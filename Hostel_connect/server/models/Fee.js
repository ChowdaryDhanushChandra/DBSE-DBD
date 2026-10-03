import pool from '../config/database.js';
import { formatFee } from '../utils/mysqlHelper.js';

export const tableName = 'fees';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM fees WHERE id = ?', [id]);
  return rows.length ? formatFee(rows[0]) : null;
};

export default { tableName, findById };
