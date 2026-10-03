import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { formatUser, formatStudent } from '../utils/mysqlHelper.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hostel_connect_super_secret_jwt_key_2024_secure_and_safe'
    );

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, profile_image, is_active, phone, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists or is inactive.',
      });
    }

    const user = formatUser(rows[0]);
    req.user = user;

    // If role is student, attach the student profile
    if (user.role === 'student') {
      const [students] = await pool.execute(
        `SELECT s.*, 
                h.name as hostel_name, h.location as hostel_location, h.gender as hostel_gender,
                r.room_number, r.floor_number, r.room_type, r.capacity as room_capacity, r.current_occupancy as room_occupancy
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN rooms r ON s.room_id = r.id
         WHERE s.user_id = ?`,
        [user.id]
      );
      if (students.length) {
        req.student = formatStudent(students[0]);
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'Unknown'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};
