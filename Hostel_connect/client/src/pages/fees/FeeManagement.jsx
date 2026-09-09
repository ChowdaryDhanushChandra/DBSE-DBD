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
    const name = f.studentId?.userId?.name?.toLowerCase() || '';
    const inv = f.invoiceNumber?.toLowerCase() || '';
    const stId = f.studentId?.studentId?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || inv.includes(q) || stId.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Semester tuition, room accommodation invoices, payment tracking, and official receipts
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCreateForm({
                studentId: students[0]?._id || '',
                feeType: 'Hostel Fee',
                amount: 35000,
                dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
                academicSemester: 'Fall Semester 2024',
                remarks: '',
                targetAll: false,
              });
              setCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Bill
          </button>
        )}
      </div>

      {/* Financial KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Invoiced</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹{(summary.totalBilled || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total student billings</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Collected</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{(summary.totalCollected || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Settled invoices</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <p className="text-xs font-bold text-slate-400 uppercase">Pending Collections</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              ₹{(summary.totalPending || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting student payment</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <p className="text-xs font-bold text-slate-400 uppercase">Overdue Invoices</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {summary.overdueCount || 0} Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Past due deadline</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-col md:flex-row items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student, invoice #, or student ID..."
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
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
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
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
              <tbody className="divide-y divide-slate-100">
                {filteredFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{fee.invoiceNumber}</td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{fee.studentId?.userId?.name || 'Student'}</p>
                      <p className="text-[11px] text-slate-400">
                        {fee.studentId?.studentId} • Room {fee.studentId?.roomId?.roomNumber || 'N/A'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700">{fee.feeType}</span>
                      <p className="text-[10px] text-slate-400">{fee.academicSemester}</p>
                    </td>

                    <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                      ₹{fee.amount?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
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
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs inline-flex items-center"
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
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-indigo-200 inline-flex items-center"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <label className="font-bold text-indigo-900 cursor-pointer flex items-center space-x-2">
              <input
                type="checkbox"
                checked={createForm.targetAll}
                onChange={(e) => setCreateForm({ ...createForm, targetAll: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Generate for All Active Students</span>
            </label>
          </div>

          {!createForm.targetAll && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                required
                value={createForm.studentId}
                onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.userId?.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fee Category *</label>
              <select
                value={createForm.feeType}
                onChange={(e) => setCreateForm({ ...createForm, feeType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Maintenance Fee">Maintenance Fee</option>
                <option value="Other Fees">Other Fees</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Semester</label>
              <input
                type="text"
                value={createForm.academicSemester}
                onChange={(e) => setCreateForm({ ...createForm, academicSemester: e.target.value })}
                placeholder="e.g. Fall 2024"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={createForm.remarks}
              onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
              placeholder="e.g. Early payment discount applicable before due date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-400 font-medium">Invoice: {selectedFee?.invoiceNumber}</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              ₹{selectedFee?.amount?.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Due Date: {selectedFee?.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Channel</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Online / UPI">Online / Instant UPI</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash at Hostel Office</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center space-x-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px]">Instant settlement verification. Official voucher will be ready.</span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
