import pool from '../config/database.js';
import { formatAllocation, withTransaction } from '../utils/mysqlHelper.js';

// @desc    Get all allocations
// @route   GET /api/allocations
// @access  Private (Admin / Warden)
export const getAllocations = async (req, res, next) => {
  try {
    const { status, hostelId, studentId } = req.query;

    let sql = `
      SELECT a.*,
             h.name AS hostel_name, h.location AS hostel_location,
             r.room_number, r.floor_number, r.room_type, r.capacity, r.current_occupancy,
             s.student_id AS student_roll, s.course, s.department,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN hostels h ON a.hostel_id = h.id
      JOIN rooms r ON a.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (hostelId) {
      sql += ' AND a.hostel_id = ?';
      params.push(hostelId);
    }
    if (studentId) {
      sql += ' AND a.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY a.allocation_date DESC';

    const [rows] = await pool.execute(sql, params);
    const allocations = rows.map(formatAllocation);

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate room to student
// @route   POST /api/allocations
// @access  Private (Admin / Warden)
export const allocateRoom = async (req, res, next) => {
  try {
    const { studentId, hostelId, roomId, remarks } = req.body;

    const [students] = await pool.execute(
      'SELECT s.*, u.id AS user_id FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [studentId]
    );
    if (!students.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];

    const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!rooms.length) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = rooms[0];

    const [hostels] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [hostelId]);
    if (!hostels.length) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }
    const hostel = hostels[0];

    if (room.status === 'Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Cannot allocate student to a room undergoing maintenance.',
      });
    }

    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.room_number} is fully occupied (${room.current_occupancy}/${room.capacity}).`,
      });
    }

    // Gender check
    if (hostel.gender !== 'Co-ed') {
      if (hostel.gender === 'Boys' && student.gender !== 'Male') {
        return res.status(400).json({ success: false, message: 'Cannot allocate non-male student to Boys Hostel.' });
      }
      if (hostel.gender === 'Girls' && student.gender !== 'Female') {
        return res.status(400).json({ success: false, message: 'Cannot allocate non-female student to Girls Hostel.' });
      }
    }

    const allocationId = await withTransaction(async (conn) => {
      // If student was already in a room, decrement that room
      if (student.room_id) {
        const [oldRooms] = await conn.execute('SELECT * FROM rooms WHERE id = ?', [student.room_id]);
        if (oldRooms.length && oldRooms[0].current_occupancy > 0) {
          const oldOcc = oldRooms[0].current_occupancy - 1;
          const oldStat = oldOcc === 0 ? 'Available' : 'Partially Occupied';
          await conn.execute('UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?', [oldOcc, oldStat, student.room_id]);
        }

        await conn.execute(
          "UPDATE allocations SET status = 'Transferred', vacate_date = CURDATE() WHERE student_id = ? AND status = 'Active'",
          [student.id]
        );
      }

      // Increment new room
      const newOcc = room.current_occupancy + 1;
      const newStat = newOcc >= room.capacity ? 'Fully Occupied' : 'Partially Occupied';
      await conn.execute('UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?', [newOcc, newStat, room.id]);

      // Update student record
      await conn.execute('UPDATE students SET hostel_id = ?, room_id = ? WHERE id = ?', [hostelId, roomId, student.id]);

      // Create allocation record
      const [allocResult] = await conn.execute(
        `INSERT INTO allocations (student_id, hostel_id, room_id, allocation_date, status, remarks)
         VALUES (?, ?, ?, CURDATE(), 'Active', ?)`,
        [student.id, hostelId, roomId, remarks || 'Allocated by administration']
      );

      // Notification
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'room', '/student/my-room')`,
        [student.user_id, 'Room Allocated!', `You have been allocated Room ${room.room_number} in ${hostel.name}.`]
      );

      return allocResult.insertId;
    });

    const [createdRows] = await pool.execute(`
      SELECT a.*,
             h.name AS hostel_name, h.location AS hostel_location,
             r.room_number, r.floor_number, r.room_type, r.capacity, r.current_occupancy,
             s.student_id AS student_roll, s.course, s.department,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN hostels h ON a.hostel_id = h.id
      JOIN rooms r ON a.room_id = r.id
      WHERE a.id = ?
    `, [allocationId]);

    res.status(201).json({
      success: true,
      message: `Student successfully allocated to Room ${room.room_number}`,
      data: formatAllocation(createdRows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deallocate / Vacate student from room
// @route   DELETE /api/allocations/:id
// @access  Private (Admin / Warden)
export const deallocateRoom = async (req, res, next) => {
  try {
    const [allocations] = await pool.execute('SELECT * FROM allocations WHERE id = ?', [req.params.id]);
    if (!allocations.length) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }
    const allocation = allocations[0];

    await withTransaction(async (conn) => {
      // Decrement room occupancy
      const [rooms] = await conn.execute('SELECT * FROM rooms WHERE id = ?', [allocation.room_id]);
      if (rooms.length && rooms[0].current_occupancy > 0) {
        const newOcc = rooms[0].current_occupancy - 1;
        const newStat = newOcc === 0 ? 'Available' : 'Partially Occupied';
        await conn.execute('UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?', [newOcc, newStat, allocation.room_id]);
      }

      // Clear student's room
      const [students] = await conn.execute('SELECT user_id FROM students WHERE id = ?', [allocation.student_id]);
      await conn.execute('UPDATE students SET hostel_id = NULL, room_id = NULL WHERE id = ?', [allocation.student_id]);

      if (students.length) {
        await conn.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, 'Room Deallocated', 'Your room allocation has been vacated or revoked.', 'room', '/student/dashboard')`,
          [students[0].user_id]
        );
      }

      // Update allocation status
      await conn.execute(
        "UPDATE allocations SET status = 'Vacated', vacate_date = CURDATE() WHERE id = ?",
        [allocation.id]
      );
    });

    res.status(200).json({
      success: true,
      message: 'Room deallocated successfully and bed freed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change student room
// @route   PUT /api/allocations/:id
// @access  Private (Admin / Warden)
export const changeRoom = async (req, res, next) => {
  try {
    const { newRoomId, newHostelId, remarks } = req.body;

    const [allocations] = await pool.execute('SELECT * FROM allocations WHERE id = ?', [req.params.id]);
    if (!allocations.length) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }
    const allocation = allocations[0];

    const [newRooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [newRoomId]);
    if (!newRooms.length) {
      return res.status(404).json({ success: false, message: 'New room not found' });
    }
    const newRoom = newRooms[0];

    if (newRoom.current_occupancy >= newRoom.capacity) {
      return res.status(400).json({
        success: false,
        message: `New room ${newRoom.room_number} is already full.`,
      });
    }

    const targetHostelId = newHostelId || newRoom.hostel_id;

    const newAllocId = await withTransaction(async (conn) => {
      // 1. Decrement old room
      const [oldRooms] = await conn.execute('SELECT * FROM rooms WHERE id = ?', [allocation.room_id]);
      if (oldRooms.length && oldRooms[0].current_occupancy > 0) {
        const oldOcc = oldRooms[0].current_occupancy - 1;
        const oldStat = oldOcc === 0 ? 'Available' : 'Partially Occupied';
        await conn.execute('UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?', [oldOcc, oldStat, allocation.room_id]);
      }

      // 2. Increment new room
      const nextOcc = newRoom.current_occupancy + 1;
      const nextStat = nextOcc >= newRoom.capacity ? 'Fully Occupied' : 'Partially Occupied';
      await conn.execute('UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?', [nextOcc, nextStat, newRoom.id]);

      // 3. Mark old allocation transferred
      await conn.execute(
        "UPDATE allocations SET status = 'Transferred', vacate_date = CURDATE() WHERE id = ?",
        [allocation.id]
      );

      // 4. Create new allocation
      const [newAlloc] = await conn.execute(
        `INSERT INTO allocations (student_id, hostel_id, room_id, allocation_date, status, remarks)
         VALUES (?, ?, ?, CURDATE(), 'Active', ?)`,
        [allocation.student_id, targetHostelId, newRoom.id, remarks || 'Room transfer approved']
      );

      // 5. Update student
      await conn.execute('UPDATE students SET hostel_id = ?, room_id = ? WHERE id = ?', [targetHostelId, newRoom.id, allocation.student_id]);

      // 6. Notify student
      const [students] = await conn.execute('SELECT user_id FROM students WHERE id = ?', [allocation.student_id]);
      if (students.length) {
        await conn.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, 'Room Transfer Complete', ?, 'room', '/student/my-room')`,
          [students[0].user_id, `You have been transferred to Room ${newRoom.room_number}.`]
        );
      }

      return newAlloc.insertId;
    });

    const [createdRows] = await pool.execute(`
      SELECT a.*,
             h.name AS hostel_name, h.location AS hostel_location,
             r.room_number, r.floor_number, r.room_type, r.capacity, r.current_occupancy,
             s.student_id AS student_roll, s.course, s.department,
             u.id AS user_id, u.name AS student_name, u.email AS student_email
      FROM allocations a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN hostels h ON a.hostel_id = h.id
      JOIN rooms r ON a.room_id = r.id
      WHERE a.id = ?
    `, [newAllocId]);

    res.status(200).json({
      success: true,
      message: `Transferred to Room ${newRoom.room_number} successfully`,
      data: formatAllocation(createdRows[0]),
    });
  } catch (error) {
    next(error);
  }
};
