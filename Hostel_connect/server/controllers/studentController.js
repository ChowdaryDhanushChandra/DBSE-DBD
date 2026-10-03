import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import {
  formatStudent,
  formatAllocation,
  formatFee,
  formatComplaint,
  formatDocument,
  withTransaction,
} from '../utils/mysqlHelper.js';

// @desc    Get all students with search, filter, and pagination
// @route   GET /api/students
// @access  Private (Admin / Warden)
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      course,
      year,
      gender,
      status,
      hostelId,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let whereClauses = [];

    if (course) {
      whereClauses.push('s.course = ?');
      params.push(course);
    }
    if (year) {
      const match = String(year).match(/\d+/);
      if (match) {
        whereClauses.push('s.year_of_study = ?');
        params.push(Number(match[0]));
      }
    }
    if (gender) {
      whereClauses.push('s.gender = ?');
      params.push(gender);
    }
    if (status) {
      whereClauses.push('s.status = ?');
      params.push(status);
    }
    if (hostelId) {
      whereClauses.push('s.hostel_id = ?');
      params.push(hostelId);
    }

    if (search) {
      const sPattern = `%${search}%`;
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR s.student_id LIKE ? OR s.phone LIKE ? OR s.department LIKE ?)');
      params.push(sPattern, sPattern, sPattern, sPattern, sPattern);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total matching
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM students s
      JOIN users u ON s.user_id = u.id
      ${whereSql}
    `;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Fetch paginated students
    const dataQuery = `
      SELECT s.*,
             u.name, u.email, u.profile_image, u.is_active, u.phone AS user_phone, u.role, u.created_at AS user_created_at,
             h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender,
             r.room_number, r.floor_number, r.room_type, r.capacity AS room_capacity, r.current_occupancy AS room_occupancy
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      ${whereSql}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `;

    // LIMIT and OFFSET should be integers
    const [studentRows] = await pool.query(dataQuery, [...params, Number(limit), Number(offset)]);
    const students = studentRows.map(formatStudent);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with room, fees, complaints, documents
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*,
             u.name, u.email, u.profile_image, u.is_active, u.phone AS user_phone, u.role, u.created_at AS user_created_at,
             h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender,
             r.room_number, r.floor_number, r.room_type, r.capacity AS room_capacity, r.current_occupancy AS room_occupancy
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const student = formatStudent(rows[0]);

    // Allocations
    const [allocRows] = await pool.execute(`
      SELECT a.*,
             h.name AS hostel_name, h.location AS hostel_location,
             r.room_number, r.floor_number, r.room_type, r.capacity, r.current_occupancy,
             s.student_id AS student_roll, u.name AS student_name, u.email AS student_email
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON a.hostel_id = h.id
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.student_id = ?
      ORDER BY a.allocation_date DESC
    `, [req.params.id]);
    const allocations = allocRows.map(formatAllocation);

    // Fees
    const [feeRows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll, u.name AS student_name, u.email AS student_email
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.student_id = ?
      ORDER BY f.due_date DESC
    `, [req.params.id]);
    const fees = feeRows.map(formatFee);

    // Complaints
    const [complaintRows] = await pool.execute(`
      SELECT c.*,
             s.student_id AS roll_no, u.name AS student_name, u.email AS student_email,
             ua.name AS assigned_name, ua.email AS assigned_email
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users ua ON c.assigned_to = ua.id
      WHERE c.student_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.id]);

    const complaints = await Promise.all(
      complaintRows.map(async (row) => {
        const [timeline] = await pool.execute(
          'SELECT * FROM complaint_timeline WHERE complaint_id = ? ORDER BY updated_at ASC',
          [row.id]
        );
        return formatComplaint(row, timeline);
      })
    );

    // Documents
    const [docRows] = await pool.execute(`
      SELECT d.*, s.student_id AS roll_no, u.name AS student_name
      FROM documents d
      JOIN students s ON d.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE d.student_id = ?
      ORDER BY d.upload_date DESC
    `, [req.params.id]);
    const documents = docRows.map(formatDocument);

    res.status(200).json({
      success: true,
      data: {
        student,
        allocations,
        fees,
        complaints,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student manually by Admin
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      studentId,
      course,
      department,
      year,
      gender,
      phone,
      guardianName,
      guardianPhone,
      address,
      hostelId,
      roomId,
    } = req.body;

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const finalStudentId = studentId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [existingRoll] = await pool.execute('SELECT id FROM students WHERE student_id = ?', [finalStudentId]);
    if (existingRoll.length) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Student ID is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Student@123', salt);

    let yearOfStudy = 1;
    if (year) {
      const match = String(year).match(/\d+/);
      if (match) yearOfStudy = parseInt(match[0], 10);
    }

    const newStudentId = await withTransaction(async (conn) => {
      // 1. User
      const [uRes] = await conn.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashedPassword, 'student', phone || '']
      );
      const userId = uRes.insertId;

      // 2. Student
      const [sRes] = await conn.execute(
        `INSERT INTO students (user_id, student_id, course, department, year_of_study, phone, gender, guardian_name, guardian_phone, address, hostel_id, room_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
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
          hostelId ? Number(hostelId) : null,
          roomId ? Number(roomId) : null,
        ]
      );
      const studentIdPk = sRes.insertId;

      // 3. Room allocation if roomId specified
      if (roomId) {
        const [rooms] = await conn.execute('SELECT * FROM rooms WHERE id = ?', [roomId]);
        if (rooms.length && rooms[0].current_occupancy < rooms[0].capacity) {
          const newOccupancy = rooms[0].current_occupancy + 1;
          const newStatus = newOccupancy >= rooms[0].capacity ? 'Fully Occupied' : 'Partially Occupied';

          await conn.execute(
            'UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?',
            [newOccupancy, newStatus, roomId]
          );

          await conn.execute(
            `INSERT INTO allocations (student_id, hostel_id, room_id, allocation_date, status, remarks)
             VALUES (?, ?, ?, CURDATE(), 'Active', 'Allocated during student creation')`,
            [studentIdPk, hostelId || rooms[0].hostel_id, roomId]
          );
        }
      }

      return studentIdPk;
    });

    const [created] = await pool.execute(`
      SELECT s.*, u.name, u.email, u.profile_image, u.is_active, u.phone AS user_phone, u.role
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [newStudentId]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: formatStudent(created[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin / Warden)
export const updateStudent = async (req, res, next) => {
  try {
    const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const currentStudent = students[0];
    const {
      name,
      email,
      phone,
      course,
      department,
      year,
      gender,
      guardianName,
      guardianPhone,
      address,
      status,
    } = req.body;

    let yearOfStudy = currentStudent.year_of_study;
    if (year) {
      const match = String(year).match(/\d+/);
      if (match) yearOfStudy = parseInt(match[0], 10);
    }

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE students SET
         course = COALESCE(?, course),
         department = COALESCE(?, department),
         year_of_study = ?,
         gender = COALESCE(?, gender),
         phone = COALESCE(?, phone),
         guardian_name = COALESCE(?, guardian_name),
         guardian_phone = COALESCE(?, guardian_phone),
         address = COALESCE(?, address),
         status = COALESCE(?, status)
         WHERE id = ?`,
        [
          course || null,
          department || null,
          yearOfStudy,
          gender || null,
          phone || null,
          guardianName || null,
          guardianPhone || null,
          address || null,
          status || null,
          req.params.id,
        ]
      );

      if (name || email || phone) {
        await conn.execute(
          `UPDATE users SET
           name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone)
           WHERE id = ?`,
          [
            name || null,
            email ? email.toLowerCase().trim() : null,
            phone || null,
            currentStudent.user_id,
          ]
        );
      }
    });

    const [updated] = await pool.execute(`
      SELECT s.*, u.name, u.email, u.profile_image, u.is_active, u.phone AS user_phone, u.role,
             h.name AS hostel_name, r.room_number, r.floor_number, r.room_type
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.id = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: formatStudent(updated[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const student = students[0];

    await withTransaction(async (conn) => {
      // 1. Decrement room occupancy if assigned
      if (student.room_id) {
        const [rooms] = await conn.execute('SELECT * FROM rooms WHERE id = ?', [student.room_id]);
        if (rooms.length && rooms[0].current_occupancy > 0) {
          const newOcc = rooms[0].current_occupancy - 1;
          const newStat = newOcc === 0 ? 'Available' : 'Partially Occupied';
          await conn.execute(
            'UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?',
            [newOcc, newStat, student.room_id]
          );
        }
      }

      // 2. Mark allocations as vacated
      await conn.execute(
        "UPDATE allocations SET status = 'Vacated', vacate_date = CURDATE() WHERE student_id = ? AND status = 'Active'",
        [student.id]
      );

      // 3. Delete student and user
      await conn.execute('DELETE FROM students WHERE id = ?', [student.id]);
      await conn.execute('DELETE FROM users WHERE id = ?', [student.user_id]);
    });

    res.status(200).json({
      success: true,
      message: 'Student and user account removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
