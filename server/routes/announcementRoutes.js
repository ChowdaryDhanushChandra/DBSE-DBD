import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'warden'), createAnnouncement);

router.route('/:id')
  .put(authorize('admin', 'warden'), updateAnnouncement)
  .delete(authorize('admin', 'warden'), deleteAnnouncement);

export default router;
