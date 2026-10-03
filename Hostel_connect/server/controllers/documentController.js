import pool from '../config/database.js';
import { formatDocument, withTransaction } from '../utils/mysqlHelper.js';

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

    let targetStudentId = req.body.studentId;
    if (req.user.role === 'student') {
      const [st] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (!st.length) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }
      targetStudentId = st[0].id;
    }

    const { documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.execute(
      `INSERT INTO documents (student_id, document_type, file_url, original_name, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [
        targetStudentId,
        documentType || 'Other Hostel Documents',
        fileUrl,
        req.file.originalname,
      ]
    );

    const [createdRows] = await pool.execute(`
      SELECT d.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
      FROM documents d
      JOIN students s ON d.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE d.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and awaiting administrative review.',
      data: formatDocument(createdRows[0]),
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

    let targetStudentId = studentId;
    if (req.user.role === 'student') {
      const [st] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (st.length) targetStudentId = st[0].id;
    }

    let sql = `
      SELECT d.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone
      FROM documents d
      JOIN students s ON d.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND d.status = ?';
      params.push(status);
    }
    if (documentType) {
      sql += ' AND d.document_type = ?';
      params.push(documentType);
    }
    if (targetStudentId) {
      sql += ' AND d.student_id = ?';
      params.push(targetStudentId);
    }

    sql += ' ORDER BY d.upload_date DESC';

    const [rows] = await pool.execute(sql, params);
    const documents = rows.map(formatDocument);

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

    const [docs] = await pool.execute('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!docs.length) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const doc = docs[0];

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE documents SET
         status = ?,
         admin_notes = COALESCE(?, admin_notes)
         WHERE id = ?`,
        [status, adminNotes !== undefined ? adminNotes : null, req.params.id]
      );

      // Notify student
      const [students] = await conn.execute('SELECT user_id FROM students WHERE id = ?', [doc.student_id]);
      if (students.length) {
        await conn.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'document', '/student/documents')`,
          [
            students[0].user_id,
            `Document ${status}: ${doc.document_type}`,
            `Your document has been marked as ${status}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''}`,
          ]
        );
      }
    });

    const [updatedRows] = await pool.execute(`
      SELECT d.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
      FROM documents d
      JOIN students s ON d.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE d.id = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: formatDocument(updatedRows[0]),
    });
  } catch (error) {
    next(error);
  }
};
