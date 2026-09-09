import mongoose from 'mongoose';

const allocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    vacateDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Transferred', 'Vacated'],
      default: 'Active',
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

const Allocation = mongoose.model('Allocation', allocationSchema);
export default Allocation;
