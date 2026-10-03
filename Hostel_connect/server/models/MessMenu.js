import pool from '../config/database.js';
import { formatMessMenu } from '../utils/mysqlHelper.js';

export const tableName = 'mess_menus';

export const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM mess_menus WHERE id = ?', [id]);
  return rows.length ? formatMessMenu(rows[0]) : null;
};

export default { tableName, findById };
