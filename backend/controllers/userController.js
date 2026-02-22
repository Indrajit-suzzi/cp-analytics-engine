import axios from "axios";

/**
 * Fetches and processes Codeforces user analytics including rating,
 * submissions, and consistency metrics.
 */
export const getUserAnalytics = async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({ message: "Handle is required" });
  }

  try {
    const baseURL = process.env.CODEFORCES_API || "https://codeforces.com/api";
    const axiosConfig = {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" },
    };

    let userInfoRes, submissionsRes, ratingRes;

    try {
      const results = await Promise.allSettled([
        axios.get(`${baseURL}/user.info?handles=${handle}`, axiosConfig),
        axios.get(`${baseURL}/user.status?handle=${handle}`, axiosConfig),
        axios.get(`${baseURL}/user.rating?handle=${handle}`, axiosConfig),
      ]);
      
      if (results[0].status === "rejected") {
        const error = results[0].reason;
        
        if (error.response) {
           const { status, data } = error.response;

           if (data?.status === "FAILED" && data.comment?.includes("limit exceeded")) {
              return res.status(429).json({ 
                 message: "Codeforces API rate limit exceeded. Please try again in a moment.",
                 error: data.comment 
              });
           }

           if (status >= 500) {
              return res.status(502).json({ 
                 message: "Codeforces API is currently unavailable. Please try again later.",
                 error: error.message 
              });
           }
           if (status === 400 || status === 404) {
              return res.status(404).json({ message: `User "${handle}" not found.` });
           }
           return res.status(status).json({ message: "Upstream API error", details: data });
        }
        return res.status(504).json({ message: "Codeforces API timeout or no response." });
      }

      userInfoRes = results[0].value;
      submissionsRes = results[1].status === "fulfilled" ? results[1].value : null;
      ratingRes = results[2].status === "fulfilled" ? results[2].value : null;

      if (!userInfoRes || userInfoRes.data.status !== "OK") {
        const comment = userInfoRes?.data?.comment || "";
        if (comment.includes("limit exceeded")) {
           return res.status(429).json({ message: "Codeforces API rate limit exceeded." });
        }
        return res.status(404).json({ message: `User "${handle}" not found on Codeforces.` });
      }
    } catch (err) {
      console.error("Critical API Failure:", err.message);
      throw err;
    }

    const userInfo = userInfoRes.data.result[0];
    const submissions = submissionsRes?.data?.status === "OK" ? submissionsRes.data.result : [];
    const ratingHistory = ratingRes?.data?.status === "OK" ? ratingRes.data.result : [];

    const solvedProblems = new Set();
    const tagCount = {};
    const difficultyCount = {};
    
    let maxStreak = 0;
    let currentStreak = 0;
    let lastSubmissionDate = null;
    let totalRatingSum = 0;
    let ratedProblemsCount = 0;
    
    const sortedSubmissions = [...submissions].sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

    sortedSubmissions.forEach((sub) => {
      // Streak Calculation
      const date = new Date(sub.creationTimeSeconds * 1000).toDateString();
      if (date !== lastSubmissionDate) {
         if (lastSubmissionDate) {
            const diff = (new Date(date) - new Date(lastSubmissionDate)) / (1000 * 60 * 60 * 24);
            currentStreak = diff <= 1.5 ? currentStreak + 1 : 1;
         } else {
            currentStreak = 1;
         }
         maxStreak = Math.max(maxStreak, currentStreak);
         lastSubmissionDate = date;
      }

      // Solved Problem Statistics
      if (sub.verdict === "OK") {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;

        if (!solvedProblems.has(key)) {
          solvedProblems.add(key);

          if (sub.problem.rating) {
            difficultyCount[sub.problem.rating] = (difficultyCount[sub.problem.rating] || 0) + 1;
            totalRatingSum += sub.problem.rating;
            ratedProblemsCount++;
          }

          (sub.problem.tags || []).forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      }
    });
    
    const accuracy = submissions.length > 0 
       ? ((solvedProblems.size / submissions.length) * 100).toFixed(1) 
       : 0;

    const averageRating = ratedProblemsCount > 0 
       ? Math.round(totalRatingSum / ratedProblemsCount) 
       : 0;

    // Topic Analysis
    let strongestTopic = "N/A", weakestTopic = "N/A";
    const topicDistribution = {};
    const totalTags = Object.values(tagCount).reduce((a, b) => a + b, 0);

    if (totalTags > 0) {
      const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
      strongestTopic = sortedTags[0];
      weakestTopic = sortedTags[sortedTags.length - 1];

      for (const tag in tagCount) {
        topicDistribution[tag] = ((tagCount[tag] / totalTags) * 100).toFixed(2);
      }
    }

    // Rating Timeline & Growth
    const ratingTimeline = ratingHistory.map((c) => ({
      contestName: c.contestName,
      newRating: c.newRating,
      rank: c.rank,
    }));

    let ratingGrowth = ratingHistory.length >= 2 
      ? ratingHistory[ratingHistory.length - 1].newRating - ratingHistory[0].newRating
      : 0;

    // Linear Regression for Rating Prediction
    let predictedRating = null;
    if (ratingHistory.length >= 2) {
      const n = ratingHistory.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

      ratingHistory.forEach((c, i) => {
        const x = i + 1, y = c.newRating;
        sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
      });

      const denom = n * sumXX - sumX * sumX;
      if (denom !== 0) {
        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;
        predictedRating = Math.round(slope * (n + 1) + intercept);
      }
    }

    // Consistency Score Calculation (based on standard deviation of rating changes)
    let consistencyScore = null;
    if (ratingHistory.length >= 2) {
      const diffs = [];
      for (let i = 1; i < ratingHistory.length; i++) {
        diffs.push(ratingHistory[i].newRating - ratingHistory[i - 1].newRating);
      }
      const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const variance = diffs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / diffs.length;
      consistencyScore = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) / 5)));
    }

    res.json({
      name: userInfo.handle,
      rating: userInfo.rating || "Unrated",
      maxRating: userInfo.maxRating || "Unrated",
      rank: userInfo.rank || "Unranked",
      totalSolved: solvedProblems.size,
      strongestTopic,
      weakestTopic,
      topicDistribution,
      difficultyCount,
      contestCount: ratingHistory.length,
      ratingGrowth,
      ratingTimeline,
      predictedRating,
      consistencyScore,
      accuracy,
      averageRating,
      maxStreak,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};