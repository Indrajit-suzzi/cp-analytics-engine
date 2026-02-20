import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export const RatingChart = ({ data }) => {
  if (!data?.length) return null;

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Rating Growth & Prediction</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="contestName" hide />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="newRating"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CompareChart = ({ data }) => {
  if (!data?.length) return null;

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Rating Comparison</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="contest" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="user1"
            stroke="#2563eb"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="user2"
            stroke="#16a34a"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicPie = ({ topicDistribution }) => {
  if (!topicDistribution || !Object.keys(topicDistribution).length) return null;

  const data = Object.keys(topicDistribution).map((key) => ({
    name: key,
    value: parseFloat(topicDistribution[key]),
  }));

  const colors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#14b8a6",
    "#8b5cf6",
  ];

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Topic Distribution (%)</h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DifficultyBar = ({ difficultyCount }) => {
  if (!difficultyCount || !Object.keys(difficultyCount).length) return null;

  const data = Object.keys(difficultyCount)
    .map((key) => ({
      difficulty: Number(key),
      solved: difficultyCount[key],
    }))
    .sort((a, b) => a.difficulty - b.difficulty);

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Difficulty Distribution</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="difficulty" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="solved" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
