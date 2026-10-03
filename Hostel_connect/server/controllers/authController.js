import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/database.js';
import { withTransaction, formatUser, formatStudent } from '../utils/mysqlHelper.js';

// In-memory OTP storage for 2FA verification
const otpStore = new Map();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hostel_connect_super_secret_jwt_key_2024_secure_and_safe',
    {
      expiresIn: process.env.JWT_EXPIRES || process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user (Student, Warden, or Admin)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      phone,
      securityKey,
      // Warden specific
      staffId,
      hostelId,
      officeRoom,
      // Student specific
      studentId,
      course,
      department,
      year,
      gender,
      guardianName,
      guardianPhone,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. ADMIN REGISTRATION
    if (role === 'admin') {
      const validKeys = ['ADMIN2024', 'admin123', 'HOSTEL_ADMIN'];
      if (securityKey && !validKeys.includes(securityKey.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Administrator Security Passkey. Please enter ADMIN2024.',
        });
      }

      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), cleanEmail, hashedPassword, 'admin', phone || '']
      );
      const userId = userResult.insertId;

      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'system', '/admin/dashboard')`,
        [userId, 'Welcome Administrator', 'Your administrator console account has been created with full system permissions.']
      );

      const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
      const token = generateToken(userId);

      return res.status(201).json({
        success: true,
        message: 'Administrator account registered successfully!',
        token,
        user: formatUser(userRows[0]),
      });
    }

    // 2. WARDEN REGISTRATION
    if (role === 'warden') {
      const validKeys = ['WARDEN2024', 'warden123', 'HOSTEL_WARDEN'];
      if (securityKey && !validKeys.includes(securityKey.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Warden Authorization Key. Please enter WARDEN2024.',
        });
      }

      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), cleanEmail, hashedPassword, 'warden', phone || '']
      );
      const userId = userResult.insertId;

      // Associate warden with selected hostel if provided
      if (hostelId) {
        await pool.execute('UPDATE hostels SET warden_id = ? WHERE id = ?', [userId, hostelId]);
      }

      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'system', '/warden/dashboard')`,
        [userId, 'Welcome Warden', 'Your warden management account has been registered and verified.']
      );

      const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
      const token = generateToken(userId);

      return res.status(201).json({
        success: true,
        message: 'Warden account registered successfully!',
        token,
        user: formatUser(userRows[0]),
      });
    }

    // 3. STUDENT / RESIDENT REGISTRATION
    const finalStudentId = studentId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [existingStudents] = await pool.execute('SELECT id FROM students WHERE student_id = ?', [finalStudentId]);
    if (existingStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A student or resident with this ID is already registered.',
      });
    }

    let yearOfStudy = 1;
    if (year) {
      const match = String(year).match(/\d+/);
      if (match) yearOfStudy = parseInt(match[0], 10);
    }

    const result = await withTransaction(async (conn) => {
      const [userResult] = await conn.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), cleanEmail, hashedPassword, 'student', phone || '']
      );
      const userId = userResult.insertId;

      const [studentResult] = await conn.execute(
        `INSERT INTO students (user_id, student_id, course, department, year_of_study, phone, gender, guardian_name, guardian_phone, address, hostel_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [
          userId,
          finalStudentId,
          course || 'B.Tech Computer Science',
          department || 'Engineering',
          yearOfStudy,
          phone || '',
          gender || 'Male',
          guardianName || 'Guardian',
          guardianPhone || phone || '',
          address || 'Campus Residence',
          hostelId || null,
        ]
      );
      const studentProfileId = studentResult.insertId;

      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'system', '/student/dashboard')`,
        [userId, 'Welcome to Hostel Connect!', 'Your resident account has been created. Explore your dashboard to view your room, mess schedule, and fees.']
      );

      return { userId, studentProfileId };
    });

    const token = generateToken(result.userId);

    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.userId]);
    const [studentRows] = await pool.execute('SELECT * FROM students WHERE id = ?', [result.studentProfileId]);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Hostel Connect.',
      token,
      user: formatUser(userRows[0]),
      student: formatStudent(studentRows[0]),
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

    const cleanEmail = email.toLowerCase().trim();

    // Check for user in MySQL
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Check if active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // OTP 2FA check for Admin and Warden
    if (user.role === 'admin' || user.role === 'warden') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(cleanEmail, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        userId: user.id,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        requireOtp: true,
        email: cleanEmail,
        role: user.role,
        devOtp: otp,
        message: `Two-factor verification required for ${user.role}. Verification code: ${otp}`,
      });
    }

    // Fetch student profile if student role
    let student = null;
    if (user.role === 'student') {
      const [studentRows] = await pool.execute(
        `SELECT s.*,
                h.name as hostel_name, h.location as hostel_location, h.gender as hostel_gender,
                r.room_number, r.floor_number, r.room_type, r.capacity as room_capacity, r.current_occupancy as room_occupancy
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN rooms r ON s.room_id = r.id
         WHERE s.user_id = ?`,
        [user.id]
      );
      if (studentRows.length > 0) {
        student = formatStudent(studentRows[0]);
      }
    }

    const token = generateToken(user.id);
    const formattedUser = formatUser(user);

    res.status(200).json({
      success: true,
      token,
      user: formattedUser,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP for Admin / Warden login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found or session expired. Please log in again.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'The OTP has expired. Please request a new code.',
      });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please verify and try again.',
      });
    }

    // OTP verified
    otpStore.delete(cleanEmail);

    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [record.userId]);
    if (!userRows.length) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = userRows[0];
    const token = generateToken(user.id);
    const formattedUser = formatUser(user);

    res.status(200).json({
      success: true,
      message: 'OTP verification successful! Welcome back.',
      token,
      user: formattedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP for 2FA
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const cleanEmail = email.toLowerCase().trim();
    const [users] = await pool.execute('SELECT id, role FROM users WHERE email = ?', [cleanEmail]);
    if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });

    const user = users[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: user.id,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      devOtp: otp,
      message: `A new 6-digit verification code has been generated. Code: ${otp}`,
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
    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!userRows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = formatUser(userRows[0]);
    let student = null;

    if (user.role === 'student') {
      const [studentRows] = await pool.execute(
        `SELECT s.*,
                h.name as hostel_name, h.location as hostel_location, h.gender as hostel_gender,
                r.room_number, r.floor_number, r.room_type, r.capacity as room_capacity, r.current_occupancy as room_occupancy
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN rooms r ON s.room_id = r.id
         WHERE s.user_id = ?`,
        [user.id]
      );
      if (studentRows.length > 0) {
        student = formatStudent(studentRows[0]);
      }
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
    const { name, phone, profileImage, course, department, guardianName, guardianPhone, address } = req.body;

    await pool.execute(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), profile_image = COALESCE(?, profile_image) WHERE id = ?',
      [name || null, phone || null, profileImage || null, req.user.id]
    );

    if (req.user.role === 'student') {
      await pool.execute(
        `UPDATE students SET
         course = COALESCE(?, course),
         department = COALESCE(?, department),
         phone = COALESCE(?, phone),
         guardian_name = COALESCE(?, guardian_name),
         guardian_phone = COALESCE(?, guardian_phone),
         address = COALESCE(?, address)
         WHERE user_id = ?`,
        [
          course || null,
          department || null,
          phone || null,
          guardianName || null,
          guardianPhone || null,
          address || null,
          req.user.id,
        ]
      );
    }

    const [updatedUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const formattedUser = formatUser(updatedUsers[0]);

    let student = null;
    if (formattedUser.role === 'student') {
      const [students] = await pool.execute('SELECT * FROM students WHERE user_id = ?', [req.user.id]);
      if (students.length) student = formatStudent(students[0]);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: formattedUser,
      student,
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

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email?.toLowerCase()?.trim()]);

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    res.status(200).json({
      success: true,
      message: 'Password reset key generated.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email.toLowerCase().trim()]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated.',
    });
  } catch (error) {
    next(error);
  }
};
