import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hostel_connect_super_secret_jwt_key_2024_secure_and_safe',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      studentId,
      course,
      department,
      year,
      gender,
      guardianName,
      guardianPhone,
      address,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Check if studentId exists
    if (studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this Student ID is already registered.',
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone,
    });

    // Auto-generate studentId if not provided
    const finalStudentId = studentId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create student record
    const student = await Student.create({
      userId: user._id,
      studentId: finalStudentId,
      course: course || 'B.Tech Computer Science',
      department: department || 'Engineering',
      year: year || '1st Year',
      phone: phone || '',
      gender: gender || 'Male',
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || phone || '',
      address: address || 'Campus Residence',
    });

    // Send welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to Hostel Connect!',
      message: 'Your student account has been created. Explore your dashboard to view your room, mess schedule, and fees.',
      type: 'system',
      link: '/student/dashboard',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Hostel Connect.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Fetch student profile if student role
    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id })
        .populate('hostelId', 'name location gender')
        .populate('roomId', 'roomNumber floor roomType capacity currentOccupancy');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
      },
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let student = null;

    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id })
        .populate('hostelId')
        .populate('roomId');
    }

    res.status(200).json({
      success: true,
      user,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    if (user.role === 'student') {
      const { course, department, guardianName, guardianPhone, address } = req.body;
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        if (course) student.course = course;
        if (department) student.department = department;
        if (guardianName) student.guardianName = guardianName;
        if (guardianPhone) student.guardianPhone = guardianPhone;
        if (address) student.address = address;
        if (phone) student.phone = phone;
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (generates reset token)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In a real email setup, send email. Here return token directly for seamless testing:
    res.status(200).json({
      success: true,
      message: 'Password reset link / token generated successfully.',
      resetToken, // Provided for easy demo & automated testing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
