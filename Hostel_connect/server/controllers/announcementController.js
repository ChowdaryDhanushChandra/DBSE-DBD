import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get announcements for current user
// @route   GET /api/announcements
// @access  Private / Public
export const getAnnouncements = async (req, res, next) => {
  try {
    const query = {};

    // If student, show 'All Students' or announcements matching their assigned hostel
    if (req.user && req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      const audienceFilters = [{ targetAudience: 'All Students' }];

      if (student && student.hostelId) {
        audienceFilters.push({
          targetAudience: 'Specific Hostel',
          hostelId: student.hostelId,
        });
      }

      query.$or = audienceFilters;
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .populate('hostelId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement and notify audience
// @route   POST /api/announcements
// @access  Private (Admin / Warden)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience, hostelId, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      targetAudience: targetAudience || 'All Students',
      hostelId: hostelId || null,
      priority: priority || 'Normal',
      createdBy: req.user._id,
    });

    // Notify audience
    let targetUsers = [];
    if (targetAudience === 'All Students') {
      targetUsers = await User.find({ role: 'student' }).select('_id');
    } else if (targetAudience === 'Specific Hostel' && hostelId) {
      const students = await Student.find({ hostelId }).select('userId');
      targetUsers = students.map((s) => ({ _id: s.userId }));
    }

    // Create notifications for targeted users
    const notifications = targetUsers.map((u) => ({
      userId: u._id,
      title: `Notice: ${title}`,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      type: 'announcement',
      link: '/student/announcements',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: `Announcement posted and ${notifications.length} students notified.`,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin / Warden)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin / Warden)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
