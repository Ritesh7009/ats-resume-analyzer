import { Router } from 'express';
import { body } from 'express-validator';
import {
  uploadResume,
  analyzeResume,
  matchJob,
  getHistory,
  getResume,
  deleteResume,
  sendReport,
} from '../controllers/resumeController';
import { authenticate, uploadLimiter, analysisLimiter } from '../middleware';
import { uploadResume as uploadMiddleware } from '../middleware/upload';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// Validation rules
const analyzeValidation = [
  body('resumeId').optional().isMongoId().withMessage('Invalid resume ID'),
];

const matchJobValidation = [
  body('resumeId').isMongoId().withMessage('Invalid resume ID'),
  body('jobDescription')
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage('Job description must be between 50 and 10000 characters'),
];

const sendReportValidation = [
  body('resumeId').isMongoId().withMessage('Invalid resume ID'),
];

// Routes
router.post('/upload', uploadLimiter, uploadMiddleware, uploadResume);
router.post('/analyze', analysisLimiter, analyzeValidation, analyzeResume);
router.post('/analyze/:id', analysisLimiter, analyzeResume);
router.post('/match-job', analysisLimiter, matchJobValidation, matchJob);
router.get('/history', getHistory);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.post('/send-report', sendReportValidation, sendReport);

export default router;
