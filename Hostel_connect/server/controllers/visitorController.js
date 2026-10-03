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
 * @desc    Get visitor requests (Role-filtered and searchable)
 * @route   GET /api/visitors
 * @access  Private
 */
export const getVisitors = async (req, res, next) => {
  try {
    const { search, status, visitorType, date, overstayOnly } = req.query;
    const isStudent = req.user.role === 'student';
    const loggedInStudentId = isStudent ? await getStudentId(req) : null;

    let baseQuery = `
      SELECT 
        vr.*,
        s.student_id as student_roll,
        u.name as student_name,
        u.phone as student_phone,
        u.email as student_email,
        r.room_number,
        r.floor_number,
        h.name as hostel_name,
        reviewer.name as reviewer_name,
        vl.id as log_id,
        vl.id_proof_type,
        vl.id_proof_reference,
        vl.vehicle_number,
        vl.check_in_time,
        vl.check_out_time,
        vl.remarks as log_remarks,
        TIMESTAMPDIFF(MINUTE, vl.check_in_time, COALESCE(vl.check_out_time, NOW())) as duration_minutes,
        CASE 
          WHEN vr.status = 'Checked In' AND CONCAT(vr.visit_date, ' ', vr.expected_departure) < NOW() THEN 1 
          ELSE 0 
        END as is_overstay
      FROM visitor_requests vr
      JOIN students s ON vr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users reviewer ON vr.reviewed_by = reviewer.id
      LEFT JOIN visitor_logs vl ON vl.visitor_request_id = vr.id
      WHERE 1=1
    `;
    const params = [];

    if (isStudent) {
      if (!loggedInStudentId) {
        return res.json({ success: true, data: { visitors: [], stats: {} } });
      }
      baseQuery += ' AND vr.student_id = ?';
      params.push(loggedInStudentId);
    }

    if (status && status !== 'all') {
      baseQuery += ' AND vr.status = ?';
      params.push(status);
    }

    if (visitorType && visitorType !== 'all') {
      baseQuery += ' AND vr.visitor_type = ?';
      params.push(visitorType);
    }

    if (date) {
      baseQuery += ' AND vr.visit_date = ?';
      params.push(date);
    }

    if (overstayOnly === 'true' || overstayOnly === true) {
      baseQuery += " AND vr.status = 'Checked In' AND CONCAT(vr.visit_date, ' ', vr.expected_departure) < NOW()";
    }

    if (search) {
      baseQuery += ` AND (
        vr.visitor_name LIKE ? OR 
        vr.mobile_number LIKE ? OR 
        vr.relationship LIKE ? OR 
        vr.purpose LIKE ? OR 
        u.name LIKE ? OR 
        s.student_id LIKE ? OR 
        r.room_number LIKE ? OR
        vl.vehicle_number LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term, term, term);
    }

    baseQuery += ' ORDER BY vr.visit_date DESC, vr.expected_arrival DESC';

    const [rows] = await pool.query(baseQuery, params);

    // Compute stats
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN visit_date = CURDATE() THEN 1 ELSE 0 END) as visitorsToday,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedVisitors,
        SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) as currentlyInside,
        SUM(CASE WHEN status = 'Checked Out' THEN 1 ELSE 0 END) as checkedOut,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Checked In' AND CONCAT(visit_date, ' ', expected_departure) < NOW() THEN 1 ELSE 0 END) as overstayCount
      FROM visitor_requests
      WHERE 1=1
    `;
    const statsParams = [];
    if (isStudent && loggedInStudentId) {
      statsQuery += ' AND student_id = ?';
      statsParams.push(loggedInStudentId);
    }

    const [statsRows] = await pool.query(statsQuery, statsParams);
    const stats = statsRows[0] || {};

    return res.json({
      success: true,
      data: {
        visitors: rows,
        stats: {
          total: Number(stats.total || 0),
          visitorsToday: Number(stats.visitorsToday || 0),
          pendingRequests: Number(stats.pendingRequests || 0),
          approvedVisitors: Number(stats.approvedVisitors || 0),
          currentlyInside: Number(stats.currentlyInside || 0),
          checkedOut: Number(stats.checkedOut || 0),
          rejected: Number(stats.rejected || 0),
          overstayCount: Number(stats.overstayCount || 0),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single visitor request
 * @route   GET /api/visitors/:id
 * @access  Private
 */
export const getVisitorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        vr.*,
        s.student_id as student_roll,
        u.name as student_name,
        u.phone as student_phone,
        u.email as student_email,
        r.room_number,
        r.floor_number,
        h.name as hostel_name,
        reviewer.name as reviewer_name,
        vl.id as log_id,
        vl.id_proof_type,
        vl.id_proof_reference,
        vl.vehicle_number,
        vl.check_in_time,
        vl.check_out_time,
        vl.remarks as log_remarks,
        TIMESTAMPDIFF(MINUTE, vl.check_in_time, COALESCE(vl.check_out_time, NOW())) as duration_minutes,
        CASE 
          WHEN vr.status = 'Checked In' AND CONCAT(vr.visit_date, ' ', vr.expected_departure) < NOW() THEN 1 
          ELSE 0 
        END as is_overstay
      FROM visitor_requests vr
      JOIN students s ON vr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users reviewer ON vr.reviewed_by = reviewer.id
      LEFT JOIN visitor_logs vl ON vl.visitor_request_id = vr.id
      WHERE vr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const visitor = rows[0];

    // Security check for student
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req);
      if (visitor.student_id !== studentId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this visitor request' });
      }
    }

    return res.json({ success: true, data: visitor });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new visitor request
 * @route   POST /api/visitors
 * @access  Private
 */
export const createVisitor = async (req, res, next) => {
  try {
    const isStudent = req.user.role === 'student';
    let studentId = req.body.student_id;

    if (isStudent) {
      studentId = await getStudentId(req);
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student profile not linked to user account.' });
      }
    }

    const {
      visitor_name,
      mobile_number,
      relationship,
      visitor_type = 'Parent',
      visit_date,
      expected_arrival,
      expected_departure,
      purpose,
      number_of_visitors = 1,
      remarks,
    } = req.body;

    if (!studentId || !visitor_name || !mobile_number || !relationship || !visit_date || !expected_arrival || !expected_departure || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'All visitor fields (name, mobile, relationship, date, arrival, departure, purpose) are required.',
      });
    }

    // Default status: 'Pending' for student, 'Approved' if Warden/Admin creates it
    const initialStatus = isStudent ? 'Pending' : (req.body.status || 'Approved');
    const reviewerId = isStudent ? null : req.user.id;

    const [insertResult] = await pool.query(
      `INSERT INTO visitor_requests 
       (student_id, visitor_name, mobile_number, relationship, visitor_type, visit_date, expected_arrival, expected_departure, purpose, number_of_visitors, status, reviewed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        visitor_name,
        mobile_number,
        relationship,
        visitor_type,
        visit_date,
        expected_arrival,
        expected_departure,
        purpose,
        number_of_visitors,
        initialStatus,
        reviewerId,
      ]
    );

    const requestId = insertResult.insertId;

    // Notify warden/admin if student filed request
    if (isStudent) {
      const [wardens] = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'warden')");
      for (const w of wardens) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            w.id,
            'New Visitor Request',
            `Student has requested approval for visitor ${visitor_name} on ${visit_date}.`,
            'visitor',
            '/warden/visitors',
            false,
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: isStudent ? 'Visitor request submitted successfully for Warden approval.' : 'Visitor pre-registered and approved.',
      data: { id: requestId },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update visitor request (or cancel by student)
 * @route   PUT /api/visitors/:id
 * @access  Private
 */
export const updateVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM visitor_requests WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const current = rows[0];

    if (req.user.role === 'student') {
      const studentId = await getStudentId(req);
      if (current.student_id !== studentId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      // If student cancels
      if (req.body.status === 'Cancelled') {
        if (current.status !== 'Pending' && current.status !== 'Approved') {
          return res.status(400).json({ success: false, message: 'Cannot cancel an ongoing or completed visit.' });
        }
        await pool.query("UPDATE visitor_requests SET status = 'Cancelled' WHERE id = ?", [id]);
        return res.json({ success: true, message: 'Visitor request cancelled.' });
      }
    }

    // Admin/Warden update
    const {
      visitor_name,
      mobile_number,
      relationship,
      visitor_type,
      visit_date,
      expected_arrival,
      expected_departure,
      purpose,
      number_of_visitors,
      status,
      rejection_reason,
    } = req.body;

    const updates = [];
    const params = [];

    if (visitor_name !== undefined) { updates.push('visitor_name = ?'); params.push(visitor_name); }
    if (mobile_number !== undefined) { updates.push('mobile_number = ?'); params.push(mobile_number); }
    if (relationship !== undefined) { updates.push('relationship = ?'); params.push(relationship); }
    if (visitor_type !== undefined) { updates.push('visitor_type = ?'); params.push(visitor_type); }
    if (visit_date !== undefined) { updates.push('visit_date = ?'); params.push(visit_date); }
    if (expected_arrival !== undefined) { updates.push('expected_arrival = ?'); params.push(expected_arrival); }
    if (expected_departure !== undefined) { updates.push('expected_departure = ?'); params.push(expected_departure); }
    if (purpose !== undefined) { updates.push('purpose = ?'); params.push(purpose); }
    if (number_of_visitors !== undefined) { updates.push('number_of_visitors = ?'); params.push(number_of_visitors); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (rejection_reason !== undefined) { updates.push('rejection_reason = ?'); params.push(rejection_reason); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE visitor_requests SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return res.json({ success: true, message: 'Visitor request updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve visitor request (Warden/Admin)
 * @route   PUT /api/visitors/:id/approve
 * @access  Private (Warden/Admin)
 */
export const approveVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT vr.*, s.user_id 
       FROM visitor_requests vr 
       JOIN students s ON vr.student_id = s.id 
       WHERE vr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const visitor = rows[0];

    await pool.query(
      "UPDATE visitor_requests SET status = 'Approved', reviewed_by = ? WHERE id = ?",
      [req.user.id, id]
    );

    // Notify student
    const notifMsg = `🚪 Your visitor request for ${visitor.visitor_name} on ${visitor.visit_date} has been approved.`;
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
      [visitor.user_id, 'Visitor Request Approved', notifMsg, 'visitor', '/student/visitors', false]
    );

    return res.json({ success: true, message: `Visitor request for ${visitor.visitor_name} approved.` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject visitor request (Warden/Admin)
 * @route   PUT /api/visitors/:id/reject
 * @access  Private (Warden/Admin)
 */
export const rejectVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for rejection.' });
    }

    const [rows] = await pool.query(
      `SELECT vr.*, s.user_id 
       FROM visitor_requests vr 
       JOIN students s ON vr.student_id = s.id 
       WHERE vr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const visitor = rows[0];

    await pool.query(
      "UPDATE visitor_requests SET status = 'Rejected', rejection_reason = ?, reviewed_by = ? WHERE id = ?",
      [rejection_reason, req.user.id, id]
    );

    // Notify student
    const notifMsg = `❌ Your visitor request for ${visitor.visitor_name} was rejected. Reason: ${rejection_reason}`;
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
      [visitor.user_id, 'Visitor Request Rejected', notifMsg, 'visitor', '/student/visitors', false]
    );

    return res.json({ success: true, message: `Visitor request for ${visitor.visitor_name} rejected.` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check-in visitor at hostel gate/reception (Warden/Admin)
 * @route   PUT /api/visitors/:id/checkin
 * @access  Private (Warden/Admin)
 */
export const checkInVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      id_proof_type = 'Aadhaar Card',
      id_proof_reference,
      vehicle_number,
      check_in_time,
      remarks,
    } = req.body;

    const [rows] = await pool.query(
      `SELECT vr.*, s.user_id 
       FROM visitor_requests vr 
       JOIN students s ON vr.student_id = s.id 
       WHERE vr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const visitor = rows[0];
    const checkInTimestamp = check_in_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update visitor_requests status
    await pool.query("UPDATE visitor_requests SET status = 'Checked In' WHERE id = ?", [id]);

    // Check if log already exists for this request
    const [existingLogs] = await pool.query('SELECT id FROM visitor_logs WHERE visitor_request_id = ?', [id]);

    if (existingLogs.length > 0) {
      await pool.query(
        `UPDATE visitor_logs 
         SET id_proof_type = ?, id_proof_reference = ?, vehicle_number = ?, check_in_time = ?, check_out_time = NULL, verified_by = ?, remarks = ?
         WHERE id = ?`,
        [id_proof_type, id_proof_reference || null, vehicle_number || null, checkInTimestamp, req.user.id, remarks || null, existingLogs[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO visitor_logs 
         (visitor_request_id, id_proof_type, id_proof_reference, vehicle_number, check_in_time, verified_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, id_proof_type, id_proof_reference || null, vehicle_number || null, checkInTimestamp, req.user.id, remarks || null]
      );
    }

    // Notify student
    const notifMsg = `🟢 Your visitor ${visitor.visitor_name} has arrived and checked in at the hostel reception.`;
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
      [visitor.user_id, 'Visitor Checked In', notifMsg, 'visitor', '/student/visitors', false]
    );

    return res.json({
      success: true,
      message: `Visitor ${visitor.visitor_name} checked in successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check-out visitor (Warden/Admin)
 * @route   PUT /api/visitors/:id/checkout
 * @access  Private (Warden/Admin)
 */
export const checkOutVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT vr.*, vl.id as log_id, vl.check_in_time 
       FROM visitor_requests vr 
       LEFT JOIN visitor_logs vl ON vl.visitor_request_id = vr.id 
       WHERE vr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }

    const visitor = rows[0];

    // Update status to Checked Out
    await pool.query("UPDATE visitor_requests SET status = 'Checked Out' WHERE id = ?", [id]);

    if (visitor.log_id) {
      await pool.query(
        'UPDATE visitor_logs SET check_out_time = NOW(), verified_by = COALESCE(verified_by, ?) WHERE id = ?',
        [req.user.id, visitor.log_id]
      );
    }

    return res.json({
      success: true,
      message: `Visitor ${visitor.visitor_name} marked as Checked Out.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete visitor request (Admin only)
 * @route   DELETE /api/visitors/:id
 * @access  Private (Admin)
 */
export const deleteVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM visitor_requests WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Visitor request not found' });
    }
    return res.json({ success: true, message: 'Visitor request deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get currently inside visitors with overstay flags
 * @route   GET /api/visitors/currently-inside
 * @access  Private (Warden/Admin)
 */
export const getCurrentlyInside = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        vr.*,
        u.name as student_name,
        s.student_id as student_roll,
        r.room_number,
        h.name as hostel_name,
        vl.id_proof_type,
        vl.id_proof_reference,
        vl.vehicle_number,
        vl.check_in_time,
        TIMESTAMPDIFF(MINUTE, vl.check_in_time, NOW()) as elapsed_minutes,
        CASE 
          WHEN CONCAT(vr.visit_date, ' ', vr.expected_departure) < NOW() THEN 1 
          ELSE 0 
        END as is_overstay,
        TIMESTAMPDIFF(MINUTE, CONCAT(vr.visit_date, ' ', vr.expected_departure), NOW()) as overstay_minutes
      FROM visitor_requests vr
      JOIN students s ON vr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      JOIN visitor_logs vl ON vl.visitor_request_id = vr.id
      WHERE vr.status = 'Checked In' AND vl.check_out_time IS NULL
      ORDER BY is_overstay DESC, vl.check_in_time ASC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get visitor history
 * @route   GET /api/visitors/history
 * @access  Private (Warden/Admin)
 */
export const getVisitorHistory = async (req, res, next) => {
  return getVisitors(req, res, next);
};

/**
 * @desc    Get Visitor Analytics & Statistics
 * @route   GET /api/visitors/analytics
 * @access  Private (Warden/Admin)
 */
export const getVisitorAnalytics = async (req, res, next) => {
  try {
    // 1. Overall counts
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN visit_date = CURDATE() THEN 1 ELSE 0 END) as todayVisitors,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedCount,
        SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) as currentlyInside,
        SUM(CASE WHEN status = 'Checked Out' THEN 1 ELSE 0 END) as completedVisits,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount,
        SUM(CASE WHEN status = 'Checked In' AND CONCAT(visit_date, ' ', expected_departure) < NOW() THEN 1 ELSE 0 END) as overstayAlerts
      FROM visitor_requests
    `);

    // 2. Daily visitor trend (past 7 days)
    const [dailyTrend] = await pool.query(`
      SELECT 
        visit_date as date,
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('Checked In', 'Checked Out') THEN 1 ELSE 0 END) as actualVisits
      FROM visitor_requests
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY visit_date
      ORDER BY visit_date ASC
    `);

    // 3. Visitor type distribution
    const [typeDistribution] = await pool.query(`
      SELECT visitor_type, COUNT(*) as count 
      FROM visitor_requests 
      GROUP BY visitor_type 
      ORDER BY count DESC
    `);

    // 4. Status breakdown
    const [statusBreakdown] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM visitor_requests 
      GROUP BY status
    `);

    // 5. Average visit duration (in minutes) for completed visits
    const [avgDuration] = await pool.query(`
      SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time))) as avgMinutes
      FROM visitor_logs 
      WHERE check_out_time IS NOT NULL
    `);

    // 6. Peak visiting hours
    const [peakHours] = await pool.query(`
      SELECT HOUR(expected_arrival) as hour, COUNT(*) as count
      FROM visitor_requests
      GROUP BY HOUR(expected_arrival)
      ORDER BY HOUR(expected_arrival) ASC
    `);

    return res.json({
      success: true,
      data: {
        summary: counts[0] || {},
        dailyTrend,
        typeDistribution,
        statusBreakdown,
        avgDurationMinutes: Number(avgDuration[0]?.avgMinutes || 75),
        peakHours,
      },
    });
  } catch (err) {
    next(err);
  }
};
