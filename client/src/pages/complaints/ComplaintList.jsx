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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complaint & Maintenance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Report facility issues, track maintenance technician dispatches, and review timelines
          </p>
        </div>

        <button
          onClick={() => setNewComplaintModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log New Complaint
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Filters:
        </span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
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
          {complaints.map((c) => (
            <div
              key={c._id}
              onClick={() => openDetail(c)}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <StatusBadge status={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{c.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="font-semibold text-indigo-600">#{c.category}</span>
                  <span>•</span>
                  <span>
                    {c.hostelId?.name || 'Main Hostel'} - Room {c.roomId?.roomNumber || 'N/A'}
                  </span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                {c.resolutionNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 text-xs font-medium">
                    <span className="font-bold">Staff Note: </span>
                    {c.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Reported by: <span className="text-slate-700 font-semibold">{c.studentId?.userId?.name}</span>
                </span>
                <span className="font-bold text-indigo-600 flex items-center">
                  View Timeline & Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
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
            <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Geyser tripping circuit breaker in Bathroom 2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe what is happening, exact room location, and urgency..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewComplaintModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
        {selectedComplaint && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Top Detail Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-wider">
                  Category: {selectedComplaint.category}
                </span>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={selectedComplaint.priority} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">{selectedComplaint.title}</h3>
              <p className="text-slate-600 mb-3">{selectedComplaint.description}</p>
              <p className="text-[11px] text-slate-400">
                Filed by: {selectedComplaint.studentId?.userId?.name} • Room {selectedComplaint.roomId?.roomNumber || 'N/A'} •{' '}
                {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Chronological Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
                Lifecycle Timeline
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 ? (
                  selectedComplaint.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{step.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(step.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 text-[11px]">{step.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No timeline events logged.</p>
                )}
              </div>
            </div>

            {/* Admin / Warden Resolution Form */}
            {(isAdmin || isWarden) && (
              <form onSubmit={handleResolutionSubmit} className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Update Issue Status & Notes
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={resolutionForm.status}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Resolution Note</label>
                    <input
                      type="text"
                      value={resolutionForm.resolutionNotes}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNotes: e.target.value })}
                      placeholder="e.g. Electrician visited and repaired regulator"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm shadow-indigo-200"
                  >
                    {submitting ? 'Updating...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintList;
