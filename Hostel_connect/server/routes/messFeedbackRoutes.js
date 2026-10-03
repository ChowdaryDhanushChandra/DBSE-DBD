import express from 'express';
import {
  getTodayMealsAndFeedback,
  submitFeedback,
  getMyFeedback,
  getMessFeedbackAnalytics,
  getWeeklyMessReport,
} from '../controllers/messFeedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/today', getTodayMealsAndFeedback);
router.post('/', authorize('student'), submitFeedback);
router.get('/my', authorize('student'), getMyFeedback);
router.get('/analytics', authorize('warden', 'admin'), getMessFeedbackAnalytics);
router.get('/report', authorize('warden', 'admin'), getWeeklyMessReport);

export default router;
