import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const ComplaintList = () => {
  const { user, isStudent, isAdmin, isWarden } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [newComplaintModal, setNewComplaintModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity',
    priority: 'Medium',
    description: '',
  });

  const [resolutionForm, setResolutionForm] = useState({
    status: '',
    resolutionNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const categories = ['Electricity', 'Water', 'Cleanliness', 'Maintenance', 'Food', 'Internet', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['Submitted', 'In Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      setNewComplaintModal(false);
      setFormData({
        title: '',
        category: 'Electricity',
        priority: 'Medium',
        description: '',
      });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint._id}`, resolutionForm);
      setDetailModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (c) => {
    setSelectedComplaint(c);
    setResolutionForm({
      status: c.status,
      resolutionNotes: c.resolutionNotes || '',
    });
    setDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Wrench className="w-6 h-6" />
            </span>
            Complaint & Maintenance Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Report facility issues, track maintenance technician dispatches, and review timelines
          </p>
        </div>

        <button
          onClick={() => setNewComplaintModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log New Complaint
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-[#070D22]/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/15 shadow-glass">
        <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-cyan-400" />
          Filters:
        </span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
        >
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Complaints List Cards */}
      {loading ? (
        <LoadingSpinner size="md" message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No complaints registered"
          description="Everything is currently functioning smoothly! Use the button above to log a new ticket if needed."
          actionText="Log New Complaint"
          onAction={() => setNewComplaintModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => {
            const compKey = c._id || c.id;
            return (
              <div
                key={compKey}
                onClick={() => openDetail(c)}
                className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 hover:border-cyan-500/35 shadow-glass hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-sm">{c.title}</h3>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <StatusBadge status={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{c.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                    <span className="font-semibold text-cyan-400">#{c.category}</span>
                    <span>•</span>
                    <span>
                      {c.hostelId?.name || c.hostelName || 'Main Sector'} - Room {c.roomId?.roomNumber || c.roomNumber || 'N/A'}
                    </span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {c.resolutionNotes && (
                    <div className="mt-3 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <span className="font-bold">Staff Note: </span>
                      {c.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">
                    Reported by: <span className="text-zinc-300 font-semibold">{c.studentId?.userId?.name || c.studentName || 'Resident'}</span>
                  </span>
                  <span className="font-bold text-cyan-400 flex items-center hover:text-cyan-300 transition-colors">
                    View Timeline & Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal
        isOpen={newComplaintModal}
        onClose={() => setNewComplaintModal(false)}
        title="Report Maintenance Issue"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Geyser tripping circuit breaker in Bathroom 2"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Detailed Description *</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe what is happening, exact room location, and urgency..."
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setNewComplaintModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Detail & Resolution Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Complaint Details & Status Timeline"
        maxWidth="max-w-xl"
      >
        {selectedComplaint && (() => {
          let timelineArr = [];
          if (Array.isArray(selectedComplaint.timeline)) {
            timelineArr = selectedComplaint.timeline;
          } else if (typeof selectedComplaint.timeline === 'string') {
            try {
              timelineArr = JSON.parse(selectedComplaint.timeline);
            } catch (e) {
              timelineArr = [];
            }
          }

          return (
            <div className="space-y-6 text-xs text-zinc-300">
              {/* Top Detail Card */}
              <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                    Category: {selectedComplaint.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-white mb-1">{selectedComplaint.title}</h3>
                <p className="text-zinc-300 mb-3">{selectedComplaint.description}</p>
                <p className="text-[11px] text-zinc-400">
                  Filed by: {selectedComplaint.studentId?.userId?.name || selectedComplaint.studentName || 'Resident'} • Room {selectedComplaint.roomId?.roomNumber || selectedComplaint.roomNumber || 'N/A'} •{' '}
                  {new Date(selectedComplaint.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Chronological Timeline */}
              <div>
                <h4 className="font-bold text-cyan-300 uppercase text-[11px] tracking-wider mb-3">
                  Lifecycle Timeline
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/20">
                  {timelineArr.length > 0 ? (
                    timelineArr.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{step.status}</span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(step.updatedAt || step.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-zinc-300 mt-0.5 text-[11px]">{step.note || step.remarks}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic">No timeline events logged.</p>
                  )}
                </div>
              </div>

              {/* Admin / Warden Resolution Form */}
              {(isAdmin || isWarden) && (
                <form onSubmit={handleResolutionSubmit} className="border-t border-cyan-500/10 pt-4 space-y-3">
                  <h4 className="font-bold text-cyan-300 uppercase text-[11px] tracking-wider">
                    Update Issue Status & Notes
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Update Status</label>
                      <select
                        value={resolutionForm.status}
                        onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Resolution Note</label>
                      <input
                        type="text"
                        value={resolutionForm.resolutionNotes}
                        onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNotes: e.target.value })}
                        placeholder="e.g. Electrician visited and repaired regulator"
                        className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan transition-all"
                    >
                      {submitting ? 'Updating...' : 'Save Resolution'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ComplaintList;
