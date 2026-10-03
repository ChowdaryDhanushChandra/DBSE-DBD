import pool from '../config/database.js';
import {
  formatStudent,
  formatRoom,
  formatFee,
  formatComplaint,
  formatMessMenu,
  formatAnnouncement,
  formatHostel,
  formatMealAttendance,
} from '../utils/mysqlHelper.js';

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts
    const [stCount] = await pool.execute("SELECT COUNT(*) as count FROM students WHERE status = 'Active'");
    const totalStudents = Number(stCount[0]?.count || 0);

    const [hCount] = await pool.execute('SELECT COUNT(*) as count FROM hostels');
    const totalHostels = Number(hCount[0]?.count || 0);

    const [rooms] = await pool.execute('SELECT * FROM rooms');
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.current_occupancy > 0).length;
    const fullyOccupiedRooms = rooms.filter((r) => r.status === 'Fully Occupied').length;
    const availableRooms = rooms.filter((r) => r.status === 'Available').length;
    const partiallyOccupiedRooms = rooms.filter((r) => r.status === 'Partially Occupied').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

    const totalCapacity = rooms.reduce((acc, r) => acc + Number(r.capacity || 0), 0);
    const currentOccupiedBeds = rooms.reduce((acc, r) => acc + Number(r.current_occupancy || 0), 0);
    const availableBeds = Math.max(0, totalCapacity - currentOccupiedBeds);

    const [cPending] = await pool.execute(
      "SELECT COUNT(*) as count FROM complaints WHERE status IN ('Submitted', 'In Review', 'In Progress', 'Assigned')"
    );
    const pendingComplaints = Number(cPending[0]?.count || 0);

    const [cResolved] = await pool.execute(
      "SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'"
    );
    const resolvedComplaints = Number(cResolved[0]?.count || 0);

    // Fees calculation
    const [fees] = await pool.execute('SELECT * FROM fees');
    const totalPayments = fees
      .filter((f) => f.payment_status === 'Paid')
      .reduce((acc, f) => acc + Number(f.amount || 0), 0);
    const pendingPayments = fees
      .filter((f) => f.payment_status === 'Pending' || f.payment_status === 'Overdue')
      .reduce((acc, f) => acc + Number(f.amount || 0), 0);

    // Mess attendance today
    const [mToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM meal_attendance WHERE attendance_date = ? AND status = 'Present'",
      [today]
    );
    const messAttendanceToday = Number(mToday[0]?.count || 0);

    // Charts
    const roomOccupancyChart = [
      { name: 'Available', value: availableRooms, color: '#00E5FF' },
      { name: 'Partially Occupied', value: partiallyOccupiedRooms, color: '#7B61FF' },
      { name: 'Fully Occupied', value: fullyOccupiedRooms, color: '#FF4D9D' },
      { name: 'Maintenance', value: maintenanceRooms, color: '#6B7280' },
    ];

    const [statusCounts] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    );
    const complaintStatusChart = statusCounts.map((c) => ({
      status: c.status,
      count: Number(c.count),
    }));

    const monthlyFeeChart = [
      { month: 'Jan', collected: 240000, pending: 45000 },
      { month: 'Feb', collected: 320000, pending: 60000 },
      { month: 'Mar', collected: 280000, pending: 35000 },
      { month: 'Apr', collected: 390000, pending: 50000 },
      { month: 'May', collected: 450000, pending: 25000 },
      { month: 'Jun', collected: totalPayments > 0 ? totalPayments : 510000, pending: pendingPayments },
    ];

    const studentRegistrationTrends = [
      { month: 'Jan', students: 12 },
      { month: 'Feb', students: 24 },
      { month: 'Mar', students: 18 },
      { month: 'Apr', students: 35 },
      { month: 'May', students: 42 },
      { month: 'Jun', students: totalStudents || 60 },
    ];

    // Recent 5 complaints
    const [cRows] = await pool.execute(`
      SELECT c.*,
             s.student_id AS roll_no,
             u.id AS user_id, u.name AS student_name,
             h.name AS hostel_name
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);
    const recentComplaints = cRows.map((r) => formatComplaint(r, []));

    // Recent 5 fees
    const [fRows] = await pool.execute(`
      SELECT f.*,
             s.student_id AS student_roll,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT 5
    `);
    const recentFees = fRows.map(formatFee);

    // Hostel Quality Score (40% Mess + 40% Cleanliness + 20% Resolution)
    const [qMess] = await pool.execute(
      "SELECT AVG(overall_rating) as avg_rating FROM mess_feedback WHERE meal_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );
    const messRating = parseFloat((Number(qMess[0]?.avg_rating) || 4.18).toFixed(2));

    const [qClean] = await pool.execute(
      "SELECT AVG(score) as avg_score FROM cleanliness_inspections WHERE inspection_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)"
    );
    const cleanlinessRating = parseFloat((Number(qClean[0]?.avg_score) || 4.24).toFixed(2));

    const [qComp] = await pool.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('Resolved', 'Student Confirmation') THEN 1 ELSE 0 END) as resolved FROM hygiene_complaints WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
    );
    const resCount = qComp[0]?.resolved || 0;
    const totCount = qComp[0]?.total || 0;
    const resolutionRating = totCount > 0 ? parseFloat(((resCount / totCount) * 5.0).toFixed(2)) : 4.45;

    const hostelQualityScore = parseFloat((0.40 * messRating + 0.40 * cleanlinessRating + 0.20 * resolutionRating).toFixed(2));
    const qualityDiff = parseFloat((hostelQualityScore - 4.15).toFixed(2));
    const qualityTrend = qualityDiff > 0.05 ? 'Improving' : qualityDiff < -0.05 ? 'Needs Attention' : 'Stable';

    // Parcels & Visitors stats for Admin
    const [pAdmin] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(received_at) = CURDATE() THEN 1 ELSE 0 END) as todayDeliveries,
        SUM(CASE WHEN status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection') THEN 1 ELSE 0 END) as pendingCollection,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected
      FROM parcel_deliveries
    `);
    const [vAdmin] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN visit_date = CURDATE() THEN 1 ELSE 0 END) as todayVisitors,
        SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) as currentlyInside,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'Checked In' AND CONCAT(visit_date, ' ', expected_departure) < NOW() THEN 1 ELSE 0 END) as overstayAlerts
      FROM visitor_requests
    `);

    res.status(200).json({
      success: true,
      data: {
        qualityScore: {
          score: hostelQualityScore,
          messRating,
          cleanlinessRating,
          resolutionRating,
          trend: qualityTrend,
          diff: qualityDiff >= 0 ? `+${qualityDiff}` : `${qualityDiff}`,
        },
        cards: {
          totalStudents,
          totalHostels,
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalCapacity,
          currentOccupiedBeds,
          availableBeds,
          pendingComplaints,
          resolvedComplaints,
          totalPayments,
          pendingPayments,
          messAttendanceToday,
        },
        parcelStats: {
          total: Number(pAdmin[0]?.total || 0),
          todayDeliveries: Number(pAdmin[0]?.todayDeliveries || 0),
          pendingCollection: Number(pAdmin[0]?.pendingCollection || 0),
          collected: Number(pAdmin[0]?.collected || 0),
        },
        visitorStats: {
          total: Number(vAdmin[0]?.total || 0),
          todayVisitors: Number(vAdmin[0]?.todayVisitors || 0),
          currentlyInside: Number(vAdmin[0]?.currentlyInside || 0),
          pendingRequests: Number(vAdmin[0]?.pendingRequests || 0),
          overstayAlerts: Number(vAdmin[0]?.overstayAlerts || 0),
        },
        charts: {
          roomOccupancy: roomOccupancyChart,
          complaintStatus: complaintStatusChart,
          monthlyFees: monthlyFeeChart,
          studentTrends: studentRegistrationTrends,
        },
        recentComplaints,
        recentFees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Warden Dashboard
// @route   GET /api/dashboard/warden
// @access  Private (Warden / Staff / Admin)
export const getWardenDashboard = async (req, res, next) => {
  try {
    let [hostelRows] = await pool.execute('SELECT * FROM hostels WHERE warden_id = ?', [req.user.id]);
    if (!hostelRows.length) {
      [hostelRows] = await pool.execute('SELECT * FROM hostels ORDER BY id ASC LIMIT 1');
    }

    const hostel = hostelRows.length ? formatHostel(hostelRows[0]) : null;
    const hostelId = hostel ? hostel.id : null;
    const today = new Date().toISOString().split('T')[0];

    let studentsCount = 0;
    let rooms = [];
    let availableRooms = 0;
    let occupiedRooms = 0;
    let maintenanceRooms = 0;
    let openComplaints = 0;
    let maintenanceComplaints = 0;

    if (hostelId) {
      const [st] = await pool.execute(
        "SELECT COUNT(*) as count FROM students WHERE hostel_id = ? AND status = 'Active'",
        [hostelId]
      );
      studentsCount = Number(st[0]?.count || 0);

      const [rRows] = await pool.execute('SELECT * FROM rooms WHERE hostel_id = ?', [hostelId]);
      rooms = rRows.map(formatRoom);
      availableRooms = rooms.filter((r) => r.status === 'Available' || r.status === 'Partially Occupied').length;
      occupiedRooms = rooms.filter((r) => r.currentOccupancy > 0).length;
      maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

      const [cOpen] = await pool.execute(`
        SELECT COUNT(*) as count FROM complaints c
        JOIN students s ON c.student_id = s.id
        WHERE s.hostel_id = ? AND c.status IN ('Submitted', 'In Review', 'In Progress', 'Assigned')
      `, [hostelId]);
      openComplaints = Number(cOpen[0]?.count || 0);

      const [cMaint] = await pool.execute(`
        SELECT COUNT(*) as count FROM complaints c
        JOIN students s ON c.student_id = s.id
        WHERE s.hostel_id = ? AND c.category IN ('Maintenance', 'Electricity', 'Water') AND c.status IN ('Submitted', 'In Progress')
      `, [hostelId]);
      maintenanceComplaints = Number(cMaint[0]?.count || 0);
    }

    const [mToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM meal_attendance WHERE attendance_date = ? AND status = 'Present'",
      [today]
    );
    const messMealsToday = Number(mToday[0]?.count || 0);

    let recentComplaints = [];
    if (hostelId) {
      const [cList] = await pool.execute(`
        SELECT c.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
        FROM complaints c
        JOIN students s ON c.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE s.hostel_id = ?
        ORDER BY c.created_at DESC
        LIMIT 5
      `, [hostelId]);
      recentComplaints = cList.map((r) => formatComplaint(r, []));
    }

    // Hostel Quality Score (40% Mess + 40% Cleanliness + 20% Resolution)
    const [qMess] = await pool.execute(
      "SELECT AVG(overall_rating) as avg_rating FROM mess_feedback WHERE meal_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );
    const messRating = parseFloat((Number(qMess[0]?.avg_rating) || 4.18).toFixed(2));

    const [qClean] = await pool.execute(
      "SELECT AVG(score) as avg_score FROM cleanliness_inspections WHERE inspection_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)"
    );
    const cleanlinessRating = parseFloat((Number(qClean[0]?.avg_score) || 4.24).toFixed(2));

    const [qComp] = await pool.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('Resolved', 'Student Confirmation') THEN 1 ELSE 0 END) as resolved FROM hygiene_complaints WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
    );
    const resCount = qComp[0]?.resolved || 0;
    const totCount = qComp[0]?.total || 0;
    const resolutionRating = totCount > 0 ? parseFloat(((resCount / totCount) * 5.0).toFixed(2)) : 4.45;

    const hostelQualityScore = parseFloat((0.40 * messRating + 0.40 * cleanlinessRating + 0.20 * resolutionRating).toFixed(2));
    const qualityDiff = parseFloat((hostelQualityScore - 4.15).toFixed(2));
    const qualityTrend = qualityDiff > 0.05 ? 'Improving' : qualityDiff < -0.05 ? 'Needs Attention' : 'Stable';

    // Parcels & Visitors stats for Warden
    const [pWarden] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(received_at) = CURDATE() THEN 1 ELSE 0 END) as todayDeliveries,
        SUM(CASE WHEN status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection') THEN 1 ELSE 0 END) as pendingCollection,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected
      FROM parcel_deliveries
    `);
    const [vWarden] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN visit_date = CURDATE() THEN 1 ELSE 0 END) as todayVisitors,
        SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) as currentlyInside,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'Checked In' AND CONCAT(visit_date, ' ', expected_departure) < NOW() THEN 1 ELSE 0 END) as overstayAlerts
      FROM visitor_requests
    `);

    res.status(200).json({
      success: true,
      data: {
        hostel,
        qualityScore: {
          score: hostelQualityScore,
          messRating,
          cleanlinessRating,
          resolutionRating,
          trend: qualityTrend,
          diff: qualityDiff >= 0 ? `+${qualityDiff}` : `${qualityDiff}`,
        },
        cards: {
          studentsInHostel: studentsCount,
          totalRooms: rooms.length,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
          openComplaints,
          pendingMaintenanceIssues: maintenanceComplaints,
          messMealsToday,
        },
        parcelStats: {
          total: Number(pWarden[0]?.total || 0),
          todayDeliveries: Number(pWarden[0]?.todayDeliveries || 0),
          pendingCollection: Number(pWarden[0]?.pendingCollection || 0),
          collected: Number(pWarden[0]?.collected || 0),
        },
        visitorStats: {
          total: Number(vWarden[0]?.total || 0),
          todayVisitors: Number(vWarden[0]?.todayVisitors || 0),
          currentlyInside: Number(vWarden[0]?.currentlyInside || 0),
          pendingRequests: Number(vWarden[0]?.pendingRequests || 0),
          overstayAlerts: Number(vWarden[0]?.overstayAlerts || 0),
        },
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Dashboard
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.*,
             u.name, u.email, u.phone AS user_phone, u.profile_image,
             h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender,
             r.room_number, r.floor_number, r.room_type, r.capacity AS room_capacity, r.current_occupancy AS room_occupancy
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.user_id = ?
    `, [req.user.id]);

    if (!students.length) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const student = formatStudent(students[0]);

    // Roommates in same room
    let roommates = [];
    if (student.roomId && student.roomId.id) {
      const [rmRows] = await pool.execute(`
        SELECT s.*, u.name, u.email, u.phone AS user_phone, u.profile_image
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.room_id = ? AND s.id != ?
      `, [student.roomId.id, student.id]);
      roommates = rmRows.map(formatStudent);
    }

    // Pending fees
    const [feeRows] = await pool.execute(
      "SELECT * FROM fees WHERE student_id = ? AND payment_status IN ('Pending', 'Overdue') ORDER BY due_date ASC",
      [student.id]
    );
    const pendingFees = feeRows.map(formatFee);
    const totalDue = pendingFees.reduce((acc, f) => acc + f.amount, 0);

    // Today's mess menu
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()];
    const [menuRows] = await pool.execute(
      'SELECT * FROM mess_menus WHERE day_of_week = ? ORDER BY FIELD(meal_type, "Breakfast", "Lunch", "Dinner", "Special")',
      [currentDayName]
    );
    const todayMenu = menuRows.map(formatMessMenu);

    // Recent complaints
    const [cRows] = await pool.execute(
      'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC LIMIT 3',
      [student.id]
    );
    const complaints = cRows.map((r) => formatComplaint(r, []));

    // Recent announcements
    let annQuery = `
      SELECT a.*, u.name AS creator_name, u.role AS creator_role
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.target_audience = 'All Students'
    `;
    const annParams = [];
    if (student.hostelId && student.hostelId.id) {
      annQuery += " OR (a.target_audience = 'Specific Hostel' AND a.hostel_id = ?)";
      annParams.push(student.hostelId.id);
    }
    annQuery += ' ORDER BY a.created_at DESC LIMIT 4';

    const [annRows] = await pool.execute(annQuery, annParams);
    const announcements = annRows.map(formatAnnouncement);

    // Attendance count
    const [attCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM meal_attendance WHERE student_id = ? AND status = 'Present'",
      [student.id]
    );
    const attendanceCount = Number(attCount[0]?.count || 0);

    // Today's meal rating
    const [tmRating] = await pool.execute(
      "SELECT AVG(overall_rating) as avg_rating FROM mess_feedback WHERE meal_date = CURDATE()"
    );
    const todayMealRating = parseFloat((Number(tmRating[0]?.avg_rating) || 4.2).toFixed(1));

    // Hostel cleanliness score
    const targetHostelId = student.hostelId?.id || student.hostelId || 1;
    const [hcScore] = await pool.execute(
      "SELECT AVG(score) as avg_score FROM cleanliness_inspections WHERE hostel_id = ? AND inspection_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)",
      [targetHostelId]
    );
    const hostelCleanlinessScore = parseFloat((Number(hcScore[0]?.avg_score) || 4.4).toFixed(1));

    // My Mess Feedback count
    const [mfCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM mess_feedback WHERE student_id = ?",
      [student.id]
    );
    const myMessFeedbackCount = Number(mfCount[0]?.count || 0);

    // My Hygiene Complaints count
    const [hcStats] = await pool.execute(
      `SELECT 
         SUM(CASE WHEN status NOT IN ('Resolved', 'Student Confirmation') THEN 1 ELSE 0 END) as open_count,
         SUM(CASE WHEN status IN ('Resolved', 'Student Confirmation') THEN 1 ELSE 0 END) as resolved_count
       FROM hygiene_complaints WHERE student_id = ?`,
      [student.id]
    );
    const myHygieneComplaints = {
      open: Number(hcStats[0]?.open_count || 0),
      resolved: Number(hcStats[0]?.resolved_count || 0),
    };

    // Parcel stats for student
    const [pStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('Received at Hostel', 'Student Notified', 'Awaiting Collection') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as collected
      FROM parcel_deliveries WHERE student_id = ?
    `, [student.id]);
    const parcelStats = {
      total: Number(pStats[0]?.total || 0),
      pending: Number(pStats[0]?.pending || 0),
      collected: Number(pStats[0]?.collected || 0),
    };

    // Visitor stats for student
    const [vStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) as active
      FROM visitor_requests WHERE student_id = ?
    `, [student.id]);
    const visitorStats = {
      total: Number(vStats[0]?.total || 0),
      pending: Number(vStats[0]?.pending || 0),
      approved: Number(vStats[0]?.approved || 0),
      active: Number(vStats[0]?.active || 0),
    };

    res.status(200).json({
      success: true,
      data: {
        student,
        roommates,
        pendingFees,
        totalDue,
        todayMenu,
        complaints,
        announcements,
        attendanceCount,
        todayMealRating,
        hostelCleanlinessScore,
        myMessFeedbackCount,
        myHygieneComplaints,
        parcelStats,
        visitorStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Aggregated Reports
// @route   GET /api/dashboard/reports
// @access  Private (Admin / Warden)
export const getReports = async (req, res, next) => {
  try {
    const { reportType, hostelId } = req.query;
    let result = {};

    switch (reportType) {
      case 'students': {
        let sql = `
          SELECT s.*,
                 u.name, u.email, u.phone AS user_phone,
                 h.name AS hostel_name, r.room_number
          FROM students s
          JOIN users u ON s.user_id = u.id
          LEFT JOIN hostels h ON s.hostel_id = h.id
          LEFT JOIN rooms r ON s.room_id = r.id
          WHERE 1=1
        `;
        const params = [];
        if (hostelId) {
          sql += ' AND s.hostel_id = ?';
          params.push(hostelId);
        }
        sql += ' ORDER BY s.id DESC';
        const [rows] = await pool.execute(sql, params);
        const students = rows.map(formatStudent);
        result = { count: students.length, items: students };
        break;
      }
      case 'occupancy': {
        let sql = `
          SELECT r.*, h.name AS hostel_name
          FROM rooms r
          JOIN hostels h ON r.hostel_id = h.id
          WHERE 1=1
        `;
        const params = [];
        if (hostelId) {
          sql += ' AND r.hostel_id = ?';
          params.push(hostelId);
        }
        const [rows] = await pool.execute(sql, params);
        const rooms = rows.map(formatRoom);
        const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const currentOccupancy = rooms.reduce((acc, r) => acc + r.currentOccupancy, 0);
        result = {
          totalRooms: rooms.length,
          totalCapacity,
          currentOccupancy,
          availableBeds: Math.max(0, totalCapacity - currentOccupancy),
          occupancyRate: totalCapacity > 0 ? ((currentOccupancy / totalCapacity) * 100).toFixed(1) : 0,
          rooms,
        };
        break;
      }
      case 'fees': {
        const [rows] = await pool.execute(`
          SELECT f.*,
                 s.student_id AS student_roll,
                 u.name AS student_name, u.email AS student_email
          FROM fees f
          JOIN students s ON f.student_id = s.id
          JOIN users u ON s.user_id = u.id
          ORDER BY f.due_date DESC
        `);
        const fees = rows.map(formatFee);
        const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
        const totalCollected = fees.filter((f) => f.paymentStatus === 'Paid').reduce((acc, f) => acc + f.amount, 0);
        const totalPending = totalBilled - totalCollected;
        result = {
          totalBilled,
          totalCollected,
          totalPending,
          items: fees,
        };
        break;
      }
      case 'complaints': {
        let sql = `
          SELECT c.*,
                 s.student_id AS roll_no,
                 u.name AS student_name,
                 h.name AS hostel_name
          FROM complaints c
          JOIN students s ON c.student_id = s.id
          JOIN users u ON s.user_id = u.id
          LEFT JOIN hostels h ON s.hostel_id = h.id
          WHERE 1=1
        `;
        const params = [];
        if (hostelId) {
          sql += ' AND s.hostel_id = ?';
          params.push(hostelId);
        }
        const [rows] = await pool.execute(sql, params);
        const complaints = rows.map((r) => formatComplaint(r, []));
        const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
        const pending = complaints.length - resolved;
        result = {
          total: complaints.length,
          resolved,
          pending,
          items: complaints,
        };
        break;
      }
      case 'mess': {
        const [rows] = await pool.execute(`
          SELECT ma.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
          FROM meal_attendance ma
          JOIN students s ON ma.student_id = s.id
          JOIN users u ON s.user_id = u.id
          ORDER BY ma.attendance_date DESC
          LIMIT 100
        `);
        const attendance = rows.map(formatMealAttendance);
        result = {
          totalServed: attendance.filter((a) => a.status === 'Present').length,
          items: attendance,
        };
        break;
      }
      default: {
        result = { message: 'Please specify a valid reportType: students, occupancy, fees, complaints, mess' };
      }
    }

    res.status(200).json({
      success: true,
      reportType,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
