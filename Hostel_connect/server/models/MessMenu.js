import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Special'],
      required: true,
    },
    foodItems: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Both', 'Special'],
      default: 'Vegetarian',
    },
    calories: {
      type: Number,
      default: 500,
    },
    timing: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for dayOfWeek + mealType
messMenuSchema.index({ dayOfWeek: 1, mealType: 1 }, { unique: true });

const MessMenu = mongoose.model('MessMenu', messMenuSchema);
export default MessMenu;
