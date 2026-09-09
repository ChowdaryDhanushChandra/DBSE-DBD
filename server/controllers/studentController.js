import Student from '../models/Student.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Allocation from '../models/Allocation.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Document from '../models/Document.js';

// @desc    Get all students with search, filter, and pagination
// @route   GET /api/students
// @access  Private (Admin / Warden)
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      course,
      year,
      gender,
      status,
      hostelId,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (course) query.course = course;
    if (year) query.year = year;
    if (gender) query.gender = gender;
    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;

    let studentQuery = Student.find(query)
      .populate('userId', 'name email profileImage isActive phone')
      .populate('hostelId', 'name location gender')
      .populate('roomId', 'roomNumber floor roomType');

    // If search keyword provided, we need to match user name or studentId or phone
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map((u) => u._id);

      studentQuery = studentQuery.where({
        $or: [
          { userId: { $in: userIds } },
          { studentId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const total = await Student.countDocuments(studentQuery.getFilter());
    const students = await studentQuery
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with room, fees, complaints, documents
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email profileImage isActive phone role createdAt')
      .populate('hostelId')
      .populate('roomId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Fetch related records for comprehensive profile view
    const allocations = await Allocation.find({ studentId: student._id })
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber floor')
      .sort({ allocationDate: -1 });

    const fees = await Fee.find({ studentId: student._id }).sort({ dueDate: -1 });
    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });
    const documents = await Document.find({ studentId: student._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        allocations,
        fees,
        complaints,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student manually by Admin
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      studentId,
      course,
      department,
      year,
      gender,
      phone,
      guardianName,
      guardianPhone,
      address,
      hostelId,
      roomId,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const finalStudentId = studentId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      name,
      email,
      password: password || 'Student@123',
      role: 'student',
      phone,
    });

    const student = await Student.create({
      userId: user._id,
      studentId: finalStudentId,
      course: course || 'Computer Science Engineering',
      department: department || 'Engineering',
      year: year || '1st Year',
      gender: gender || 'Male',
      phone,
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || phone,
      address: address || 'Campus Dorms',
      hostelId: hostelId || null,
      roomId: roomId || null,
    });

    // If roomId was assigned directly, update room occupancy
    if (roomId) {
      const room = await Room.findById(roomId);
      if (room && room.currentOccupancy < room.capacity) {
        room.currentOccupancy += 1;
        await room.save();

        await Allocation.create({
          studentId: student._id,
          hostelId: hostelId || room.hostelId,
          roomId: room._id,
          allocationDate: new Date(),
          status: 'Active',
          remarks: 'Allocated during student creation',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin / Warden)
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const {
      name,
      email,
      phone,
      course,
      department,
      year,
      gender,
      guardianName,
      guardianPhone,
      address,
      status,
    } = req.body;

    // Update student fields
    if (course) student.course = course;
    if (department) student.department = department;
    if (year) student.year = year;
    if (gender) student.gender = gender;
    if (phone) student.phone = phone;
    if (guardianName) student.guardianName = guardianName;
    if (guardianPhone) student.guardianPhone = guardianPhone;
    if (address) student.address = address;
    if (status) student.status = status;

    await student.save();

    // Update associated user if name, email, or phone changed
    const user = await User.findById(student.userId);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      await user.save();
    }

    const updated = await Student.findById(student._id)
      .populate('userId', 'name email profileImage isActive phone')
      .populate('hostelId')
      .populate('roomId');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // If student had a room, decrement occupancy
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room && room.currentOccupancy > 0) {
        room.currentOccupancy -= 1;
        await room.save();
      }
    }

    // Remove active allocations
    await Allocation.updateMany({ studentId: student._id, status: 'Active' }, { status: 'Vacated', vacateDate: new Date() });

    // Remove associated user
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(student._id);

    res.status(200).json({
      success: true,
      message: 'Student and user account removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
