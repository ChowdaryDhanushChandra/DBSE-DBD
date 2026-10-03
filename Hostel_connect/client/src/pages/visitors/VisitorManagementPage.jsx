import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Phone,
  Shield,
  FileCheck,
  LogOut,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  DoorOpen,
  ArrowRight,
  Printer,
  Sparkles,
  Car,
  CreditCard,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const VISITOR_TYPES = [
  { value: 'Parent', label: '👨‍👩‍👧 Parent' },
  { value: 'Relative', label: '👨‍👩‍👦 Relative' },
  { value: 'Friend', label: '👨‍🎓 Friend' },
  { value: 'Service Provider', label: '🛠 Service Provider' },
  { value: 'Delivery Person', label: '📦 Delivery Person' },
  { value: 'Other', label: '👤 Other' },
];

const ID_PROOF_TYPES = [
  'Aadhaar Card',
  'Driving License',
  'PAN Card',
  'Voter ID Card',
  'College / Employee ID',
  'Passport',
  'Other Govt ID',
];

const PIE_COLORS = ['#00E5FF', '#7B61FF', '#FF4D9D', '#10B981', '#F59E0B', '#6366F1'];

export const VisitorManagementPage = () => {
  const { user, isAdmin, isWarden, isStudent } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [currentlyInsideList, setCurrentlyInsideList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    visitorsToday: 0,
    pendingRequests: 0,
    approvedVisitors: 0,
    currentlyInside: 0,
    checkedOut: 0,
    rejected: 0,
    overstayCount: 0,
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'inside' | 'pending' | 'analytics'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // Forms
  const [studentsList, setStudentsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    student_id: '',
    visitor_name: '',
    mobile_number: '',
    relationship: 'Parent',
    visitor_type: 'Parent',
    visit_date: new Date().toISOString().split('T')[0],
    expected_arrival: '10:00',
    expected_departure: '12:00',
    purpose: '',
    number_of_visitors: 1,
  });

  const [checkInForm, setCheckInForm] = useState({
    id_proof_type: 'Aadhaar Card',
    id_proof_reference: '',
    vehicle_number: '',
    remarks: '',
  });

  const [rejectReason, setRejectReason] = useState('');

  // Fetch visitors
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.visitorType = typeFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/visitors', { params });
      if (res.data.success) {
        setVisitors(res.data.data.visitors || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch currently inside visitors
  const fetchCurrentlyInside = async () => {
    if (isStudent) return;
    try {
      const res = await api.get('/visitors/currently-inside');
      if (res.data.success) {
        setCurrentlyInsideList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load currently inside visitors:', err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (isStudent) return;
    try {
      const res = await api.get('/visitors/analytics');
      if (res.data.success) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load visitor analytics:', err);
    }
  };

  // Fetch student roster (Warden/Admin)
  const fetchStudents = async () => {
    if (isStudent) return;
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        setStudentsList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [search, statusFilter, typeFilter, dateFilter]);

  useEffect(() => {
    if (!isStudent) {
      fetchCurrentlyInside();
      fetchAnalytics();
      fetchStudents();
    }
  }, [isStudent]);

  // Handle Create Visitor Request
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/visitors', createForm);
      if (res.data.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
        setCreateModalOpen(false);
        setCreateForm({
          student_id: '',
          visitor_name: '',
          mobile_number: '',
          relationship: 'Parent',
          visitor_type: 'Parent',
          visit_date: new Date().toISOString().split('T')[0],
          expected_arrival: '10:00',
          expected_departure: '12:00',
          purpose: '',
          number_of_visitors: 1,
        });
        fetchVisitors();
        if (!isStudent) {
          fetchCurrentlyInside();
          fetchAnalytics();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit visitor request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Approve (Warden/Admin)
  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/visitors/${id}/approve`);
      if (res.data.success) {
        fetchVisitors();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve visitor.');
    }
  };

  // Handle Reject Submit (Warden/Admin)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitor) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/visitors/${selectedVisitor.id}/reject`, {
        rejection_reason: rejectReason,
      });
      if (res.data.success) {
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedVisitor(null);
        fetchVisitors();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject visitor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-In Submit (Warden/Admin)
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitor) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/visitors/${selectedVisitor.id}/checkin`, checkInForm);
      if (res.data.success) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
        setCheckInModalOpen(false);
        setSelectedVisitor(null);
        setCheckInForm({
          id_proof_type: 'Aadhaar Card',
          id_proof_reference: '',
          vehicle_number: '',
          remarks: '',
        });
        fetchVisitors();
        fetchCurrentlyInside();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in visitor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-Out (Warden/Admin)
  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitor) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/visitors/${selectedVisitor.id}/checkout`);
      if (res.data.success) {
        setCheckOutModalOpen(false);
        setSelectedVisitor(null);
        fetchVisitors();
        fetchCurrentlyInside();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check out visitor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Student Cancel Request
  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this visitor request?')) return;
    try {
      const res = await api.put(`/visitors/${id}`, { status: 'Cancelled' });
      if (res.data.success) {
        fetchVisitors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Campus Security & Guest Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🚪 Visitor & Guest <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pre-register guests, manage digital gate check-ins, overstay monitoring, and institutional visitor logs
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setCreateForm({
                student_id: isStudent ? '' : '',
                visitor_name: '',
                mobile_number: '',
                relationship: 'Parent',
                visitor_type: 'Parent',
                visit_date: new Date().toISOString().split('T')[0],
                expected_arrival: '10:00',
                expected_departure: '12:00',
                purpose: '',
                number_of_visitors: 1,
              });
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {isStudent ? 'Pre-Register Visitor' : 'Pre-Register / Add Guest'}
          </button>

          {!isStudent && (
            <div className="bg-[#070D22]/80 border border-white/10 rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab('inside')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'inside'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live: Inside ({currentlyInsideList.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overstay Alert Banner (Warden/Admin) */}
      {!isStudent && stats.overstayCount > 0 && (
        <div className="bg-gradient-to-r from-rose-500/20 via-rose-950/40 to-transparent border border-rose-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-300 flex items-center gap-2">
                ⚠️ VISITOR OVERSTAY ALERT ({stats.overstayCount} Guest{stats.overstayCount > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                One or more visitors have stayed past their approved departure time. Security action is advised.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inside')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.4)] flex items-center"
          >
            Review Inside Guests <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Visitors Today */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visitors Today</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.visitorsToday}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Scheduled today</span>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{stats.pendingRequests}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting signoff</span>
        </div>

        {/* Approved */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-purple-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 mt-2">{stats.approvedVisitors}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Pass issued</span>
        </div>

        {/* Currently Inside */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Currently Inside</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{stats.currentlyInside}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Active on premises</span>
        </div>

        {/* Checked Out */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Checked Out</span>
            <LogOut className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-300 mt-2">{stats.checkedOut}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Completed visits</span>
        </div>

        {/* Rejected */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Rejected</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{stats.rejected}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Declined requests</span>
        </div>
      </div>

      {/* Main Tabs Container */}
      {activeTab === 'all' && (
        <>
          {/* Search & Filter Toolbar */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/15 shadow-glass flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  isStudent
                    ? 'Search by guest name, mobile, relationship, purpose...'
                    : 'Search by guest, student name, roll number, room, vehicle...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">⏳ Pending Approval</option>
                <option value="Approved">✅ Approved</option>
                <option value="Checked In">🟢 Checked In</option>
                <option value="Checked Out">⚪ Checked Out</option>
                <option value="Rejected">❌ Rejected</option>
                <option value="Cancelled">🚫 Cancelled</option>
              </select>

              {/* Visitor Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Visitor Types</option>
                {VISITOR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Visitors Grid */}
          {loading ? (
            <LoadingSpinner size="md" message="Loading Visitor Registry..." />
          ) : visitors.length === 0 ? (
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-12 border border-cyan-500/15 text-center shadow-glass">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No visitor requests found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {search || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No results match your search and filter criteria.'
                  : 'Pre-registered guests and visit requests will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visitors.map((visitor) => {
                const isOverstay = visitor.is_overstay === 1;

                return (
                  <div
                    key={visitor.id}
                    className={`bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border shadow-glass transition-all hover:translate-y-[-2px] flex flex-col justify-between ${
                      isOverstay
                        ? 'border-rose-500/50 bg-rose-950/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                        : 'border-cyan-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                              {visitor.visitor_name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {visitor.mobile_number}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={isOverstay ? 'OVERSTAY ALERT' : visitor.status} />
                          <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            {visitor.relationship}
                          </span>
                        </div>
                      </div>

                      {/* Resident Info (For Warden/Admin) */}
                      {!isStudent && (
                        <div className="bg-white/[0.03] rounded-xl p-2.5 mb-3 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              {visitor.student_name}
                            </span>
                            <span className="text-[11px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/25">
                              Room {visitor.room_number || 'N/A'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Roll: {visitor.student_roll} • {visitor.hostel_name || 'Hostel'}
                          </p>
                        </div>
                      )}

                      {/* Visit Timings & Details */}
                      <div className="space-y-2 mb-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            Visit Date:
                          </span>
                          <span className="font-bold text-slate-200">
                            {new Date(visitor.visit_date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            Window:
                          </span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {visitor.expected_arrival} - {visitor.expected_departure}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Visitors:</span>
                          <span className="font-bold text-white">{visitor.number_of_visitors} Person(s)</span>
                        </div>

                        <div className="pt-1 border-t border-white/5">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Purpose</span>
                          <p className="text-slate-200 text-xs mt-0.5 line-clamp-2">{visitor.purpose}</p>
                        </div>
                      </div>

                      {/* Log details if checked in/out */}
                      {visitor.check_in_time && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 mb-3 text-[11px]">
                          <div className="flex items-center justify-between text-emerald-300 font-semibold">
                            <span>Checked In:</span>
                            <span className="font-mono">{new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {visitor.check_out_time ? (
                            <div className="flex items-center justify-between text-slate-300 mt-1">
                              <span>Checked Out:</span>
                              <span className="font-mono">{new Date(visitor.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-amber-300 font-bold mt-1">
                              <span>Duration:</span>
                              <span className="font-mono">{visitor.duration_minutes || 0} mins</span>
                            </div>
                          )}
                          {visitor.vehicle_number && (
                            <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
                              <Car className="w-3 h-3 text-cyan-400" /> {visitor.vehicle_number}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Rejection notice */}
                      {visitor.status === 'Rejected' && visitor.rejection_reason && (
                        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 mb-3 text-[11px] text-rose-300">
                          <strong className="block text-rose-400 font-bold">Reason for Rejection:</strong>
                          <p className="mt-0.5">{visitor.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setDetailsModalOpen(true);
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>

                      <div className="flex items-center space-x-2">
                        {/* Student actions */}
                        {isStudent && visitor.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelRequest(visitor.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Warden / Admin actions */}
                        {!isStudent && (
                          <>
                            {visitor.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(visitor.id)}
                                  className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center"
                                >
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVisitor(visitor);
                                    setRejectReason('');
                                    setRejectModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {visitor.status === 'Approved' && (
                              <button
                                onClick={() => {
                                  setSelectedVisitor(visitor);
                                  setCheckInForm({
                                    id_proof_type: 'Aadhaar Card',
                                    id_proof_reference: '',
                                    vehicle_number: '',
                                    remarks: '',
                                  });
                                  setCheckInModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center"
                              >
                                <DoorOpen className="w-3.5 h-3.5 mr-1" />
                                Check In
                              </button>
                            )}

                            {visitor.status === 'Checked In' && (
                              <button
                                onClick={() => {
                                  setSelectedVisitor(visitor);
                                  setCheckOutModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(123,97,255,0.3)] flex items-center"
                              >
                                <LogOut className="w-3.5 h-3.5 mr-1" />
                                Check Out
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Live Currently Inside Table View (Warden/Admin) */}
      {activeTab === 'inside' && !isStudent && (
        <div className="space-y-4">
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-glass flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                Active Campus Guests Roster ({currentlyInsideList.length} Currently Inside)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time gate registry of non-residents on hostel grounds with active time tracking and overstay monitoring
              </p>
            </div>
            <button
              onClick={() => {
                fetchCurrentlyInside();
                fetchVisitors();
              }}
              className="px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/10 rounded-xl text-xs font-bold text-cyan-300 border border-cyan-500/20"
            >
              Refresh Live Table
            </button>
          </div>

          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 overflow-hidden shadow-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold">
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Resident Host</th>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Elapsed Duration</th>
                    <th className="py-3 px-4">Expected Departure</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Security / Overstay Status</th>
                    <th className="py-3 px-4 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentlyInsideList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400 text-xs">
                        No visitors are currently inside the hostel premises.
                      </td>
                    </tr>
                  ) : (
                    currentlyInsideList.map((row) => {
                      const isOverstay = row.is_overstay === 1;

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            isOverstay ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{row.visitor_name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{row.mobile_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-200 font-medium">{row.student_name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Roll: {row.student_roll}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-purple-300">
                            Room {row.room_number || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {new Date(row.check_in_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/20">
                              {row.elapsed_minutes || 0} mins
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {row.expected_departure}
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-[140px] truncate" title={row.purpose}>
                            {row.purpose}
                          </td>
                          <td className="py-3 px-4">
                            {isOverstay ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 text-[11px] animate-pulse flex items-center w-fit gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                OVERSTAY (+{row.overstay_minutes}m)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-[11px] flex items-center w-fit gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                🟢 Currently Inside
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedVisitor(row);
                                setCheckOutModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-[0_0_10px_rgba(123,97,255,0.3)]"
                            >
                              Check Out
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab (Warden/Admin) */}
      {activeTab === 'analytics' && !isStudent && (
        <div className="space-y-6">
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Visitor Traffic & Security Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Daily visitor turnover trends, category demographic distribution, and duration metrics
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2 text-cyan-400" />
              Print Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Visitor Trend */}
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                7-Day Inbound Guest Volume
              </h3>
              <div className="h-64 w-full">
                {analyticsData?.dailyTrend && analyticsData.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#070D22',
                          borderColor: 'rgba(0, 229, 255, 0.3)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="total" name="Total Scheduled" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualVisits" name="Completed Visits" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No visitor traffic recorded this week.
                  </div>
                )}
              </div>
            </div>

            {/* Visitor Type Share */}
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                Visitor Relationship Demographics
              </h3>
              <div className="h-64 w-full">
                {analyticsData?.typeDistribution && analyticsData.typeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.typeDistribution}
                        dataKey="count"
                        nameKey="visitor_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {analyticsData.typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#070D22',
                          borderColor: 'rgba(123, 97, 255, 0.3)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No demographic distribution data.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Average Visit Duration Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 shadow-glass">
              <span className="text-xs text-slate-400 uppercase font-bold">Avg Campus Visit Duration</span>
              <p className="text-3xl font-black text-cyan-300 mt-2">
                {analyticsData?.avgDurationMinutes || 75} <span className="text-sm font-normal">minutes</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Based on gate checkout logs</span>
            </div>

            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/15 shadow-glass">
              <span className="text-xs text-slate-400 uppercase font-bold">Approved vs Rejected Ratio</span>
              <p className="text-3xl font-black text-purple-300 mt-2">
                {stats.approvedVisitors + stats.checkedOut} / {stats.rejected}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Approval compliance rate</span>
            </div>

            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/15 shadow-glass">
              <span className="text-xs text-slate-400 uppercase font-bold">Peak Visiting Window</span>
              <p className="text-3xl font-black text-amber-300 mt-2">16:00 - 19:00</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Late afternoon arrivals</span>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Register Visitor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="🚪 Pre-Register / Request Visitor Pass"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {!isStudent && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">Select Student Resident *</label>
              <select
                value={createForm.student_id}
                onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}
                required
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">-- Choose Resident --</option>
                {studentsList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name || st.userId?.name} ({st.studentId || st.roll_no}) - Room {st.room_number || st.roomId?.roomNumber || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={createForm.visitor_name}
                onChange={(e) => setCreateForm({ ...createForm, visitor_name: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile Contact Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={createForm.mobile_number}
                onChange={(e) => setCreateForm({ ...createForm, mobile_number: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Relationship to Resident *</label>
              <select
                value={createForm.relationship}
                onChange={(e) => setCreateForm({ ...createForm, relationship: e.target.value, visitor_type: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Parent">Parent (Father / Mother)</option>
                <option value="Relative">Relative (Uncle / Aunt / Sibling)</option>
                <option value="Friend">Friend / Classmate</option>
                <option value="Service Provider">Service Provider (Technician / Doctor)</option>
                <option value="Delivery Person">Delivery Personnel</option>
                <option value="Other">Other Official Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Number of Visitors *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={createForm.number_of_visitors}
                onChange={(e) => setCreateForm({ ...createForm, number_of_visitors: parseInt(e.target.value) || 1 })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Visit Date *</label>
              <input
                type="date"
                required
                value={createForm.visit_date}
                onChange={(e) => setCreateForm({ ...createForm, visit_date: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Expected Arrival *</label>
              <input
                type="time"
                required
                value={createForm.expected_arrival}
                onChange={(e) => setCreateForm({ ...createForm, expected_arrival: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Expected Departure *</label>
              <input
                type="time"
                required
                value={createForm.expected_departure}
                onChange={(e) => setCreateForm({ ...createForm, expected_departure: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Purpose of Visit *</label>
            <textarea
              rows="2"
              required
              placeholder="e.g. Family weekend visit, fee payment discussion, study materials handover..."
              value={createForm.purpose}
              onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {submitting ? 'Submitting...' : isStudent ? 'Submit Request to Warden' : 'Create & Approve Visitor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-In Modal (Entrance Gate) */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title={`🟢 Gate Check-In: ${selectedVisitor?.visitor_name || ''}`}
      >
        <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Visitor:</span>
              <span className="font-bold text-white">{selectedVisitor?.visitor_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Host Resident:</span>
              <span className="font-bold text-purple-300">
                {selectedVisitor?.student_name} (Room {selectedVisitor?.room_number || 'N/A'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Approved Departure:</span>
              <span className="font-mono text-cyan-300 font-bold">{selectedVisitor?.expected_departure}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">ID Proof Type *</label>
              <select
                value={checkInForm.id_proof_type}
                onChange={(e) => setCheckInForm({ ...checkInForm, id_proof_type: e.target.value })}
                required
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {ID_PROOF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">ID Reference (e.g. Last 4 Digits) *</label>
              <input
                type="text"
                required
                placeholder="e.g. XXXX-4812"
                value={checkInForm.id_proof_reference}
                onChange={(e) => setCheckInForm({ ...checkInForm, id_proof_reference: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Vehicle License Plate (If Applicable)</label>
            <input
              type="text"
              placeholder="e.g. AP 39 BK 2049"
              value={checkInForm.vehicle_number}
              onChange={(e) => setCheckInForm({ ...checkInForm, vehicle_number: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Security Guard Remarks</label>
            <input
              type="text"
              placeholder="e.g. Gate pass #GP-102 issued. Admitted with 1 bag."
              value={checkInForm.remarks}
              onChange={(e) => setCheckInForm({ ...checkInForm, remarks: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCheckInModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center"
            >
              <DoorOpen className="w-4 h-4 mr-1.5" />
              {submitting ? 'Checking in...' : 'Admit Visitor at Gate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-Out Confirmation Modal */}
      <Modal
        isOpen={checkOutModalOpen}
        onClose={() => setCheckOutModalOpen(false)}
        title="⚪ Confirm Visitor Departure & Check-Out"
      >
        <form onSubmit={handleCheckOutSubmit} className="space-y-4 text-xs">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Visitor:</span>
              <span className="font-bold text-white text-sm">{selectedVisitor?.visitor_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Resident Host:</span>
              <span className="text-slate-200">{selectedVisitor?.student_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Arrival Time:</span>
              <span className="font-mono text-cyan-300">
                {selectedVisitor?.check_in_time
                  ? new Date(selectedVisitor.check_in_time).toLocaleTimeString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Departure:</span>
              <span className="font-mono text-emerald-300 font-bold">Now</span>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Confirming will mark this guest as officially departed from the hostel grounds, record the departure timestamp, and close the gate log.
          </p>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCheckOutModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(123,97,255,0.3)] flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {submitting ? 'Recording Departure...' : 'Confirm Check-Out'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Request Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="❌ Reject Visitor Request"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <p className="text-slate-300">
            Please specify why this visitor request for <strong>{selectedVisitor?.visitor_name}</strong> is being rejected. This reason will be transmitted to the resident student.
          </p>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Rejection Reason *</label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Requested visit falls outside permitted visiting hours (09:00 - 20:00). Prior disciplinary hold."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              {submitting ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Visitor Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`📋 Visitor Pass Dossier`}
      >
        {selectedVisitor && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-extrabold text-white">{selectedVisitor.visitor_name}</h3>
                <span className="text-slate-400 font-mono text-[11px]">{selectedVisitor.mobile_number}</span>
              </div>
              <StatusBadge status={selectedVisitor.is_overstay === 1 ? 'OVERSTAY ALERT' : selectedVisitor.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Relationship</span>
                <span className="font-bold text-white">{selectedVisitor.relationship}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Guest Count</span>
                <span className="font-bold text-white">{selectedVisitor.number_of_visitors} Person(s)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Host Resident</span>
                <span className="font-bold text-slate-200">{selectedVisitor.student_name}</span>
                <span className="text-slate-400 text-[11px] block font-mono">
                  Room {selectedVisitor.room_number || 'N/A'} • {selectedVisitor.hostel_name || 'Hostel'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Visit Date & Hours</span>
                <span className="font-bold text-slate-200">{selectedVisitor.visit_date}</span>
                <span className="text-slate-400 text-[11px] block font-mono">
                  {selectedVisitor.expected_arrival} - {selectedVisitor.expected_departure}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Purpose</span>
              <p className="text-slate-200 mt-1">{selectedVisitor.purpose}</p>
            </div>

            {selectedVisitor.check_in_time && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1.5">
                <span className="text-emerald-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Security Verification Record
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ID Proof</span>
                    <strong>{selectedVisitor.id_proof_type || 'N/A'}</strong> ({selectedVisitor.id_proof_reference || 'N/A'})
                  </div>
                  {selectedVisitor.vehicle_number && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vehicle</span>
                      <strong className="font-mono text-cyan-300">{selectedVisitor.vehicle_number}</strong>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-emerald-500/20">
                  <span>Admitted at: <strong className="font-mono text-white">{new Date(selectedVisitor.check_in_time).toLocaleString()}</strong></span>
                  {selectedVisitor.check_out_time && (
                    <span>Departed at: <strong className="font-mono text-white">{new Date(selectedVisitor.check_out_time).toLocaleString()}</strong></span>
                  )}
                </div>
              </div>
            )}

            {selectedVisitor.rejection_reason && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-rose-300">
                <span className="text-rose-400 text-[10px] uppercase font-bold block">Rejection Note</span>
                <p className="mt-0.5">{selectedVisitor.rejection_reason}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VisitorManagementPage;
