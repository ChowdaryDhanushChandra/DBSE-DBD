import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool, { testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Testing MySQL connection...');
    const connected = await testConnection();
    if (!connected) {
      console.warn('[Seeder] Could not connect to MySQL. Ensure MySQL server is running and credentials in server/.env are correct.');
      return;
    }

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const sampleDataPath = path.join(__dirname, '..', '..', 'database', 'sample_data.sql');

    const connection = await pool.getConnection();
    try {
      if (fs.existsSync(schemaPath)) {
        console.log(`[Seeder] Reading schema SQL from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        console.log('[Seeder] Executing database schema creation...');
        await connection.query(schemaSql);
        console.log('[Seeder] Schema initialized successfully!');
      }

      if (fs.existsSync(sampleDataPath)) {
        console.log(`[Seeder] Reading sample SQL from ${sampleDataPath}...`);
        const sampleSql = fs.readFileSync(sampleDataPath, 'utf-8');
        console.log('[Seeder] Executing sample data import...');
        await connection.query(sampleSql);
        console.log('[Seeder] Sample data imported successfully into MySQL!');
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Seeder Error] Failed to seed MySQL database:', error.message);
  }
};

// If run directly via `node utils/seeder.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase().then(() => {
    console.log('[Seeder] Process complete.');
    process.exit(0);
  });
}
