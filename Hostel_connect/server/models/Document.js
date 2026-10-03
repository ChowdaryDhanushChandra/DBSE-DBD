import pool from '../config/database.js';
import { formatDocument } from '../utils/mysqlHelper.js';

export const tableName = 'documents';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
  return rows.length ? formatDocument(rows[0]) : null;
};

export default { tableName, findById };
