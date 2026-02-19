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
} from "recharts";

export const RatingChart = ({ data }) => (
  <div style={{ width: "100%", height: 300 }}>
    <h3>Rating Growth</h3>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="contestName" hide />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="newRating" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const TopicPie = ({ topicDistribution }) => {
  const data = Object.keys(topicDistribution).map((key) => ({
    name: key,
    value: parseFloat(topicDistribution[key]),
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Topic Distribution</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#82ca9d"
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DifficultyBar = ({ difficultyCount }) => {
  const data = Object.keys(difficultyCount).map((key) => ({
    difficulty: key,
    solved: difficultyCount[key],
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Difficulty Distribution</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="difficulty" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="solved" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
