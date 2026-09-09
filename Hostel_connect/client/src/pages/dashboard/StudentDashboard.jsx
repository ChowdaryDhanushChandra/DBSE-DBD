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
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Student Resident Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            {student?.course} ({student?.year}) • Student ID: <span className="font-bold text-white">{student?.studentId}</span>
          </p>
        </div>

        {/* Decorative blur circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Top 3 Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Information & Roommates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Accomodation</p>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {student?.hostelId?.name || 'Unassigned'}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Room {student?.roomId?.roomNumber || 'Pending'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Floor {student?.roomId?.floor || '1'} • {student?.roomId?.roomType || 'Double'} Bed
            </p>

            {/* Roommates List */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Roommates ({roommates?.length || 0})
              </p>
              {roommates && roommates.length > 0 ? (
                <div className="space-y-2">
                  {roommates.map((rm) => (
                    <div key={rm._id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-[10px]">
                          {rm.userId?.name?.[0] || 'R'}
                        </div>
                        <span className="font-semibold text-slate-700">{rm.userId?.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rm.course?.split(' ')?.[0]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No roommates allocated yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/student/my-room"
            className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-end"
          >
            Room Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Fee Payment Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Fee Status</p>
                  <h3 className="text-xl font-black text-slate-900">
                    {totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN')}` : 'All Clear'}
                  </h3>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  totalDue > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
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
                    className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{fee.feeType}</p>
                      <p className="text-[10px] text-slate-400">
                        Due {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">₹{fee.amount}</span>
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setPayFeeModal(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-emerald-50 rounded-xl text-emerald-700 text-xs font-medium">
                  🎉 No pending dues for current semester!
                </div>
              )}
            </div>
          </div>

          <Link
            to="/student/fees"
            className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-end"
          >
            Payment History & Receipts <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Meal Attendance Counter */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Dining Attendance</p>
                  <h3 className="text-xl font-black text-slate-900">
                    {attendanceCount || 0} Meals
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                Active Plan
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-2">
              Valid for North & South Campus Dining Mess Halls.
            </p>
            <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 text-xs text-cyan-900">
              <p className="font-semibold">Mess Timing Reminder:</p>
              <p className="text-[11px] text-cyan-800 mt-0.5">Breakfast: 7:30 - 9:30 AM | Lunch: 12:30 - 2:30 PM | Dinner: 7:30 - 9:45 PM</p>
            </div>
          </div>

          <Link
            to="/student/attendance"
            className="mt-4 text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center justify-end"
          >
            View Attendance Log <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Today's Mess Menu */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Daily Nutrition Plan
            </span>
            <h3 className="text-lg font-bold text-slate-900">Today's Mess Menu</h3>
          </div>
          <Link
            to="/student/mess-menu"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
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
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800">{meal}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {menuSlot?.calories ? `${menuSlot.calories} kcal` : 'Balanced'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-3">
                    {menuSlot?.timing || 'Standard Slot'}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {menuSlot?.foodItems && menuSlot.foodItems.length > 0 ? (
                      menuSlot.foodItems.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">Menu for this slot is updating</li>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Maintenance Complaints</h3>
              <p className="text-xs text-slate-400">Track progress of reported room issues</p>
            </div>
            <Link
              to="/student/complaints"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + New Issue
            </Link>
          </div>

          <div className="space-y-3">
            {complaints && complaints.length > 0 ? (
              complaints.map((c) => (
                <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{c.description}</p>
                  {c.resolutionNotes && (
                    <p className="mt-1.5 text-[11px] text-indigo-600 font-medium bg-indigo-50/60 p-1.5 rounded-lg">
                      Staff Note: {c.resolutionNotes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">
                You have no active maintenance complaints. Everything is running smoothly!
              </p>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Notice Board</h3>
              <p className="text-xs text-slate-400">Official updates from administration & wardens</p>
            </div>
            <Link
              to="/student/announcements"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((a) => (
                <div key={a._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{a.title}</span>
                    <StatusBadge status={a.priority} />
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{a.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No recent notices.</p>
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
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 font-medium">Invoice Number: {selectedFee?.invoiceNumber}</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              ₹{selectedFee?.amount?.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Due Date: {selectedFee?.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'Immediate'}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Payment Gateway / Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Online / UPI">Instant UPI (GPay / PhonePe / Paytm)</option>
              <option value="Credit / Debit Card">Credit / Debit Card (Visa / Mastercard)</option>
              <option value="Net Banking">Net Banking (All Major Banks)</option>
              <option value="Cash">Cash at Hostel Office</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center space-x-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px]">Demo Payment Simulation: Confirmation & receipt will be generated instantly.</span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setPayFeeModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
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
