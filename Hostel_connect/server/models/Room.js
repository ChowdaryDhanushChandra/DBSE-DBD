import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
      default: 1,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Four-Sharing'],
      default: 'Double',
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Maintenance'],
      default: 'Available',
    },
    pricePerSemester: {
      type: Number,
      default: 35000,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for available beds
roomSchema.virtual('availableBeds').get(function () {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

// Automatically update status based on occupancy
roomSchema.pre('save', function (next) {
  if (this.status !== 'Maintenance') {
    if (this.currentOccupancy >= this.capacity) {
      this.status = 'Fully Occupied';
    } else if (this.currentOccupancy > 0) {
      this.status = 'Partially Occupied';
    } else {
      this.status = 'Available';
    }
  }
  next();
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
