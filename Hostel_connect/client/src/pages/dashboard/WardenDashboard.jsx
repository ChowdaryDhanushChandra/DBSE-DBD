import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  BedDouble,
  AlertCircle,
  Wrench,
  UtensilsCrossed,
  Plus,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const WardenDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/warden');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load warden dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading Hostel Operations..." />;
  }

  const { hostel, cards, recentComplaints } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Hostel Operations & Supervision
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {hostel?.name || 'Assigned Residence Wing'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {hostel?.location || 'Campus North Sector'} • Gender: {hostel?.gender || 'Boys'} • Total Rooms:{' '}
            {cards?.totalRooms || 0}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/warden/mess"
            className="inline-flex items-center px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-200 transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 mr-1.5" />
            Mark Mess Attendance
          </Link>
          <Link
            to="/warden/announcements"
            className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Megaphone className="w-4 h-4 mr-1.5 text-purple-600" />
            Post Notice
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Students in Hostel"
          value={cards?.studentsInHostel || 0}
          subtitle="Registered active residents"
          icon={Users}
          color="purple"
        />
        <DashboardCard
          title="Available Rooms"
          value={cards?.availableRooms || 0}
          subtitle="Vacant or partially empty"
          icon={BedDouble}
          color="emerald"
        />
        <DashboardCard
          title="Occupied Rooms"
          value={cards?.occupiedRooms || 0}
          subtitle="Active student rooms"
          icon={Building2}
          color="cyan"
        />
        <DashboardCard
          title="Open Complaints"
          value={cards?.openComplaints || 0}
          subtitle={`${cards?.pendingMaintenanceIssues || 0} maintenance issues`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Grid: Maintenance & Complaints + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Complaints for this Hostel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hostel Complaints & Maintenance</h3>
              <p className="text-xs text-slate-400">Issues requiring warden or maintenance attention</p>
            </div>
            <Link
              to="/warden/complaints"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <div key={c._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Student: {c.studentId?.userId?.name} • Category: {c.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <StatusBadge status={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-slate-400 text-xs">
                No active complaints reported in this hostel.
              </p>
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Warden Operations</h3>

          <div className="space-y-3 text-xs">
            <Link
              to="/warden/allocations"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 transition-all"
            >
              <p className="font-bold text-slate-800 flex items-center justify-between">
                <span>Room Allocation & Transfers</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Assign available beds to new students or approve room switches.
              </p>
            </Link>

            <Link
              to="/warden/rooms"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 transition-all"
            >
              <p className="font-bold text-slate-800 flex items-center justify-between">
                <span>Visual Room Grid</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Inspect floor layouts and real-time room capacity.
              </p>
            </Link>

            <Link
              to="/warden/mess"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 transition-all"
            >
              <p className="font-bold text-slate-800 flex items-center justify-between">
                <span>Meal Attendance Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Check-in students for Breakfast, Lunch, and Dinner.
              </p>
            </Link>

            <Link
              to="/warden/documents"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 transition-all"
            >
              <p className="font-bold text-slate-800 flex items-center justify-between">
                <span>Verification Documents</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Review and approve student Aadhaar and ID uploads.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
