import express from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(upload.single('image'), createComplaint);

router.route('/:id')
  .put(authorize('admin', 'warden'), updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

export default router;
