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
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Home className="w-6 h-6" />
          </span>
          My Room & Residence
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Orbital accommodation details, room inventory, and co-resident directory
        </p>
      </div>

      {student?.roomId || student?.roomNumber ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Room Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-cyan-500/15 shadow-glass">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/10 pb-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {student.hostelId?.name || student.hostelName || 'Hostel Sector'}
                  </span>
                  <h2 className="text-3xl font-black text-white mt-0.5">
                    Room {student.roomId?.roomNumber || student.roomNumber}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Floor {student.roomId?.floor ?? student.floor ?? '—'} • {student.roomId?.roomType || student.roomType || 'Standard'} Occupancy Pod
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Confirmed Resident
                  </span>
                </div>
              </div>

              {/* Room Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-medium">Total Capacity</p>
                  <p className="text-base font-bold text-white mt-1">{student.roomId?.capacity || student.capacity || 2} Pods</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-medium">Current Occupancy</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">
                    {student.roomId?.currentOccupancy ?? student.currentOccupancy ?? 1} Occupied
                  </p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-medium">Hostel Sector</p>
                  <p className="text-base font-bold text-purple-400 mt-1">{student.hostelId?.gender || student.gender || 'Co-Ed'}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6 border-t border-cyan-500/10 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Room Amenities & Inventory
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-zinc-300">
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    Workstation & Chair
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    Dedicated Pod Locker
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    High-speed Grid Wi-Fi
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    24/7 Power Conduit
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    Atmospheric Flow & LED
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
                    Daily Sanitation Service
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action: Report Issue */}
            <div className="bg-[#070D22]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between shadow-glass">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Maintenance Required?</h4>
                  <p className="text-xs text-zinc-400">Report plumbing, electrical, or technical issues in Room {student.roomId?.roomNumber || student.roomNumber}</p>
                </div>
              </div>
              <Link
                to="/student/complaints"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all"
              >
                Log Ticket
              </Link>
            </div>
          </div>

          {/* Roommates Sidebar Card */}
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/15 shadow-glass space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Co-Residents
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Residents sharing this accommodation</p>
            </div>

            <div className="space-y-3">
              {roommates && roommates.length > 0 ? (
                roommates.map((rm) => (
                  <div key={rm._id || rm.id} className="p-3.5 rounded-2xl bg-[#050816] border border-cyan-500/15 text-xs">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={
                          rm.userId?.profileImage ||
                          rm.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            rm.userId?.name || rm.name || 'Resident'
                          )}&background=7B61FF&color=ffffff`
                        }
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-500/20"
                      />
                      <div>
                        <p className="font-bold text-white">{rm.userId?.name || rm.name}</p>
                        <p className="text-[11px] text-cyan-400">{rm.course || 'Resident'}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-zinc-400 text-[11px] pt-2 border-t border-zinc-800">
                      <p className="flex items-center">
                        <Mail className="w-3 h-3 mr-1.5 text-zinc-500" />
                        {rm.userId?.email || rm.email}
                      </p>
                      <p className="flex items-center">
                        <Phone className="w-3 h-3 mr-1.5 text-zinc-500" />
                        {rm.phone || rm.emergencyContactPhone || '—'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 bg-[#050816] rounded-2xl border border-cyan-500/10">
                  No other co-residents allocated in this pod yet.
                </div>
              )}
            </div>

            {/* Hostel Guidelines */}
            <div className="border-t border-cyan-500/10 pt-4 text-xs space-y-2 text-zinc-400">
              <p className="font-bold text-cyan-300">Residence Protocols:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                <li>Sector curfew: 22:00 Hours nightly</li>
                <li>Quiet focus hours: 22:00 - 06:00 Hours</li>
                <li>Visitors restricted to designated lounges</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#070D22]/80 backdrop-blur-md rounded-3xl border border-cyan-500/15 shadow-glass">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BedDouble className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Room Allocated Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-sm mx-auto">
            Your accommodation allocation is currently in queue with sector administration. You will be notified when an orbital bed is assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyRoom;
