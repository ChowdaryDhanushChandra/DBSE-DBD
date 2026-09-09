import express from 'express';
import {
  getAllocations,
  allocateRoom,
  deallocateRoom,
  changeRoom,
} from '../controllers/allocationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllocations)
  .post(authorize('admin', 'warden'), allocateRoom);

router.route('/:id')
  .put(authorize('admin', 'warden'), changeRoom)
  .delete(authorize('admin', 'warden'), deallocateRoom);

export default router;
