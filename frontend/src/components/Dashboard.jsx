import { useState } from "react";
import { fetchUserData } from "../services/api.js";
import { RatingChart, TopicPie, DifficultyBar } from "./Charts.jsx";

const Dashboard = () => {
  const [handle, setHandle] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!handle) return;

    setLoading(true);
    try {
      const res = await fetchUserData(handle);
      setData(res.data);
    } catch {
      alert("Invalid handle or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Competitive Programming Analytics Engine</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Codeforces handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
          Analyze
        </button>
      </div>

      {loading && <p>Analyzing...</p>}

      {data && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h2>{data.name}</h2>
            <p>Rating: {data.rating}</p>
            <p>Max Rating: {data.maxRating}</p>
            <p>Rank: {data.rank}</p>
            <p>Total Solved: {data.totalSolved}</p>
            <p>Strongest Topic: {data.strongestTopic}</p>
            <p>Weakest Topic: {data.weakestTopic}</p>
            <p>Rating Growth: {data.ratingGrowth}</p>
            <p>Contest Count: {data.contestCount}</p>
          </div>

          {data.ratingTimeline && <RatingChart data={data.ratingTimeline} />}

          {data.topicDistribution && (
            <TopicPie topicDistribution={data.topicDistribution} />
          )}

          {data.difficultyCount && (
            <DifficultyBar difficultyCount={data.difficultyCount} />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
