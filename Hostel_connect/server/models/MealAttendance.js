import mongoose from 'mongoose';

const mealAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for straightforward daily queries
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per student per date per mealType
mealAttendanceSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

const MealAttendance = mongoose.model('MealAttendance', mealAttendanceSchema);
export default MealAttendance;
