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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Audit-ready reporting, sector occupancy statements, fee reconciliations, and facility analytics
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3.5 py-2 bg-[#050816] hover:bg-zinc-900 text-zinc-200 border border-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5 text-cyan-400" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Configuration & Filters */}
      <div className="bg-[#070D22]/80 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/15 shadow-glass flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'occupancy', label: 'Room Occupancy' },
            { id: 'students', label: 'Resident Directory' },
            { id: 'fees', label: 'Fee Collection' },
            { id: 'complaints', label: 'Complaints Resolution' },
            { id: 'mess', label: 'Dining Attendance' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                reportType === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-neon-cyan'
                  : 'bg-[#050816] text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-cyan-500/15'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-zinc-400 uppercase">Sector Filter:</span>
          <select
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
            className="px-3 py-2 text-xs bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          >
            <option value="">All Campus Sectors</option>
            {hostels.map((h) => (
              <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Report Body */}
      {loading ? (
        <LoadingSpinner size="md" message="Compiling report metrics..." />
      ) : (
        <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-cyan-500/15 shadow-glass space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-cyan-500/10">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
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
              <p className="text-xs text-zinc-400 mt-0.5">
                Generated on {new Date().toLocaleString()} • Cryptographic Audit Copy
              </p>
            </div>
          </div>

          {/* Report Specific View */}
          {reportType === 'occupancy' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-bold uppercase">Total Rooms</p>
                  <p className="text-2xl font-black text-white mt-1">{reportData.totalRooms}</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-bold uppercase">Total Bed Capacity</p>
                  <p className="text-2xl font-black text-white mt-1">{reportData.totalCapacity}</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-bold uppercase">Occupied Beds</p>
                  <p className="text-2xl font-black text-cyan-400 mt-1">{reportData.currentOccupancy}</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-emerald-500/20">
                  <p className="text-emerald-400 font-bold uppercase">Occupancy Rate</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{reportData.occupancyRate}%</p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#050816]/90 text-cyan-300 uppercase font-bold text-[10px] border-b border-cyan-500/20">
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
                <tbody className="divide-y divide-cyan-500/10">
                  {reportData.rooms?.map((r) => (
                    <tr key={r._id || r.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">Room {r.roomNumber}</td>
                      <td className="px-4 py-3 text-zinc-300">{r.hostelId?.name || r.hostelName}</td>
                      <td className="px-4 py-3 text-zinc-400">Floor {r.floor}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.roomType}</td>
                      <td className="px-4 py-3 text-zinc-300">{r.capacity} Beds</td>
                      <td className="px-4 py-3 font-semibold text-cyan-400">{r.currentOccupancy} Beds</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-zinc-300">{r.status}</span>
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
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-bold uppercase">Total Invoiced Amount</p>
                  <p className="text-2xl font-black text-white mt-1">
                    ₹{reportData.totalBilled?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-emerald-500/20">
                  <p className="text-emerald-400 font-bold uppercase">Collected Amount</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    ₹{reportData.totalCollected?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-amber-500/20">
                  <p className="text-amber-400 font-bold uppercase">Pending Amount</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    ₹{reportData.totalPending?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#050816]/90 text-cyan-300 uppercase font-bold text-[10px] border-b border-cyan-500/20">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Fee Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {reportData.items?.map((f) => (
                    <tr key={f._id || f.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-white font-mono">{f.invoiceNumber}</td>
                      <td className="px-4 py-3 text-zinc-300">{f.studentId?.userId?.name || f.studentName || 'Student'}</td>
                      <td className="px-4 py-3 text-zinc-400">{f.feeType}</td>
                      <td className="px-4 py-3 font-bold text-white">₹{f.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-zinc-400">{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={f.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
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
              <p className="text-xs text-cyan-400 font-semibold">Total Residents: {reportData.count}</p>
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#050816]/90 text-cyan-300 uppercase font-bold text-[10px] border-b border-cyan-500/20">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Roll ID</th>
                    <th className="px-4 py-3">Program & Year</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {reportData.items?.map((s) => (
                    <tr key={s._id || s.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{s.userId?.name || s.name}</td>
                      <td className="px-4 py-3 text-cyan-400 font-semibold">{s.studentId || s.studentIdentifier}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.course} ({s.year})</td>
                      <td className="px-4 py-3 text-zinc-300">{s.hostelId?.name || s.hostelName || 'Unallocated'}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.roomId?.roomNumber || s.roomNumber ? `Room ${s.roomId?.roomNumber || s.roomNumber}` : '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'complaints' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#050816] rounded-2xl border border-cyan-500/20">
                  <p className="text-zinc-400 font-bold uppercase">Total Issues Logged</p>
                  <p className="text-2xl font-black text-white mt-1">{reportData.total}</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-emerald-500/20">
                  <p className="text-emerald-400 font-bold uppercase">Resolved Issues</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{reportData.resolved}</p>
                </div>
                <div className="p-4 bg-[#050816] rounded-2xl border border-amber-500/20">
                  <p className="text-amber-400 font-bold uppercase">Pending Maintenance</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">{reportData.pending}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#050816]/90 text-cyan-300 uppercase font-bold text-[10px] border-b border-cyan-500/20">
                  <tr>
                    <th className="px-4 py-3">Complaint</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {reportData.items?.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{c.title}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.category}</td>
                      <td className="px-4 py-3 font-semibold text-cyan-400">{c.priority}</td>
                      <td className="px-4 py-3 text-zinc-300">{c.hostelId?.name || c.hostelName}</td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-300">{c.status}</td>
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
