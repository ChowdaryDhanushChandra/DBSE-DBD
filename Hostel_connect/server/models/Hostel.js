import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hostel name'],
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Boys', 'Girls', 'Co-ed'],
      required: true,
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Hostel = mongoose.model('Hostel', hostelSchema);
export default Hostel;
