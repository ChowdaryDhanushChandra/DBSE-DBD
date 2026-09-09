import Allocation from '../models/Allocation.js';
import Room from '../models/Room.js';
import Student from '../models/Student.js';
import Hostel from '../models/Hostel.js';
import Notification from '../models/Notification.js';

// @desc    Get all allocations
// @route   GET /api/allocations
// @access  Private (Admin / Warden)
export const getAllocations = async (req, res, next) => {
  try {
    const { status, hostelId, studentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;
    if (studentId) query.studentId = studentId;

    const allocations = await Allocation.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('hostelId', 'name location gender')
      .populate('roomId', 'roomNumber floor roomType capacity currentOccupancy')
      .sort({ allocationDate: -1 });

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

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found',
      });
    }

    // Check room status & capacity
    if (room.status === 'Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Cannot allocate student to a room undergoing maintenance.',
      });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is fully occupied (${room.currentOccupancy}/${room.capacity}).`,
      });
    }

    // Check gender matching
    if (hostel.gender !== 'Co-ed') {
      if (hostel.gender === 'Boys' && student.gender !== 'Male') {
        return res.status(400).json({
          success: false,
          message: 'Cannot allocate non-male student to Boys Hostel.',
        });
      }
      if (hostel.gender === 'Girls' && student.gender !== 'Female') {
        return res.status(400).json({
          success: false,
          message: 'Cannot allocate non-female student to Girls Hostel.',
        });
      }
    }

    // If student already has an active room, handle transfer or deallocate old room
    if (student.roomId) {
      const oldRoom = await Room.findById(student.roomId);
      if (oldRoom && oldRoom.currentOccupancy > 0) {
        oldRoom.currentOccupancy -= 1;
        await oldRoom.save();
      }

      await Allocation.updateMany(
        { studentId: student._id, status: 'Active' },
        { status: 'Transferred', vacateDate: new Date() }
      );
    }

    // Update room occupancy
    room.currentOccupancy += 1;
    await room.save();

    // Update student
    student.hostelId = hostelId;
    student.roomId = roomId;
    await student.save();

    // Create allocation record
    const allocation = await Allocation.create({
      studentId: student._id,
      hostelId,
      roomId,
      allocationDate: new Date(),
      status: 'Active',
      remarks: remarks || 'Allocated by administration',
    });

    // Notify student
    await Notification.create({
      userId: student.userId,
      title: 'Room Allocated!',
      message: `You have been allocated Room ${room.roomNumber} in ${hostel.name}.`,
      type: 'room',
      link: '/student/my-room',
    });

    res.status(201).json({
      success: true,
      message: `Student successfully allocated to Room ${room.roomNumber}`,
      data: allocation,
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
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation record not found',
      });
    }

    // Decrement room occupancy
    const room = await Room.findById(allocation.roomId);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
    }

    // Clear student assigned room
    const student = await Student.findById(allocation.studentId);
    if (student) {
      student.hostelId = null;
      student.roomId = null;
      await student.save();

      // Notify student
      await Notification.create({
        userId: student.userId,
        title: 'Room Deallocated',
        message: 'Your room allocation has been vacated or revoked.',
        type: 'room',
        link: '/student/dashboard',
      });
    }

    allocation.status = 'Vacated';
    allocation.vacateDate = new Date();
    await allocation.save();

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
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation record not found',
      });
    }

    const newRoom = await Room.findById(newRoomId);
    if (!newRoom) {
      return res.status(404).json({
        success: false,
        message: 'New room not found',
      });
    }

    if (newRoom.currentOccupancy >= newRoom.capacity) {
      return res.status(400).json({
        success: false,
        message: `New room ${newRoom.roomNumber} is already full.`,
      });
    }

    // Decrement previous room occupancy
    const oldRoom = await Room.findById(allocation.roomId);
    if (oldRoom && oldRoom.currentOccupancy > 0) {
      oldRoom.currentOccupancy -= 1;
      await oldRoom.save();
    }

    // Increment new room occupancy
    newRoom.currentOccupancy += 1;
    await newRoom.save();

    // Mark previous allocation as Transferred
    allocation.status = 'Transferred';
    allocation.vacateDate = new Date();
    await allocation.save();

    // Create new allocation
    const targetHostelId = newHostelId || newRoom.hostelId;
    const newAllocation = await Allocation.create({
      studentId: allocation.studentId,
      hostelId: targetHostelId,
      roomId: newRoom._id,
      allocationDate: new Date(),
      status: 'Active',
      remarks: remarks || 'Room transfer approved',
    });

    // Update student
    const student = await Student.findById(allocation.studentId);
    if (student) {
      student.hostelId = targetHostelId;
      student.roomId = newRoom._id;
      await student.save();

      await Notification.create({
        userId: student.userId,
        title: 'Room Transfer Complete',
        message: `You have been transferred to Room ${newRoom.roomNumber}.`,
        type: 'room',
        link: '/student/my-room',
      });
    }

    res.status(200).json({
      success: true,
      message: `Transferred to Room ${newRoom.roomNumber} successfully`,
      data: newAllocation,
    });
  } catch (error) {
    next(error);
  }
};
