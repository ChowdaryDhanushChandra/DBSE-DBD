import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  BedDouble,
  ShieldAlert,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const MyRoom = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get('/dashboard/student');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your room details..." />;
  }

  const { student, roommates } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Room & Residence</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Campus accommodation details, room inventory, and roommate directory
        </p>
      </div>

      {student?.roomId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Room Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {student.hostelId?.name}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-0.5">
                    Room {student.roomId?.roomNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Floor {student.roomId?.floor} • {student.roomId?.roomType} Occupancy Room
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Confirmed Resident
                  </span>
                </div>
              </div>

              {/* Room Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Total Bed Capacity</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{student.roomId?.capacity} Beds</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Current Occupancy</p>
                  <p className="text-base font-bold text-indigo-600 mt-0.5">
                    {student.roomId?.currentOccupancy} Occupied
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Hostel Gender</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{student.hostelId?.gender}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Room Amenities & Furnishings
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    Individual Study Desk & Chair
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    Dedicated Clothes Wardrobe
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    High-speed Campus Wi-Fi
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    24/7 Power Backup
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    Ceiling Fan & LED Tube
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                    Daily Housekeeping Service
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action: Report Issue */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Maintenance Required?</h4>
                  <p className="text-xs text-indigo-800/80">Report plumbing, electrical, or Wi-Fi issues in Room {student.roomId?.roomNumber}</p>
                </div>
              </div>
              <Link
                to="/student/complaints"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Log Complaint
              </Link>
            </div>
          </div>

          {/* Roommates Sidebar Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Roommates</h3>
              <p className="text-xs text-slate-400">Co-residents sharing this room</p>
            </div>

            <div className="space-y-3">
              {roommates && roommates.length > 0 ? (
                roommates.map((rm) => (
                  <div key={rm._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={
                          rm.userId?.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            rm.userId?.name || 'R'
                          )}&background=e0e7ff&color=4f46e5`
                        }
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{rm.userId?.name}</p>
                        <p className="text-[11px] text-indigo-600">{rm.course}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-slate-500 text-[11px] pt-2 border-t border-slate-200/60">
                      <p className="flex items-center">
                        <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                        {rm.userId?.email}
                      </p>
                      <p className="flex items-center">
                        <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                        {rm.phone}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No other roommates allocated in this room yet.
                </div>
              )}
            </div>

            {/* Hostel Guidelines */}
            <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500">
              <p className="font-bold text-slate-700">Hostel Rules Summary:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Curfew time: 10:00 PM nightly</li>
                <li>Quiet study hours: 10:00 PM - 06:00 AM</li>
                <li>Visitors permitted in visitor lounge only</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-card">
          <BedDouble className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Room Allocated Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your hostel room allocation is currently being processed by the administration. You will be notified as soon as a bed is assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyRoom;
