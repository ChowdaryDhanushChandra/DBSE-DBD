import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  BedDouble,
  CheckCircle,
  AlertCircle,
  CreditCard,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  Sparkles,
  Package,
  DoorOpen,
} from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import HostelQualityScoreBanner from '../../components/common/HostelQualityScoreBanner';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading Admin Analytics..." />;
  }

  const { cards, charts, recentComplaints, recentFees, parcelStats, visitorStats } = data || {};

  const occupancyColors = ['#00E5FF', '#7B61FF', '#FF4D9D', '#334155'];

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Mission Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Institutional Admin <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time occupancy analytics, campus resident roster, and mess operations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/admin/students"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Student
          </Link>
          <Link
            to="/admin/rooms"
            className="inline-flex items-center px-4 py-2 bg-[#070D22]/90 hover:bg-cyan-500/10 text-slate-200 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl text-xs font-semibold shadow-glass transition-all"
          >
            <BedDouble className="w-4 h-4 mr-1.5 text-cyan-400" />
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* UNIQUE FEATURE: Hostel Quality Score at Top */}
      <HostelQualityScoreBanner />

      {/* Quick Services: Parcel & Visitor Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parcel Delivery Overview Widget */}
        <Link
          to="/admin/parcels"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Parcel & Delivery Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {parcelStats?.todayDeliveries ?? 0} Today
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400 font-bold">{parcelStats?.pendingCollection ?? 0}</span> awaiting pickup • {parcelStats?.total ?? 0} total records
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>

        {/* Visitor & Gate Security Widget */}
        <Link
          to="/admin/visitors"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(123,97,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Visitor & Gate Security</h3>
                {visitorStats?.overstayAlerts > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    ⚠️ {visitorStats.overstayAlerts} Overstay
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🟢 {visitorStats?.currentlyInside ?? 0} Inside
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-purple-300 font-bold">{visitorStats?.todayVisitors ?? 0}</span> visitors today • {visitorStats?.pendingRequests ?? 0} pending review
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* 8 Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Students"
          value={cards?.totalStudents || 0}
          subtitle="Enrolled active residents"
          icon={Users}
          color="cyan"
        />
        <DashboardCard
          title="Total Hostels"
          value={cards?.totalHostels || 0}
          subtitle="Campus accommodation wings"
          icon={Building2}
          color="purple"
        />
        <DashboardCard
          title="Available Rooms"
          value={cards?.availableRooms || 0}
          subtitle={`${cards?.availableBeds || 0} empty beds ready`}
          icon={CheckCircle}
          color="emerald"
        />
        <DashboardCard
          title="Occupied Rooms"
          value={cards?.occupiedRooms || 0}
          subtitle={`${cards?.currentOccupiedBeds || 0} allocated beds`}
          icon={BedDouble}
          color="pink"
        />
        <DashboardCard
          title="Pending Complaints"
          value={cards?.pendingComplaints || 0}
          subtitle={`${cards?.resolvedComplaints || 0} resolved this term`}
          icon={AlertCircle}
          color="rose"
        />
        <DashboardCard
          title="Total Payments"
          value={`₹${(cards?.totalPayments || 0).toLocaleString('en-IN')}`}
          subtitle="Collected semester revenue"
          icon={CreditCard}
          color="emerald"
        />
        <DashboardCard
          title="Pending Payments"
          value={`₹${(cards?.pendingPayments || 0).toLocaleString('en-IN')}`}
          subtitle="Awaiting student settlement"
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Mess Attendance Today"
          value={cards?.messAttendanceToday || 0}
          subtitle="Check-ins recorded today"
          icon={UtensilsCrossed}
          color="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Donut Chart */}
        <div className="bg-[#070D22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Room Occupancy Breakdown</h3>
              <p className="text-xs text-slate-400">Total room distribution across campus</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.roomOccupancy || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {(charts?.roomOccupancy || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={occupancyColors[index % occupancyColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D22', borderColor: '#00E5FF40', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#00E5FF' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Fee Collections Bar Chart */}
        <div className="bg-[#070D22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Fee Collection Analytics (₹)</h3>
              <p className="text-xs text-slate-400">Collected vs pending fee trends</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyFees || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D22', borderColor: '#00E5FF40', borderRadius: '12px', color: '#fff' }}
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
                <Bar dataKey="collected" fill="#00E5FF" radius={[6, 6, 0, 0]} name="Collected" />
                <Bar dataKey="pending" fill="#7B61FF" radius={[6, 6, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Registration Trends */}
        <div className="bg-[#070D22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Student Admissions Trend</h3>
              <p className="text-xs text-slate-400">Cumulative student intake this academic year</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.studentTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D22', borderColor: '#00E5FF40', borderRadius: '12px', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#00E5FF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7B61FF', stroke: '#00E5FF', strokeWidth: 2 }}
                  name="Total Students"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Status Distribution */}
        <div className="bg-[#070D22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Complaints Resolution Pipeline</h3>
              <p className="text-xs text-slate-400">Status breakdown of submitted student complaints</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.complaintStatus || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D22', borderColor: '#00E5FF40', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#7B61FF" radius={[0, 6, 6, 0]} name="Issues Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Complaints</h3>
              <p className="text-xs text-slate-400">Latest issues logged by hostel residents</p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-white/5 text-xs">
            {recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <div key={c._id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-white truncate">{c.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {c.studentName || c.studentId?.userId?.name} • {c.hostelName || c.hostelId?.name} • {c.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <StatusBadge status={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-500 text-xs">No pending complaints</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Fee Invoices</h3>
              <p className="text-xs text-slate-400">Financial transactions and collections</p>
            </div>
            <Link
              to="/admin/fees"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-white/5 text-xs">
            {recentFees && recentFees.length > 0 ? (
              recentFees.map((f) => (
                <div key={f._id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{f.studentName || f.studentId?.userId?.name || 'Student'}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {f.feeType} • {f.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-400">₹{f.amount?.toLocaleString('en-IN')}</p>
                    <div className="mt-1">
                      <StatusBadge status={f.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-500 text-xs">No fee transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
