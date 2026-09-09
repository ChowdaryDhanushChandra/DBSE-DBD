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
} from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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

  const { cards, charts, recentComplaints, recentFees } = data || {};

  const occupancyColors = ['#10B981', '#F59E0B', '#EF4444', '#64748B'];

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time occupancy analytics, campus resident roster, and mess operations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/admin/students"
            className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Student
          </Link>
          <Link
            to="/admin/rooms"
            className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <BedDouble className="w-4 h-4 mr-1.5 text-indigo-600" />
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* 8 Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Students"
          value={cards?.totalStudents || 0}
          subtitle="Enrolled active residents"
          icon={Users}
          color="indigo"
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
          color="cyan"
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
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Room Occupancy Breakdown</h3>
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
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Fee Collections Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Collection Analytics (₹)</h3>
              <p className="text-xs text-slate-400">Collected vs pending fee trends</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyFees || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collected" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Collected" />
                <Bar dataKey="pending" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Registration Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Admissions Trend</h3>
              <p className="text-xs text-slate-400">Cumulative student intake this academic year</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.studentTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7C3AED' }}
                  name="Total Students"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints Resolution Pipeline</h3>
              <p className="text-xs text-slate-400">Status breakdown of submitted student complaints</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.complaintStatus || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 6, 6, 0]} name="Issues Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Complaints</h3>
              <p className="text-xs text-slate-400">Latest issues logged by hostel residents</p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <div key={c._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {c.studentId?.userId?.name} • {c.hostelId?.name} • {c.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <StatusBadge status={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-400 text-xs">No pending complaints</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Fee Invoices</h3>
              <p className="text-xs text-slate-400">Financial transactions and collections</p>
            </div>
            <Link
              to="/admin/fees"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentFees && recentFees.length > 0 ? (
              recentFees.map((f) => (
                <div key={f._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{f.studentId?.userId?.name || 'Student'}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {f.feeType} • {f.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{f.amount?.toLocaleString('en-IN')}</p>
                    <div className="mt-1">
                      <StatusBadge status={f.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-400 text-xs">No fee transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
