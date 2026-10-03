import pool from '../config/database.js';
import { formatAnnouncement } from '../utils/mysqlHelper.js';

export const tableName = 'announcements';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM announcements WHERE id = ?', [id]);
  return rows.length ? formatAnnouncement(rows[0]) : null;
};

export default { tableName, findById };
