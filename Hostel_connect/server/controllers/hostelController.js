import pool from '../config/database.js';
import { formatHostel, formatRoom, formatStudent } from '../utils/mysqlHelper.js';

// @desc    Get all hostels with aggregated statistics
// @route   GET /api/hostels
// @access  Public / Authenticated
export const getHostels = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT h.*,
             u.name AS warden_name, u.email AS warden_email,
             COUNT(r.id) AS calculated_rooms,
             COALESCE(SUM(r.capacity), 0) AS total_capacity,
             COALESCE(SUM(r.current_occupancy), 0) AS calculated_occupancy
      FROM hostels h
      LEFT JOIN users u ON h.warden_id = u.id
      LEFT JOIN rooms r ON r.hostel_id = h.id
      GROUP BY h.id, u.name, u.email
      ORDER BY h.id ASC
    `);

    const hostelData = rows.map((row) => {
      const base = formatHostel(row);
      const totalCapacity = Number(row.total_capacity || 0);
      const currentOccupancy = Number(row.calculated_occupancy || 0);
      const availableBeds = Math.max(0, totalCapacity - currentOccupancy);
      const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

      return {
        ...base,
        totalRooms: Number(row.calculated_rooms || row.total_rooms || 0),
        totalCapacity,
        currentOccupancy,
        availableBeds,
        occupancyRate,
      };
    });

    res.status(200).json({
      success: true,
      data: hostelData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hostel with rooms and students
// @route   GET /api/hostels/:id
// @access  Private
export const getHostelById = async (req, res, next) => {
  try {
    const [hostels] = await pool.execute(`
      SELECT h.*, u.name AS warden_name, u.email AS warden_email, u.phone AS warden_phone
      FROM hostels h
      LEFT JOIN users u ON h.warden_id = u.id
      WHERE h.id = ?
    `, [req.params.id]);

    if (!hostels.length) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found',
      });
    }

    const hostel = formatHostel(hostels[0]);

    // Fetch rooms
    const [roomRows] = await pool.execute(
      'SELECT * FROM rooms WHERE hostel_id = ? ORDER BY room_number ASC',
      [req.params.id]
    );
    const rooms = roomRows.map(r => formatRoom({ ...r, hostel_id: hostel.id, hostel_name: hostel.name }));

    // Fetch students
    const [studentRows] = await pool.execute(`
      SELECT s.*, u.name, u.email, u.phone AS user_phone, u.profile_image,
             r.room_number, r.floor_number, r.room_type, r.capacity AS room_capacity, r.current_occupancy AS room_occupancy
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.hostel_id = ?
      ORDER BY s.id ASC
    `, [req.params.id]);
    const students = studentRows.map(s => formatStudent({ ...s, hostel_id: hostel.id, hostel_name: hostel.name }));

    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const currentOccupancy = rooms.reduce((acc, r) => acc + r.currentOccupancy, 0);

    res.status(200).json({
      success: true,
      data: {
        ...hostel,
        totalCapacity,
        currentOccupancy,
        availableBeds: Math.max(0, totalCapacity - currentOccupancy),
        rooms,
        students,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hostel
// @route   POST /api/hostels
// @access  Private (Admin)
export const createHostel = async (req, res, next) => {
  try {
    const { name, location, gender, totalRooms, description, wardenId, contactPhone, image } = req.body;

    const [existing] = await pool.execute('SELECT id FROM hostels WHERE name = ?', [name]);
    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: 'A hostel with this name already exists',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO hostels (name, location, gender, total_rooms, description, warden_id, contact_phone, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location || 'Main Campus',
        gender || 'Boys',
        Number(totalRooms || 0),
        description || '',
        wardenId ? Number(wardenId) : null,
        contactPhone || '',
        image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      ]
    );

    const [inserted] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [result.insertId]);
    const hostel = formatHostel(inserted[0]);

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      data: hostel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (Admin)
export const updateHostel = async (req, res, next) => {
  try {
    const { name, location, gender, totalRooms, description, wardenId, contactPhone, image } = req.body;

    await pool.execute(
      `UPDATE hostels SET
       name = COALESCE(?, name),
       location = COALESCE(?, location),
       gender = COALESCE(?, gender),
       total_rooms = COALESCE(?, total_rooms),
       description = COALESCE(?, description),
       warden_id = ?,
       contact_phone = COALESCE(?, contact_phone),
       image = COALESCE(?, image)
       WHERE id = ?`,
      [
        name || null,
        location || null,
        gender || null,
        totalRooms !== undefined ? Number(totalRooms) : null,
        description !== undefined ? description : null,
        wardenId !== undefined ? (wardenId ? Number(wardenId) : null) : null,
        contactPhone || null,
        image || null,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
    if (!updated.length) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Hostel updated successfully',
      data: formatHostel(updated[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (Admin)
export const deleteHostel = async (req, res, next) => {
  try {
    const [rooms] = await pool.execute('SELECT id FROM rooms WHERE hostel_id = ?', [req.params.id]);
    if (rooms.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hostel with active rooms. Please delete or reassign rooms first.',
      });
    }

    const [result] = await pool.execute('DELETE FROM hostels WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Hostel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
