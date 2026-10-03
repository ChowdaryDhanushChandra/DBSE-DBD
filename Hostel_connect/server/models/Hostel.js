import pool from '../config/database.js';
import { formatHostel } from '../utils/mysqlHelper.js';

export const tableName = 'hostels';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [id]);
  return rows.length ? formatHostel(rows[0]) : null;
};

export default { tableName, findById };
