import Room from '../models/Room.js';
import Hostel from '../models/Hostel.js';
import Student from '../models/Student.js';

// @desc    Get all rooms with filter options
// @route   GET /api/rooms
// @access  Private / Public
export const getRooms = async (req, res, next) => {
  try {
    const { hostelId, floor, roomType, status, availableOnly } = req.query;
    const query = {};

    if (hostelId) query.hostelId = hostelId;
    if (floor) query.floor = Number(floor);
    if (roomType) query.roomType = roomType;
    if (status) query.status = status;

    if (availableOnly === 'true') {
      query.status = { $in: ['Available', 'Partially Occupied'] };
    }

    const rooms = await Room.find(query)
      .populate('hostelId', 'name gender location')
      .sort({ floor: 1, roomNumber: 1 });

    // Populate students currently in each room
    const roomsWithStudents = await Promise.all(
      rooms.map(async (room) => {
        const students = await Student.find({ roomId: room._id })
          .populate('userId', 'name email phone profileImage');
        return {
          ...room.toObject(),
          students,
          availableBeds: Math.max(0, room.capacity - room.currentOccupancy),
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
    const room = await Room.findById(req.params.id).populate('hostelId');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const students = await Student.find({ roomId: room._id })
      .populate('userId', 'name email phone profileImage');

    res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        students,
        availableBeds: Math.max(0, room.capacity - room.currentOccupancy),
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
    const { hostelId, roomNumber, floor, roomType, capacity, pricePerSemester, status } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Selected hostel does not exist',
      });
    }

    const existingRoom = await Room.findOne({ hostelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomNumber} already exists in ${hostel.name}`,
      });
    }

    const room = await Room.create({
      hostelId,
      roomNumber,
      floor: floor || 1,
      roomType: roomType || 'Double',
      capacity: capacity || 2,
      pricePerSemester: pricePerSemester || 35000,
      status: status || 'Available',
    });

    // Update hostel total rooms
    await Hostel.findByIdAndUpdate(hostelId, { $inc: { totalRooms: 1 } });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
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
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const { roomNumber, floor, roomType, capacity, status, pricePerSemester } = req.body;

    if (capacity && capacity < room.currentOccupancy) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than current occupancy (${room.currentOccupancy})`,
      });
    }

    if (roomNumber) room.roomNumber = roomNumber;
    if (floor !== undefined) room.floor = floor;
    if (roomType) room.roomType = roomType;
    if (capacity) room.capacity = capacity;
    if (status) room.status = status;
    if (pricePerSemester) room.pricePerSemester = pricePerSemester;

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
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
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (room.currentOccupancy > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with assigned students. Deallocate students first.',
      });
    }

    await Hostel.findByIdAndUpdate(room.hostelId, { $inc: { totalRooms: -1 } });
    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
