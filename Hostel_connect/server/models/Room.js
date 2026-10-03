import pool from '../config/database.js';
import { formatRoom } from '../utils/mysqlHelper.js';

export const tableName = 'rooms';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [id]);
  return rows.length ? formatRoom(rows[0]) : null;
};

export default { tableName, findById };
