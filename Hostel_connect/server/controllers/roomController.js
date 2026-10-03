import pool from '../config/database.js';
import { formatRoom, formatStudent, withTransaction } from '../utils/mysqlHelper.js';

// @desc    Get all rooms with filter options
// @route   GET /api/rooms
// @access  Private / Public
export const getRooms = async (req, res, next) => {
  try {
    const { hostelId, floor, roomType, status, availableOnly, category } = req.query;

    let sql = `
      SELECT r.*,
             h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender, h.type AS hostel_type
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND (r.category = ? OR h.type = ?)';
      params.push(category, category);
    }
    if (hostelId) {
      sql += ' AND r.hostel_id = ?';
      params.push(hostelId);
    }
    if (floor !== undefined && floor !== '') {
      sql += ' AND r.floor_number = ?';
      params.push(Number(floor));
    }
    if (roomType) {
      sql += ' AND r.room_type = ?';
      params.push(roomType);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (availableOnly === 'true') {
      sql += " AND r.status IN ('Available', 'Partially Occupied')";
    }

    sql += ' ORDER BY r.floor_number ASC, r.room_number ASC';

    const [roomRows] = await pool.execute(sql, params);

    // Fetch students for these rooms
    const roomsWithStudents = await Promise.all(
      roomRows.map(async (row) => {
        const formatted = formatRoom(row);
        const [studentRows] = await pool.execute(`
          SELECT s.*, u.name, u.email, u.phone AS user_phone, u.profile_image
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE s.room_id = ?
        `, [row.id]);

        const students = studentRows.map(st => formatStudent({ ...st, room_number: row.room_number }));
        return {
          ...formatted,
          students,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: roomsWithStudents.length,
      data: roomsWithStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room with allocated students
// @route   GET /api/rooms/:id
// @access  Private
export const getRoomById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*,
             h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const room = formatRoom(rows[0]);

    const [studentRows] = await pool.execute(`
      SELECT s.*, u.name, u.email, u.phone AS user_phone, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.room_id = ?
    `, [req.params.id]);

    const students = studentRows.map(st => formatStudent({ ...st, room_number: room.roomNumber }));

    res.status(200).json({
      success: true,
      data: {
        ...room,
        students,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin / Warden)
export const createRoom = async (req, res, next) => {
  try {
    const {
      hostelId,
      roomNumber,
      floor,
      roomType,
      capacity,
      pricePerSemester,
      status,
      category = 'hostel',
      imageUrl,
      image_url,
      amenities,
    } = req.body;

    const finalImage = imageUrl || image_url || null;
    const finalAmenities = Array.isArray(amenities) ? amenities.join(', ') : (amenities || null);

    const [hostels] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [hostelId]);
    if (!hostels.length) {
      return res.status(404).json({
        success: false,
        message: 'Selected hostel or PG does not exist',
      });
    }

    const [existingRooms] = await pool.execute(
      'SELECT id FROM rooms WHERE hostel_id = ? AND room_number = ?',
      [hostelId, String(roomNumber).trim()]
    );
    if (existingRooms.length) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomNumber} already exists in ${hostels[0].name}`,
      });
    }

    const initialCap = Number(capacity || 2);
    const initialPrice = Number(pricePerSemester || 35000);
    const floorNum = Number(floor || 1);

    const result = await withTransaction(async (conn) => {
      const [insertRes] = await conn.execute(
        `INSERT INTO rooms (hostel_id, category, room_number, floor_number, room_type, capacity, current_occupancy, status, price_per_semester, image_url, amenities)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [
          hostelId,
          category,
          String(roomNumber).trim(),
          floorNum,
          roomType || 'Double',
          initialCap,
          status || 'Available',
          initialPrice,
          finalImage,
          finalAmenities,
        ]
      );

      // Increment hostel total rooms
      await conn.execute('UPDATE hostels SET total_rooms = total_rooms + 1 WHERE id = ?', [hostelId]);

      return insertRes.insertId;
    });

    const [created] = await pool.execute(`
      SELECT r.*, h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = ?
    `, [result]);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: formatRoom(created[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin / Warden)
export const updateRoom = async (req, res, next) => {
  try {
    const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (!rooms.length) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const currentRoom = rooms[0];
    const {
      roomNumber,
      floor,
      roomType,
      capacity,
      status,
      pricePerSemester,
      category,
      imageUrl,
      image_url,
      amenities,
    } = req.body;

    const finalImage = imageUrl !== undefined ? imageUrl : (image_url !== undefined ? image_url : currentRoom.image_url);
    const finalAmenities = Array.isArray(amenities) ? amenities.join(', ') : (amenities !== undefined ? amenities : currentRoom.amenities);

    const newCapacity = capacity !== undefined ? Number(capacity) : currentRoom.capacity;
    if (newCapacity < currentRoom.current_occupancy) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than current occupancy (${currentRoom.current_occupancy})`,
      });
    }

    // Auto calculate status if not explicitly maintenance
    let newStatus = status || currentRoom.status;
    if (newStatus !== 'Maintenance') {
      if (currentRoom.current_occupancy >= newCapacity) {
        newStatus = 'Fully Occupied';
      } else if (currentRoom.current_occupancy > 0) {
        newStatus = 'Partially Occupied';
      } else {
        newStatus = 'Available';
      }
    }

    await pool.execute(
      `UPDATE rooms SET
       room_number = COALESCE(?, room_number),
       floor_number = COALESCE(?, floor_number),
       room_type = COALESCE(?, room_type),
       capacity = ?,
       status = ?,
       price_per_semester = COALESCE(?, price_per_semester),
       category = COALESCE(?, category),
       image_url = ?,
       amenities = ?
       WHERE id = ?`,
      [
        roomNumber ? String(roomNumber).trim() : null,
        floor !== undefined ? Number(floor) : null,
        roomType || null,
        newCapacity,
        newStatus,
        pricePerSemester !== undefined ? Number(pricePerSemester) : null,
        category || null,
        finalImage,
        finalAmenities,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute(`
      SELECT r.*, h.name AS hostel_name, h.location AS hostel_location, h.gender AS hostel_gender
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: formatRoom(updated[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (!rooms.length) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const room = rooms[0];
    if (room.current_occupancy > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with assigned students. Deallocate students first.',
      });
    }

    await withTransaction(async (conn) => {
      await conn.execute('UPDATE hostels SET total_rooms = GREATEST(0, total_rooms - 1) WHERE id = ?', [room.hostel_id]);
      await conn.execute('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    });

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
