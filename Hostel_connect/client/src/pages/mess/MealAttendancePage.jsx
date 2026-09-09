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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Meal Attendance & Dining Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time mess check-ins, dining headcounts, and student food logs
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Today's Total Meals</p>
            <h3 className="text-2xl font-black text-slate-900">
              {stats?.totalServedToday || 0} Meals
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Today's Breakdown</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              B: {stats?.breakdownToday?.breakfast || 0} | L: {stats?.breakdownToday?.lunch || 0} | D:{' '}
              {stats?.breakdownToday?.dinner || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Semester Meals Served</p>
            <h3 className="text-2xl font-black text-slate-900">
              {stats?.totalAllTime || 0} Meals
            </h3>
          </div>
        </div>
      </div>

      {/* Date & Meal Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Meal Slot:</span>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing: <span className="font-bold text-indigo-600">{mealType}</span> on{' '}
          <span className="font-bold text-slate-800">{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Roster / Student History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading meal records..." />
        ) : isStudent ? (
          /* Student Personal Log */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Meal Slot</th>
                  <th className="px-5 py-3.5">Attendance Status</th>
                  <th className="px-5 py-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-bold text-slate-800">{r.date}</td>
                      <td className="px-5 py-3.5 text-slate-600">{r.mealType}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            r.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                        Marked by Dining Staff
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 text-xs">
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
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Hostel & Room</th>
                  <th className="px-5 py-3.5">Attendance Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const record = getAttendanceForStudent(st._id);
                  const isPresent = record?.status === 'Present';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {st.userId?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.userId?.name}</p>
                            <p className="text-[11px] text-slate-400">{st.course}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-indigo-600">
                        {st.studentId}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {st.hostelId?.name ? `${st.hostelId.name} - Room ${st.roomId?.roomNumber || 'N/A'}` : 'Not Allocated'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Present
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              Not Checked In
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={marking}
                          onClick={() => handleToggleAttendance(st._id, record?.status)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                            isPresent
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
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
