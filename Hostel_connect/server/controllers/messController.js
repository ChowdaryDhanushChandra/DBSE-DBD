import MessMenu from '../models/MessMenu.js';
import MealAttendance from '../models/MealAttendance.js';
import Student from '../models/Student.js';

// @desc    Get weekly mess menu and today's menu
// @route   GET /api/mess/menu
// @access  Public / Authenticated
export const getMessMenu = async (req, res, next) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()];

    const weeklyMenu = await MessMenu.find().sort({ dayOfWeek: 1, mealType: 1 });
    const todayMenu = await MessMenu.find({ dayOfWeek: currentDayName });

    res.status(200).json({
      success: true,
      currentDay: currentDayName,
      today: todayMenu,
      weekly: weeklyMenu,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a menu item
// @route   POST /api/mess/menu
// @access  Private (Admin / Warden)
export const saveMenuItem = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, foodItems, category, calories, timing, description } = req.body;

    const menuItem = await MessMenu.findOneAndUpdate(
      { dayOfWeek, mealType },
      {
        dayOfWeek,
        mealType,
        foodItems: Array.isArray(foodItems) ? foodItems : foodItems.split(',').map((s) => s.trim()),
        category: category || 'Vegetarian',
        calories: Number(calories) || 500,
        timing: timing || '',
        description: description || '',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${mealType} for ${dayOfWeek} updated successfully`,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/mess/menu/:id
// @access  Private (Admin / Warden)
export const deleteMenuItem = async (req, res, next) => {
  try {
    await MessMenu.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark student meal attendance
// @route   POST /api/mess/attendance
// @access  Private (Warden / Staff / Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, mealType, status } = req.body;

    const formattedDate = date || new Date().toISOString().split('T')[0];

    const attendance = await MealAttendance.findOneAndUpdate(
      { studentId, date: formattedDate, mealType },
      {
        studentId,
        date: formattedDate,
        mealType,
        status: status || 'Present',
        markedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${status || 'Present'} for ${mealType}`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal attendance records
// @route   GET /api/mess/attendance
// @access  Private
export const getAttendance = async (req, res, next) => {
  try {
    const { date, mealType, studentId } = req.query;
    const query = {};

    if (date) query.date = date;
    if (mealType) query.mealType = mealType;
    if (studentId) query.studentId = studentId;

    // If logged-in user is a student, restrict to their own records
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.studentId = student._id;
      }
    }

    const records = await MealAttendance.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email profileImage' },
      })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal attendance analytics & statistics
// @route   GET /api/mess/stats
// @access  Private
export const getMessStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayMeals = await MealAttendance.find({ date: today, status: 'Present' });
    const breakfastToday = todayMeals.filter((m) => m.mealType === 'Breakfast').length;
    const lunchToday = todayMeals.filter((m) => m.mealType === 'Lunch').length;
    const dinnerToday = todayMeals.filter((m) => m.mealType === 'Dinner').length;

    const totalServedToday = todayMeals.length;
    const totalAllTime = await MealAttendance.countDocuments({ status: 'Present' });

    res.status(200).json({
      success: true,
      data: {
        date: today,
        totalServedToday,
        totalAllTime,
        breakdownToday: {
          breakfast: breakfastToday,
          lunch: lunchToday,
          dinner: dinnerToday,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
