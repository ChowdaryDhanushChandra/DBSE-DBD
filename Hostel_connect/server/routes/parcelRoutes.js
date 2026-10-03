import express from 'express';
import {
  getParcels,
  getParcelById,
  createParcel,
  updateParcel,
  deleteParcel,
  collectParcel,
  getStudentParcels,
  getParcelReports,
} from '../controllers/parcelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/reports', authorize('warden', 'admin'), getParcelReports);
router.get('/student/:studentId', getStudentParcels);

router.route('/')
  .get(getParcels)
  .post(authorize('warden', 'admin'), createParcel);

router.route('/:id')
  .get(getParcelById)
  .put(authorize('warden', 'admin'), updateParcel)
  .delete(authorize('admin'), deleteParcel);

router.put('/:id/collect', collectParcel);

export default router;
