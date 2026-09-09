import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    feeType: {
      type: String,
      enum: ['Hostel Fee', 'Mess Fee', 'Maintenance Fee', 'Other Fees'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Online / UPI', 'Credit / Debit Card', 'Net Banking', 'Cash', 'None'],
      default: 'None',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    academicSemester: {
      type: String,
      default: 'Fall 2024',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helper to auto-update Overdue status if due date passed and not paid
feeSchema.methods.checkOverdue = function () {
  if (this.paymentStatus === 'Pending' && new Date() > this.dueDate) {
    this.paymentStatus = 'Overdue';
  }
  return this.paymentStatus;
};

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
