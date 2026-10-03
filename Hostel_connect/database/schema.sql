CREATE DATABASE IF NOT EXISTS hostel_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostel_connect;

CREATE TABLE users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
 role ENUM('admin','warden','student') DEFAULT 'student', profile_image VARCHAR(500),
 is_active BOOLEAN DEFAULT TRUE, phone VARCHAR(30), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE hostels (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL,
 type ENUM('hostel','pg') NOT NULL DEFAULT 'hostel',
 location VARCHAR(255), gender ENUM('Boys','Girls','Co-ed') NOT NULL,
 total_rooms INT UNSIGNED DEFAULT 0, description TEXT, warden_id BIGINT UNSIGNED NULL,
 contact_phone VARCHAR(30), image VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (warden_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE rooms (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, hostel_id BIGINT UNSIGNED NOT NULL,
 category ENUM('hostel','pg') NOT NULL DEFAULT 'hostel',
 room_number VARCHAR(30) NOT NULL, floor_number INT,
 room_type VARCHAR(60) NOT NULL DEFAULT 'Double',
 capacity INT UNSIGNED NOT NULL, current_occupancy INT UNSIGNED DEFAULT 0,
 status ENUM('Available','Partially Occupied','Fully Occupied','Maintenance') DEFAULT 'Available',
 image_url VARCHAR(500) DEFAULT NULL,
 amenities TEXT DEFAULT NULL,
 price_per_semester DECIMAL(12,2) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(hostel_id,room_number), FOREIGN KEY(hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE students (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL UNIQUE,
 student_id VARCHAR(50) NOT NULL UNIQUE, course VARCHAR(150), department VARCHAR(150),
 year_of_study INT UNSIGNED, phone VARCHAR(30), gender ENUM('Male','Female','Other'),
 guardian_name VARCHAR(150), guardian_phone VARCHAR(30), address TEXT,
 hostel_id BIGINT UNSIGNED NULL, room_id BIGINT UNSIGNED NULL,
 status ENUM('Active','Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(hostel_id) REFERENCES hostels(id) ON DELETE SET NULL,
 FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE allocations (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 hostel_id BIGINT UNSIGNED NOT NULL, room_id BIGINT UNSIGNED NOT NULL,
 allocation_date DATE NOT NULL, vacate_date DATE NULL,
 status ENUM('Active','Transferred','Vacated') DEFAULT 'Active', remarks TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
 FOREIGN KEY(hostel_id) REFERENCES hostels(id) ON DELETE RESTRICT,
 FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE mess_menus (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
 meal_type VARCHAR(50) NOT NULL,
 food_items JSON NOT NULL, category ENUM('Vegetarian','Non-Vegetarian','Both','Special') DEFAULT 'Both',
 calories INT UNSIGNED, timing VARCHAR(100), description TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(day_of_week,meal_type)
) ENGINE=InnoDB;

CREATE TABLE meal_attendance (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 attendance_date DATE NOT NULL, meal_type ENUM('Breakfast','Lunch','Dinner') NOT NULL,
 status ENUM('Present','Absent') DEFAULT 'Present', marked_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(student_id,attendance_date,meal_type),
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
 FOREIGN KEY(marked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE fees (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 fee_type ENUM('Hostel Fee','Mess Fee','Maintenance Fee','Other Fees') NOT NULL,
 amount DECIMAL(12,2) NOT NULL, due_date DATE NOT NULL, payment_date DATE NULL,
 payment_status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
 transaction_id VARCHAR(150), payment_method VARCHAR(100), invoice_number VARCHAR(100) UNIQUE,
 academic_semester VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE complaints (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(255) NOT NULL,
 category ENUM('Electricity','Water','Cleanliness','Maintenance','Food','Internet','Other') NOT NULL,
 description TEXT NOT NULL, priority ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
 status ENUM('Submitted','In Review','Assigned','In Progress','Resolved','Closed') DEFAULT 'Submitted',
 assigned_to BIGINT UNSIGNED NULL, resolution_notes TEXT, image VARCHAR(500),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
 FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE complaint_timeline (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, complaint_id BIGINT UNSIGNED NOT NULL,
 status ENUM('Submitted','In Review','Assigned','In Progress','Resolved','Closed') NOT NULL,
 note TEXT, updated_by BIGINT UNSIGNED NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
 FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE announcements (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
 target_audience ENUM('All Students','Specific Hostel','Specific Users') DEFAULT 'All Students',
 hostel_id BIGINT UNSIGNED NULL, priority ENUM('Normal','Important','Urgent') DEFAULT 'Normal',
 created_by BIGINT UNSIGNED NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(hostel_id) REFERENCES hostels(id) ON DELETE SET NULL,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE notifications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
 type ENUM('room','fee','complaint','announcement','mess','document','system') NOT NULL,
 link VARCHAR(500), is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE documents (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 document_type VARCHAR(100) NOT NULL, file_url VARCHAR(500) NOT NULL,
 original_name VARCHAR(255), status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
 admin_notes TEXT, upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;
