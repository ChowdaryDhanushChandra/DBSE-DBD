import pool from '../config/database.js';
import { formatNotification } from '../utils/mysqlHelper.js';

export const tableName = 'notifications';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows.length ? formatNotification(rows[0]) : null;
};

export default { tableName, findById };
