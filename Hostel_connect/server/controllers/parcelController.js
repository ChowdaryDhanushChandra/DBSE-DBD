import pool from '../config/database.js';

/**
 * Helper to get student ID for a logged-in student user
 */
const getStudentId = async (req) => {
  if (req.student?.id) return req.student.id;
  if (req.user?.role === 'student') {
    const [rows] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (rows.length) return rows[0].id;
  }
  return null;
};

/**
 * @desc    Get all parcels (Role-filtered and searchable)
 * @route   GET /api/parcels
 * @access  Private
 */
export const getParcels = async (req, res, next) => {
  try {
    const { search, status, courier, date, studentId } = req.query;
    const isStudent = req.user.role === 'student';
    const loggedInStudentId = isStudent ? await getStudentId(req) : null;

    let baseQuery = `
      SELECT 
        p.*,
        s.student_id as student_roll,
        u.name as student_name,
        u.phone as student_phone,
        u.email as student_email,
        r.room_number,
        r.floor_number,
        h.name as hostel_name,
        v.name as verified_by_name
      FROM parcel_deliveries p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users v ON p.verified_by = v.id
      WHERE 1=1
    `;
    const params = [];

    // Security: Student only sees their own parcels
    if (isStudent) {
      if (!loggedInStudentId) {
        return res.json({ success: true, data: { parcels: [], stats: {} } });
      }
      baseQuery += ' AND p.student_id = ?';
      params.push(loggedInStudentId);
    } else if (studentId) {
      baseQuery += ' AND p.student_id = ?';
      params.push(studentId);
    }

    if (status && status !== 'all') {
      baseQuery += ' AND p.status = ?';
      params.push(status);
    }

    if (courier && courier !== 'all') {
      baseQuery += ' AND p.courier_name = ?';
      params.push(courier);
    }

    if (date) {
      baseQuery += ' AND DATE(p.received_at) = ?';
      params.push(date);
    }

    if (search) {
      baseQuery += ` AND (
        p.parcel_code LIKE ? OR 
        p.tracking_number LIKE ? OR 
        p.sender_name LIKE ? OR 
        p.courier_name LIKE ? OR 
        p.storage_location LIKE ? OR 
        u.name LIKE ? OR 
        s.student_id LIKE ? OR 
        r.room_number LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term, term, term);
    }

    baseQuery += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(baseQuery, params);

    // Compute stats
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection', 'Expected', 'In Transit') THEN 1 ELSE 0 END) as pendingCollection,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected,
        SUM(CASE WHEN status = 'Returned' THEN 1 ELSE 0 END) as returned,
        SUM(CASE WHEN DATE(received_at) = CURDATE() THEN 1 ELSE 0 END) as todayDeliveries
      FROM parcel_deliveries
      WHERE 1=1
    `;
    const statsParams = [];
    if (isStudent && loggedInStudentId) {
      statsQuery += ' AND student_id = ?';
      statsParams.push(loggedInStudentId);
    } else if (studentId) {
      statsQuery += ' AND student_id = ?';
      statsParams.push(studentId);
    }

    const [statsRows] = await pool.query(statsQuery, statsParams);
    const stats = statsRows[0] || {};

    return res.json({
      success: true,
      data: {
        parcels: rows,
        stats: {
          total: Number(stats.total || 0),
          pendingCollection: Number(stats.pendingCollection || 0),
          collected: Number(stats.collected || 0),
          returned: Number(stats.returned || 0),
          todayDeliveries: Number(stats.todayDeliveries || 0),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single parcel details
 * @route   GET /api/parcels/:id
 * @access  Private
 */
export const getParcelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        p.*,
        s.student_id as student_roll,
        u.name as student_name,
        u.phone as student_phone,
        u.email as student_email,
        r.room_number,
        r.floor_number,
        h.name as hostel_name,
        v.name as verified_by_name
      FROM parcel_deliveries p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users v ON p.verified_by = v.id
      WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    const parcel = rows[0];

    // Security check for student
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req);
      if (parcel.student_id !== studentId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this parcel' });
      }
    }

    // Get parcel notifications
    const [notifications] = await pool.query(
      'SELECT * FROM parcel_notifications WHERE parcel_id = ? ORDER BY created_at DESC',
      [id]
    );

    return res.json({
      success: true,
      data: {
        ...parcel,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register a new parcel (Warden/Admin)
 * @route   POST /api/parcels
 * @access  Private (Warden/Admin)
 */
export const createParcel = async (req, res, next) => {
  try {
    const {
      student_id,
      courier_name,
      tracking_number,
      parcel_type = 'Standard Box',
      sender_name,
      expected_date,
      received_at,
      storage_location = 'Hostel Reception / Desk',
      status = 'Received at Hostel',
      remarks,
    } = req.body;

    if (!student_id || !courier_name) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Courier Name are required.',
      });
    }

    // Verify student exists and fetch user_id for notification
    const [studentRows] = await pool.query(
      `SELECT s.id, s.user_id, s.student_id as roll_no, u.name, r.room_number 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN rooms r ON s.room_id = r.id
       WHERE s.id = ?`,
      [student_id]
    );

    if (!studentRows.length) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const student = studentRows[0];

    // Auto-generate parcel code: PRC-YEAR-XXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const parcelCode = req.body.parcel_code || `PRC-${year}-${randomSuffix}`;

    const receivedTime = received_at || new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [insertResult] = await pool.query(
      `INSERT INTO parcel_deliveries 
       (student_id, parcel_code, courier_name, tracking_number, parcel_type, sender_name, expected_date, received_at, storage_location, status, verified_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        parcelCode,
        courier_name,
        tracking_number || null,
        parcel_type,
        sender_name || 'Courier Shipper',
        expected_date || null,
        receivedTime,
        storage_location,
        status,
        req.user.id,
        remarks || null,
      ]
    );

    const parcelId = insertResult.insertId;

    // Automatically trigger notification for student
    const notifMsg = `Your parcel (${parcelCode}) from ${courier_name} has arrived at ${storage_location}. Please collect it from the hostel office.`;

    await pool.query(
      `INSERT INTO parcel_notifications (parcel_id, student_id, notification_message, is_read) VALUES (?, ?, ?, ?)`,
      [parcelId, student_id, notifMsg, false]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
      [student.user_id, '📦 Parcel Arrived', notifMsg, 'parcel', '/student/parcels', false]
    );

    return res.status(201).json({
      success: true,
      message: 'Parcel registered successfully and student notified.',
      data: { id: parcelId, parcel_code: parcelCode },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update parcel details (Warden/Admin)
 * @route   PUT /api/parcels/:id
 * @access  Private (Warden/Admin)
 */
export const updateParcel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      courier_name,
      tracking_number,
      parcel_type,
      sender_name,
      expected_date,
      received_at,
      storage_location,
      status,
      remarks,
    } = req.body;

    const [exists] = await pool.query('SELECT * FROM parcel_deliveries WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    const current = exists[0];

    // Build update dynamic query
    const updates = [];
    const params = [];

    if (courier_name !== undefined) { updates.push('courier_name = ?'); params.push(courier_name); }
    if (tracking_number !== undefined) { updates.push('tracking_number = ?'); params.push(tracking_number); }
    if (parcel_type !== undefined) { updates.push('parcel_type = ?'); params.push(parcel_type); }
    if (sender_name !== undefined) { updates.push('sender_name = ?'); params.push(sender_name); }
    if (expected_date !== undefined) { updates.push('expected_date = ?'); params.push(expected_date || null); }
    if (received_at !== undefined) { updates.push('received_at = ?'); params.push(received_at); }
    if (storage_location !== undefined) { updates.push('storage_location = ?'); params.push(storage_location); }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'Collected' && !current.collected_at) {
        updates.push('collected_at = NOW()');
        updates.push('collected_by = ?');
        params.push(req.body.collected_by || 'Resident');
        updates.push('verified_by = ?');
        params.push(req.user.id);
      }
    }
    if (remarks !== undefined) { updates.push('remarks = ?'); params.push(remarks); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE parcel_deliveries SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return res.json({ success: true, message: 'Parcel updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark parcel as collected (Student or Warden/Admin)
 * @route   PUT /api/parcels/:id/collect
 * @access  Private
 */
export const collectParcel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, s.user_id, u.name as student_name 
       FROM parcel_deliveries p 
       JOIN students s ON p.student_id = s.id 
       JOIN users u ON s.user_id = u.id 
       WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    const parcel = rows[0];

    // If student, ensure they own the parcel
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req);
      if (parcel.student_id !== studentId) {
        return res.status(403).json({ success: false, message: 'You can only collect your own parcels.' });
      }
    }

    const collector = req.body.collected_by || req.user.name || parcel.student_name;
    const verifiedBy = req.user.role !== 'student' ? req.user.id : (parcel.verified_by || null);

    await pool.query(
      `UPDATE parcel_deliveries 
       SET status = 'Collected', collected_at = NOW(), collected_by = ?, verified_by = COALESCE(?, verified_by)
       WHERE id = ?`,
      [collector, verifiedBy, id]
    );

    return res.json({
      success: true,
      message: `Parcel ${parcel.parcel_code} marked as Collected by ${collector}.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete parcel (Admin only)
 * @route   DELETE /api/parcels/:id
 * @access  Private (Admin)
 */
export const deleteParcel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM parcel_deliveries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    return res.json({ success: true, message: 'Parcel deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get parcels for a specific student
 * @route   GET /api/parcels/student/:studentId
 * @access  Private
 */
export const getStudentParcels = async (req, res, next) => {
  req.query.studentId = req.params.studentId;
  return getParcels(req, res, next);
};

/**
 * @desc    Get Parcel Analytics & Reports
 * @route   GET /api/parcels/reports
 * @access  Private (Warden/Admin)
 */
export const getParcelReports = async (req, res, next) => {
  try {
    // 1. Overall counts
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(received_at) = CURDATE() THEN 1 ELSE 0 END) as todayTotal,
        SUM(CASE WHEN status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection', 'Expected', 'In Transit') THEN 1 ELSE 0 END) as pendingCollection,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected,
        SUM(CASE WHEN status = 'Returned' THEN 1 ELSE 0 END) as returned
      FROM parcel_deliveries
    `);

    // 2. 7-Day Trend
    const [dailyTrend] = await pool.query(`
      SELECT 
        DATE(received_at) as date,
        COUNT(*) as received,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected
      FROM parcel_deliveries
      WHERE received_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(received_at)
      ORDER BY DATE(received_at) ASC
    `);

    // 3. Courier-wise distribution
    const [couriers] = await pool.query(`
      SELECT courier_name, COUNT(*) as count 
      FROM parcel_deliveries 
      GROUP BY courier_name 
      ORDER BY count DESC
    `);

    // 4. Monthly trends (past 6 months)
    const [monthlyTrend] = await pool.query(`
      SELECT 
        DATE_FORMAT(received_at, '%b %Y') as month,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected
      FROM parcel_deliveries
      WHERE received_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(received_at, '%b %Y'), YEAR(received_at), MONTH(received_at)
      ORDER BY YEAR(received_at) ASC, MONTH(received_at) ASC
    `);

    // 5. Longest pending collection (exceeding 48 hours)
    const [overduePickups] = await pool.query(`
      SELECT 
        p.*, u.name as student_name, s.student_id as student_roll, r.room_number,
        TIMESTAMPDIFF(HOUR, p.received_at, NOW()) as hours_pending
      FROM parcel_deliveries p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE p.status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection')
      ORDER BY p.received_at ASC
      LIMIT 10
    `);

    return res.json({
      success: true,
      data: {
        summary: counts[0] || {},
        dailyTrend,
        couriers,
        monthlyTrend,
        overduePickups,
      },
    });
  } catch (err) {
    next(err);
  }
};
