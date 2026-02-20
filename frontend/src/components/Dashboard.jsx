import { useState } from "react";
import { fetchUserData } from "../services/api";
import { RatingChart, TopicPie, DifficultyBar, CompareChart } from "./Charts";

const Dashboard = () => {
  const [handle1, setHandle1] = useState("");
  const [handle2, setHandle2] = useState("");
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeSingle = async () => {
    if (!handle1.trim()) return;
    setLoading(true);
    setError("");
    setData2(null);

    try {
      const res = await fetchUserData(handle1.trim());
      setData1(res.data);
    } catch {
      setError("Invalid handle or server error.");
    } finally {
      setLoading(false);
    }
  };

  const compareUsers = async () => {
    if (!handle1.trim() || !handle2.trim()) return;
    setLoading(true);
    setError("");

    try {
      const [res1, res2] = await Promise.all([
        fetchUserData(handle1.trim()),
        fetchUserData(handle2.trim()),
      ]);

      setData1(res1.data);
      setData2(res2.data);
    } catch {
      setError("Error comparing users.");
    } finally {
      setLoading(false);
    }
  };

  const enhancedTimeline =
    data1?.ratingTimeline && data1?.predictedRating
      ? [
          ...data1.ratingTimeline,
          {
            contestName: "Prediction",
            newRating: data1.predictedRating,
          },
        ]
      : data1?.ratingTimeline || [];

  const compareTimeline =
    data1 && data2
      ? data1.ratingTimeline.map((point, index) => ({
          contest: index + 1,
          user1: point.newRating,
          user2: data2.ratingTimeline[index]?.newRating ?? null,
        }))
      : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          CP Analytics Engine
        </h1>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
          <input
            type="text"
            placeholder="Handle 1"
            value={handle1}
            onChange={(e) => setHandle1(e.target.value)}
            className="px-4 py-2 border rounded w-64"
          />
          <input
            type="text"
            placeholder="Handle 2 (optional)"
            value={handle2}
            onChange={(e) => setHandle2(e.target.value)}
            className="px-4 py-2 border rounded w-64"
          />
          <button
            onClick={analyzeSingle}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Analyze
          </button>
          <button
            onClick={compareUsers}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Compare
          </button>
        </div>

        {loading && <p className="text-center text-blue-600">Analyzing...</p>}

        {error && <p className="text-center text-red-500">{error}</p>}

        {data1 && !data2 && (
          <>
            <SummaryGrid data={data1} />
            {enhancedTimeline.length > 0 && (
              <RatingChart data={enhancedTimeline} />
            )}
            {Object.keys(data1.topicDistribution || {}).length > 0 && (
              <TopicPie topicDistribution={data1.topicDistribution} />
            )}
            {Object.keys(data1.difficultyCount || {}).length > 0 && (
              <DifficultyBar difficultyCount={data1.difficultyCount} />
            )}
          </>
        )}

        {data1 && data2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SummaryGrid data={data1} />
              <SummaryGrid data={data2} />
            </div>

            {compareTimeline.length > 0 && (
              <CompareChart data={compareTimeline} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SummaryGrid = ({ data }) => (
  <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">
    <Card title="Handle" value={data.name} />
    <Card title="Rating" value={data.rating ?? "Unrated"} />
    <Card title="Max Rating" value={data.maxRating ?? "Unrated"} />
    <Card title="Rank" value={data.rank ?? "Unranked"} />
    <Card title="Solved" value={data.totalSolved} />
    <Card title="Growth" value={data.ratingGrowth} />
    <Card title="Prediction" value={data.predictedRating ?? "N/A"} />
    <Card
      title="Consistency"
      value={`${data.consistencyScore ?? "N/A"} / 100`}
    />
  </div>
);

const Card = ({ title, value }) => (
  <div>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default Dashboard;
