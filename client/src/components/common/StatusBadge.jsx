import React from 'react';

const StatusBadge = ({ status, type = 'general' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Room statuses
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partially Occupied':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Fully Occupied':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Maintenance':
        return 'bg-slate-100 text-slate-700 border-slate-300';

      // Fee statuses
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // Complaint statuses
      case 'Submitted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'In Review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';

      // Priority
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse';

      // Document statuses
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // General active / inactive
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive':
      case 'Suspended':
      case 'Vacated':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'Available' || status === 'Paid' || status === 'Resolved' || status === 'Approved' || status === 'Active'
            ? 'bg-emerald-500'
            : status === 'Partially Occupied' || status === 'Pending' || status === 'In Progress'
            ? 'bg-amber-500'
            : status === 'Fully Occupied' || status === 'Overdue' || status === 'Rejected' || status === 'Urgent'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
