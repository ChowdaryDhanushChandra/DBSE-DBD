import pool from '../config/database.js';
import { formatMealAttendance } from '../utils/mysqlHelper.js';

export const tableName = 'meal_attendance';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM meal_attendance WHERE id = ?', [id]);
  return rows.length ? formatMealAttendance(rows[0]) : null;
};

export default { tableName, findById };
