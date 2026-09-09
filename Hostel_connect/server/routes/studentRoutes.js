import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(authorize('admin'), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(authorize('admin', 'warden'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

export default router;
