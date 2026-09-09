import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the complaint'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electricity', 'Water', 'Cleanliness', 'Maintenance', 'Food', 'Internet', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed description of the issue'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'In Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Submitted',
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      default: null,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    timeline: [timelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to add initial timeline event when created
complaintSchema.pre('save', function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: 'Submitted',
      note: 'Complaint submitted by student.',
      updatedAt: new Date(),
    });
  }
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
