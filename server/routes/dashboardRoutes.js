import express from 'express';
import {
  getAdminDashboard,
  getWardenDashboard,
  getStudentDashboard,
  getReports,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/warden', authorize('admin', 'warden'), getWardenDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/reports', authorize('admin', 'warden'), getReports);

export default router;
