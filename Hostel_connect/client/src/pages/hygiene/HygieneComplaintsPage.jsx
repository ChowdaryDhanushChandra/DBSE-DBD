import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Camera,
  User,
  ArrowRight,
  Filter,
  Flame,
  Check,
  Send,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'Water contamination concern',
  'Pest problem',
  'Overflowing dustbin',
  'Garbage not collected',
  'Dirty bathroom',
  'Unclean dining table',
  'Poor kitchen hygiene',
  'Bad smell',
  'Minor cleanliness issue',
  'Other',
];

const WORKFLOW_STEPS = [
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Student Confirmation',
];

const HygieneComplaintsPage = () => {
  const { user, isStudent, isAdmin, isWarden } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Report Modal
  const [reportModal, setReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({
    category: 'Dirty bathroom',
    location: '',
    description: '',
    priority: 'MEDIUM',
    imageUrl: '',
  });

  // Manage / Update Modal for Warden
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await api.get('/hygiene/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  // SMART PRIORITY DETECTION
  const handleCategoryChange = (cat) => {
    let smartPriority = 'LOW';
    const catLower = cat.toLowerCase();

    if (catLower.includes('water contamination') || catLower.includes('drinking water')) {
      smartPriority = 'CRITICAL';
    } else if (
      catLower.includes('pest') ||
      catLower.includes('overflowing') ||
      catLower.includes('garbage not collected')
    ) {
      smartPriority = 'HIGH';
    } else if (
      catLower.includes('dirty bathroom') ||
      catLower.includes('unclean dining') ||
      catLower.includes('poor kitchen')
    ) {
      smartPriority = 'MEDIUM';
    } else {
      smartPriority = 'LOW';
    }

    setReportForm({ ...reportForm, category: cat, priority: smartPriority });
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/hygiene/complaints', reportForm);
      if (res.data.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        setReportModal(false);
        setReportForm({
          category: 'Dirty bathroom',
          location: '',
          description: '',
          priority: 'MEDIUM',
          imageUrl: '',
        });
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      await api.put(`/hygiene/complaints/${selectedComplaint.id}/status`, {
        status: updateStatus,
        adminNotes,
      });
      setUpdateModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentConfirm = async (complaintId) => {
    try {
      await api.put(`/hygiene/complaints/${complaintId}/confirm`);
      confetti({ particleCount: 50, spread: 50 });
      fetchComplaints();
    } catch (err) {
      alert('Failed to confirm resolution');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-500/20 text-slate-300 border border-slate-500/30">
            LOW
          </span>
        );
    }
  };

  const getStatusStepIndex = (status) => {
    const idx = WORKFLOW_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.category?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.studentName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Sanitation Response Unit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </span>
            Hygiene & Sanitation Complaints
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Report cleanliness deficiencies, track 6-stage dispatch pipeline, and verify resolution
          </p>
        </div>

        {isStudent && (
          <button
            onClick={() => setReportModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 hover:from-rose-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Report Hygiene Problem
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#070D22]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-glass flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by category, location, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#050816] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#050816] border border-white/10 rounded-xl text-white font-medium focus:border-cyan-400"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#050816] border border-white/10 rounded-xl text-white font-medium focus:border-cyan-400"
          >
            <option value="">All Statuses</option>
            {WORKFLOW_STEPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List Cards */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading hygiene complaints..." />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No hygiene complaints found"
          description="Everything is currently sparkling clean! Use the button above to report any concerns."
          actionText={isStudent ? 'Report Hygiene Problem' : undefined}
          onAction={isStudent ? () => setReportModal(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const stepIdx = getStatusStepIndex(c.status);
            return (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-[#070D22]/85 border border-white/10 hover:border-cyan-500/30 transition-all shadow-glass space-y-5"
              >
                {/* Top Row: Category, Location, Priority */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">{c.category}</span>
                      {getPriorityBadge(c.priority)}
                    </div>
                    <p className="text-xs text-zinc-400 flex items-center gap-2">
                      <span>📍 {c.location}</span>
                      <span>•</span>
                      <span>Reported by {c.studentName} (Room {c.roomNumber})</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {(isAdmin || isWarden) && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setUpdateStatus(c.status);
                          setAdminNotes(c.adminNotes || '');
                          setUpdateModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
                      >
                        Update Status / Assign
                      </button>
                    )}

                    {isStudent && c.status === 'Resolved' && !c.studentConfirmed && (
                      <button
                        onClick={() => handleStudentConfirm(c.id)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Confirm Resolution
                      </button>
                    )}

                    {c.studentConfirmed && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  "{c.description}"
                </p>

                {c.adminNotes && (
                  <div className="text-xs text-cyan-300 bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/15">
                    <strong>Warden Note:</strong> {c.adminNotes}
                  </div>
                )}

                {/* 6-Stage Workflow Progress Indicator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-2">
                    <span>Workflow Stage: <strong className="text-white">{c.status}</strong></span>
                    <span>Staff Assigned: <strong className="text-cyan-300">{c.assignedName}</strong></span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const isCompleted = idx <= stepIdx;
                      const isCurrent = idx === stepIdx;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleted
                                ? isCurrent
                                  ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]'
                                  : 'bg-emerald-500'
                                : 'bg-white/10'
                            }`}
                          />
                          <p
                            className={`text-[9px] truncate font-medium ${
                              isCompleted ? 'text-zinc-200' : 'text-zinc-600'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Complaint Modal */}
      <Modal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        title="Report Hygiene / Cleanliness Issue"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Issue Category *</label>
            <select
              value={reportForm.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Smart Priority Auto-Assignment Display */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Auto Smart Priority</p>
              <p className="text-xs text-zinc-300">Determined automatically based on issue severity</p>
            </div>
            {getPriorityBadge(reportForm.priority)}
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Specific Location *</label>
            <input
              type="text"
              required
              value={reportForm.location}
              onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
              placeholder="e.g. 2nd Floor Washroom 3, Mess Dining Table #14"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              placeholder="Describe the hygiene concern in detail..."
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Photo Evidence URL (Optional)</label>
            <input
              type="url"
              value={reportForm.imageUrl}
              onChange={(e) => setReportForm({ ...reportForm, imageUrl: e.target.value })}
              placeholder="https://example.com/evidence.jpg"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setReportModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 hover:from-rose-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'File Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Warden Status Update Modal */}
      <Modal
        isOpen={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Advance Complaint Workflow"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Workflow Status *</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:outline-none"
            >
              {WORKFLOW_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Internal Warden Notes / Action Taken</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Dispatched housekeeping team; water filter serviced; sanitization completed."
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setUpdateModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HygieneComplaintsPage;
