import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const DocumentManagement = () => {
  const { user, isStudent, isAdmin, isWarden } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [uploadModal, setUploadModal] = useState(false);
  const [documentType, setDocumentType] = useState('Student ID');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Review modal
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'Approved', adminNotes: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const docTypes = [
    'Student ID',
    'Aadhaar / Identity Document',
    'Admission Document',
    'Medical Certificate',
    'Other Hostel Documents',
  ];

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadModal(false);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmittingReview(true);
    try {
      await api.put(`/documents/${selectedDoc._id}/status`, reviewForm);
      setReviewModal(false);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating document status');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Document Verification Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student identity documents, admission certificates, and administrative approvals
          </p>
        </div>

        <button
          onClick={() => setUploadModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Upload Document
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" message="Loading documents..." />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents on file"
            description="Upload required identity and university documents to complete verification."
            actionText="Upload Document"
            onAction={() => setUploadModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Document Type</th>
                  {!isStudent && <th className="px-5 py-3.5">Student</th>}
                  <th className="px-5 py-3.5">File Name</th>
                  <th className="px-5 py-3.5">Uploaded Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Admin Feedback</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{doc.documentType}</td>

                    {!isStudent && (
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{doc.studentId?.userId?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-400">{doc.studentId?.studentId}</p>
                      </td>
                    )}

                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {doc.originalName || 'Attached Document'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {doc.adminNotes || '-'}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold inline-flex items-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        View
                      </a>

                      {(isAdmin || isWarden) && (
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setReviewForm({
                              status: doc.status === 'Pending' ? 'Approved' : doc.status,
                              adminNotes: doc.adminNotes || '',
                            });
                            setReviewModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center shadow-sm"
                        >
                          Review
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

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModal}
        onClose={() => setUploadModal(false)}
        title="Upload Student Document"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Category *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {docTypes.map((dt) => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select File (PDF, PNG, JPG) *</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Status Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title={`Verify Document: ${selectedDoc?.documentType}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
            <p className="font-semibold text-slate-800">Student:</p>
            <p>{selectedDoc?.studentId?.userId?.name} ({selectedDoc?.studentId?.studentId})</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Verification Status</label>
            <select
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Approved">Approved (Valid Document)</option>
              <option value="Rejected">Rejected (Resubmission Needed)</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Administrative Feedback / Notes</label>
            <textarea
              rows="3"
              value={reviewForm.adminNotes}
              onChange={(e) => setReviewForm({ ...reviewForm, adminNotes: e.target.value })}
              placeholder="e.g. Identity verified against registrar database or reason for rejection"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {submittingReview ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentManagement;
