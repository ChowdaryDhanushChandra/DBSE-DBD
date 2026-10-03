import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Building,
  Plus,
  ArrowRightLeft,
  LogOut,
  Search,
  CheckCircle2,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const RoomAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [allocateModal, setAllocateModal] = useState(false);
  const [changeRoomModal, setChangeRoomModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Forms
  const [allocateForm, setAllocateForm] = useState({
    studentId: '',
    hostelId: '',
    roomId: '',
    remarks: 'Allocated by administration',
  });

  const [changeForm, setChangeForm] = useState({
    newHostelId: '',
    newRoomId: '',
    remarks: 'Room change request',
  });

  const [deallocateConfirm, setDeallocateConfirm] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/allocations');
      if (res.data.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [sRes, hRes] = await Promise.all([
        api.get('/students?limit=100'),
        api.get('/hostels'),
      ]);
      if (sRes.data.success) setStudents(sRes.data.data);
      if (hRes.data.success) {
        setHostels(hRes.data.data);
        if (hRes.data.data.length > 0) {
          fetchRoomsForHostel(hRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoomsForHostel = async (hId) => {
    try {
      const res = await api.get(`/rooms?hostelId=${hId}&availableOnly=true`);
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllocations();
    fetchDropdownData();
  }, []);

  const handleHostelChange = (e) => {
    const hId = e.target.value;
    setAllocateForm({ ...allocateForm, hostelId: hId, roomId: '' });
    fetchRoomsForHostel(hId);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/allocations', allocateForm);
      if (res.data.success) {
        setAllocateModal(false);
        fetchAllocations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/allocations/${selectedAllocation._id}`, changeForm);
      if (res.data.success) {
        setChangeRoomModal(false);
        fetchAllocations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transfer student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeallocate = async () => {
    if (!deallocateConfirm.id) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/allocations/${deallocateConfirm.id}`);
      if (res.data.success) {
        setDeallocateConfirm({ isOpen: false, id: null });
        fetchAllocations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deallocate student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BedDouble className="w-6 h-6" />
            </span>
            Room Allocations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage bed assignments, orbital room transfers, and resident occupancy tracking
          </p>
        </div>

        <button
          onClick={() => {
            if (hostels.length > 0) {
              setAllocateForm({
                studentId: students[0]?._id || '',
                hostelId: hostels[0]?._id || '',
                roomId: '',
                remarks: 'Allocated by administration',
              });
              fetchRoomsForHostel(hostels[0]?._id);
            }
            setAllocateModal(true);
          }}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Allocate Room
        </button>
      </div>

      {/* Allocations Table */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading allocation registry..." />
        ) : allocations.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No room allocations recorded"
            description="Assign students to available hostel rooms to begin tracking occupancy."
            actionText="Allocate Room"
            onAction={() => setAllocateModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050816]/90 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Hostel & Room</th>
                  <th className="px-5 py-3.5">Allocation Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {allocations.map((a) => (
                  <tr key={a._id} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white">{a.studentId?.userId?.name || a.studentName || 'Resident'}</p>
                      <p className="text-[11px] text-zinc-500">
                        {a.studentId?.studentId || a.studentIdentifier || 'ID'} • {a.studentId?.gender || a.gender || 'N/A'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white">{a.hostelId?.name || a.hostelName}</p>
                      <p className="text-cyan-400 font-semibold text-[11px]">
                        Room {a.roomId?.roomNumber || a.roomNumber} (Floor {a.roomId?.floor ?? a.floor ?? '—'})
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-zinc-400">
                      {new Date(a.allocationDate || a.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>

                    <td className="px-5 py-3.5 text-zinc-400 max-w-xs truncate">
                      {a.remarks || '-'}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      {a.status === 'Active' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAllocation(a);
                              setChangeForm({
                                newHostelId: a.hostelId?._id || a.hostelId || '',
                                newRoomId: '',
                                remarks: 'Approved room transfer',
                              });
                              fetchRoomsForHostel(a.hostelId?._id || a.hostelId);
                              setChangeRoomModal(true);
                            }}
                            title="Change / Transfer Room"
                            className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg inline-flex transition-colors"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeallocateConfirm({ isOpen: true, id: a._id || a.id })}
                            title="Vacate / Deallocate Room"
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg inline-flex transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Room Modal */}
      <Modal
        isOpen={allocateModal}
        onClose={() => setAllocateModal(false)}
        title="Assign Room to Student"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Select Student *</label>
            <select
              required
              value={allocateForm.studentId}
              onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.userId?.name || s.name} ({s.studentId} - {s.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Select Hostel *</label>
            <select
              required
              value={allocateForm.hostelId}
              onChange={handleHostelChange}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">-- Choose Hostel --</option>
              {hostels.map((h) => (
                <option key={h._id || h.id} value={h._id || h.id}>
                  {h.name} ({h.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Select Available Room *</label>
            <select
              required
              value={allocateForm.roomId}
              onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">-- Choose Room with Available Bed --</option>
              {rooms.map((r) => (
                <option key={r._id || r.id} value={r._id || r.id}>
                  Room {r.roomNumber} ({r.roomType} - {r.availableBeds || (r.capacity - r.currentOccupancy)} beds available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Remarks</label>
            <input
              type="text"
              value={allocateForm.remarks}
              onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
              placeholder="e.g. Regular allocation for academic term"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setAllocateModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Room Modal */}
      <Modal
        isOpen={changeRoomModal}
        onClose={() => setChangeRoomModal(false)}
        title={`Transfer Student: ${selectedAllocation?.studentId?.userId?.name || selectedAllocation?.studentName || 'Resident'}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangeRoomSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#050816] rounded-xl border border-cyan-500/20 text-zinc-400">
            <p className="font-semibold text-white">Current Room:</p>
            <p className="text-cyan-400">
              {selectedAllocation?.hostelId?.name || selectedAllocation?.hostelName} - Room {selectedAllocation?.roomId?.roomNumber || selectedAllocation?.roomNumber}
            </p>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Select New Room *</label>
            <select
              required
              value={changeForm.newRoomId}
              onChange={(e) => setChangeForm({ ...changeForm, newRoomId: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">-- Choose New Room --</option>
              {rooms
                .filter((r) => (r._id || r.id) !== (selectedAllocation?.roomId?._id || selectedAllocation?.roomId))
                .map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    Room {r.roomNumber} ({r.roomType} - {r.availableBeds || (r.capacity - r.currentOccupancy)} beds available)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Transfer Remarks</label>
            <input
              type="text"
              value={changeForm.remarks}
              onChange={(e) => setChangeForm({ ...changeForm, remarks: e.target.value })}
              placeholder="e.g. Student requested quieter room on 3rd floor"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setChangeRoomModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deallocate Confirmation */}
      <ConfirmDialog
        isOpen={deallocateConfirm.isOpen}
        onClose={() => setDeallocateConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeallocate}
        title="Vacate Student from Room"
        message="Are you sure you want to vacate this student? The bed will be freed and available for new allocations."
        confirmText="Vacate Bed"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
};

export default RoomAllocation;
