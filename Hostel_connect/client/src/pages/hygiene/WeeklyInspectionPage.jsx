import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  User,
  ShieldCheck,
  Star,
  Camera,
  X,
  Send,
  BedDouble,
  Bath,
  Footprints,
  Users,
  UtensilsCrossed,
  ChefHat,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';

const SCHEDULE_DAYS = [
  { day: 'Monday', area: 'Hostel Rooms', icon: BedDouble },
  { day: 'Tuesday', area: 'Bathrooms', icon: Bath },
  { day: 'Wednesday', area: 'Corridors', icon: Footprints },
  { day: 'Thursday', area: 'Common Areas', icon: Users },
  { day: 'Friday', area: 'Dining Hall', icon: UtensilsCrossed },
  { day: 'Saturday', area: 'Kitchen', icon: ChefHat },
  { day: 'Sunday', area: 'Weekly Summary', icon: FileCheck },
];

const WeeklyInspectionPage = () => {
  const { user, isAdmin, isWarden } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Conduct Inspection Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    area: 'Hostel Rooms',
    score: 4.5,
    status: 'Excellent',
    remarks: '',
    imageUrl: '',
    inspectionDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, inspRes] = await Promise.all([
        api.get('/hygiene/schedule'),
        api.get('/hygiene/inspections'),
      ]);

      if (schedRes.data.success) {
        setSchedule(schedRes.data.data);
      }
      if (inspRes.data.success) {
        setInspections(inspRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load inspection data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateScheduleStatus = async (item, newStatus) => {
    try {
      await api.put(`/hygiene/schedule/${item.id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update schedule status');
    }
  };

  const handleScoreChange = (newScore) => {
    const s = Number(newScore);
    let autoStatus = 'Good';
    if (s >= 4.5) autoStatus = 'Excellent';
    else if (s >= 3.5) autoStatus = 'Good';
    else if (s >= 2.5) autoStatus = 'Needs Improvement';
    else autoStatus = 'Critical';

    setForm({ ...form, score: s, status: autoStatus });
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/hygiene/inspections', form);
      if (res.data.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        setModalOpen(false);
        setForm({
          area: 'Hostel Rooms',
          score: 4.5,
          status: 'Excellent',
          remarks: '',
          imageUrl: '',
          inspectionDate: new Date().toISOString().split('T')[0],
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Hygiene Schedule & Quality Audits
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Calendar className="w-6 h-6" />
            </span>
            Weekly Cleanliness Inspections
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Conduct daily zone audits, track compliance, and enforce sanitation standards
          </p>
        </div>

        {(isAdmin || isWarden) && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Conduct Inspection
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading inspection schedules..." />
      ) : (
        <div className="space-y-8">
          {/* Weekly 7-Day Inspection Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">7-Day Weekly Inspection Schedule</h3>
              <span className="text-xs text-zinc-400">Mon - Sun Protocol</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {SCHEDULE_DAYS.map((sd) => {
                const found = schedule.find(
                  (s) => s.scheduledDay?.toLowerCase() === sd.day.toLowerCase()
                );
                const status = found?.status || 'Pending';
                const Icon = sd.icon;

                return (
                  <div
                    key={sd.day}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      status === 'Completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : status === 'Missed'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-[#070D22]/80 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-white uppercase">{sd.day}</span>
                        <div
                          className={`p-1.5 rounded-lg ${
                            status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/[0.05] text-zinc-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-200 mt-1">{sd.area}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Inspector: {found?.assignedName?.split(' ')?.[0] || 'Warden'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {(isAdmin || isWarden) ? (
                        <select
                          value={status}
                          onChange={(e) => found && handleUpdateScheduleStatus(found, e.target.value)}
                          className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold border ${
                            status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : status === 'Missed'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-[#050816] text-amber-300 border-amber-500/40'
                          } focus:outline-none`}
                        >
                          <option value="Completed">✓ Completed</option>
                          <option value="Pending">⏳ Pending</option>
                          <option value="Missed">✕ Missed</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block w-full py-1 text-center rounded-lg text-[10px] font-bold ${
                            status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : status === 'Missed'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Cleanliness Inspections Audit Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Recent Inspection Audit Records</h3>
                <p className="text-xs text-zinc-400">Formal inspection entries with scores and remarks</p>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                {inspections.length} Total Logs
              </span>
            </div>

            {inspections.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No inspection logs yet"
                description="Conduct the first inspection using the button above."
              />
            ) : (
              <div className="bg-[#070D22]/80 rounded-2xl border border-white/10 overflow-hidden shadow-glass">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#050816] text-cyan-300 uppercase tracking-wider text-[11px] border-b border-white/10 font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Zone / Area</th>
                        <th className="px-5 py-3.5">Score</th>
                        <th className="px-5 py-3.5">Compliance Status</th>
                        <th className="px-5 py-3.5">Inspector</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Remarks / Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {inspections.map((insp) => (
                        <tr key={insp.id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            {insp.area}
                          </td>
                          <td className="px-5 py-3.5 font-black text-amber-300">
                            ⭐ {insp.score?.toFixed(1)} / 5.0
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                insp.status === 'Excellent'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : insp.status === 'Good'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : insp.status === 'Needs Improvement'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {insp.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-300">{insp.inspectorName}</td>
                          <td className="px-5 py-3.5 text-zinc-400">
                            {new Date(insp.inspectionDate).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 max-w-sm text-zinc-300">
                            <p className="truncate" title={insp.remarks}>
                              {insp.remarks || 'Standard verified.'}
                            </p>
                            {insp.imageUrl && (
                              <a
                                href={insp.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Camera className="w-3 h-3" /> View Photo Evidence
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conduct Inspection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Conduct Cleanliness Inspection"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Inspection Zone / Area *</label>
            <select
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:outline-none"
            >
              <option value="Hostel Rooms">Hostel Rooms</option>
              <option value="Bathrooms">Bathrooms</option>
              <option value="Corridors">Corridors</option>
              <option value="Common Areas">Common Areas</option>
              <option value="Dining Hall">Dining Hall</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Drinking Water Area">Drinking Water Area</option>
              <option value="Waste Disposal Area">Waste Disposal Area</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Score: {form.score} / 5.0
              </label>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={form.score}
                onChange={(e) => handleScoreChange(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Compliance Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:outline-none"
              >
                <option value="Excellent">Excellent (4.5 - 5.0)</option>
                <option value="Good">Good (3.5 - 4.4)</option>
                <option value="Needs Improvement">Needs Improvement (2.5 - 3.4)</option>
                <option value="Critical">Critical (&lt; 2.5)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Inspection Date</label>
            <input
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Inspector Remarks</label>
            <textarea
              rows={3}
              required
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. Floor vacuumed, handrails disinfected, exhaust fans operational."
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Image / Photo Evidence URL (Optional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/sanitation-evidence.jpg"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Recording...' : 'Save Inspection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeeklyInspectionPage;
