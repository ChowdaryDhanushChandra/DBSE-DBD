import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Building,
  Calendar,
  Users,
  CreditCard,
  AlertCircle,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('occupancy'); // occupancy, students, fees, complaints, mess
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) setHostels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { reportType };
      if (hostelId) params.hostelId = hostelId;

      const res = await api.get('/dashboard/reports', { params });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, hostelId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'occupancy' && reportData.rooms) {
      csvContent += 'Room Number,Floor,Room Type,Capacity,Current Occupancy,Status\n';
      reportData.rooms.forEach((r) => {
        csvContent += `${r.roomNumber},${r.floor},${r.roomType},${r.capacity},${r.currentOccupancy},${r.status}\n`;
      });
    } else if (reportType === 'students' && reportData.items) {
      csvContent += 'Student Name,Email,Phone,Student ID,Course,Year,Hostel,Room,Status\n';
      reportData.items.forEach((s) => {
        csvContent += `"${s.userId?.name || ''}","${s.userId?.email || ''}","${s.phone || ''}","${s.studentId || ''}","${s.course || ''}","${s.year || ''}","${s.hostelId?.name || ''}","${s.roomId?.roomNumber || ''}","${s.status || ''}"\n`;
      });
    } else if (reportType === 'fees' && reportData.items) {
      csvContent += 'Invoice Number,Student,Fee Type,Amount,Due Date,Status,Payment Method\n';
      reportData.items.forEach((f) => {
        csvContent += `"${f.invoiceNumber}","${f.studentId?.userId?.name || ''}","${f.feeType}",${f.amount},"${f.dueDate}","${f.paymentStatus}","${f.paymentMethod || ''}"\n`;
      });
    } else if (reportType === 'complaints' && reportData.items) {
      csvContent += 'Title,Category,Priority,Status,Hostel,Filed Date\n';
      reportData.items.forEach((c) => {
        csvContent += `"${c.title}","${c.category}","${c.priority}","${c.status}","${c.hostelId?.name || ''}","${c.createdAt}"\n`;
      });
    } else {
      csvContent += 'Report Type,Export Date\n';
      csvContent += `${reportType},${new Date().toISOString()}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HostelConnect_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit-ready reporting, room occupancy statements, fee reconciliations, and facility analytics
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5 text-indigo-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Configuration & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'occupancy', label: 'Room Occupancy' },
            { id: 'students', label: 'Student Directory' },
            { id: 'fees', label: 'Fee Collection' },
            { id: 'complaints', label: 'Complaints Resolution' },
            { id: 'mess', label: 'Dining Attendance' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                reportType === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Hostel:</span>
          <select
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="">All Campus Hostels</option>
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Report Body */}
      {loading ? (
        <LoadingSpinner size="md" message="Compiling report metrics..." />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {reportType === 'occupancy'
                  ? 'Hostel Capacity & Room Occupancy Statement'
                  : reportType === 'students'
                  ? 'Active Student Residents Roster'
                  : reportType === 'fees'
                  ? 'Fee Billing & Revenue Collection Ledger'
                  : reportType === 'complaints'
                  ? 'Facilities & Maintenance Resolution Summary'
                  : 'Mess Dining Attendance Log'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generated on {new Date().toLocaleString()} • Official Institution Audit Copy
              </p>
            </div>
          </div>

          {/* Report Specific View */}
          {reportType === 'occupancy' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Total Rooms</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.totalRooms}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Total Bed Capacity</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.totalCapacity}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Occupied Beds</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{reportData.currentOccupancy}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Occupancy Rate</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.occupancyRate}%</p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Room #</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3">Floor</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Occupied</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.rooms?.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">Room {r.roomNumber}</td>
                      <td className="px-4 py-3">{r.hostelId?.name}</td>
                      <td className="px-4 py-3">Floor {r.floor}</td>
                      <td className="px-4 py-3">{r.roomType}</td>
                      <td className="px-4 py-3">{r.capacity} Beds</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">{r.currentOccupancy} Beds</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-700">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'fees' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Total Invoiced Amount</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₹{reportData.totalBilled?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Collected Amount</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    ₹{reportData.totalCollected?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Pending Amount</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    ₹{reportData.totalPending?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Fee Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.items?.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{f.invoiceNumber}</td>
                      <td className="px-4 py-3">{f.studentId?.userId?.name || 'Student'}</td>
                      <td className="px-4 py-3">{f.feeType}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{f.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={f.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}>
                          {f.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'students' && reportData && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold">Total Residents: {reportData.count}</p>
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Roll ID</th>
                    <th className="px-4 py-3">Program & Year</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.items?.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{s.userId?.name}</td>
                      <td className="px-4 py-3 text-indigo-600 font-semibold">{s.studentId}</td>
                      <td className="px-4 py-3">{s.course} ({s.year})</td>
                      <td className="px-4 py-3">{s.hostelId?.name || 'Unallocated'}</td>
                      <td className="px-4 py-3">{s.roomId?.roomNumber ? `Room ${s.roomId.roomNumber}` : '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'complaints' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Total Issues Logged</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.total}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Resolved Issues</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.resolved}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase">Pending Maintenance</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{reportData.pending}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Complaint</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.items?.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{c.title}</td>
                      <td className="px-4 py-3">{c.category}</td>
                      <td className="px-4 py-3 font-semibold">{c.priority}</td>
                      <td className="px-4 py-3">{c.hostelId?.name}</td>
                      <td className="px-4 py-3 text-right font-bold">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
