import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

// @desc    Get all fees with filters
// @route   GET /api/fees
// @access  Private
export const getFees = async (req, res, next) => {
  try {
    const { paymentStatus, feeType, studentId, search } = req.query;
    const query = {};

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (feeType) query.feeType = feeType;
    if (studentId) query.studentId = studentId;

    // Check overdue dates automatically for pending fees
    const pendingFees = await Fee.find({ paymentStatus: 'Pending' });
    const now = new Date();
    for (const f of pendingFees) {
      if (now > f.dueDate) {
        f.paymentStatus = 'Overdue';
        await f.save();
      }
    }

    const fees = await Fee.find(query)
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'hostelId', select: 'name' },
          { path: 'roomId', select: 'roomNumber' },
        ],
      })
      .sort({ createdAt: -1 });

    // Financial summaries
    const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
    const totalCollected = fees
      .filter((f) => f.paymentStatus === 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees
      .filter((f) => f.paymentStatus === 'Pending' || f.paymentStatus === 'Overdue')
      .reduce((acc, f) => acc + f.amount, 0);
    const overdueCount = fees.filter((f) => f.paymentStatus === 'Overdue').length;

    res.status(200).json({
      success: true,
      count: fees.length,
      summary: {
        totalBilled,
        totalCollected,
        totalPending,
        overdueCount,
      },
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee records for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Private
export const getStudentFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ dueDate: 1 });

    const totalPaid = fees
      .filter((f) => f.paymentStatus === 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees
      .filter((f) => f.paymentStatus !== 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);

    res.status(200).json({
      success: true,
      summary: { totalPaid, totalPending },
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee invoice for student or all students
// @route   POST /api/fees
// @access  Private (Admin)
export const createFee = async (req, res, next) => {
  try {
    const { studentId, feeType, amount, dueDate, remarks, academicSemester, targetAll } = req.body;

    if (targetAll) {
      // Bulk bill creation for all active students
      const students = await Student.find({ status: 'Active' });
      const createdFees = [];

      for (const st of students) {
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const fee = await Fee.create({
          studentId: st._id,
          feeType,
          amount: Number(amount),
          dueDate: new Date(dueDate),
          invoiceNumber,
          academicSemester: academicSemester || 'Current Semester',
          remarks: remarks || '',
          paymentStatus: 'Pending',
        });
        createdFees.push(fee);

        // Notify student
        await Notification.create({
          userId: st.userId,
          title: `New Fee Invoice: ${feeType}`,
          message: `An invoice of ₹${amount} for ${feeType} is generated. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
          type: 'fee',
          link: '/student/fees',
        });
      }

      return res.status(201).json({
        success: true,
        message: `Invoices generated for ${createdFees.length} students.`,
        count: createdFees.length,
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const fee = await Fee.create({
      studentId,
      feeType,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      invoiceNumber,
      academicSemester: academicSemester || 'Current Semester',
      remarks: remarks || '',
      paymentStatus: 'Pending',
    });

    // Notify student
    await Notification.create({
      userId: student.userId,
      title: `Fee Due: ${feeType}`,
      message: `An invoice of ₹${amount} has been billed to your account. Due: ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'fee',
      link: '/student/fees',
    });

    res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee record or record student payment
// @route   PUT /api/fees/:id
// @access  Private
export const updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    const { paymentStatus, paymentMethod, transactionId, amount, dueDate, remarks } = req.body;

    if (paymentStatus === 'Paid') {
      fee.paymentStatus = 'Paid';
      fee.paymentDate = new Date();
      fee.paymentMethod = paymentMethod || 'Online / UPI';
      fee.transactionId = transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Notify student
      const student = await Student.findById(fee.studentId);
      if (student) {
        await Notification.create({
          userId: student.userId,
          title: 'Payment Successful',
          message: `Payment of ₹${fee.amount} for ${fee.feeType} confirmed. Transaction ID: ${fee.transactionId}`,
          type: 'fee',
          link: '/student/fees',
        });
      }
    } else if (paymentStatus) {
      fee.paymentStatus = paymentStatus;
    }

    if (amount) fee.amount = Number(amount);
    if (dueDate) fee.dueDate = new Date(dueDate);
    if (remarks !== undefined) fee.remarks = remarks;

    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed receipt data for printing/downloading
// @route   GET /api/fees/:id/receipt
// @access  Private
export const getReceipt = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'hostelId', select: 'name location' },
          { path: 'roomId', select: 'roomNumber' },
        ],
      });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};
