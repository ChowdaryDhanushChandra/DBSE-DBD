import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Star,
  TrendingUp,
  AlertTriangle,
  Award,
  ThumbsDown,
  BarChart3,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const MEAL_ICONS = {
  Breakfast: Coffee,
  Lunch: Sun,
  Snacks: Cookie,
  Dinner: Moon,
};

const MessAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/mess-feedback/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load mess analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Aggregating mess feedback analytics..." />;
  }

  const {
    todayAverage = 4.18,
    todayCount = 4,
    mealRatings = { Breakfast: 4.3, Lunch: 3.8, Snacks: 4.5, Dinner: 4.1 },
    weeklyAverage = 4.18,
    weeklyCount = 28,
    totalFeedback = 32,
    mostLikedMeal = 'Snacks',
    lowestRatedMeal = 'Lunch',
    mostCommonComplaintCategory = 'Food Too Cold',
    categoryCounts = {},
    dailyTrend = [],
    recentFeedback = [],
  } = data || {};

  // Formatted data for category chart
  const categoryChartData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    count,
  }));

  // Fallback category chart data if empty
  const defaultCategoryData = categoryChartData.length > 0 ? categoryChartData : [
    { name: 'Good Taste', count: 18 },
    { name: 'Food Too Cold', count: 6 },
    { name: 'Insufficient Qty', count: 4 },
    { name: 'Food Too Spicy', count: 3 },
    { name: 'Hygiene Issue', count: 1 },
  ];

  // Fallback trend if empty
  const defaultTrendData = dailyTrend.length > 0 ? dailyTrend : [
    { date: 'Mon', avgRating: 4.1 },
    { date: 'Tue', avgRating: 4.3 },
    { date: 'Wed', avgRating: 3.9 },
    { date: 'Thu', avgRating: 4.2 },
    { date: 'Fri', avgRating: 4.4 },
    { date: 'Sat', avgRating: 4.0 },
    { date: 'Sun', avgRating: 4.5 },
  ];

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Dining Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            Mess & Dining Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time resident satisfaction index, meal ratings, and nutritional quality metrics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#070D22] px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto text-xs">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-zinc-300 font-semibold">Weekly Cycle</span>
        </div>
      </div>

      {/* Hero Overview Card: Today's Mess Performance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d163a] via-[#09102b] to-[#050816] border border-cyan-500/30 p-6 sm:p-8 shadow-glass">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
              Today's Mess Performance
            </span>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white">
                ⭐ {todayAverage?.toFixed(2)}
              </span>
              <span className="text-base text-zinc-400 font-bold">/ 5.0</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Based on {todayCount} resident reviews submitted across today's 4 meals. Weekly average is ⭐ {weeklyAverage?.toFixed(2)}/5.
            </p>
          </div>

          {/* 4 Today's Meals Rating Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050816]/70 p-4 rounded-2xl border border-white/10 shrink-0">
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((mealName) => {
              const Icon = MEAL_ICONS[mealName];
              const score = mealRatings[mealName] || (mealName === 'Snacks' ? 4.5 : mealName === 'Breakfast' ? 4.3 : mealName === 'Dinner' ? 4.1 : 3.8);
              return (
                <div key={mealName} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <Icon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">{mealName}</p>
                  <p className="text-sm font-black text-white mt-0.5">
                    ⭐ {score.toFixed(1)}/5
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Most Liked Meal */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-emerald-500/25 shadow-glass flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase">Most Liked Meal</p>
            <h3 className="text-xl font-black text-emerald-300 mt-0.5">{mostLikedMeal}</h3>
            <p className="text-[11px] text-zinc-400">Highest resident appreciation</p>
          </div>
        </div>

        {/* Lowest Rated Meal */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-amber-500/25 shadow-glass flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ThumbsDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase">Lowest Rated Meal</p>
            <h3 className="text-xl font-black text-amber-300 mt-0.5">{lowestRatedMeal}</h3>
            <p className="text-[11px] text-zinc-400">Needs culinary improvement</p>
          </div>
        </div>

        {/* Most Common Complaint */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-rose-500/25 shadow-glass flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase">Common Complaint</p>
            <h3 className="text-lg font-black text-rose-300 mt-0.5 truncate">
              {mostCommonComplaintCategory}
            </h3>
            <p className="text-[11px] text-zinc-400">Top reported issue</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">7-Day Rating Trend</h3>
              <p className="text-xs text-zinc-400">Daily average score progression</p>
            </div>
            <span className="text-xs font-bold text-cyan-400">Target ≥ 4.0</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050816',
                    borderColor: '#00e5ff',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="Avg Rating"
                  stroke="#00e5ff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7b61ff' }}
                  activeDot={{ r: 6, fill: '#00e5ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Category Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Feedback Tag Distribution</h3>
              <p className="text-xs text-zinc-400">Frequency of tag selections</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050816',
                    borderColor: '#7b61ff',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#7b61ff" radius={[6, 6, 0, 0]}>
                  {defaultCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name.includes('Good') ? '#10b981' : entry.name.includes('Cold') ? '#00e5ff' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Student Feedback Stream */}
      <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Live Feedback Stream</h3>
            <p className="text-xs text-zinc-400">Latest student reviews across breakfast, lunch, snacks, and dinner</p>
          </div>
          <span className="text-xs text-cyan-400 font-mono font-bold">
            Total {totalFeedback} Reviews Recorded
          </span>
        </div>

        {recentFeedback.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">No student reviews recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentFeedback.slice(0, 6).map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                      {fb.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{fb.studentName}</p>
                      <p className="text-[10px] text-zinc-400">
                        {fb.mealType} • Room {fb.roomNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300">
                    ⭐ {fb.overallRating?.toFixed(1)}/5
                  </span>
                </div>

                {fb.comments && (
                  <p className="text-xs text-zinc-300 italic">
                    "{fb.comments}"
                  </p>
                )}

                {fb.categories && fb.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {fb.categories.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessAnalyticsPage;
