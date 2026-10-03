import pool from '../config/database.js';
import { formatFee, withTransaction } from '../utils/mysqlHelper.js';

// @desc    Get all fees with filters
// @route   GET /api/fees
// @access  Private
export const getFees = async (req, res, next) => {
  try {
    const { paymentStatus, feeType, studentId } = req.query;

    // Check overdue dates automatically for pending fees
    await pool.execute(
      "UPDATE fees SET payment_status = 'Overdue' WHERE payment_status = 'Pending' AND due_date < CURDATE()"
    );

    let sql = `
      SELECT f.*,
             s.student_id AS student_roll, s.course, s.department,
             u.id AS user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
             h.name AS hostel_name, r.room_number
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (paymentStatus) {
      sql += ' AND f.payment_status = ?';
      params.push(paymentStatus);
    }
    if (feeType) {
      sql += ' AND f.fee_type = ?';
      params.push(feeType);
    }
    if (studentId) {
      sql += ' AND f.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY f.id DESC';

    const [rows] = await pool.execute(sql, params);
    const fees = rows.map(formatFee);

    // Financial summaries
    const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
    const totalCollected = fees
      .filter((f) => f.paymentStatus === 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees
      .filter((f) => f.paymentStatus === 'Pending' || f.paymentStatus === 'Overdue')
      .reduce((acc, f) => acc + f.amount, 0);
    const overdueCount = fees.filter((f) => f.paymentStatus === 'Overdue').length;

    res.status(200).json({
      success: true,
      count: fees.length,
      summary: {
        totalBilled,
        totalCollected,
        totalPending,
        overdueCount,
      },
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee records for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Private
export const getStudentFees = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.student_id = ?
      ORDER BY f.due_date ASC
    `, [req.params.studentId]);

    const fees = rows.map(formatFee);
    const totalPaid = fees
      .filter((f) => f.paymentStatus === 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees
      .filter((f) => f.paymentStatus !== 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);

    res.status(200).json({
      success: true,
      summary: { totalPaid, totalPending },
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee invoice for student or all students
// @route   POST /api/fees
// @access  Private (Admin)
export const createFee = async (req, res, next) => {
  try {
    const { studentId, feeType, amount, dueDate, remarks, academicSemester, targetAll } = req.body;

    if (targetAll) {
      const [students] = await pool.execute("SELECT id, user_id FROM students WHERE status = 'Active'");
      let createdCount = 0;

      await withTransaction(async (conn) => {
        for (const st of students) {
          const invNum = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          await conn.execute(
            `INSERT INTO fees (student_id, fee_type, amount, due_date, payment_status, invoice_number, academic_semester)
             VALUES (?, ?, ?, ?, 'Pending', ?, ?)`,
            [
              st.id,
              feeType,
              Number(amount),
              dueDate,
              invNum,
              academicSemester || 'Fall 2026',
            ]
          );

          await conn.execute(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES (?, ?, ?, 'fee', '/student/fees')`,
            [st.user_id, `New Fee Invoice: ${feeType}`, `An invoice of ₹${amount} for ${feeType} is generated. Due date: ${dueDate}.`]
          );
          createdCount++;
        }
      });

      return res.status(201).json({
        success: true,
        message: `Invoices generated for ${createdCount} students.`,
        count: createdCount,
      });
    }

    const [students] = await pool.execute('SELECT id, user_id FROM students WHERE id = ?', [studentId]);
    if (!students.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const feeId = await withTransaction(async (conn) => {
      const [insertRes] = await conn.execute(
        `INSERT INTO fees (student_id, fee_type, amount, due_date, payment_status, invoice_number, academic_semester)
         VALUES (?, ?, ?, ?, 'Pending', ?, ?)`,
        [
          studentId,
          feeType,
          Number(amount),
          dueDate,
          invoiceNumber,
          academicSemester || 'Fall 2026',
        ]
      );

      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'fee', '/student/fees')`,
        [students[0].user_id, `Fee Due: ${feeType}`, `An invoice of ₹${amount} has been billed to your account. Due: ${dueDate}.`]
      );

      return insertRes.insertId;
    });

    const [createdRows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.id = ?
    `, [feeId]);

    res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully',
      data: formatFee(createdRows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee record or record student payment
// @route   PUT /api/fees/:id
// @access  Private
export const updateFee = async (req, res, next) => {
  try {
    const [fees] = await pool.execute('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    if (!fees.length) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    const currentFee = fees[0];

    const { paymentStatus, paymentMethod, transactionId, amount, dueDate } = req.body;

    await withTransaction(async (conn) => {
      if (paymentStatus === 'Paid') {
        const txnId = transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pMethod = paymentMethod || 'Online / UPI';

        await conn.execute(
          `UPDATE fees SET
           payment_status = 'Paid',
           payment_date = CURDATE(),
           payment_method = ?,
           transaction_id = ?
           WHERE id = ?`,
          [pMethod, txnId, req.params.id]
        );

        // Notify student
        const [students] = await conn.execute('SELECT user_id FROM students WHERE id = ?', [currentFee.student_id]);
        if (students.length) {
          await conn.execute(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES (?, 'Payment Successful', ?, 'fee', '/student/fees')`,
            [students[0].user_id, `Payment of ₹${currentFee.amount} for ${currentFee.fee_type} confirmed. Transaction ID: ${txnId}`]
          );
        }
      } else {
        await conn.execute(
          `UPDATE fees SET
           payment_status = COALESCE(?, payment_status),
           amount = COALESCE(?, amount),
           due_date = COALESCE(?, due_date)
           WHERE id = ?`,
          [
            paymentStatus || null,
            amount ? Number(amount) : null,
            dueDate || null,
            req.params.id,
          ]
        );
      }
    });

    const [updatedRows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.id = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: formatFee(updatedRows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed receipt data for printing/downloading
// @route   GET /api/fees/:id/receipt
// @access  Private
export const getReceipt = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll, s.course, s.department,
             u.id AS user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
             h.name AS hostel_name, h.location AS hostel_location,
             r.room_number
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    res.status(200).json({
      success: true,
      data: formatFee(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};
