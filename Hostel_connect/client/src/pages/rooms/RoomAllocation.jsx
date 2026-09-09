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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Allocations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage bed assignments, room transfers, and resident occupancy tracking
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
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Allocate Room
        </button>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
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
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Hostel & Room</th>
                  <th className="px-5 py-3.5">Allocation Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{a.studentId?.userId?.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {a.studentId?.studentId} • {a.studentId?.gender}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{a.hostelId?.name}</p>
                      <p className="text-indigo-600 font-semibold text-[11px]">
                        Room {a.roomId?.roomNumber} (Floor {a.roomId?.floor})
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {new Date(a.allocationDate).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                      {a.remarks || '-'}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      {a.status === 'Active' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAllocation(a);
                              setChangeForm({
                                newHostelId: a.hostelId?._id || '',
                                newRoomId: '',
                                remarks: 'Approved room transfer',
                              });
                              fetchRoomsForHostel(a.hostelId?._id);
                              setChangeRoomModal(true);
                            }}
                            title="Change / Transfer Room"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeallocateConfirm({ isOpen: true, id: a._id })}
                            title="Vacate / Deallocate Room"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg inline-flex"
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
            <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={allocateForm.studentId}
              onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.userId?.name} ({s.studentId} - {s.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Hostel *</label>
            <select
              required
              value={allocateForm.hostelId}
              onChange={handleHostelChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Choose Hostel --</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Available Room *</label>
            <select
              required
              value={allocateForm.roomId}
              onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Choose Room with Available Bed --</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  Room {r.roomNumber} ({r.roomType} - {r.availableBeds || (r.capacity - r.currentOccupancy)} beds available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={allocateForm.remarks}
              onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
              placeholder="e.g. Regular allocation for academic term"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAllocateModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
        title={`Transfer Student: ${selectedAllocation?.studentId?.userId?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangeRoomSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
            <p className="font-semibold text-slate-800">Current Room:</p>
            <p>
              {selectedAllocation?.hostelId?.name} - Room {selectedAllocation?.roomId?.roomNumber}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select New Room *</label>
            <select
              required
              value={changeForm.newRoomId}
              onChange={(e) => setChangeForm({ ...changeForm, newRoomId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">-- Choose New Room --</option>
              {rooms
                .filter((r) => r._id !== selectedAllocation?.roomId?._id)
                .map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} ({r.roomType} - {r.availableBeds || (r.capacity - r.currentOccupancy)} beds available)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Transfer Remarks</label>
            <input
              type="text"
              value={changeForm.remarks}
              onChange={(e) => setChangeForm({ ...changeForm, remarks: e.target.value })}
              placeholder="e.g. Student requested quieter room on 3rd floor"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setChangeRoomModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
