import { useState } from "react";
import { fetchUserData } from "../services/api";
import { RatingChart, TopicPie, DifficultyBar, CompareChart } from "./Charts";
import { 
  Search, TrendingUp, Award, Zap, Target, Activity, Users, Trophy, 
  BarChart2 
} from "lucide-react";

/**
 * Main dashboard component that handles data fetching, comparison logic,
 * and renders all analytics widgets.
 */
const Dashboard = () => {
  const [handle1, setHandle1] = useState("");
  const [handle2, setHandle2] = useState("");
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetches single user analytics and clears comparison data.
   */
  const analyzeSingle = async () => {
    if (!handle1.trim()) return;
    setLoading(true);
    setError("");
    setData2(null);

    try {
      const res = await fetchUserData(handle1.trim());
      setData1(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid handle or server error.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches data for two users simultaneously for side-by-side comparison.
   */
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
    } catch (err) {
      setError(err.response?.data?.message || "Error comparing users.");
    } finally {
      setLoading(false);
    }
  };

  const enhancedTimeline = data1?.ratingTimeline && data1?.predictedRating
    ? [...data1.ratingTimeline, { contestName: "Prediction", newRating: data1.predictedRating }]
    : data1?.ratingTimeline || [];

  const compareTimeline = data1 && data2
    ? data1.ratingTimeline.map((point, index) => ({
        contest: index + 1,
        user1: point.newRating,
        user2: data2.ratingTimeline[index]?.newRating ?? null,
      }))
    : [];

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Deep-dive into performance and competitive metrics</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Enter Handle..."
                value={handle1}
                onChange={(e) => setHandle1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeSingle()}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-full"
              />
            </div>

            <div className="relative group flex-1 md:w-64">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Compare (Optional)"
                value={handle2}
                onChange={(e) => setHandle2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && compareUsers()}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={analyzeSingle}
                disabled={loading}
                className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
              >
                {loading ? "..." : "Analyze"}
              </button>
              <button
                onClick={compareUsers}
                disabled={loading || !handle2}
                className="flex-1 md:flex-none px-6 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching Data from Codeforces...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            {data1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {!data2 ? (
                  <>
                    <StatsGrid data={data1} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        {enhancedTimeline.length > 0 && <RatingChart data={enhancedTimeline} />}
                      </div>
                      <div className="md:col-span-1">
                        {Object.keys(data1.topicDistribution || {}).length > 0 && (
                          <TopicPie topicDistribution={data1.topicDistribution} />
                        )}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                          <BarChart2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        Problem Difficulty Breakdown
                      </h3>
                      {Object.keys(data1.difficultyCount || {}).length > 0 && <DifficultyBar difficultyCount={data1.difficultyCount} />}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none">1</div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{data1.name}</h3>
                        </div>
                        <StatsGrid data={data1} compact />
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-200 dark:shadow-none">2</div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{data2.name}</h3>
                        </div>
                        <StatsGrid data={data2} compact />
                      </div>
                    </div>
                    {compareTimeline.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <CompareChart data={compareTimeline} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!data1 && (
              <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-3xl flex items-center justify-center mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ready for Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2 text-center text-sm px-4">
                  Enter your Codeforces handle to unlock detailed performance metrics and growth projections.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm relative z-10"><Zap className="w-6 h-6 text-yellow-300" /></div>
              <h4 className="font-bold mb-2 relative z-10">Pro Tip</h4>
              <p className="text-sm text-indigo-50 leading-relaxed relative z-10">Consistency is key. Aim for at least one problem daily to maintain your streak and keep your rating projection positive!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsGrid = ({ data, compact }) => (
  <div className={`grid grid-cols-2 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-4`}>
    <StatCard icon={Trophy} label="Current Rating" value={data.rating ?? "Unrated"} subValue={`Max: ${data.maxRating ?? "N/A"}`} color="text-yellow-600" bgColor="bg-yellow-50" borderColor="border-yellow-100" />
    <StatCard icon={Award} label="Global Rank" value={data.rank ? capitalize(data.rank) : "Unranked"} color="text-purple-600" bgColor="bg-purple-50" borderColor="border-purple-100" />
    <StatCard icon={Target} label="Solved Problems" value={data.totalSolved} color="text-green-600" bgColor="bg-green-50" borderColor="border-green-100" />
    <StatCard icon={TrendingUp} label="Projected Rating" value={data.predictedRating ?? "N/A"} subValue={data.ratingGrowth > 0 ? `+${data.ratingGrowth} Growth` : null} color="text-indigo-600" bgColor="bg-indigo-50" borderColor="border-indigo-100" />
    {!compact && (
       <>
        <StatCard icon={Zap} label="Max Streak" value={data.maxStreak ? `${data.maxStreak} Days` : "0 Days"} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
        <StatCard icon={Activity} label="Accuracy" value={data.accuracy ? `${data.accuracy}%` : "N/A"} color="text-teal-600" bgColor="bg-teal-50" borderColor="border-teal-100" />
        <StatCard icon={BarChart2} label="Avg. Difficulty" value={data.averageRating || "N/A"} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-100" />
        <StatCard icon={Target} label="Strongest Topic" value={data.strongestTopic} color="text-pink-600" bgColor="bg-pink-50" borderColor="border-pink-100" />
       </>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, subValue, color, bgColor, borderColor }) => (
  <div className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border ${borderColor} shadow-sm group transition-all duration-300`}>
    <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>
    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1 truncate">{value}</h4>
    {subValue && <p className="text-[10px] font-bold text-gray-400 mt-1">{subValue}</p>}
  </div>
);

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default Dashboard;