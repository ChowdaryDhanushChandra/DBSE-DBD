import React from 'react';

const StatusBadge = ({ status, type = 'general' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Room statuses
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Partially Occupied':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      case 'Fully Occupied':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
      case 'Maintenance':
        return 'bg-slate-800/80 text-slate-300 border-slate-700';

      // Fee statuses
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      case 'Overdue':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]';

      // Complaint statuses
      case 'Submitted':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(0,229,255,0.15)]';
      case 'In Review':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(123,97,255,0.15)]';
      case 'Assigned':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.15)]';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Closed':
        return 'bg-slate-800/80 text-slate-300 border-slate-700';

      // Priority
      case 'Low':
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(123,97,255,0.2)]';
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]';

      // Document statuses
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';

      // General active / inactive
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Inactive':
      case 'Suspended':
      case 'Vacated':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';

      // Parcel statuses
      case 'Expected':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'In Transit':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'Received at Hostel':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]';
      case 'Student Notified':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Awaiting Collection':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse';
      case 'Collected':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Returned':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';

      // Visitor statuses
      case 'Checked In':
      case 'Currently Inside':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]';
      case 'Checked Out':
        return 'bg-slate-700/60 text-slate-300 border-slate-600/40';
      case 'Cancelled':
        return 'bg-slate-800/80 text-slate-400 border-slate-700';
      case 'Overstay Alert':
      case 'OVERSTAY ALERT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]';

      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'Available':
      case 'Paid':
      case 'Resolved':
      case 'Approved':
      case 'Active':
      case 'Collected':
      case 'Checked In':
      case 'Currently Inside':
        return 'bg-emerald-400 shadow-[0_0_6px_#10b981]';
      case 'Partially Occupied':
      case 'Pending':
      case 'In Progress':
      case 'Medium':
      case 'Awaiting Collection':
      case 'Student Notified':
        return 'bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-ping-slow';
      case 'Submitted':
      case 'Received at Hostel':
        return 'bg-cyan-400 shadow-[0_0_6px_#00e5ff]';
      case 'In Review':
      case 'High':
        return 'bg-purple-400 shadow-[0_0_6px_#7b61ff]';
      case 'Fully Occupied':
      case 'Overdue':
      case 'Rejected':
      case 'Urgent':
      case 'Returned':
      case 'Overstay Alert':
      case 'OVERSTAY ALERT':
        return 'bg-rose-400 shadow-[0_0_8px_#f43f5e] animate-ping-slow';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getDotStyle()}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
