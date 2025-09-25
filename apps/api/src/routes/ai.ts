import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateSessionSampleSummary } from '../controllers/aiController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// AI routes
router.post('/sessions/:sessionId/samples/:sampleId/summary', generateSessionSampleSummary);

export default router;
