import pool from '../config/database.js';
import { formatUser } from '../utils/mysqlHelper.js';

export const tableName = 'users';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows.length ? formatUser(rows[0]) : null;
};

export const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  return rows.length ? rows[0] : null;
};

export default { tableName, findById, findByEmail };
