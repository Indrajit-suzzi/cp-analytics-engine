import axios from "axios";

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

    const [userInfoRes, submissionsRes, ratingRes] = await Promise.all([
      axios.get(`${baseURL}/user.info?handles=${handle}`, axiosConfig),
      axios.get(`${baseURL}/user.status?handle=${handle}`, axiosConfig),
      axios.get(`${baseURL}/user.rating?handle=${handle}`, axiosConfig),
    ]);

    if (userInfoRes.data.status !== "OK") {
      return res.status(400).json({ message: "Invalid handle" });
    }

    const userInfo = userInfoRes.data.result[0];

    const submissions =
      submissionsRes.data.status === "OK" ? submissionsRes.data.result : [];

    const ratingHistory =
      ratingRes.data.status === "OK" ? ratingRes.data.result : [];

    // Process Submissions 

    const solvedProblems = new Set();
    const tagCount = {};
    const difficultyCount = {};

    submissions.forEach((sub) => {
      if (sub.verdict === "OK") {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;

        if (!solvedProblems.has(key)) {
          solvedProblems.add(key);

          if (sub.problem.rating) {
            difficultyCount[sub.problem.rating] =
              (difficultyCount[sub.problem.rating] || 0) + 1;
          }

          sub.problem.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      }
    });

    //Topic Analysis 

    let strongestTopic = "N/A";
    let weakestTopic = "N/A";
    const topicDistribution = {};

    const totalTags = Object.values(tagCount).reduce((a, b) => a + b, 0);

    if (totalTags > 0) {
      strongestTopic = Object.keys(tagCount).reduce((a, b) =>
        tagCount[a] > tagCount[b] ? a : b,
      );

      weakestTopic = Object.keys(tagCount).reduce((a, b) =>
        tagCount[a] < tagCount[b] ? a : b,
      );

      for (const tag in tagCount) {
        topicDistribution[tag] = ((tagCount[tag] / totalTags) * 100).toFixed(2);
      }
    }

    // Rating Timeline

    const ratingTimeline = ratingHistory.map((contest) => ({
      contestName: contest.contestName,
      newRating: contest.newRating,
      rank: contest.rank,
    }));

    let ratingGrowth = 0;
    if (ratingHistory.length >= 2) {
      ratingGrowth =
        ratingHistory[ratingHistory.length - 1].newRating -
        ratingHistory[0].newRating;
    }

    //Prediction 

    let predictedRating = null;

    if (ratingHistory.length >= 2) {
      const n = ratingHistory.length;

      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;

      ratingHistory.forEach((c, i) => {
        const x = i + 1;
        const y = c.newRating;

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      });

      const denom = n * sumXX - sumX * sumX;

      if (denom !== 0) {
        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;

        predictedRating = Math.round(slope * (n + 1) + intercept);
      }
    }

    // Consistency 

    let consistencyScore = null;

    if (ratingHistory.length >= 2) {
      const diffs = [];

      for (let i = 1; i < ratingHistory.length; i++) {
        diffs.push(ratingHistory[i].newRating - ratingHistory[i - 1].newRating);
      }

      const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;

      const variance =
        diffs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / diffs.length;

      const stdDev = Math.sqrt(variance);

      consistencyScore = Math.round(100 - stdDev / 5);
      consistencyScore = Math.max(0, Math.min(100, consistencyScore));
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
    });
  } catch (error) {
    console.error("Detailed Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Server error while fetching analytics",
    });
  }
};
