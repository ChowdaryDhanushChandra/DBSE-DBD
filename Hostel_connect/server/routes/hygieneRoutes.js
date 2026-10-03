import express from 'express';
import {
  getInspections,
  createInspection,
  getCleanlinessScore,
  getInspectionSchedule,
  updateScheduleItem,
  getHygieneComplaints,
  createHygieneComplaint,
  updateComplaintStatus,
  confirmComplaint,
  getHygieneAnalytics,
  getHostelQualityScore,
  getWeeklyQualityReport,
} from '../controllers/hygieneController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Inspections & Cleanliness
router.get('/inspections', getInspections);
router.post('/inspections', authorize('warden', 'admin'), createInspection);
router.get('/cleanliness-score', getCleanlinessScore);

// Inspection Schedule
router.get('/schedule', getInspectionSchedule);
router.put('/schedule/:id', authorize('warden', 'admin'), updateScheduleItem);

// Hygiene Complaints
router.get('/complaints', getHygieneComplaints);
router.post('/complaints', authorize('student'), createHygieneComplaint);
router.put('/complaints/:id/status', authorize('warden', 'admin'), updateComplaintStatus);
router.put('/complaints/:id/confirm', authorize('student'), confirmComplaint);

// Analytics & Reports
router.get('/analytics', authorize('warden', 'admin'), getHygieneAnalytics);
router.get('/quality-score', getHostelQualityScore);
router.get('/weekly-report', authorize('warden', 'admin'), getWeeklyQualityReport);

export default router;
