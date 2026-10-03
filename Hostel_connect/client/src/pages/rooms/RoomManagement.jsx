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
  Sparkles,
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
    <div className="space-y-6 text-slate-100">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Inventory Matrix</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hostel & Room Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visual room availability matrix, capacity planning, and maintenance states
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setAddHostelModal(true)}
            className="inline-flex items-center px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 hover:border-cyan-500/40 text-xs font-bold rounded-xl shadow-glass transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 mr-1.5 text-cyan-400" />
            Add Hostel
          </button>
          <button
            onClick={handleOpenAddRoom}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Room
          </button>
        </div>
      </div>

      {/* Hostel Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {hostels.map((h) => (
          <button
            key={h._id}
            onClick={() => {
              setSelectedHostel(h._id);
              setSelectedFloor('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedHostel === h._id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] border border-cyan-400/50'
                : 'bg-[#070D22]/80 text-slate-400 hover:bg-white/5 hover:text-white border border-white/10'
            }`}
          >
            {h.name} ({h.gender})
          </button>
        ))}
      </div>

      {/* Hostel Summary Banner */}
      {currentHostelObj && (
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 shadow-glass flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{currentHostelObj.name}</h3>
              <p className="text-xs text-slate-400">{currentHostelObj.location} • Gender: {currentHostelObj.gender}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Total Rooms</span>
              <span className="font-bold text-white text-sm">{currentHostelObj.totalRooms || rooms.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Total Capacity</span>
              <span className="font-bold text-white text-sm">{currentHostelObj.totalCapacity || 0} Beds</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Occupied Beds</span>
              <span className="font-bold text-purple-400 text-sm font-mono">{currentHostelObj.currentOccupancy || 0}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Available Beds</span>
              <span className="font-bold text-cyan-400 text-sm font-mono">{currentHostelObj.availableBeds || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Row: Floor & Status */}
      <div className="flex flex-wrap items-center gap-3 bg-[#070D22]/80 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/15 shadow-glass">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-cyan-400/70" />
          Filter Matrix:
        </span>

        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
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
          className="px-3 py-1.5 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-slate-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available (Cyan / Green)</option>
          <option value="Partially Occupied">Partially Occupied (Amber)</option>
          <option value="Fully Occupied">Fully Occupied (Pink / Rose)</option>
          <option value="Maintenance">Maintenance (Slate)</option>
        </select>

        <div className="ml-auto flex items-center space-x-3 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5 shadow-[0_0_6px_#10b981]" />
            Available
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5 shadow-[0_0_6px_#f59e0b]" />
            Partial
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-1.5 shadow-[0_0_6px_#f43f5e]" />
            Full
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-1.5" />
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
                className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 hover:border-cyan-500/40 shadow-glass hover:shadow-[0_0_25px_rgba(0,229,255,0.15)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Floor {room.floor}</span>
                      <h4 className="text-xl font-black text-white tracking-tight">
                        Room {room.roomNumber}
                      </h4>
                    </div>
                    <StatusBadge status={room.status} />
                  </div>

                  <p className="text-xs text-slate-400 font-medium mb-3">
                    {room.roomType} • ₹{room.pricePerSemester?.toLocaleString('en-IN')}/sem
                  </p>

                  {/* Bed Occupancy Meter */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Beds Occupied</span>
                      <span className="text-cyan-400 font-mono">
                        {room.currentOccupancy} / {room.capacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          room.status === 'Fully Occupied'
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_8px_#f43f5e]'
                            : room.status === 'Partially Occupied'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_#f59e0b]'
                            : room.status === 'Maintenance'
                            ? 'bg-slate-600'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_#00e5ff]'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Occupant Badges */}
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Residents ({room.students?.length || 0})
                    </p>
                    {room.students && room.students.length > 0 ? (
                      <div className="space-y-1">
                        {room.students.map((st) => (
                          <div key={st._id} className="text-xs font-semibold text-slate-300 truncate">
                            • {st.name || st.userId?.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No students allocated</p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end space-x-1 border-t border-white/10 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenEditRoom(room)}
                    title="Edit Room"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: room._id })}
                    title="Delete Room"
                    disabled={room.currentOccupancy > 0}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
            <label className="block font-bold text-slate-300 mb-1">Hostel</label>
            <select
              value={roomForm.hostelId}
              onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                placeholder="e.g. 101, B-204"
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Floor *</label>
              <input
                type="number"
                required
                min="1"
                max="15"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Room Type</label>
              <select
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Four-Sharing">Four-Sharing</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Bed Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Status</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Price / Semester (₹)</label>
              <input
                type="number"
                value={roomForm.pricePerSemester}
                onChange={(e) => setRoomForm({ ...roomForm, pricePerSemester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAddRoomModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 cursor-pointer transition-all"
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
            <label className="block font-bold text-slate-300 mb-1">Hostel Name *</label>
            <input
              type="text"
              required
              value={hostelForm.name}
              onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
              placeholder="e.g. Saraswati Girls Hostel"
              className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-300 mb-1">Campus Location *</label>
            <input
              type="text"
              required
              value={hostelForm.location}
              onChange={(e) => setHostelForm({ ...hostelForm, location: e.target.value })}
              placeholder="e.g. West Campus, Sector 9"
              className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Gender *</label>
              <select
                value={hostelForm.gender}
                onChange={(e) => setHostelForm({ ...hostelForm, gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={hostelForm.contactPhone}
                onChange={(e) => setHostelForm({ ...hostelForm, contactPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={hostelForm.description}
              onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}
              placeholder="Hostel amenities, rules, capacity details..."
              className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAddHostelModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 cursor-pointer transition-all"
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
