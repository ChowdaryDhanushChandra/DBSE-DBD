import express from 'express';
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from '../controllers/hostelController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getHostels)
  .post(protect, authorize('admin'), createHostel);

router.route('/:id')
  .get(getHostelById)
  .put(protect, authorize('admin'), updateHostel)
  .delete(protect, authorize('admin'), deleteHostel);

export default router;
