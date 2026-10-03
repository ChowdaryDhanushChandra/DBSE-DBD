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
  Shield,
  FileCheck,
  Package,
  DoorOpen,
} from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import HostelQualityScoreBanner from '../../components/common/HostelQualityScoreBanner';

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

  const { hostel, cards, recentComplaints, parcelStats, visitorStats } = data || {};

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Hostel Supervision & Sector Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {hostel?.name || 'Assigned Residence Wing'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {hostel?.location || 'Campus North Sector'} • Gender: {hostel?.gender || 'Boys'} • Total Rooms:{' '}
            {cards?.totalRooms || 0}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/warden/mess"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4 mr-1.5" />
            Mark Mess Attendance
          </Link>
          <Link
            to="/warden/announcements"
            className="inline-flex items-center px-4 py-2 bg-[#070D22]/90 hover:bg-cyan-500/10 text-slate-200 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl text-xs font-semibold shadow-glass transition-all"
          >
            <Megaphone className="w-4 h-4 mr-1.5 text-cyan-400" />
            Post Notice
          </Link>
        </div>
      </div>

      {/* UNIQUE FEATURE: Hostel Quality Score Banner */}
      <HostelQualityScoreBanner />

      {/* Quick Services: Parcel & Visitor Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parcel Delivery Overview Widget */}
        <Link
          to="/warden/parcels"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Parcel & Delivery Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {parcelStats?.todayDeliveries ?? 0} Today
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400 font-bold">{parcelStats?.pendingCollection ?? 0}</span> awaiting pickup • {parcelStats?.total ?? 0} total records
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>

        {/* Visitor & Gate Security Widget */}
        <Link
          to="/warden/visitors"
          className="group bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/50 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(123,97,255,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Visitor & Gate Security</h3>
                {visitorStats?.overstayAlerts > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    ⚠️ {visitorStats.overstayAlerts} Overstay
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🟢 {visitorStats?.currentlyInside ?? 0} Inside
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-purple-300 font-bold">{visitorStats?.todayVisitors ?? 0}</span> visitors today • {visitorStats?.pendingRequests ?? 0} pending review
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Students in Hostel"
          value={cards?.studentsInHostel || 0}
          subtitle="Registered active residents"
          icon={Users}
          color="cyan"
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
          color="purple"
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
        <div className="lg:col-span-2 bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Hostel Complaints & Maintenance</h3>
              <p className="text-xs text-slate-400">Issues requiring warden or maintenance attention</p>
            </div>
            <Link
              to="/warden/complaints"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-white/5 text-xs">
            {recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <div key={c._id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-white truncate">{c.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Student: {c.studentName || c.studentId?.userId?.name} • Category: {c.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <StatusBadge status={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-slate-500 text-xs">
                No active complaints reported in this hostel.
              </p>
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Warden Operations</h3>

          <div className="space-y-3 text-xs">
            <Link
              to="/warden/allocations"
              className="block p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-white/10 transition-all"
            >
              <p className="font-bold text-white flex items-center justify-between">
                <span>Room Allocation & Transfers</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Assign available beds to new students or approve room switches.
              </p>
            </Link>

            <Link
              to="/warden/rooms"
              className="block p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-white/10 transition-all"
            >
              <p className="font-bold text-white flex items-center justify-between">
                <span>Visual Room Grid</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Inspect floor layouts and real-time room capacity.
              </p>
            </Link>

            <Link
              to="/warden/mess"
              className="block p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-white/10 transition-all"
            >
              <p className="font-bold text-white flex items-center justify-between">
                <span>Meal Attendance Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Check-in students for Breakfast, Lunch, and Dinner.
              </p>
            </Link>

            <Link
              to="/warden/documents"
              className="block p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-white/10 transition-all"
            >
              <p className="font-bold text-white flex items-center justify-between">
                <span>Verification Documents</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
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
