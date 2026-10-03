import pool from '../config/database.js';
import { formatStudent } from '../utils/mysqlHelper.js';

export const tableName = 'students';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);
  return rows.length ? formatStudent(rows[0]) : null;
};

export const findByUserId = async (userId) => {
  const [rows] = await pool.execute('SELECT * FROM students WHERE user_id = ?', [userId]);
  return rows.length ? formatStudent(rows[0]) : null;
};

export default { tableName, findById, findByUserId };
