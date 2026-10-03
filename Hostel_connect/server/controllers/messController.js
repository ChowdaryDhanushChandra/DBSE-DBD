import pool from '../config/database.js';
import { formatMessMenu, formatMealAttendance } from '../utils/mysqlHelper.js';

// @desc    Get weekly mess menu and today's menu
// @route   GET /api/mess/menu
// @access  Public / Authenticated
export const getMessMenu = async (req, res, next) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()];

    const [weeklyRows] = await pool.execute(
      'SELECT * FROM mess_menus ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), FIELD(meal_type, "Breakfast", "Lunch", "Snacks", "Dinner", "Special")'
    );
    const weekly = weeklyRows.map(formatMessMenu);

    const [todayRows] = await pool.execute(
      'SELECT * FROM mess_menus WHERE day_of_week = ? ORDER BY FIELD(meal_type, "Breakfast", "Lunch", "Snacks", "Dinner", "Special")',
      [currentDayName]
    );
    const today = todayRows.map(formatMessMenu);

    res.status(200).json({
      success: true,
      currentDay: currentDayName,
      today,
      weekly,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a menu item
// @route   POST /api/mess/menu
// @access  Private (Admin / Warden)
export const saveMenuItem = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, foodItems, category, calories, timing, description } = req.body;

    const itemsArray = Array.isArray(foodItems)
      ? foodItems
      : String(foodItems || '').split(',').map((s) => s.trim()).filter(Boolean);

    const foodJson = JSON.stringify(itemsArray);

    await pool.execute(
      `INSERT INTO mess_menus (day_of_week, meal_type, food_items, category, calories, timing, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       food_items = VALUES(food_items),
       category = VALUES(category),
       calories = VALUES(calories),
       timing = VALUES(timing),
       description = VALUES(description)`,
      [
        dayOfWeek,
        mealType,
        foodJson,
        category || 'Vegetarian',
        Number(calories || 500),
        timing || '',
        description || '',
      ]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM mess_menus WHERE day_of_week = ? AND meal_type = ?',
      [dayOfWeek, mealType]
    );

    res.status(200).json({
      success: true,
      message: `${mealType} for ${dayOfWeek} updated successfully`,
      data: formatMessMenu(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/mess/menu/:id
// @access  Private (Admin / Warden)
export const deleteMenuItem = async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM mess_menus WHERE id = ?', [req.params.id]);
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark student meal attendance
// @route   POST /api/mess/attendance
// @access  Private (Warden / Staff / Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, mealType, status } = req.body;
    const formattedDate = date || new Date().toISOString().split('T')[0];

    await pool.execute(
      `INSERT INTO meal_attendance (student_id, attendance_date, meal_type, status, marked_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       marked_by = VALUES(marked_by)`,
      [
        studentId,
        formattedDate,
        mealType,
        status || 'Present',
        req.user ? req.user.id : null,
      ]
    );

    const [rows] = await pool.execute(`
      SELECT ma.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
      FROM meal_attendance ma
      JOIN students s ON ma.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ma.student_id = ? AND ma.attendance_date = ? AND ma.meal_type = ?
    `, [studentId, formattedDate, mealType]);

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${status || 'Present'} for ${mealType}`,
      data: formatMealAttendance(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal attendance records
// @route   GET /api/mess/attendance
// @access  Private
export const getAttendance = async (req, res, next) => {
  try {
    const { date, mealType, studentId } = req.query;

    let targetStudentId = studentId;
    if (req.user.role === 'student') {
      const [st] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (st.length) targetStudentId = st[0].id;
    }

    let sql = `
      SELECT ma.*, s.student_id AS roll_no, u.id AS user_id, u.name AS student_name
      FROM meal_attendance ma
      JOIN students s ON ma.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND ma.attendance_date = ?';
      params.push(date);
    }
    if (mealType) {
      sql += ' AND ma.meal_type = ?';
      params.push(mealType);
    }
    if (targetStudentId) {
      sql += ' AND ma.student_id = ?';
      params.push(targetStudentId);
    }

    sql += ' ORDER BY ma.attendance_date DESC, ma.id DESC';

    const [rows] = await pool.execute(sql, params);
    const records = rows.map(formatMealAttendance);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal attendance analytics & statistics
// @route   GET /api/mess/stats
// @access  Private
export const getMessStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [todayRows] = await pool.execute(
      "SELECT meal_type, COUNT(*) as count FROM meal_attendance WHERE attendance_date = ? AND status = 'Present' GROUP BY meal_type",
      [today]
    );

    let breakfastToday = 0;
    let lunchToday = 0;
    let dinnerToday = 0;

    todayRows.forEach((r) => {
      if (r.meal_type === 'Breakfast') breakfastToday = Number(r.count);
      if (r.meal_type === 'Lunch') lunchToday = Number(r.count);
      if (r.meal_type === 'Dinner') dinnerToday = Number(r.count);
    });

    const totalServedToday = breakfastToday + lunchToday + dinnerToday;

    const [allTimeRows] = await pool.execute(
      "SELECT COUNT(*) as total FROM meal_attendance WHERE status = 'Present'"
    );
    const totalAllTime = Number(allTimeRows[0].total || 0);

    res.status(200).json({
      success: true,
      data: {
        date: today,
        totalServedToday,
        totalAllTime,
        breakdownToday: {
          breakfast: breakfastToday,
          lunch: lunchToday,
          dinner: dinnerToday,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
