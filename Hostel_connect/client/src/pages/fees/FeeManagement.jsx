import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  FileText,
  DollarSign,
  Shield,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { SearchBar } from '../../components/common/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';

const FeeManagement = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    studentId: '',
    feeType: 'Hostel Fee',
    amount: 35000,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    academicSemester: 'Fall Semester 2024',
    remarks: '',
    targetAll: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('Online / UPI');
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.paymentStatus = statusFilter;
      if (typeFilter) params.feeType = typeFilter;

      const res = await api.get('/fees', { params });
      if (res.data.success) {
        setFees(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/students?limit=100&status=Active');
        if (res.data.success) setStudents(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, [statusFilter, typeFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/fees', createForm);
      setCreateModal(false);
      fetchFees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create fee');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    setSubmitting(true);
    try {
      const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await api.put(`/fees/${selectedFee._id}`, {
        paymentStatus: 'Paid',
        paymentMethod,
        transactionId: txnId,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setPayModal(false);
      fetchFees();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFees = fees.filter((f) => {
    if (!search) return true;
    const name = (f.studentId?.userId?.name || f.studentName || '').toLowerCase();
    const inv = (f.invoiceNumber || '').toLowerCase();
    const stId = (f.studentId?.studentId || f.studentIdentifier || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || inv.includes(q) || stId.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CreditCard className="w-6 h-6" />
            </span>
            Fee Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sector accommodation invoices, payment tracking, and digital cryptographic receipts
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCreateForm({
                studentId: students[0]?._id || students[0]?.id || '',
                feeType: 'Hostel Fee',
                amount: 35000,
                dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
                academicSemester: 'Fall Semester 2024',
                remarks: '',
                targetAll: false,
              });
              setCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Bill
          </button>
        )}
      </div>

      {/* Financial KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/15 shadow-glass">
            <p className="text-xs font-bold text-zinc-400 uppercase">Total Invoiced</p>
            <h3 className="text-2xl font-black text-white mt-1">
              ₹{(summary.totalBilled || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Total resident billings</p>
          </div>

          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20 shadow-glass">
            <p className="text-xs font-bold text-emerald-400 uppercase">Total Collected</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              ₹{(summary.totalCollected || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Settled invoices</p>
          </div>

          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 shadow-glass">
            <p className="text-xs font-bold text-amber-400 uppercase">Pending Collections</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              ₹{(summary.totalPending || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Awaiting resident payment</p>
          </div>

          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-5 border border-rose-500/20 shadow-glass">
            <p className="text-xs font-bold text-rose-400 uppercase">Overdue Invoices</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">
              {summary.overdueCount || 0} Accounts
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Past due deadline</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#070D22]/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/15 shadow-glass flex flex-col md:flex-row items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student, invoice #, or student ID..."
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 rounded-xl font-medium text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          >
            <option value="">All Fee Types</option>
            <option value="Hostel Fee">Hostel Fee</option>
            <option value="Mess Fee">Mess Fee</option>
            <option value="Maintenance Fee">Maintenance Fee</option>
            <option value="Other Fees">Other Fees</option>
          </select>
        </div>
      </div>

      {/* Fees Data Table */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading fee invoices..." />
        ) : filteredFees.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No fee records found"
            description="Generate semester fee bills or adjust filter parameters."
            actionText={isAdmin ? 'Generate Fee Invoice' : undefined}
            onAction={isAdmin ? () => setCreateModal(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050816]/90 text-cyan-300 font-bold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {filteredFees.map((fee) => {
                  const feeKey = fee._id || fee.id;
                  return (
                    <tr key={feeKey} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white font-mono">{fee.invoiceNumber}</td>

                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white">{fee.studentId?.userId?.name || fee.studentName || 'Student'}</p>
                        <p className="text-[11px] text-zinc-400">
                          {fee.studentId?.studentId || fee.studentIdentifier || 'ID'} • Room {fee.studentId?.roomId?.roomNumber || fee.roomNumber || 'N/A'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-zinc-200">{fee.feeType}</span>
                        <p className="text-[10px] text-zinc-500">{fee.academicSemester}</p>
                      </td>

                      <td className="px-5 py-3.5 font-black text-white text-sm">
                        ₹{fee.amount?.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-3.5 text-zinc-400">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={fee.paymentStatus} />
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {fee.paymentStatus === 'Paid' ? (
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setReceiptModal(true);
                            }}
                            className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl font-bold text-xs inline-flex items-center transition-colors shadow-[0_0_8px_rgba(0,229,255,0.15)]"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setPayModal(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs shadow-neon-cyan inline-flex items-center transition-all"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Fee Invoice Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Generate Semester Fee Invoice"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#050816] border border-cyan-500/20 rounded-xl flex items-center justify-between">
            <label className="font-bold text-zinc-200 cursor-pointer flex items-center space-x-2">
              <input
                type="checkbox"
                checked={createForm.targetAll}
                onChange={(e) => setCreateForm({ ...createForm, targetAll: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-400"
              />
              <span>Generate for All Active Students</span>
            </label>
          </div>

          {!createForm.targetAll && (
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Select Student *</label>
              <select
                required
                value={createForm.studentId}
                onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.userId?.name || s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Fee Category *</label>
              <select
                value={createForm.feeType}
                onChange={(e) => setCreateForm({ ...createForm, feeType: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Maintenance Fee">Maintenance Fee</option>
                <option value="Other Fees">Other Fees</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Academic Semester</label>
              <input
                type="text"
                value={createForm.academicSemester}
                onChange={(e) => setCreateForm({ ...createForm, academicSemester: e.target.value })}
                placeholder="e.g. Fall 2024"
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={createForm.remarks}
              onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
              placeholder="e.g. Early payment discount applicable before due date"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        title={`Payment: ${selectedFee?.feeType}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
            <p className="text-zinc-400 font-medium">Invoice: {selectedFee?.invoiceNumber}</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">
              ₹{selectedFee?.amount?.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Due Date: {selectedFee?.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Payment Channel</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="Online / UPI">Online / Instant UPI</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash at Hostel Office</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center space-x-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="text-[11px]">Instant settlement verification. Official voucher will be ready.</span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setPayModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Confirming...' : `Pay ₹${selectedFee?.amount}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal}
        onClose={() => setReceiptModal(false)}
        fee={selectedFee}
      />
    </div>
  );
};

export default FeeManagement;
