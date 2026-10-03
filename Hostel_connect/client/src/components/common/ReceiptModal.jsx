import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle, Building } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, fee }) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = fee.studentName || fee.studentId?.userId?.name || 'Student';
  const studentEmail = fee.studentEmail || fee.studentId?.userId?.email || 'N/A';
  const hostelName = fee.hostelName || fee.studentId?.hostelId?.name || 'Main Campus Hostel';
  const roomNumber = fee.roomNumber || fee.studentId?.roomId?.roomNumber || 'Room N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="max-w-2xl">
      <div id="printable-receipt" className="p-4 bg-[#050816]/90 rounded-xl space-y-6 text-slate-200 border border-cyan-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-5 border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                HOSTEL CONNECT
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">PAY-VOUCHER</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Official Payment Receipt & Digital Voucher</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {fee.paymentStatus?.toUpperCase()}
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">Invoice: {fee.invoiceNumber}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-white/[0.03] p-4 rounded-xl border border-white/10">
          <div>
            <p className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">Billed To</p>
            <p className="font-bold text-white mt-0.5">{studentName}</p>
            <p className="text-xs text-slate-400">{studentEmail}</p>
            <p className="text-xs text-slate-400 mt-1">{hostelName} - {roomNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">Payment Details</p>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">
              <span className="font-medium text-slate-400 font-sans">Txn ID:</span> {fee.transactionId || 'N/A'}
            </p>
            <p className="text-xs text-slate-300">
              <span className="font-medium text-slate-400">Method:</span> {fee.paymentMethod || 'Online'}
            </p>
            <p className="text-xs text-slate-300">
              <span className="font-medium text-slate-400">Date:</span>{' '}
              {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-slate-300 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Academic Period</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3 font-medium text-white">{fee.feeType}</td>
                <td className="px-4 py-3 text-slate-400">{fee.academicSemester || 'Fall Semester 2024'}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  ₹{fee.amount?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-white/[0.04] border-t border-white/10 font-bold">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-slate-300">Total Paid</td>
                <td className="px-4 py-3 text-right text-cyan-400 text-base font-extrabold text-glow">
                  ₹{fee.amount?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <p>This is a computer-generated voucher verified by Hostel Connect.</p>
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
