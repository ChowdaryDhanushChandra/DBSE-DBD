import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    documentType: {
      type: String,
      enum: [
        'Student ID',
        'Aadhaar / Identity Document',
        'Admission Document',
        'Medical Certificate',
        'Other Hostel Documents',
      ],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
