import Document from '../models/Document.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file',
      });
    }

    let studentId = req.body.studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }
      studentId = student._id;
    }

    const { documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await Document.create({
      studentId,
      documentType: documentType || 'Other Hostel Documents',
      fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and awaiting administrative review.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents with optional filters
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const { studentId, status, documentType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (documentType) query.documentType = documentType;
    if (studentId) query.studentId = studentId;

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.studentId = student._id;
      }
    }

    const documents = await Document.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document status (Approve / Reject)
// @route   PUT /api/documents/:id/status
// @access  Private (Admin / Warden)
export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    doc.status = status;
    if (adminNotes !== undefined) doc.adminNotes = adminNotes;
    await doc.save();

    // Notify student
    const student = await Student.findById(doc.studentId);
    if (student) {
      await Notification.create({
        userId: student.userId,
        title: `Document ${status}: ${doc.documentType}`,
        message: `Your document has been marked as ${status}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''}`,
        type: 'document',
        link: '/student/documents',
      });
    }

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
