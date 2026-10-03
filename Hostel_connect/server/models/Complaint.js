import pool from '../config/database.js';
import { formatComplaint } from '../utils/mysqlHelper.js';

export const tableName = 'complaints';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM complaints WHERE id = ?', [id]);
  return rows.length ? formatComplaint(rows[0]) : null;
};

export default { tableName, findById };
