import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Building,
  BedDouble,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Pagination, SearchBar } from '../../components/common/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add/Edit Student Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentId: '',
    course: 'B.Tech Computer Science',
    department: 'Engineering',
    year: '1st Year',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    address: '',
    hostelId: '',
    roomId: '',
    status: 'Active',
  });

  // Delete Confirm Dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search,
        course: courseFilter,
        year: yearFilter,
        hostelId: hostelFilter,
        status: statusFilter,
      };

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostelsAndRooms = async () => {
    try {
      const [hRes, rRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/rooms?availableOnly=true'),
      ]);
      if (hRes.data.success) setHostels(hRes.data.data);
      if (rRes.data.success) setRooms(rRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHostelsAndRooms();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, courseFilter, yearFilter, hostelFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: 'Student@123',
      phone: '',
      studentId: '',
      course: 'B.Tech Computer Science',
      department: 'Engineering',
      year: '1st Year',
      gender: 'Male',
      guardianName: '',
      guardianPhone: '',
      address: '',
      hostelId: '',
      roomId: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStudent(st);
    setFormData({
      name: st.name || st.userId?.name || '',
      email: st.email || st.userId?.email || '',
      phone: st.phone || '',
      studentId: st.studentId || '',
      course: st.course || '',
      department: st.department || '',
      year: st.year || '1st Year',
      gender: st.gender || 'Male',
      guardianName: st.guardianName || '',
      guardianPhone: st.guardianPhone || '',
      address: st.address || '',
      hostelId: st.hostelId?._id || st.hostelId || '',
      roomId: st.roomId?._id || st.roomId || '',
      status: st.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setSubmitting(true);
    try {
      await api.delete(`/students/${deleteConfirm.id}`);
      setDeleteConfirm({ isOpen: false, id: null });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Roster Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage student registrations, profile details, room allocations, and residency statuses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#070D22]/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/15 shadow-glass flex flex-col md:flex-row items-center gap-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by student name, ID, email, or department..."
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto ml-auto">
          <select
            value={hostelFilter}
            onChange={(e) => {
              setHostelFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Vacated">Vacated</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading student records..." />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try changing your search keywords or filter criteria."
            actionText="Add New Student"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.04] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">ID / Department</th>
                  <th className="px-5 py-3.5">Hostel & Room</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            st.profileImage ||
                            st.userId?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              st.name || st.userId?.name || 'Student'
                            )}&background=7b61ff&color=fff`
                          }
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-500/30"
                        />
                        <div>
                          <p className="font-bold text-white">{st.name || st.userId?.name}</p>
                          <p className="text-[11px] text-slate-400">{st.email || st.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-cyan-400 font-mono">{st.studentId}</p>
                      <p className="text-slate-400">{st.course} ({st.year})</p>
                    </td>

                    <td className="px-5 py-3.5">
                      {st.hostelName || st.hostelId ? (
                        <div>
                          <p className="font-semibold text-white">{st.hostelName || st.hostelId?.name}</p>
                          <p className="text-slate-400 text-[11px]">Room {st.roomNumber || st.roomId?.roomNumber || 'Assigned'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unallocated</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-slate-300 font-mono">{st.phone}</p>
                      <p className="text-slate-500 text-[10px] font-mono">Guardian: {st.guardianPhone}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={st.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-1">
                      <Link
                        to={`/admin/students/${st._id}`}
                        title="View Full Profile"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg inline-flex transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(st)}
                        title="Edit Student"
                        className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg inline-flex transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: st._id })}
                        title="Delete Student"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg inline-flex transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Register New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
            {!editingStudent && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                />
              </div>
            )}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Student Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Course / Major *</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Academic Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Vacated">Vacated</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Residential Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white/[0.04] border border-cyan-500/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-slate-300 border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 cursor-pointer transition-all"
            >
              {submitting ? 'Saving...' : editingStudent ? 'Update Profile' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message="Are you sure you want to delete this student? If allocated to a room, the bed will be released automatically."
        confirmText="Delete Student"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
};

export default StudentList;
