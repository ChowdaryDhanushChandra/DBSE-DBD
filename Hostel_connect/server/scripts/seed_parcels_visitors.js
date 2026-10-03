import pool from '../config/database.js';

async function seed() {
  console.log('--- Starting Seed for Parcels and Visitors ---');

  // Find students and warden/admin users
  const [students] = await pool.query(`
    SELECT s.id as student_id, s.user_id, s.student_id as roll_no, u.name as student_name, r.room_number, h.name as hostel_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN hostels h ON s.hostel_id = h.id
  `);

  if (!students.length) {
    console.error('No students found to seed parcels/visitors.');
    process.exit(1);
  }

  const [staff] = await pool.query(`SELECT id, role FROM users WHERE role IN ('admin', 'warden')`);
  const wardenId = staff.find((s) => s.role === 'warden')?.id || staff[0]?.id || 1;

  // Clear existing seeded parcels/visitors to prevent duplicate keys if re-run
  await pool.query('DELETE FROM visitor_logs');
  await pool.query('DELETE FROM visitor_requests');
  await pool.query('DELETE FROM parcel_notifications');
  await pool.query('DELETE FROM parcel_deliveries');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgoStr = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  const primaryStudent = students[0];
  const secondStudent = students[1] || students[0];
  const thirdStudent = students[2] || students[0];

  console.log(`Seeding for Student 1: ${primaryStudent.student_name} (${primaryStudent.roll_no})`);

  // 1. Seed Parcel Deliveries
  const parcels = [
    {
      student_id: primaryStudent.student_id,
      parcel_code: 'PRC-2026-1001',
      courier_name: 'Amazon Prime',
      tracking_number: 'AMZ-IN-88902412',
      parcel_type: 'Electronics',
      sender_name: 'Cloudtail Retail',
      expected_date: todayStr,
      received_at: `${todayStr} 10:15:00`,
      storage_location: 'Rack A - Shelf 3',
      status: 'Received at Hostel',
      collected_at: null,
      collected_by: null,
      verified_by: wardenId,
      remarks: 'Fragile equipment - handle with care',
    },
    {
      student_id: primaryStudent.student_id,
      parcel_code: 'PRC-2026-1002',
      courier_name: 'Blue Dart',
      tracking_number: 'BLU-DEL-991204',
      parcel_type: 'Document / Books',
      sender_name: 'University Publication House',
      expected_date: yesterdayStr,
      received_at: `${yesterdayStr} 14:30:00`,
      storage_location: 'Shelf B - Slot 1',
      status: 'Awaiting Collection',
      collected_at: null,
      collected_by: null,
      verified_by: wardenId,
      remarks: 'Semester textbooks package',
    },
    {
      student_id: primaryStudent.student_id,
      parcel_code: 'PRC-2026-1003',
      courier_name: 'Flipkart Logistics',
      tracking_number: 'FMPC-77192301',
      parcel_type: 'Clothing',
      sender_name: 'Myntra Fashion',
      expected_date: twoDaysAgoStr,
      received_at: `${twoDaysAgoStr} 11:20:00`,
      storage_location: 'Rack C - Shelf 1',
      status: 'Collected',
      collected_at: `${twoDaysAgoStr} 18:45:00`,
      collected_by: primaryStudent.student_name,
      verified_by: wardenId,
      remarks: 'OTP verified by resident',
    },
    {
      student_id: secondStudent.student_id,
      parcel_code: 'PRC-2026-1004',
      courier_name: 'Delhivery',
      tracking_number: 'DLHV-44019283',
      parcel_type: 'Standard Box',
      sender_name: 'Home / Parents',
      expected_date: todayStr,
      received_at: `${todayStr} 09:00:00`,
      storage_location: 'Storage Bay 2',
      status: 'Received at Hostel',
      collected_at: null,
      collected_by: null,
      verified_by: wardenId,
      remarks: 'Perishable homemade sweets. Collect immediately.',
    },
    {
      student_id: thirdStudent.student_id,
      parcel_code: 'PRC-2026-1005',
      courier_name: 'DTDC Express',
      tracking_number: 'DTDC-9923847',
      parcel_type: 'Medicine / Pharma',
      sender_name: 'Apollo Pharmacy',
      expected_date: todayStr,
      received_at: `${todayStr} 11:45:00`,
      storage_location: 'Rack A - Shelf 1',
      status: 'Student Notified',
      collected_at: null,
      collected_by: null,
      verified_by: wardenId,
      remarks: 'Urgent prescription delivery',
    },
  ];

  for (const p of parcels) {
    const [res] = await pool.query(
      `INSERT INTO parcel_deliveries 
       (student_id, parcel_code, courier_name, tracking_number, parcel_type, sender_name, expected_date, received_at, storage_location, status, collected_at, collected_by, verified_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.student_id,
        p.parcel_code,
        p.courier_name,
        p.tracking_number,
        p.parcel_type,
        p.sender_name,
        p.expected_date,
        p.received_at,
        p.storage_location,
        p.status,
        p.collected_at,
        p.collected_by,
        p.verified_by,
        p.remarks,
      ]
    );

    const parcelId = res.insertId;

    // Create notifications for uncollected parcels
    if (p.status !== 'Collected') {
      const msg = `📦 Your parcel (${p.parcel_code}) from ${p.courier_name} has arrived at ${p.storage_location}. Please collect it from the hostel office.`;
      await pool.query(
        `INSERT INTO parcel_notifications (parcel_id, student_id, notification_message, is_read) VALUES (?, ?, ?, ?)`,
        [parcelId, p.student_id, msg, false]
      );

      // Also insert into existing notifications table for user
      const stUser = students.find((s) => s.student_id === p.student_id)?.user_id;
      if (stUser) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
          [stUser, 'Parcel Arrived', msg, 'parcel', '/student/parcels', false]
        );
      }
    }
  }
  console.log(`✓ Seeded ${parcels.length} parcel deliveries and notifications`);

  // 2. Seed Visitor Requests and Logs
  const visitors = [
    {
      student_id: primaryStudent.student_id,
      visitor_name: 'Rajesh Chandra',
      mobile_number: '+91 98450 12345',
      relationship: 'Parent',
      visitor_type: 'Parent',
      visit_date: todayStr,
      expected_arrival: '10:00:00',
      expected_departure: '12:00:00', // Past departure! Overstay alert demo!
      purpose: 'Semester fee discussion & family visit',
      number_of_visitors: 2,
      status: 'Checked In',
      rejection_reason: null,
      reviewed_by: wardenId,
      log: {
        id_proof_type: 'Aadhaar Card',
        id_proof_reference: 'XXXX-XXXX-4812',
        vehicle_number: 'AP 39 BK 2049',
        check_in_time: `${todayStr} 10:10:00`,
        check_out_time: null,
        verified_by: wardenId,
        remarks: 'Admitted with spouse. Gate pass #GP-102 issued.',
      },
    },
    {
      student_id: primaryStudent.student_id,
      visitor_name: 'Suresh Kumar',
      mobile_number: '+91 94401 56789',
      relationship: 'Friend',
      visitor_type: 'Friend',
      visit_date: todayStr,
      expected_arrival: '16:00:00',
      expected_departure: '18:30:00',
      purpose: 'Project group study and lab kit handover',
      number_of_visitors: 1,
      status: 'Approved',
      rejection_reason: null,
      reviewed_by: wardenId,
      log: null,
    },
    {
      student_id: primaryStudent.student_id,
      visitor_name: 'Vijay Aircon Tech',
      mobile_number: '+91 91234 56789',
      relationship: 'Service Provider',
      visitor_type: 'Service Provider',
      visit_date: yesterdayStr,
      expected_arrival: '14:00:00',
      expected_departure: '16:00:00',
      purpose: 'Room AC filter replacement and maintenance',
      number_of_visitors: 1,
      status: 'Checked Out',
      rejection_reason: null,
      reviewed_by: wardenId,
      log: {
        id_proof_type: 'Driving License',
        id_proof_reference: 'DL-KA-05-9981',
        vehicle_number: 'KA 05 MN 1204',
        check_in_time: `${yesterdayStr} 14:05:00`,
        check_out_time: `${yesterdayStr} 15:45:00`,
        verified_by: wardenId,
        remarks: 'Maintenance completed satisfactorily.',
      },
    },
    {
      student_id: secondStudent.student_id,
      visitor_name: 'Karan Mehra',
      mobile_number: '+91 99887 76655',
      relationship: 'Friend',
      visitor_type: 'Friend',
      visit_date: todayStr,
      expected_arrival: '19:00:00',
      expected_departure: '21:00:00',
      purpose: 'Personal visit',
      number_of_visitors: 3,
      status: 'Pending',
      rejection_reason: null,
      reviewed_by: null,
      log: null,
    },
    {
      student_id: thirdStudent.student_id,
      visitor_name: 'Ramesh Patel',
      mobile_number: '+91 98765 43210',
      relationship: 'Relative',
      visitor_type: 'Relative',
      visit_date: twoDaysAgoStr,
      expected_arrival: '22:00:00',
      expected_departure: '23:30:00',
      purpose: 'Late night drop off',
      number_of_visitors: 1,
      status: 'Rejected',
      rejection_reason: 'Hostel visiting hours end strictly at 20:00 PM as per campus code of conduct.',
      reviewed_by: wardenId,
      log: null,
    },
  ];

  for (const v of visitors) {
    const [res] = await pool.query(
      `INSERT INTO visitor_requests 
       (student_id, visitor_name, mobile_number, relationship, visitor_type, visit_date, expected_arrival, expected_departure, purpose, number_of_visitors, status, rejection_reason, reviewed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        v.student_id,
        v.visitor_name,
        v.mobile_number,
        v.relationship,
        v.visitor_type,
        v.visit_date,
        v.expected_arrival,
        v.expected_departure,
        v.purpose,
        v.number_of_visitors,
        v.status,
        v.rejection_reason,
        v.reviewed_by,
      ]
    );

    const requestId = res.insertId;

    if (v.log) {
      await pool.query(
        `INSERT INTO visitor_logs 
         (visitor_request_id, id_proof_type, id_proof_reference, vehicle_number, check_in_time, check_out_time, verified_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          v.log.id_proof_type,
          v.log.id_proof_reference,
          v.log.vehicle_number,
          v.log.check_in_time,
          v.log.check_out_time,
          v.log.verified_by,
          v.log.remarks,
        ]
      );
    }

    // Insert user notification
    const stUser = students.find((s) => s.student_id === v.student_id)?.user_id;
    if (stUser) {
      let notifTitle = '';
      let notifMsg = '';
      if (v.status === 'Approved') {
        notifTitle = 'Visitor Request Approved';
        notifMsg = `🚪 Your visitor request for ${v.visitor_name} on ${v.visit_date} has been approved by the Warden.`;
      } else if (v.status === 'Rejected') {
        notifTitle = 'Visitor Request Rejected';
        notifMsg = `❌ Your visitor request for ${v.visitor_name} was rejected. Reason: ${v.rejection_reason}`;
      } else if (v.status === 'Checked In') {
        notifTitle = 'Visitor Checked In';
        notifMsg = `🟢 Your visitor ${v.visitor_name} has arrived and checked in at the hostel reception.`;
      }

      if (notifTitle) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`,
          [stUser, notifTitle, notifMsg, 'visitor', '/student/visitors', false]
        );
      }
    }
  }

  console.log(`✓ Seeded ${visitors.length} visitor requests and logs`);
  console.log('--- Seed Finished Successfully! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
