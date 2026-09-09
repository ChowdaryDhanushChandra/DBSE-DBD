import Hostel from '../models/Hostel.js';
import Room from '../models/Room.js';
import Student from '../models/Student.js';

// @desc    Get all hostels with aggregated statistics
// @route   GET /api/hostels
// @access  Public / Authenticated
export const getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().populate('wardenId', 'name email phone profileImage');

    // Attach real-time computed room and occupancy stats for each hostel
    const hostelData = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id });
        const totalRooms = rooms.length;
        const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const currentOccupancy = rooms.reduce((acc, r) => acc + r.currentOccupancy, 0);
        const availableBeds = Math.max(0, totalCapacity - currentOccupancy);

        const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

        return {
          ...hostel.toObject(),
          totalRooms,
          totalCapacity,
          currentOccupancy,
          availableBeds,
          occupancyRate,
        };
      })
    );

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
    const hostel = await Hostel.findById(req.params.id).populate('wardenId', 'name email phone');
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found',
      });
    }

    const rooms = await Room.find({ hostelId: hostel._id }).sort({ roomNumber: 1 });
    const students = await Student.find({ hostelId: hostel._id })
      .populate('userId', 'name email phone profileImage')
      .populate('roomId', 'roomNumber');

    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const currentOccupancy = rooms.reduce((acc, r) => acc + r.currentOccupancy, 0);

    res.status(200).json({
      success: true,
      data: {
        ...hostel.toObject(),
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

    const existingHostel = await Hostel.findOne({ name });
    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: 'A hostel with this name already exists',
      });
    }

    const hostel = await Hostel.create({
      name,
      location,
      gender,
      totalRooms: totalRooms || 0,
      description,
      wardenId: wardenId || null,
      contactPhone,
      image: image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    });

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
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hostel updated successfully',
      data: hostel,
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
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found',
      });
    }

    // Check if any rooms exist
    const roomsCount = await Room.countDocuments({ hostelId: hostel._id });
    if (roomsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hostel with active rooms. Please delete or reassign rooms first.',
      });
    }

    await Hostel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hostel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
