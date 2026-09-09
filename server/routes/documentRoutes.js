import express from 'express';
import {
  uploadDocument,
  getDocuments,
  updateDocumentStatus,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocuments);

router.route('/upload')
  .post(upload.single('file'), uploadDocument);

router.route('/:id/status')
  .put(authorize('admin', 'warden'), updateDocumentStatus);

export default router;
