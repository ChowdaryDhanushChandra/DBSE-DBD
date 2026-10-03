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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Megaphone className="w-6 h-6" />
            </span>
            Announcements & Notices
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sector-wide broadcasts, orbital alerts, and maintenance dispatches
          </p>
        </div>

        {(isAdmin || isWarden) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
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
          {announcements.map((a) => {
            const aId = a._id || a.id;
            const author = a.createdBy?.name || a.authorName || 'Sector Command';
            const role = a.createdBy?.role || a.authorRole || 'Staff';
            const hName = a.hostelId?.name || a.hostelName;

            return (
              <div
                key={aId}
                className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 hover:border-cyan-500/35 shadow-glass hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold shrink-0">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{a.title}</h3>
                      <p className="text-[11px] text-zinc-400">
                        Posted by: <span className="font-semibold text-zinc-200">{author}</span> ({role}) •{' '}
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#050816] text-cyan-300 border border-cyan-500/20">
                      {a.targetAudience}
                      {hName ? ` (${hName})` : ''}
                    </span>
                    <StatusBadge status={a.priority} />
                    {(isAdmin || (isWarden && (a.createdBy?._id === user?._id || a.createdBy === user?.id))) && (
                      <button
                        onClick={() => handleDelete(aId)}
                        title="Delete Announcement"
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-13">
                  {a.message}
                </p>
              </div>
            );
          })}
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
            <label className="block font-bold text-zinc-300 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Sports Day Registrations"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="All Students">All Students</option>
                <option value="Specific Hostel">Specific Hostel</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {formData.targetAudience === 'Specific Hostel' && (
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Select Hostel *</label>
              <select
                required
                value={formData.hostelId}
                onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="">-- Choose Hostel --</option>
                {hostels.map((h) => (
                  <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Announcement Body *</label>
            <textarea
              rows="4"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write notice text here..."
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
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
