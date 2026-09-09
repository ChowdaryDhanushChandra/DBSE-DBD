import express from 'express';
import {
  getMessMenu,
  saveMenuItem,
  deleteMenuItem,
  markAttendance,
  getAttendance,
  getMessStats,
} from '../controllers/messController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/menu')
  .get(getMessMenu)
  .post(protect, authorize('admin', 'warden'), saveMenuItem);

router.route('/menu/:id')
  .delete(protect, authorize('admin', 'warden'), deleteMenuItem);

router.route('/attendance')
  .get(protect, getAttendance)
  .post(protect, authorize('admin', 'warden'), markAttendance);

router.route('/stats')
  .get(protect, getMessStats);

export default router;
