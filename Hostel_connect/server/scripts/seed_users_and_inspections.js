import pool from '../config/database.js';

async function setupUsers() {
  const usersToEnsure = [
    { name: 'System Admin', email: 'admin@hostelconnect.com', password: '$2a$10$ux2vzf8LnVtJBKdkUGBV9OmDCeiNugzS7H8eyFK9lqjyOWotHUoiO', role: 'admin', phone: '9000000001' },
    { name: 'Ravi Kumar (Warden)', email: 'warden@hostelconnect.com', password: '$2a$10$hOqcfoye63Uw/WWqLHuabelwcPn7bHN9gdb4GXzjabCUDevhBbBgK', role: 'warden', phone: '9000000002' },
    { name: 'Demo Student', email: 'student@hostelconnect.com', password: '$2a$10$txvGylNf8akco2kHV3kiouaQ0JjWNrM8kz/amv/AUx5KX6SvR0Rmq', role: 'student', phone: '9000000005' },
  ];

  for (const u of usersToEnsure) {
    const [exist] = await pool.execute('SELECT id FROM users WHERE email = ?', [u.email]);
    if (exist.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, u.password, u.role, u.phone]
      );
      console.log('Inserted user:', u.email);
    }
  }

  // Ensure Demo Student has a record in students table
  const [studentUser] = await pool.execute('SELECT id FROM users WHERE email = ?', ['student@hostelconnect.com']);
  if (studentUser.length > 0) {
    const [stExist] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [studentUser[0].id]);
    if (stExist.length === 0) {
      const [firstHostel] = await pool.execute('SELECT id FROM hostels LIMIT 1');
      const [firstRoom] = await pool.execute('SELECT id FROM rooms LIMIT 1');
      await pool.execute(
        'INSERT INTO students (user_id, student_id, course, department, year_of_study, phone, gender, guardian_name, guardian_phone, address, hostel_id, room_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [studentUser[0].id, 'STU007', 'B.Tech CS', 'Computer Science', 2, '9000000005', 'Male', 'Guardian', '9111111111', 'Campus City', firstHostel[0]?.id || 1, firstRoom[0]?.id || 1, 'Active']
      );
      console.log('Inserted student profile for student@hostelconnect.com');
    }
  }

  // Seed cleanliness inspections
  const [ciCount] = await pool.execute('SELECT COUNT(*) as c FROM cleanliness_inspections');
  if (ciCount[0].c === 0) {
    const [warden] = await pool.execute("SELECT id FROM users WHERE role IN ('warden', 'admin') LIMIT 1");
    const [hostel] = await pool.execute('SELECT id FROM hostels LIMIT 1');
    const wardenId = warden[0]?.id || 1;
    const hostelId = hostel[0]?.id || 1;
    const today = new Date().toISOString().split('T')[0];

    const areas = [
      { area: 'Hostel Rooms', score: 4.40, status: 'Good', remarks: 'Floors swept and sanitized; bed frames checked.' },
      { area: 'Bathrooms', score: 3.70, status: 'Good', remarks: 'Plumbing clear, geysers operational.' },
      { area: 'Corridors', score: 4.20, status: 'Good', remarks: 'Waste bins cleared, handrails disinfected.' },
      { area: 'Common Areas', score: 4.50, status: 'Excellent', remarks: 'Study halls and lounges tidy and dusted.' },
      { area: 'Dining Hall', score: 4.60, status: 'Excellent', remarks: 'Tables wiped with disinfectant, floor spotless.' },
      { area: 'Kitchen', score: 4.00, status: 'Good', remarks: 'Utensil sterilizer working properly, cooking counters clean.' },
      { area: 'Drinking Water Area', score: 4.30, status: 'Good', remarks: 'RO filter pressure verified, drip tray cleansed.' },
      { area: 'Waste Disposal Area', score: 3.90, status: 'Good', remarks: 'Segregated waste bins covered and emptied on schedule.' },
    ];

    for (const a of areas) {
      await pool.execute(
        'INSERT INTO cleanliness_inspections (hostel_id, area, score, status, inspector_id, inspection_date, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [hostelId, a.area, a.score, a.status, wardenId, today, a.remarks]
      );
    }
    console.log('Seeded cleanliness inspections!');
  }

  process.exit(0);
}

setupUsers().catch(e => { console.error(e); process.exit(1); });
