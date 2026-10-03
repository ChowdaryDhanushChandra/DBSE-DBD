import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Users,
  UtensilsCrossed,
  Filter,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const MealAttendancePage = () => {
  const { isStudent } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [mealType, setMealType] = useState('Breakfast');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, statsRes] = await Promise.all([
        api.get(`/mess/attendance?date=${date}&mealType=${mealType}`),
        api.get('/mess/stats'),
      ]);

      if (attRes.data.success) {
        setAttendanceRecords(attRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // If not student, also fetch student list to mark attendance
      if (!isStudent) {
        const studRes = await api.get('/students?limit=100&status=Active');
        if (studRes.data.success) {
          setStudents(studRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, mealType]);

  const handleToggleAttendance = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    setMarking(true);
    try {
      await api.post('/mess/attendance', {
        studentId,
        date,
        mealType,
        status: newStatus,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating attendance');
    } finally {
      setMarking(false);
    }
  };

  const getAttendanceForStudent = (studentId) => {
    return attendanceRecords.find((r) => r.studentId?._id === studentId || r.studentId === studentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <CalendarCheck className="w-6 h-6" />
            </span>
            Meal Attendance & Dining Tracker
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time mess check-ins, dining headcounts, and student food logs
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 shadow-glass flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-cyan-300/80 uppercase">Today's Total Meals</p>
            <h3 className="text-2xl font-black text-white">
              {stats?.totalServedToday || 0} Meals
            </h3>
          </div>
        </div>

        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/15 shadow-glass flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-300/80 uppercase">Today's Breakdown</p>
            <p className="text-xs font-semibold text-zinc-300 mt-0.5">
              B: {stats?.breakdownToday?.breakfast || 0} | L: {stats?.breakdownToday?.lunch || 0} | D:{' '}
              {stats?.breakdownToday?.dinner || 0}
            </p>
          </div>
        </div>

        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 shadow-glass flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-cyan-300/80 uppercase">Semester Meals Served</p>
            <h3 className="text-2xl font-black text-white">
              {stats?.totalAllTime || 0} Meals
            </h3>
          </div>
        </div>
      </div>

      {/* Date & Meal Filter Row */}
      <div className="bg-[#070D22]/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/15 shadow-glass flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-zinc-400 uppercase">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-zinc-400 uppercase">Meal Slot:</span>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Showing: <span className="font-bold text-cyan-400">{mealType}</span> on{' '}
          <span className="font-bold text-white">{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Roster / Student History Table */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading meal records..." />
        ) : isStudent ? (
          /* Student Personal Log */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050816]/90 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Meal Slot</th>
                  <th className="px-5 py-3.5">Attendance Status</th>
                  <th className="px-5 py-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((r) => (
                    <tr key={r._id || r.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">{r.date}</td>
                      <td className="px-5 py-3.5 text-zinc-400">{r.mealType}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            r.status === 'Present'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-zinc-500 text-[11px]">
                        Marked by Dining Staff
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-zinc-500 text-xs">
                      No check-ins recorded on {date} for {mealType}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Admin / Warden Check-in Roster */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050816]/90 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Hostel & Room</th>
                  <th className="px-5 py-3.5">Attendance Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {students.map((st) => {
                  const sId = st._id || st.id;
                  const record = getAttendanceForStudent(sId);
                  const isPresent = record?.status === 'Present';

                  return (
                    <tr key={sId} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
                            {(st.userId?.name || st.name)?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-white">{st.userId?.name || st.name}</p>
                            <p className="text-[11px] text-zinc-500">{st.course || 'Resident'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-cyan-400">
                        {st.studentId || st.studentIdentifier}
                      </td>

                      <td className="px-5 py-3.5 text-zinc-400">
                        {st.hostelId?.name || st.hostelName ? `${st.hostelId?.name || st.hostelName} - Room ${st.roomId?.roomNumber || st.roomNumber || 'N/A'}` : 'Not Allocated'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPresent
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              Present
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                              Not Checked In
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={marking}
                          onClick={() => handleToggleAttendance(sId, record?.status)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                            isPresent
                              ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                              : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-neon-cyan'
                          }`}
                        >
                          {isPresent ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealAttendancePage;
