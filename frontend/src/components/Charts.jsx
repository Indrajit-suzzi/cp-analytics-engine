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

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} p-3 border rounded-lg shadow-lg text-xs`}>
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RatingChart = ({ data }) => {
  if (!data?.length) return null;
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Rating Growth & Prediction</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="contestName" 
            hide 
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip dark={isDark} />} />
          <Line
            type="monotone"
            dataKey="newRating"
            name="Rating"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: isDark ? '#111827' : '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CompareChart = ({ data }) => {
  if (!data?.length) return null;
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Rating Comparison</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="contest" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip dark={isDark} />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="user1"
            name="User 1"
            stroke="#6366f1"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="user2"
            name="User 2"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicPie = ({ topicDistribution }) => {
  if (!topicDistribution || !Object.keys(topicDistribution).length) return null;
  const isDark = document.documentElement.classList.contains('dark');

  const data = Object.keys(topicDistribution).map((key) => ({
    name: key,
    value: parseFloat(topicDistribution[key]),
  }));

  const colors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#ec4899"
  ];

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Topic Distribution (%)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip dark={isDark} />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DifficultyBar = ({ difficultyCount }) => {
  if (!difficultyCount || !Object.keys(difficultyCount).length) return null;
  const isDark = document.documentElement.classList.contains('dark');

  const data = Object.keys(difficultyCount)
    .map((key) => ({
      difficulty: Number(key),
      solved: difficultyCount[key],
    }))
    .sort((a, b) => a.difficulty - b.difficulty);

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="difficulty" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip dark={isDark} />} />
          <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
