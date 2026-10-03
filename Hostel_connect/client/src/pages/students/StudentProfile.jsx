import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Building,
  BedDouble,
  CreditCard,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReceiptModal } from '../../components/common/ReceiptModal';

const StudentProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, allocations, fees, complaints, documents

  // Receipt Modal
  const [receiptModal, setReceiptModal] = useState(false);
  const [activeFee, setActiveFee] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        // If route is /student/profile (without param id), fetch current user's student data
        if (!id) {
          const res = await api.get('/auth/me');
          if (res.data.student) {
            const detailRes = await api.get(`/students/${res.data.student._id}`);
            if (detailRes.data.success) {
              setProfileData(detailRes.data.data);
            }
          }
        } else {
          const res = await api.get(`/students/${id}`);
          if (res.data.success) {
            setProfileData(res.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading Student Profile..." />;
  }

  if (!profileData || !profileData.student) {
    return (
      <div className="p-8 text-center bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-glass">
        <p className="text-slate-400 text-sm">Student profile not found.</p>
        <Link to="/admin/students" className="mt-3 inline-block text-xs font-bold text-cyan-400 hover:text-cyan-300">
          Return to Student Directory
        </Link>
      </div>
    );
  }

  const { student, allocations, fees, complaints, documents } = profileData;
  const studentName = student.name || student.userId?.name || 'Student';
  const studentEmail = student.email || student.userId?.email || 'N/A';
  const hostelName = student.hostelName || student.hostelId?.name || 'No Hostel';
  const roomNumber = student.roomNumber || student.roomId?.roomNumber || 'N/A';
  const backLink = currentUser?.role === 'student' ? '/student/dashboard' : '/admin/students';

  return (
    <div className="space-y-6 text-slate-100">
      {/* Back Link */}
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      </div>

      {/* Top Student Header Card */}
      <div className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-cyan-500/15 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-transparent" />

        <div className="flex items-center space-x-5">
          <img
            src={
              student.profileImage ||
              student.userId?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=7b61ff&color=fff&size=128`
            }
            alt=""
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          />
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-black text-white">{studentName}</h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs font-semibold text-cyan-400 mt-0.5 font-mono">
              Roll ID: {student.studentId} • {student.course} ({student.year})
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-cyan-400/60" />
                {studentEmail}
              </span>
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-cyan-400/60" />
                {student.phone}
              </span>
              <span className="flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-cyan-400/60" />
                {hostelName} - Room {roomNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto space-x-8 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Guardian' },
          { id: 'allocations', label: `Room History (${allocations?.length || 0})` },
          { id: 'fees', label: `Fee Payments (${fees?.length || 0})` },
          { id: 'complaints', label: `Complaints (${complaints?.length || 0})` },
          { id: 'documents', label: `Documents (${documents?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 font-bold shadow-[0_2px_10px_rgba(0,229,255,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Tab 1: Overview & Guardian */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass space-y-4">
              <h3 className="text-sm font-bold text-white border-b pb-2 border-white/10 tracking-wide">
                Academic & Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-bold text-white mt-0.5">{studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Student ID</p>
                  <p className="font-bold text-cyan-400 font-mono mt-0.5">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Course / Program</p>
                  <p className="font-bold text-white mt-0.5">{student.course}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Department</p>
                  <p className="font-bold text-white mt-0.5">{student.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Academic Year</p>
                  <p className="font-bold text-white mt-0.5">{student.year}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Gender</p>
                  <p className="font-bold text-white mt-0.5">{student.gender}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/15 shadow-glass space-y-4">
              <h3 className="text-sm font-bold text-white border-b pb-2 border-white/10 tracking-wide">
                Guardian & Address Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Guardian Name</p>
                  <p className="font-bold text-white mt-0.5">{student.guardianName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Guardian Phone</p>
                  <p className="font-bold text-white font-mono mt-0.5">{student.guardianPhone}</p>
                </div>
              </div>
              <div className="text-xs pt-2">
                <p className="text-slate-400 font-medium">Permanent Residential Address</p>
                <p className="font-semibold text-slate-300 mt-0.5">{student.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Allocations */}
        {activeTab === 'allocations' && (
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Room Allocation Lifecycle</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Hostel</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Allocation Date</th>
                  <th className="px-5 py-3">Vacate Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allocations && allocations.length > 0 ? (
                  allocations.map((a) => (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-bold text-white">{a.hostelName || a.hostelId?.name}</td>
                      <td className="px-5 py-3 font-semibold text-cyan-400">
                        Room {a.roomNumber || a.roomId?.roomNumber} (Floor {a.floor || a.roomId?.floor || '1'})
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(a.allocationDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {a.vacateDate ? new Date(a.vacateDate).toLocaleDateString() : 'Present'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">{a.remarks || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500 text-xs">
                      No room allocation records on file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Fees */}
        {activeTab === 'fees' && (
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Fee Invoices & Receipts</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Fee Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fees && fees.length > 0 ? (
                  fees.map((f) => (
                    <tr key={f._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-bold text-white font-mono">{f.invoiceNumber}</td>
                      <td className="px-5 py-3 text-slate-300">{f.feeType}</td>
                      <td className="px-5 py-3 font-bold text-cyan-400 font-mono">
                        ₹{f.amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={f.paymentStatus} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {f.paymentStatus === 'Paid' ? (
                          <button
                            onClick={() => {
                              setActiveFee({
                                ...f,
                                studentName,
                                studentEmail,
                                hostelName,
                                roomNumber,
                                studentId: student,
                              });
                              setReceiptModal(true);
                            }}
                            className="px-2.5 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Receipt
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500 text-xs">
                      No fee records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Complaints */}
        {activeTab === 'complaints' && (
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b pb-2 border-white/10 tracking-wide">
              Submitted Maintenance Issues
            </h3>
            {complaints && complaints.length > 0 ? (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c._id} className="p-4 bg-white/[0.03] rounded-xl border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-white">{c.title}</h4>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <p className="text-slate-400 mb-2">{c.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Category: {c.category} • Date: {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                    {c.resolutionNotes && (
                      <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-[11px] font-medium">
                        Resolution Note: {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-slate-500 text-xs">
                No complaints recorded by this student.
              </p>
            )}
          </div>
        )}

        {/* Tab 5: Documents */}
        {activeTab === 'documents' && (
          <div className="bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-cyan-500/15 shadow-glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b pb-2 border-white/10 tracking-wide">
              Verification Documents
            </h3>
            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{doc.documentType}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">{doc.originalName || 'Document file'}</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-cyan-400 font-bold hover:text-cyan-300 text-xs transition-colors"
                    >
                      View File ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-slate-500 text-xs">
                No uploaded verification documents.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal}
        onClose={() => setReceiptModal(false)}
        fee={activeFee}
      />
    </div>
  );
};

export default StudentProfile;
