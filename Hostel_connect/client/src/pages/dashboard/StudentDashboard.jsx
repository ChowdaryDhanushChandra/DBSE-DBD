import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  UtensilsCrossed,
  CreditCard,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
  DollarSign,
  Compass,
  Star,
  MessageSquare,
  AlertTriangle,
  Package,
  DoorOpen,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pay modal state
  const [payFeeModal, setPayFeeModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online / UPI');
  const [paying, setPaying] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    setPaying(true);
    try {
      const txnId = `TXN-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await api.put(`/fees/${selectedFee._id}`, {
        paymentStatus: 'Paid',
        paymentMethod,
        transactionId: txnId,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setPayFeeModal(false);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading Student Portal..." />;
  }

  const {
    student,
    roommates,
    pendingFees,
    totalDue,
    todayMenu,
    complaints,
    announcements,
    attendanceCount,
    todayMealRating = 4.2,
    hostelCleanlinessScore = 4.4,
    myMessFeedbackCount = 12,
    myHygieneComplaints = { open: 2, resolved: 5 },
    parcelStats = { total: 0, pending: 0 },
    visitorStats = { total: 0, pending: 0, approved: 0, active: 0 },
  } = data || {};

  return (
    <div className="space-y-8 text-slate-100">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-950/80 to-[#070D22] border border-cyan-500/20 p-6 sm:p-8 text-white shadow-glass">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3 border border-cyan-500/30 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resident Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            {student?.course} ({student?.year}) • Student ID: <span className="font-bold text-cyan-400 font-mono">{student?.studentId}</span>
          </p>
        </div>
      </div>

      {/* 4 Dedicated Hygiene & Mess Cards for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Meal Rating */}
        <Link
          to="/student/meal-feedback"
          className="group relative bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 hover:border-amber-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400/30 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Today's Meal
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{Number(todayMealRating).toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Average Dining Score</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Hostel Cleanliness */}
        <Link
          to="/student/hygiene-cleanliness"
          className="group relative bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Hygiene Score
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{Number(hostelCleanlinessScore).toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Campus Cleanliness</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* My Mess Feedback */}
        <Link
          to="/student/meal-feedback"
          className="group relative bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              My Submissions
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{myMessFeedbackCount}</span>
              <span className="text-xs font-semibold text-slate-400">Reviews</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Mess Feedback Logs</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* My Hygiene Complaints */}
        <Link
          to="/student/hygiene-complaints"
          className="group relative bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-rose-500/20 hover:border-rose-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Hygiene Tickets
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                {myHygieneComplaints?.open ?? 0} Open
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                {myHygieneComplaints?.resolved ?? 0} Done
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
              <span>Report & Track Issues</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>
      </div>

      {/* 2 Dedicated Resident Services: Parcels & Visitors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* My Parcels */}
        <Link
          to="/student/parcels"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">My Deliveries & Parcels</h3>
                {parcelStats?.pending > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {parcelStats.pending} Ready for Pickup
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {parcelStats?.pending > 0
                  ? `Collect package at hostel reception desk`
                  : `All packages collected • ${parcelStats?.total || 0} deliveries total`}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>

        {/* Visitor Requests */}
        <Link
          to="/student/visitors"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(123,97,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Visitor Passes & Guests</h3>
                {visitorStats?.active > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 {visitorStats.active} Guest Inside
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {visitorStats?.pending > 0
                  ? `${visitorStats.pending} request awaiting warden approval`
                  : `Pre-register visitors & view pass status`}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* Top 3 Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Information & Roommates */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Accommodation</p>
                  <h3 className="text-base font-extrabold text-white">
                    {student?.hostelId?.name || 'Unassigned'}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Room {student?.roomId?.roomNumber || 'Pending'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Floor {student?.roomId?.floor || '1'} • {student?.roomId?.roomType || 'Double'} Bed
            </p>

            {/* Roommates List */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Roommates ({roommates?.length || 0})
              </p>
              {roommates && roommates.length > 0 ? (
                <div className="space-y-2">
                  {roommates.map((rm) => (
                    <div key={rm._id} className="flex items-center justify-between text-xs bg-white/[0.03] p-2 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px] border border-purple-500/30">
                          {rm.userId?.name?.[0] || 'R'}
                        </div>
                        <span className="font-semibold text-slate-200">{rm.userId?.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rm.course?.split(' ')?.[0]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No roommates allocated yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/student/my-room"
            className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-end transition-colors"
          >
            Room Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Fee Payment Summary */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(123,97,255,0.2)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Fee Status</p>
                  <h3 className="text-xl font-black text-white">
                    {totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN')}` : 'All Clear'}
                  </h3>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  totalDue > 0
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {totalDue > 0 ? 'Due Pending' : 'Paid Up'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {pendingFees && pendingFees.length > 0 ? (
                pendingFees.map((fee) => (
                  <div
                    key={fee._id}
                    className="p-2.5 rounded-xl bg-white/[0.03] flex items-center justify-between border border-white/10"
                  >
                    <div>
                      <p className="font-bold text-white">{fee.feeType}</p>
                      <p className="text-[10px] text-slate-400">
                        Due {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-cyan-400 font-mono">₹{fee.amount}</span>
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setPayFeeModal(true);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg font-bold text-[11px] shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer transition-all"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                  🎉 No pending dues for current semester!
                </div>
              )}
            </div>
          </div>

          <Link
            to="/student/fees"
            className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-end transition-colors"
          >
            Payment History & Receipts <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Meal Attendance Counter */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30 shadow-[0_0_12px_rgba(255,77,157,0.2)]">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Dining Attendance</p>
                  <h3 className="text-xl font-black text-white">
                    {attendanceCount || 0} Meals
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-cyan-300 border border-cyan-500/20">
                Active Plan
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-2">
              Valid for North & South Campus Dining Mess Halls.
            </p>
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 text-xs text-slate-300">
              <p className="font-semibold text-cyan-400">Mess Timing Schedule:</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Breakfast: 7:30 - 9:30 AM | Lunch: 12:30 - 2:30 PM | Dinner: 7:30 - 9:45 PM</p>
            </div>
          </div>

          <Link
            to="/student/attendance"
            className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-end transition-colors"
          >
            View Attendance Log <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Today's Mess Menu */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Daily Nutrition Plan
            </span>
            <h3 className="text-lg font-bold text-white">Today's Mess Menu</h3>
          </div>
          <Link
            to="/student/mess-menu"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
          >
            Weekly 7-Day Plan <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
            const menuSlot = todayMenu?.find((m) => m.mealType === meal);
            return (
              <div
                key={meal}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{meal}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {menuSlot?.calories ? `${menuSlot.calories} kcal` : 'Balanced'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-3">
                    {menuSlot?.timing || 'Standard Slot'}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {menuSlot?.foodItems && menuSlot.foodItems.length > 0 ? (
                      menuSlot.foodItems.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_6px_#00e5ff]" />
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">Menu for this slot is updating</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row: Active Complaints & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Tracker */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">My Maintenance Complaints</h3>
              <p className="text-xs text-slate-400">Track progress of reported room issues</p>
            </div>
            <Link
              to="/student/complaints"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              + New Issue
            </Link>
          </div>

          <div className="space-y-3">
            {complaints && complaints.length > 0 ? (
              complaints.map((c) => (
                <div key={c._id} className="p-3 bg-white/[0.03] rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{c.description}</p>
                  {c.resolutionNotes && (
                    <p className="mt-1.5 text-[11px] text-cyan-300 font-medium bg-cyan-500/10 border border-cyan-500/20 p-1.5 rounded-lg">
                      Staff Note: {c.resolutionNotes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                You have no active maintenance complaints. Everything is running smoothly!
              </p>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Notice Board</h3>
              <p className="text-xs text-slate-400">Official updates from administration & wardens</p>
            </div>
            <Link
              to="/student/announcements"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((a) => (
                <div key={a._id} className="p-3 bg-white/[0.03] rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{a.title}</span>
                    <StatusBadge status={a.priority} />
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{a.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">No recent notices.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pay Fee Modal */}
      <Modal
        isOpen={payFeeModal}
        onClose={() => setPayFeeModal(false)}
        title={`Settle ${selectedFee?.feeType}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePayFee} className="space-y-4 text-xs">
          <div className="p-4 bg-white/[0.03] rounded-xl border border-white/10">
            <p className="text-slate-400 font-medium">Invoice Number: {selectedFee?.invoiceNumber}</p>
            <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">
              ₹{selectedFee?.amount?.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Due Date: {selectedFee?.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'Immediate'}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Select Payment Gateway / Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
            >
              <option value="Online / UPI">Instant UPI (GPay / PhonePe / Paytm)</option>
              <option value="Credit / Debit Card">Credit / Debit Card (Visa / Mastercard)</option>
              <option value="Net Banking">Net Banking (All Major Banks)</option>
              <option value="Cash">Cash at Hostel Office</option>
            </select>
          </div>

          <div className="p-3 bg-cyan-500/10 text-cyan-300 rounded-xl border border-cyan-500/20 flex items-center space-x-2">
            <Shield className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="text-[11px]">Instant Confirmation & Digital Voucher will be generated upon transaction.</span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setPayFeeModal(false)}
              className="px-4 py-2 text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl font-semibold border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {paying ? 'Processing...' : `Pay ₹${selectedFee?.amount}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
