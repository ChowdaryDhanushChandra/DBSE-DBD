import express from 'express';
import {
  getFees,
  getStudentFees,
  createFee,
  updateFee,
  getReceipt,
} from '../controllers/feeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFees)
  .post(authorize('admin'), createFee);

router.route('/:id')
  .put(updateFee);

router.route('/student/:studentId')
  .get(getStudentFees);

router.route('/:id/receipt')
  .get(getReceipt);

export default router;
