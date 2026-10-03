import express from 'express';
import {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  deleteVisitor,
  getCurrentlyInside,
  getVisitorHistory,
  getVisitorAnalytics,
} from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/currently-inside', authorize('warden', 'admin'), getCurrentlyInside);
router.get('/history', authorize('warden', 'admin'), getVisitorHistory);
router.get('/analytics', authorize('warden', 'admin'), getVisitorAnalytics);

router.route('/')
  .get(getVisitors)
  .post(createVisitor);

router.route('/:id')
  .get(getVisitorById)
  .put(updateVisitor)
  .delete(authorize('admin', 'student'), deleteVisitor);

router.put('/:id/approve', authorize('warden', 'admin'), approveVisitor);
router.put('/:id/reject', authorize('warden', 'admin'), rejectVisitor);
router.put('/:id/checkin', authorize('warden', 'admin'), checkInVisitor);
router.put('/:id/checkout', authorize('warden', 'admin'), checkOutVisitor);

export default router;
