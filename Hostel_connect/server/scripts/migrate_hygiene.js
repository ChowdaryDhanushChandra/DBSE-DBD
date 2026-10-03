import pool from '../config/database.js';

async function migrate() {
  console.log('--- Migrating Smart Mess & Hostel Hygiene Management Tables ---');

  // 1. mess_feedback
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mess_feedback (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT UNSIGNED NOT NULL,
      meal_id BIGINT UNSIGNED NULL,
      meal_date DATE NOT NULL,
      meal_type ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner') NOT NULL,
      taste_rating TINYINT NOT NULL,
      quality_rating TINYINT NOT NULL,
      quantity_rating TINYINT NOT NULL,
      cleanliness_rating TINYINT NOT NULL,
      temperature_rating TINYINT NOT NULL,
      overall_rating DECIMAL(3,2) NOT NULL,
      comments TEXT NULL,
      feedback_categories JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_meal (student_id, meal_date, meal_type),
      CONSTRAINT fk_mf_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      CONSTRAINT fk_mf_meal FOREIGN KEY (meal_id) REFERENCES mess_menus(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Table created: mess_feedback');

  // 2. cleanliness_inspections
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cleanliness_inspections (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      hostel_id BIGINT UNSIGNED NOT NULL,
      area ENUM(
        'Hostel Rooms',
        'Bathrooms',
        'Corridors',
        'Common Areas',
        'Dining Hall',
        'Kitchen',
        'Drinking Water Area',
        'Waste Disposal Area'
      ) NOT NULL,
      score DECIMAL(3,2) NOT NULL,
      status ENUM('Excellent', 'Good', 'Needs Improvement', 'Critical') NOT NULL,
      inspector_id BIGINT UNSIGNED NOT NULL,
      inspection_date DATE NOT NULL,
      remarks TEXT NULL,
      image_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_ci_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      CONSTRAINT fk_ci_inspector FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Table created: cleanliness_inspections');

  // 3. inspection_schedule
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS inspection_schedule (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      hostel_id BIGINT UNSIGNED NOT NULL,
      area VARCHAR(100) NOT NULL,
      scheduled_day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
      assigned_to BIGINT UNSIGNED NULL,
      status ENUM('Completed', 'Pending', 'Missed') DEFAULT 'Pending',
      last_inspected_at DATE NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_is_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      CONSTRAINT fk_is_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Table created: inspection_schedule');

  // 4. hygiene_complaints
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS hygiene_complaints (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT UNSIGNED NOT NULL,
      hostel_id BIGINT UNSIGNED NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
      status ENUM('Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Student Confirmation') DEFAULT 'Reported',
      assigned_to BIGINT UNSIGNED NULL,
      image_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP NULL,
      student_confirmed TINYINT(1) DEFAULT 0,
      admin_notes TEXT NULL,
      CONSTRAINT fk_hc_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      CONSTRAINT fk_hc_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      CONSTRAINT fk_hc_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Table created: hygiene_complaints');

  // Seed default inspection schedule for all existing hostels if not present
  const [hostels] = await pool.execute('SELECT id FROM hostels');
  const [users] = await pool.execute("SELECT id FROM users WHERE role IN ('warden', 'admin') LIMIT 1");
  const wardenId = users[0]?.id || null;

  const defaultSchedule = [
    { day: 'Monday', area: 'Hostel Rooms' },
    { day: 'Tuesday', area: 'Bathrooms' },
    { day: 'Wednesday', area: 'Corridors' },
    { day: 'Thursday', area: 'Common Areas' },
    { day: 'Friday', area: 'Dining Hall' },
    { day: 'Saturday', area: 'Kitchen' },
    { day: 'Sunday', area: 'Weekly Summary' },
  ];

  for (const h of hostels) {
    for (const item of defaultSchedule) {
      const [existing] = await pool.execute(
        'SELECT id FROM inspection_schedule WHERE hostel_id = ? AND scheduled_day = ?',
        [h.id, item.day]
      );
      if (existing.length === 0) {
        await pool.execute(
          'INSERT INTO inspection_schedule (hostel_id, area, scheduled_day, assigned_to, status) VALUES (?, ?, ?, ?, ?)',
          [h.id, item.area, item.day, wardenId, 'Completed']
        );
      }
    }
  }
  console.log('✓ Default weekly inspection schedule seeded');

  // Seed sample cleanliness inspections if empty
  const [existingInspections] = await pool.execute('SELECT COUNT(*) as count FROM cleanliness_inspections');
  if (existingInspections[0].count === 0 && hostels.length > 0 && wardenId) {
    const today = new Date().toISOString().split('T')[0];
    const areas = [
      { area: 'Hostel Rooms', score: 4.40, status: 'Good', remarks: 'Floors vacuumed and sanitized; bed frames checked.' },
      { area: 'Bathrooms', score: 3.70, status: 'Good', remarks: 'Plumbing clear, mirrors wiped, geysers operational.' },
      { area: 'Corridors', score: 4.20, status: 'Good', remarks: 'Waste bins cleared, handrails disinfected.' },
      { area: 'Common Areas', score: 4.50, status: 'Excellent', remarks: 'Study halls and TV lounges tidy and dusted.' },
      { area: 'Dining Hall', score: 4.60, status: 'Excellent', remarks: 'Dining tables wiped with food-grade disinfectant, floor spotless.' },
      { area: 'Kitchen', score: 4.00, status: 'Good', remarks: 'Utensil sterilizer working properly, cooking counters clean.' },
      { area: 'Drinking Water Area', score: 4.30, status: 'Good', remarks: 'RO filter pressure verified, drip tray cleansed.' },
      { area: 'Waste Disposal Area', score: 3.90, status: 'Good', remarks: 'Segregated waste bins covered and emptied on schedule.' },
    ];

    for (const a of areas) {
      await pool.execute(
        `INSERT INTO cleanliness_inspections (hostel_id, area, score, status, inspector_id, inspection_date, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hostels[0].id, a.area, a.score, a.status, wardenId, today, a.remarks]
      );
    }
    console.log('✓ Sample cleanliness inspections seeded');
  }

  // Seed sample meal feedback if empty
  const [existingFeedback] = await pool.execute('SELECT COUNT(*) as count FROM mess_feedback');
  const [studentsList] = await pool.execute('SELECT id FROM students LIMIT 5');
  if (existingFeedback[0].count === 0 && studentsList.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const sampleFeedbacks = [
      {
        mealType: 'Breakfast',
        taste: 5, quality: 4, quantity: 5, cleanliness: 4, temperature: 4,
        overall: 4.40,
        comments: 'Masala Dosa was very crispy and hot! Sambar was flavorful.',
        categories: JSON.stringify(['Good Taste']),
      },
      {
        mealType: 'Lunch',
        taste: 4, quality: 4, quantity: 4, cleanliness: 4, temperature: 3,
        overall: 3.80,
        comments: 'Dal Tadka was great, but rotis could have been warmer.',
        categories: JSON.stringify(['Food Too Cold']),
      },
      {
        mealType: 'Snacks',
        taste: 5, quality: 5, quantity: 4, cleanliness: 5, temperature: 5,
        overall: 4.80,
        comments: 'Crispy samosas and ginger chai were phenomenal.',
        categories: JSON.stringify(['Good Taste']),
      },
      {
        mealType: 'Dinner',
        taste: 4, quality: 4, quantity: 5, cleanliness: 4, temperature: 4,
        overall: 4.20,
        comments: 'Paneer butter masala and jeera rice were delicious.',
        categories: JSON.stringify(['Good Taste']),
      },
    ];

    for (const f of sampleFeedbacks) {
      await pool.execute(
        `INSERT INTO mess_feedback
         (student_id, meal_date, meal_type, taste_rating, quality_rating, quantity_rating, cleanliness_rating, temperature_rating, overall_rating, comments, feedback_categories)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentsList[0].id, today, f.mealType, f.taste, f.quality, f.quantity, f.cleanliness, f.temperature, f.overall, f.comments, f.categories]
      );
    }
    console.log('✓ Sample meal feedback seeded');
  }

  // Seed sample hygiene complaints if empty
  const [existingComplaints] = await pool.execute('SELECT COUNT(*) as count FROM hygiene_complaints');
  if (existingComplaints[0].count === 0 && studentsList.length > 0 && hostels.length > 0) {
    const sampleComplaints = [
      {
        student_id: studentsList[0].id,
        hostel_id: hostels[0].id,
        category: 'Water contamination concern',
        location: '2nd Floor Water Dispenser',
        description: 'Water dispenser tap seems dirty and water looks slightly cloudy. Please inspect RO filters.',
        priority: 'CRITICAL',
        status: 'In Progress',
        assigned_to: wardenId,
      },
      {
        student_id: studentsList[0].id,
        hostel_id: hostels[0].id,
        category: 'Overflowing dustbin',
        location: 'Block A Corridor West',
        description: 'Corridor waste bin is full and starting to smell.',
        priority: 'HIGH',
        status: 'Assigned',
        assigned_to: wardenId,
      },
      {
        student_id: studentsList[0].id,
        hostel_id: hostels[0].id,
        category: 'Dirty bathroom',
        location: '1st Floor Washroom 3',
        description: 'Tap was leaking and floor was wet.',
        priority: 'MEDIUM',
        status: 'Resolved',
        assigned_to: wardenId,
        student_confirmed: 1,
      },
    ];

    for (const c of sampleComplaints) {
      await pool.execute(
        `INSERT INTO hygiene_complaints
         (student_id, hostel_id, category, location, description, priority, status, assigned_to, student_confirmed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.student_id, c.hostel_id, c.category, c.location, c.description, c.priority, c.status, c.assigned_to, c.student_confirmed || 0]
      );
    }
    console.log('✓ Sample hygiene complaints seeded');
  }

  console.log('--- Migration & Seeding Finished Successfully! ---');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
