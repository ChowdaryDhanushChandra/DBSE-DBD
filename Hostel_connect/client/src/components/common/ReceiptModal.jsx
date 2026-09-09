import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle, Building } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, fee }) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = fee.studentId?.userId?.name || 'Student';
  const studentEmail = fee.studentId?.userId?.email || 'N/A';
  const hostelName = fee.studentId?.hostelId?.name || 'Main Campus Hostel';
  const roomNumber = fee.studentId?.roomId?.roomNumber || 'Room N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="max-w-2xl">
      <div id="printable-receipt" className="p-4 bg-white rounded-xl space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-5 border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">HOSTEL CONNECT</h2>
              <p className="text-xs text-slate-500 font-medium">Official Payment Receipt & Voucher</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {fee.paymentStatus?.toUpperCase()}
            </span>
            <p className="text-xs text-slate-400 mt-1">Invoice: {fee.invoiceNumber}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Billed To</p>
            <p className="font-semibold text-slate-800 mt-0.5">{studentName}</p>
            <p className="text-xs text-slate-500">{studentEmail}</p>
            <p className="text-xs text-slate-500 mt-1">{hostelName} - {roomNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium uppercase">Payment Details</p>
            <p className="text-xs text-slate-600 mt-0.5">
              <span className="font-medium">Txn ID:</span> {fee.transactionId || 'N/A'}
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-medium">Method:</span> {fee.paymentMethod || 'Online'}
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-medium">Date:</span>{' '}
              {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Academic Period</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">{fee.feeType}</td>
                <td className="px-4 py-3 text-slate-500">{fee.academicSemester || 'Fall Semester 2024'}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  ₹{fee.amount?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50/70 border-t border-slate-100 font-bold">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-slate-700">Total Paid</td>
                <td className="px-4 py-3 text-right text-indigo-600 text-base">
                  ₹{fee.amount?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <p>This is a computer-generated voucher and requires no physical signature.</p>
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-colors"
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
