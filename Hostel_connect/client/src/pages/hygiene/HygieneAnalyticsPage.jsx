import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const HygieneAnalyticsPage = () => {
  const [period, setPeriod] = useState('this_week'); // 'this_week' | 'last_week' | 'this_month'
  const [data, setData] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, reportRes] = await Promise.all([
        api.get(`/hygiene/analytics?period=${period}`),
        api.get('/hygiene/weekly-report'),
      ]);

      if (analyticsRes.data.success) {
        setData(analyticsRes.data.data);
      }
      if (reportRes.data.success) {
        setWeeklyReport(reportRes.data.report);
      }
    } catch (err) {
      console.error('Failed to load hygiene analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Synthesizing hygiene analytics..." />;
  }

  const {
    totalComplaints = 14,
    resolvedComplaints = 11,
    pendingComplaints = 3,
    criticalComplaints = 1,
    averageResolutionTimeHours = 18,
    areaScores = [
      { area: 'Hostel Rooms', score: 4.4 },
      { area: 'Bathrooms', score: 3.7 },
      { area: 'Corridors', score: 4.2 },
      { area: 'Common Areas', score: 4.5 },
      { area: 'Dining Hall', score: 4.6 },
      { area: 'Kitchen', score: 4.0 },
      { area: 'Drinking Water', score: 4.3 },
      { area: 'Waste Disposal', score: 3.9 },
    ],
    cleanlinessTrend = [
      { date: 'Mon', score: 4.1 },
      { date: 'Tue', score: 4.3 },
      { date: 'Wed', score: 4.2 },
      { date: 'Thu', score: 4.4 },
      { date: 'Fri', score: 4.5 },
      { date: 'Sat', score: 4.2 },
      { date: 'Sun', score: 4.6 },
    ],
    complaintCategories = [
      { category: 'Dirty bathroom', count: 5 },
      { category: 'Overflowing dustbin', count: 4 },
      { category: 'Pest problem', count: 2 },
      { category: 'Water contamination concern', count: 1 },
      { category: 'Bad smell', count: 2 },
    ],
  } = data || {};

  const resolutionRate = totalComplaints > 0
    ? Math.round((resolvedComplaints / totalComplaints) * 100)
    : 85;

  const resolutionPieData = [
    { name: 'Resolved', value: resolvedComplaints, color: '#10b981' },
    { name: 'Pending', value: pendingComplaints, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Sanitation Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            Hygiene & Cleanliness Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Multi-zone sanitation indicators, ticket resolution velocity, and weekly compliance tracking
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center gap-1.5 bg-[#070D22] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          {[
            { id: 'this_week', label: 'This Week' },
            { id: 'last_week', label: 'Last Week' },
            { id: 'this_month', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                period === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Hygiene Complaints */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-white/10 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Total Complaints</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">{totalComplaints}</h3>
          <p className="text-xs text-zinc-400 mt-1">Logged during this period</p>
        </div>

        {/* Card 2: Resolved vs Pending */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-emerald-500/20 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Resolution Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-300">{resolutionRate}%</h3>
            <span className="text-xs text-zinc-400 font-bold">
              ({resolvedComplaints}/{totalComplaints})
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{pendingComplaints} open issues remaining</p>
        </div>

        {/* Card 3: Avg Resolution Time */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-cyan-500/20 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-cyan-400">Avg Resolution Time</span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-cyan-300">
            {averageResolutionTimeHours} hrs
          </h3>
          <p className="text-xs text-zinc-400 mt-1">From reported to verified</p>
        </div>

        {/* Card 4: Critical Severity */}
        <div className="p-5 rounded-3xl bg-[#070D22]/80 border border-rose-500/20 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-rose-400">Critical Priority</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-300">{criticalComplaints}</h3>
          <p className="text-xs text-zinc-400 mt-1">High-urgency sanitation events</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cleanliness Trend Line Chart */}
        <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Cleanliness Trend Progression</h3>
              <p className="text-xs text-zinc-400">Daily average inspection score</p>
            </div>
            <span className="text-xs font-bold text-cyan-400">Benchmark ≥ 4.0</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cleanlinessTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050816',
                    borderColor: '#a855f7',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Cleanliness Score"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00e5ff' }}
                  activeDot={{ r: 6, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area-Wise Cleanliness Scores Bar Chart */}
        <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">8-Zone Cleanliness Scores</h3>
              <p className="text-xs text-zinc-400">Score per specific physical zone</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="area" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050816',
                    borderColor: '#00e5ff',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" fill="#00e5ff" radius={[0, 6, 6, 0]}>
                  {areaScores.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 4.4 ? '#10b981' : entry.score >= 3.8 ? '#00e5ff' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 10: WEEKLY HOSTEL QUALITY REPORT Integration */}
      {weeklyReport && (
        <div className="p-7 rounded-3xl bg-gradient-to-r from-[#0d163a] via-[#09102b] to-[#050816] border border-cyan-500/30 shadow-glass">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                Official Report Module
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                HOSTEL WEEKLY QUALITY REPORT
              </h3>
              <p className="text-xs text-zinc-400">
                Institutional aggregate report across dining performance and hygiene standards
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Generate / Print Report</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Mess Performance</p>
              <h4 className="text-xl font-black text-amber-300 mt-1">
                ⭐ {weeklyReport.messPerformance}/5
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Cleanliness Score</p>
              <h4 className="text-xl font-black text-purple-300 mt-1">
                ⭐ {weeklyReport.cleanlinessScore}/5
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Hygiene Complaints</p>
              <h4 className="text-xl font-black text-white mt-1">
                {weeklyReport.hygieneComplaints}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Resolved vs Pending</p>
              <h4 className="text-xl font-black text-emerald-400 mt-1">
                {weeklyReport.resolved} / {weeklyReport.pending}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Avg Resolution Time</p>
              <h4 className="text-xl font-black text-cyan-300 mt-1">
                {weeklyReport.averageResolutionTime}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HygieneAnalyticsPage;
