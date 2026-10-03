import pool from '../config/database.js';

async function migrate() {
  console.log('--- Starting Parcel & Visitor Management Migration ---');

  // 1. Parcel Deliveries
  await pool.query(`
    CREATE TABLE IF NOT EXISTS parcel_deliveries (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT UNSIGNED NOT NULL,
      parcel_code VARCHAR(50) NOT NULL UNIQUE,
      courier_name VARCHAR(100) NOT NULL,
      tracking_number VARCHAR(100) NULL,
      parcel_type VARCHAR(50) NOT NULL DEFAULT 'Standard Box',
      sender_name VARCHAR(100) NULL,
      expected_date DATE NULL,
      received_at DATETIME NULL,
      storage_location VARCHAR(100) NULL,
      status ENUM('Expected', 'In Transit', 'Received at Hostel', 'Student Notified', 'Awaiting Collection', 'Collected', 'Returned') NOT NULL DEFAULT 'Received at Hostel',
      collected_at DATETIME NULL,
      collected_by VARCHAR(100) NULL,
      verified_by BIGINT UNSIGNED NULL,
      remarks TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_student_status (student_id, status),
      INDEX idx_parcel_code (parcel_code),
      INDEX idx_tracking (tracking_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ parcel_deliveries table ensured');

  // 2. Parcel Notifications
  await pool.query(`
    CREATE TABLE IF NOT EXISTS parcel_notifications (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      parcel_id BIGINT UNSIGNED NOT NULL,
      student_id BIGINT UNSIGNED NOT NULL,
      notification_message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parcel_id) REFERENCES parcel_deliveries(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_student_read (student_id, is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ parcel_notifications table ensured');

  // 3. Visitor Requests
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_requests (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT UNSIGNED NOT NULL,
      visitor_name VARCHAR(100) NOT NULL,
      mobile_number VARCHAR(20) NOT NULL,
      relationship VARCHAR(50) NOT NULL,
      visitor_type VARCHAR(50) NOT NULL DEFAULT 'Parent',
      visit_date DATE NOT NULL,
      expected_arrival TIME NOT NULL,
      expected_departure TIME NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      number_of_visitors INT NOT NULL DEFAULT 1,
      status ENUM('Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out', 'Cancelled') NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT NULL,
      reviewed_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_student_status (student_id, status),
      INDEX idx_visit_date (visit_date, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ visitor_requests table ensured');

  // 4. Visitor Logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      visitor_request_id BIGINT UNSIGNED NOT NULL,
      id_proof_type VARCHAR(50) NULL,
      id_proof_reference VARCHAR(50) NULL,
      vehicle_number VARCHAR(30) NULL,
      check_in_time DATETIME NOT NULL,
      check_out_time DATETIME NULL,
      verified_by BIGINT UNSIGNED NULL,
      remarks TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visitor_request_id) REFERENCES visitor_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_request (visitor_request_id),
      INDEX idx_checkin (check_in_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ visitor_logs table ensured');

  // 5. Update notifications type ENUM to include parcel and visitor
  try {
    await pool.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM('room','fee','complaint','announcement','mess','document','system','parcel','visitor') DEFAULT 'system'
    `);
    console.log('✓ notifications table type ENUM updated to include parcel and visitor');
  } catch (err) {
    console.warn('Note on notifications type enum alteration:', err.message);
  }

  console.log('--- Parcel & Visitor Migration Complete! ---');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
