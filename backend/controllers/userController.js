import axios from "axios";

export const getUserAnalytics = async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({ message: "Handle is required" });
  }

  try {
    const baseURL = process.env.CODEFORCES_API;

    const axiosConfig = {
      timeout: 10000,
    };

    const [userInfoRes, submissionsRes, ratingRes] = await Promise.all([
      axios.get(`${baseURL}/user.info?handles=${handle}`, axiosConfig),
      axios.get(`${baseURL}/user.status?handle=${handle}`, axiosConfig),
      axios.get(`${baseURL}/user.rating?handle=${handle}`, axiosConfig),
    ]);

    if (
      userInfoRes.data.status !== "OK" ||
      submissionsRes.data.status !== "OK" ||
      ratingRes.data.status !== "OK"
    ) {
      return res.status(400).json({ message: "Invalid handle" });
    }

    const userInfo = userInfoRes.data.result[0];
    const submissions = submissionsRes.data.result || [];
    const ratingHistory = ratingRes.data.result || [];

    const solvedProblems = new Set();
    const tagCount = {};
    const difficultyCount = {};

    submissions.forEach((sub) => {
      if (sub.verdict === "OK") {
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
        solvedProblems.add(problemKey);

        if (sub.problem.rating) {
          difficultyCount[sub.problem.rating] =
            (difficultyCount[sub.problem.rating] || 0) + 1;
        }

        sub.problem.tags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    let strongestTopic = "N/A";
    let weakestTopic = "N/A";

    if (Object.keys(tagCount).length > 0) {
      strongestTopic = Object.keys(tagCount).reduce((a, b) =>
        tagCount[a] > tagCount[b] ? a : b,
      );
      weakestTopic = Object.keys(tagCount).reduce((a, b) =>
        tagCount[a] < tagCount[b] ? a : b,
      );
    }

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

    res.json({
      name: userInfo.handle,
      rating: userInfo.rating || "Unrated",
      maxRating: userInfo.maxRating || "Unrated",
      rank: userInfo.rank || "Unranked",
      totalSolved: solvedProblems.size,
      strongestTopic,
      weakestTopic,
      contestCount: ratingHistory.length,
      ratingGrowth,
      ratingTimeline,
      difficultyCount,
    });
  } catch (error) {
    console.error("Detailed Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Server error while fetching analytics",
      error: error.message,
    });
  }
};
