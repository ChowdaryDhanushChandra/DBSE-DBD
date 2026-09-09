import Complaint from '../models/Complaint.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

// @desc    Get all complaints with filters
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const { category, priority, status, hostelId, studentId } = req.query;
    const query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;
    if (studentId) query.studentId = studentId;

    // If user is a student, filter to only their complaints
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.studentId = student._id;
      }
    }

    const complaints = await Complaint.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber')
      .populate('assignedTo', 'name role')
      .populate('timeline.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new complaint by Student
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res, next) => {
  try {
    let studentId = req.body.studentId;

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found for logged in user.',
        });
      }
      studentId = student._id;
    }

    const student = await Student.findById(studentId);
    const { title, category, description, priority, hostelId, roomId, image } = req.body;

    // Default image or uploaded file path
    const complaintImage = req.file ? `/uploads/${req.file.filename}` : (image || '');

    const complaint = await Complaint.create({
      studentId,
      title,
      category,
      description,
      priority: priority || 'Medium',
      hostelId: hostelId || student?.hostelId || null,
      roomId: roomId || student?.roomId || null,
      image: complaintImage,
      status: 'Submitted',
      timeline: [
        {
          status: 'Submitted',
          note: 'Complaint submitted by student.',
          updatedBy: req.user._id,
          updatedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Our team will review it shortly.',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status, assignment, and resolution notes
// @route   PUT /api/complaints/:id
// @access  Private (Admin / Warden)
export const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const { status, assignedTo, resolutionNotes, note } = req.body;

    let statusChanged = false;
    if (status && status !== complaint.status) {
      complaint.status = status;
      statusChanged = true;
    }

    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;

    // Add entry to chronological timeline
    complaint.timeline.push({
      status: complaint.status,
      note: note || (resolutionNotes ? `Notes: ${resolutionNotes}` : `Status updated to ${complaint.status}`),
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    await complaint.save();

    // Notify the student regarding the update
    const student = await Student.findById(complaint.studentId);
    if (student) {
      await Notification.create({
        userId: student.userId,
        title: `Complaint Update: "${complaint.title}"`,
        message: `Your complaint is now ${complaint.status}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''}`,
        type: 'complaint',
        link: '/student/complaints',
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber')
      .populate('assignedTo', 'name role');

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
