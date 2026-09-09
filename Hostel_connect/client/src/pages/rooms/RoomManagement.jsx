import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const RoomManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addRoomModal, setAddRoomModal] = useState(false);
  const [addHostelModal, setAddHostelModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Forms
  const [roomForm, setRoomForm] = useState({
    hostelId: '',
    roomNumber: '',
    floor: 1,
    roomType: 'Double',
    capacity: 2,
    pricePerSemester: 35000,
    status: 'Available',
  });

  const [hostelForm, setHostelForm] = useState({
    name: '',
    location: '',
    gender: 'Boys',
    description: '',
    contactPhone: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) {
        setHostels(res.data.data);
        if (res.data.data.length > 0 && !selectedHostel) {
          setSelectedHostel(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedFloor) params.floor = selectedFloor;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedHostel, selectedFloor, statusFilter]);

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      hostelId: selectedHostel || (hostels[0]?._id || ''),
      roomNumber: '',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      pricePerSemester: 35000,
      status: 'Available',
    });
    setAddRoomModal(true);
  };

  const handleOpenEditRoom = (r) => {
    setEditingRoom(r);
    setRoomForm({
      hostelId: r.hostelId?._id || r.hostelId,
      roomNumber: r.roomNumber,
      floor: r.floor,
      roomType: r.roomType,
      capacity: r.capacity,
      pricePerSemester: r.pricePerSemester,
      status: r.status,
    });
    setAddRoomModal(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, roomForm);
      } else {
        await api.post('/rooms', roomForm);
      }
      setAddRoomModal(false);
      fetchRooms();
      fetchHostels();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/hostels', hostelForm);
      if (res.data.success) {
        setAddHostelModal(false);
        fetchHostels();
        setSelectedHostel(res.data.data._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating hostel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteConfirm.id) return;
    setSubmitting(true);
    try {
      await api.delete(`/rooms/${deleteConfirm.id}`);
      setDeleteConfirm({ isOpen: false, id: null });
      fetchRooms();
      fetchHostels();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete room');
    } finally {
      setSubmitting(false);
    }
  };

  const currentHostelObj = hostels.find((h) => h._id === selectedHostel);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hostel & Room Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visual room availability matrix, capacity planning, and maintenance states
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setAddHostelModal(true)}
            className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Building2 className="w-4 h-4 mr-1.5 text-indigo-600" />
            Add Hostel
          </button>
          <button
            onClick={handleOpenAddRoom}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Room
          </button>
        </div>
      </div>

      {/* Hostel Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {hostels.map((h) => (
          <button
            key={h._id}
            onClick={() => {
              setSelectedHostel(h._id);
              setSelectedFloor('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedHostel === h._id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {h.name} ({h.gender})
          </button>
        ))}
      </div>

      {/* Hostel Summary Banner */}
      {currentHostelObj && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">{currentHostelObj.name}</h3>
              <p className="text-xs text-slate-400">{currentHostelObj.location} • Gender: {currentHostelObj.gender}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Rooms</span>
              <span className="font-bold text-slate-800 text-sm">{currentHostelObj.totalRooms || rooms.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Capacity</span>
              <span className="font-bold text-slate-800 text-sm">{currentHostelObj.totalCapacity || 0} Beds</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Occupied Beds</span>
              <span className="font-bold text-indigo-600 text-sm">{currentHostelObj.currentOccupancy || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Available Beds</span>
              <span className="font-bold text-emerald-600 text-sm">{currentHostelObj.availableBeds || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Row: Floor & Status */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Filter Matrix:
        </span>

        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="">All Floors</option>
          <option value="1">1st Floor</option>
          <option value="2">2nd Floor</option>
          <option value="3">3rd Floor</option>
          <option value="4">4th Floor</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available (Green)</option>
          <option value="Partially Occupied">Partially Occupied (Yellow)</option>
          <option value="Fully Occupied">Fully Occupied (Red)</option>
          <option value="Maintenance">Maintenance (Gray)</option>
        </select>

        <div className="ml-auto flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
            Available
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
            Partial
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />
            Full
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-1.5" />
            Maintenance
          </span>
        </div>
      </div>

      {/* Visual Room Grid */}
      {loading ? (
        <LoadingSpinner size="md" message="Scanning room inventory..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No rooms found"
          description="Create rooms for this hostel or adjust your filter options."
          actionText="Create Room"
          onAction={handleOpenAddRoom}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const occupancyPct = Math.round((room.currentOccupancy / room.capacity) * 100);
            return (
              <div
                key={room._id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Floor {room.floor}</span>
                      <h4 className="text-xl font-black text-slate-800 tracking-tight">
                        Room {room.roomNumber}
                      </h4>
                    </div>
                    <StatusBadge status={room.status} />
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {room.roomType} • ₹{room.pricePerSemester?.toLocaleString('en-IN')}/sem
                  </p>

                  {/* Bed Occupancy Meter */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Beds Occupied</span>
                      <span className="text-indigo-600">
                        {room.currentOccupancy} / {room.capacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          room.status === 'Fully Occupied'
                            ? 'bg-rose-500'
                            : room.status === 'Partially Occupied'
                            ? 'bg-amber-500'
                            : room.status === 'Maintenance'
                            ? 'bg-slate-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Occupant Badges */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Residents ({room.students?.length || 0})
                    </p>
                    {room.students && room.students.length > 0 ? (
                      <div className="space-y-1">
                        {room.students.map((st) => (
                          <div key={st._id} className="text-xs font-semibold text-slate-700 truncate">
                            • {st.userId?.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No students allocated</p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end space-x-1 border-t border-slate-100 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenEditRoom(room)}
                    title="Edit Room"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: room._id })}
                    title="Delete Room"
                    disabled={room.currentOccupancy > 0}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={addRoomModal}
        onClose={() => setAddRoomModal(false)}
        title={editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Create New Room'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRoomSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hostel</label>
            <select
              value={roomForm.hostelId}
              onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                placeholder="e.g. 101, B-204"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor *</label>
              <input
                type="number"
                required
                min="1"
                max="15"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Type</label>
              <select
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Four-Sharing">Four-Sharing</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Bed Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price / Semester (₹)</label>
              <input
                type="number"
                value={roomForm.pricePerSemester}
                onChange={(e) => setRoomForm({ ...roomForm, pricePerSemester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddRoomModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Save Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Hostel Modal */}
      <Modal
        isOpen={addHostelModal}
        onClose={() => setAddHostelModal(false)}
        title="Add New Hostel Wing"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleHostelSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hostel Name *</label>
            <input
              type="text"
              required
              value={hostelForm.name}
              onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
              placeholder="e.g. Saraswati Girls Hostel"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus Location *</label>
            <input
              type="text"
              required
              value={hostelForm.location}
              onChange={(e) => setHostelForm({ ...hostelForm, location: e.target.value })}
              placeholder="e.g. West Campus, Sector 9"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={hostelForm.gender}
                onChange={(e) => setHostelForm({ ...hostelForm, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={hostelForm.contactPhone}
                onChange={(e) => setHostelForm({ ...hostelForm, contactPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={hostelForm.description}
              onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}
              placeholder="Hostel amenities, rules, capacity details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddHostelModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Hostel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
};

export default RoomManagement;
