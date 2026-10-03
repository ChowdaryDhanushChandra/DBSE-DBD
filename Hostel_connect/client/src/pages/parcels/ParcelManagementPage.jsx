import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  MapPin,
  Calendar,
  Building,
  User,
  Phone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  FileText,
  Printer,
  X,
  Sparkles,
  ArrowRight,
  Trash2,
  Edit,
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

const COURIER_OPTIONS = [
  'Amazon Prime',
  'Flipkart Logistics',
  'Blue Dart',
  'Delhivery',
  'DTDC Express',
  'India Post / Speed Post',
  'Shadowfax',
  'Ekart Logistics',
  'Other Courier',
];

const PARCEL_TYPES = [
  'Standard Box',
  'Document / Books',
  'Electronics & Gadgets',
  'Clothing & Apparel',
  'Medicine / Pharma',
  'Perishable / Food',
  'Fragile Item',
];

const PIE_COLORS = ['#00E5FF', '#7B61FF', '#FF4D9D', '#10B981', '#F59E0B', '#6366F1'];

export const ParcelManagementPage = () => {
  const { user, isAdmin, isWarden, isStudent } = useAuth();

  const [parcels, setParcels] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendingCollection: 0,
    collected: 0,
    returned: 0,
    todayDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('parcels'); // 'parcels' | 'reports'

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states for Add / Edit
  const [studentsList, setStudentsList] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    courier_name: 'Amazon Prime',
    tracking_number: '',
    parcel_type: 'Standard Box',
    sender_name: '',
    expected_date: '',
    received_at: '',
    storage_location: 'Rack A - Shelf 1',
    status: 'Received at Hostel',
    remarks: '',
  });

  const [collectData, setCollectData] = useState({
    collected_by: '',
  });

  // Fetch parcels list & stats
  const fetchParcels = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (courierFilter !== 'all') params.courier = courierFilter;

      const res = await api.get('/parcels', { params });
      if (res.data.success) {
        setParcels(res.data.data.parcels || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch report data for admin/warden
  const fetchReports = async () => {
    if (isStudent) return;
    try {
      const res = await api.get('/parcels/reports');
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load parcel reports:', err);
    }
  };

  // Fetch students for dropdown (Warden/Admin)
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
    fetchParcels();
  }, [search, statusFilter, courierFilter]);

  useEffect(() => {
    if (!isStudent) {
      fetchStudents();
      fetchReports();
    }
  }, [isStudent]);

  // Copy tracking number helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Add Parcel Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id) {
      alert('Please select a student resident.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await api.post('/parcels', formData);
      if (res.data.success) {
        setAddModalOpen(false);
        setFormData({
          student_id: '',
          courier_name: 'Amazon Prime',
          tracking_number: '',
          parcel_type: 'Standard Box',
          sender_name: '',
          expected_date: '',
          received_at: '',
          storage_location: 'Rack A - Shelf 1',
          status: 'Received at Hostel',
          remarks: '',
        });
        fetchParcels();
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register parcel.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit Parcel Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setFormSubmitting(true);
    try {
      const res = await api.put(`/parcels/${selectedParcel.id}`, formData);
      if (res.data.success) {
        setEditModalOpen(false);
        fetchParcels();
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update parcel.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Confirm Collection
  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setFormSubmitting(true);
    try {
      const res = await api.put(`/parcels/${selectedParcel.id}/collect`, {
        collected_by: collectData.collected_by || user.name,
      });
      if (res.data.success) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
        setCollectModalOpen(false);
        setSelectedParcel(null);
        fetchParcels();
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify parcel pickup.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Parcel (Admin only)
  const handleDeleteParcel = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this parcel record?')) return;
    try {
      await api.delete(`/parcels/${id}`);
      fetchParcels();
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete parcel.');
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
              Hostel Logistics & Deliveries
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            📦 Parcel & Delivery <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track student courier deliveries, storage bay slots, and contactless collection verification
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {!isStudent && (
            <>
              <button
                onClick={() => {
                  setFormData({
                    student_id: '',
                    courier_name: 'Amazon Prime',
                    tracking_number: '',
                    parcel_type: 'Standard Box',
                    sender_name: '',
                    expected_date: '',
                    received_at: new Date().toISOString().slice(0, 16),
                    storage_location: 'Rack A - Shelf 1',
                    status: 'Received at Hostel',
                    remarks: '',
                  });
                  setAddModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Register New Parcel
              </button>

              <div className="bg-[#070D22]/80 border border-white/10 rounded-xl p-1 flex">
                <button
                  onClick={() => setActiveTab('parcels')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'parcels'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Parcels
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Analytics & Reports
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Student Urgent Pending Collection Alert */}
      {isStudent && stats.pendingCollection > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Package className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Parcels Ready For Pickup ({stats.pendingCollection})
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                You have parcels stored at the hostel office. Please present your Student ID to collect them.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
            Hostel Office: 09:00 AM - 08:00 PM
          </span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Parcels */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/15 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Parcels</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.total}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Lifetime records</span>
        </div>

        {/* Pending Collection */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Pending Collection</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{stats.pendingCollection}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting student pickup</span>
        </div>

        {/* Collected */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{stats.collected}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Successfully delivered</span>
        </div>

        {/* Today's Deliveries */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-purple-500/20 shadow-glass">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Today's Arrivals</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-300 mt-2">{stats.todayDeliveries}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Received today</span>
        </div>

        {/* Returned / Other */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20 shadow-glass col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Returned</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{stats.returned}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">RTO / Unclaimed</span>
        </div>
      </div>

      {activeTab === 'parcels' ? (
        <>
          {/* Search & Filter Toolbar */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/15 shadow-glass flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  isStudent
                    ? 'Search by parcel ID, courier, tracking number, sender...'
                    : 'Search by student name, roll number, room, courier, tracking...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Received at Hostel">🏢 Received at Hostel</option>
                  <option value="Awaiting Collection">⏳ Awaiting Collection</option>
                  <option value="Student Notified">🔔 Student Notified</option>
                  <option value="Collected">✅ Collected</option>
                  <option value="Expected">📦 Expected</option>
                  <option value="In Transit">🚚 In Transit</option>
                  <option value="Returned">❌ Returned</option>
                </select>
              </div>

              {/* Courier Filter */}
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Couriers</option>
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parcels List / Table */}
          {loading ? (
            <LoadingSpinner size="md" message="Loading Parcel Catalog..." />
          ) : parcels.length === 0 ? (
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-12 border border-cyan-500/15 text-center shadow-glass">
              <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No parcels found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filter tags.'
                  : 'New parcel deliveries registered by staff will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcels.map((parcel) => {
                const isPending = [
                  'Received at Hostel',
                  'Student Notified',
                  'Awaiting Collection',
                  'Expected',
                  'In Transit',
                ].includes(parcel.status);

                return (
                  <div
                    key={parcel.id}
                    className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 hover:border-cyan-400/40 shadow-glass transition-all hover:translate-y-[-2px] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Code & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                            {parcel.parcel_code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">{parcel.parcel_type}</span>
                        </div>
                        <StatusBadge status={parcel.status} />
                      </div>

                      {/* Resident Info (For Warden/Admin) */}
                      {!isStudent && (
                        <div className="bg-white/[0.03] rounded-xl p-2.5 mb-3 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              {parcel.student_name}
                            </span>
                            <span className="text-[11px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/25">
                              Room {parcel.room_number || 'N/A'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">
                            Roll: {parcel.student_roll} • Ph: {parcel.student_phone || 'N/A'}
                          </p>
                        </div>
                      )}

                      {/* Courier & Tracking */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            Courier:
                          </span>
                          <span className="font-bold text-white">{parcel.courier_name}</span>
                        </div>

                        {parcel.tracking_number && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Tracking #:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-slate-300 text-[11px]">{parcel.tracking_number}</span>
                              <button
                                onClick={() => handleCopy(parcel.tracking_number, parcel.id)}
                                className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                                title="Copy tracking number"
                              >
                                {copiedId === parcel.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {parcel.sender_name && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Sender:</span>
                            <span className="text-slate-300 text-[11px] truncate max-w-[150px]">
                              {parcel.sender_name}
                            </span>
                          </div>
                        )}

                        {/* Storage Location */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            Storage Bay:
                          </span>
                          <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                            {parcel.storage_location || 'Hostel Desk'}
                          </span>
                        </div>
                      </div>

                      {/* Received Date & Remarks */}
                      <div className="text-[11px] text-slate-400 mb-4 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <span>Received At:</span>
                          <span className="font-mono text-slate-300">
                            {parcel.received_at
                              ? new Date(parcel.received_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Pending'}
                          </span>
                        </div>
                        {parcel.collected_at && (
                          <div className="flex items-center justify-between mt-1 text-emerald-300">
                            <span>Collected:</span>
                            <span className="font-mono">
                              {new Date(parcel.collected_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                        {parcel.remarks && (
                          <p className="mt-1.5 text-[11px] text-slate-300 italic border-t border-white/5 pt-1">
                            "{parcel.remarks}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          setSelectedParcel(parcel);
                          setDetailsModalOpen(true);
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>

                      <div className="flex items-center space-x-2">
                        {isPending && (
                          <button
                            onClick={() => {
                              setSelectedParcel(parcel);
                              setCollectData({
                                collected_by: isStudent ? user.name : parcel.student_name,
                              });
                              setCollectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            {isStudent ? 'Collect Parcel' : 'Verify Pickup'}
                          </button>
                        )}

                        {!isStudent && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedParcel(parcel);
                                setFormData({
                                  student_id: parcel.student_id,
                                  courier_name: parcel.courier_name,
                                  tracking_number: parcel.tracking_number || '',
                                  parcel_type: parcel.parcel_type,
                                  sender_name: parcel.sender_name || '',
                                  expected_date: parcel.expected_date
                                    ? parcel.expected_date.split('T')[0]
                                    : '',
                                  received_at: parcel.received_at
                                    ? new Date(parcel.received_at).toISOString().slice(0, 16)
                                    : '',
                                  storage_location: parcel.storage_location || 'Rack A - Shelf 1',
                                  status: parcel.status,
                                  remarks: parcel.remarks || '',
                                });
                                setEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 transition-colors"
                              title="Edit Parcel"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteParcel(parcel.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* Reports & Analytics View (Warden/Admin) */
        <div className="space-y-6">
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Courier Deliveries & Turnover Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Historical parcel volume, courier delivery share, and pending turnaround reports
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                7-Day Inbound Deliveries vs Pickups
              </h3>
              <div className="h-64 w-full">
                {reportData?.dailyTrend && reportData.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.dailyTrend}>
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
                      <Bar dataKey="received" name="Received at Hostel" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="collected" name="Collected by Students" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No trend data available for this week.
                  </div>
                )}
              </div>
            </div>

            {/* Courier Distribution */}
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                Courier Volume Share
              </h3>
              <div className="h-64 w-full">
                {reportData?.couriers && reportData.couriers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.couriers}
                        dataKey="count"
                        nameKey="courier_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {reportData.couriers.map((entry, index) => (
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
                    No courier statistics recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overdue Pending Pickups (> 48h) */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-amber-500/20 shadow-glass">
            <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Overdue Uncollected Parcels (&gt; 24h - 48h in Hostel Storage)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Residents who have not collected their packages. Reach out to prevent storage congestion.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">Parcel ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Storage Bay</th>
                    <th className="py-2.5 px-3">Hours Pending</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reportData?.overduePickups && reportData.overduePickups.length > 0 ? (
                    reportData.overduePickups.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{p.parcel_code}</td>
                        <td className="py-2.5 px-3 text-white font-medium">{p.student_name}</td>
                        <td className="py-2.5 px-3 font-mono text-purple-300">Room {p.room_number || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-300">{p.storage_location}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                            {p.hours_pending} hours
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedParcel(p);
                              setCollectData({ collected_by: p.student_name });
                              setCollectModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold"
                          >
                            Mark Collected
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-500">
                        No overdue uncollected parcels. Storage turnover is optimal!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Register Parcel Modal (Warden/Admin) */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="📦 Register New Inbound Parcel">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Select Student Resident *</label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Courier Company *</label>
              <select
                value={formData.courier_name}
                onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                required
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tracking Number</label>
              <input
                type="text"
                placeholder="e.g. AMZ-IN-889024"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Parcel Type</label>
              <select
                value={formData.parcel_type}
                onChange={(e) => setFormData({ ...formData, parcel_type: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {PARCEL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Sender / Merchant</label>
              <input
                type="text"
                placeholder="e.g. Amazon, Myntra, Parents"
                value={formData.sender_name}
                onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Storage Bay / Location *</label>
              <input
                type="text"
                placeholder="e.g. Rack A - Shelf 3"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Arrival Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Received at Hostel">🏢 Received at Hostel</option>
                <option value="Awaiting Collection">⏳ Awaiting Collection</option>
                <option value="Student Notified">🔔 Student Notified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Remarks / Handling Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Fragile, Perishable items, Large heavy box..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-cyan-300 text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              Saving this will automatically generate an in-app push notification for the student with parcel code and pickup details.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {formSubmitting ? 'Registering...' : 'Register & Notify Resident'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Parcel Modal (Warden/Admin) */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="✏️ Edit Parcel Record">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Courier Company</label>
              <select
                value={formData.courier_name}
                onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tracking Number</label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Storage Location</label>
              <input
                type="text"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Parcel Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="Received at Hostel">🏢 Received at Hostel</option>
                <option value="Awaiting Collection">⏳ Awaiting Collection</option>
                <option value="Student Notified">🔔 Student Notified</option>
                <option value="Collected">✅ Collected</option>
                <option value="Returned">❌ Returned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Remarks</label>
            <textarea
              rows="2"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              {formSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Pickup / Collection Modal */}
      <Modal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        title="✅ Confirm Parcel Collection & Pickup"
      >
        <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Parcel Code:</span>
              <span className="font-mono font-bold text-cyan-300">{selectedParcel?.parcel_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Courier:</span>
              <span className="font-bold text-white">{selectedParcel?.courier_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Resident:</span>
              <span className="text-slate-200 font-semibold">{selectedParcel?.student_name || user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Storage Location:</span>
              <span className="text-amber-300 font-bold">{selectedParcel?.storage_location}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Collected By (Resident Name or Authorized Roommate) *
            </label>
            <input
              type="text"
              required
              value={collectData.collected_by}
              onChange={(e) => setCollectData({ collected_by: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCollectModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {formSubmitting ? 'Confirming...' : 'Confirm Pickup'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Parcel Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`📋 Parcel Dossier: ${selectedParcel?.parcel_code || ''}`}
      >
        {selectedParcel && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-base font-extrabold text-white block">
                  {selectedParcel.parcel_code}
                </span>
                <span className="text-slate-400 text-[11px]">{selectedParcel.courier_name}</span>
              </div>
              <StatusBadge status={selectedParcel.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Resident</span>
                <span className="font-bold text-white text-xs">{selectedParcel.student_name}</span>
                <span className="text-slate-400 text-[11px] block font-mono">
                  Roll: {selectedParcel.student_roll || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Accommodation</span>
                <span className="font-bold text-purple-300 text-xs">Room {selectedParcel.room_number || 'N/A'}</span>
                <span className="text-slate-400 text-[11px] block">{selectedParcel.hostel_name || 'Main Hostel'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tracking Number</span>
                <span className="font-mono text-slate-200 text-xs">{selectedParcel.tracking_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Storage Location</span>
                <span className="font-bold text-amber-300 text-xs">{selectedParcel.storage_location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Received Timestamp</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {selectedParcel.received_at ? new Date(selectedParcel.received_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Verified By</span>
                <span className="text-slate-300 text-[11px]">{selectedParcel.verified_by_name || 'Hostel Staff'}</span>
              </div>
            </div>

            {selectedParcel.collected_at && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <span className="text-emerald-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Collection Completed
                </span>
                <p className="text-slate-200 text-xs mt-1">
                  Handed over to <strong className="text-white">{selectedParcel.collected_by}</strong> on{' '}
                  <span className="font-mono text-emerald-300">
                    {new Date(selectedParcel.collected_at).toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {selectedParcel.remarks && (
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Notes / Remarks</span>
                <p className="text-slate-300 text-xs mt-0.5">{selectedParcel.remarks}</p>
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

export default ParcelManagementPage;
