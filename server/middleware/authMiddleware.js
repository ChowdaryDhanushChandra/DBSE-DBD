import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

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

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists or is inactive.',
      });
    }

    req.user = user;

    // If role is student, attach the student document
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      req.student = student;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};
