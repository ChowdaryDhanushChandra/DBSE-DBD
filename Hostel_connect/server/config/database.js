import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'hostel_connect',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

/**
 * Test database connectivity
 */
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Connected successfully to database: ${process.env.DB_NAME || 'hostel_connect'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[MySQL Connection Warning] Could not connect to MySQL database '${process.env.DB_NAME || 'hostel_connect'}': ${error.message}`);
    console.warn('[MySQL Tip] Ensure MySQL service is running and DB_PASSWORD in server/.env matches your local MySQL password.');
    return false;
  }
};

export default pool;
