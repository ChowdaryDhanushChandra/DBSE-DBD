import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Users,
  Building,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const AnnouncementsPage = () => {
  const { user, isAdmin, isWarden } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All Students',
    hostelId: '',
    priority: 'Normal',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) setHostels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    if (isAdmin || isWarden) fetchHostels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/announcements', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        message: '',
        targetAudience: 'All Students',
        hostelId: '',
        priority: 'Normal',
      });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting notice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Announcements & Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Campus-wide broadcasts, hostel notifications, and maintenance schedules
          </p>
        </div>

        {(isAdmin || isWarden) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Post Announcement
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <LoadingSpinner size="md" message="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices at this time"
          description="Official announcements and notices will appear here once published."
          actionText={isAdmin || isWarden ? 'Create Announcement' : undefined}
          onAction={isAdmin || isWarden ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      Posted by: <span className="font-semibold text-slate-600">{a.createdBy?.name}</span> ({a.createdBy?.role}) •{' '}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {a.targetAudience}
                    {a.hostelId ? ` (${a.hostelId.name})` : ''}
                  </span>
                  <StatusBadge status={a.priority} />
                  {(isAdmin || (isWarden && a.createdBy?._id === user?._id)) && (
                    <button
                      onClick={() => handleDelete(a._id)}
                      title="Delete Announcement"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-13">
                {a.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Sports Day Registrations"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="All Students">All Students</option>
                <option value="Specific Hostel">Specific Hostel</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {formData.targetAudience === 'Specific Hostel' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Hostel *</label>
              <select
                required
                value={formData.hostelId}
                onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">-- Choose Hostel --</option>
                {hostels.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Announcement Body *</label>
            <textarea
              rows="4"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write notice text here..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
