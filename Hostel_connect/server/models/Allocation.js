import pool from '../config/database.js';
import { formatAllocation } from '../utils/mysqlHelper.js';

export const tableName = 'allocations';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM allocations WHERE id = ?', [id]);
  return rows.length ? formatAllocation(rows[0]) : null;
};

export default { tableName, findById };
