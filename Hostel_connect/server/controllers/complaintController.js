import pool from '../config/database.js';
import { formatComplaint, withTransaction } from '../utils/mysqlHelper.js';

// @desc    Get all complaints with filters
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const { category, priority, status, hostelId, studentId } = req.query;

    let targetStudentId = studentId;
    if (req.user.role === 'student') {
      const [st] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (st.length) targetStudentId = st[0].id;
    }

    let sql = `
      SELECT c.*,
             s.student_id AS roll_no,
             u.id AS user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
             h.name AS hostel_name, r.room_number,
             ua.name AS assigned_name, ua.email AS assigned_email
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN users ua ON c.assigned_to = ua.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND c.category = ?';
      params.push(category);
    }
    if (priority) {
      sql += ' AND c.priority = ?';
      params.push(priority);
    }
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (targetStudentId) {
      sql += ' AND c.student_id = ?';
      params.push(targetStudentId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const [complaintRows] = await pool.execute(sql, params);

    const complaints = await Promise.all(
      complaintRows.map(async (row) => {
        const [timelineRows] = await pool.execute(`
          SELECT ct.*, u.name AS updater_name
          FROM complaint_timeline ct
          LEFT JOIN users u ON ct.updated_by = u.id
          WHERE ct.complaint_id = ?
          ORDER BY ct.updated_at ASC
        `, [row.id]);

        return formatComplaint(row, timelineRows);
      })
    );

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
      const [st] = await pool.execute('SELECT id, hostel_id, room_id FROM students WHERE user_id = ?', [req.user.id]);
      if (!st.length) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found for logged in user.',
        });
      }
      studentId = st[0].id;
    }

    const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!students.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];

    const { title, category, description, priority, image } = req.body;
    const complaintImage = req.file ? `/uploads/${req.file.filename}` : (image || '');

    const complaintId = await withTransaction(async (conn) => {
      const [cRes] = await conn.execute(
        `INSERT INTO complaints (student_id, title, category, description, priority, status, image)
         VALUES (?, ?, ?, ?, ?, 'Submitted', ?)`,
        [
          student.id,
          title,
          category || 'Other',
          description,
          priority || 'Medium',
          complaintImage,
        ]
      );
      const newId = cRes.insertId;

      await conn.execute(
        `INSERT INTO complaint_timeline (complaint_id, status, note, updated_by)
         VALUES (?, 'Submitted', 'Complaint submitted by student.', ?)`,
        [newId, req.user.id]
      );

      return newId;
    });

    const [complaintRows] = await pool.execute(`
      SELECT c.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE c.id = ?
    `, [complaintId]);

    const [timelineRows] = await pool.execute(
      'SELECT * FROM complaint_timeline WHERE complaint_id = ?',
      [complaintId]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Our team will review it shortly.',
      data: formatComplaint(complaintRows[0], timelineRows),
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
    const [complaints] = await pool.execute('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    if (!complaints.length) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    const currentComplaint = complaints[0];

    const { status, assignedTo, resolutionNotes, note } = req.body;
    const nextStatus = status || currentComplaint.status;

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE complaints SET
         status = ?,
         assigned_to = ?,
         resolution_notes = COALESCE(?, resolution_notes)
         WHERE id = ?`,
        [
          nextStatus,
          assignedTo !== undefined ? (assignedTo ? Number(assignedTo) : null) : currentComplaint.assigned_to,
          resolutionNotes !== undefined ? resolutionNotes : null,
          req.params.id,
        ]
      );

      const timelineNote = note || (resolutionNotes ? `Notes: ${resolutionNotes}` : `Status updated to ${nextStatus}`);
      await conn.execute(
        `INSERT INTO complaint_timeline (complaint_id, status, note, updated_by)
         VALUES (?, ?, ?, ?)`,
        [req.params.id, nextStatus, timelineNote, req.user.id]
      );

      // Notify the student regarding the update
      const [students] = await conn.execute('SELECT user_id FROM students WHERE id = ?', [currentComplaint.student_id]);
      if (students.length) {
        await conn.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'complaint', '/student/complaints')`,
          [
            students[0].user_id,
            `Complaint Update: "${currentComplaint.title}"`,
            `Your complaint is now ${nextStatus}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''}`,
          ]
        );
      }
    });

    const [updatedRows] = await pool.execute(`
      SELECT c.*,
             s.student_id AS roll_no,
             u.id AS user_id, u.name AS student_name, u.email AS student_email,
             ua.name AS assigned_name, ua.email AS assigned_email
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users ua ON c.assigned_to = ua.id
      WHERE c.id = ?
    `, [req.params.id]);

    const [timelineRows] = await pool.execute(
      'SELECT * FROM complaint_timeline WHERE complaint_id = ? ORDER BY updated_at ASC',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: formatComplaint(updatedRows[0], timelineRows),
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
    const [result] = await pool.execute('DELETE FROM complaints WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
