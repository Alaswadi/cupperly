import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  startSession,
  completeSession,
  addSampleToSession,
  removeSampleFromSession,
  getSessionScores,
  submitScore,
} from '../controllers/sessionsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Session validation rules
const sessionValidation = [
  body('name').notEmpty().withMessage('Session name is required'),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('templateId').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (typeof value === 'string' || typeof value === 'number') return true;
    throw new Error('Template ID must be a string or number');
  }).customSanitizer((value) => {
    if (value === null || value === undefined || value === '') return undefined;
    return String(value);
  }),
  body('blindTasting').optional().isBoolean(),
  body('allowComments').optional().isBoolean(),
  body('requireCalibration').optional().isBoolean(),
  body('scheduledAt').optional().isISO8601(),
  body('sampleIds').optional().isArray(),
  body('tags').optional().isArray(),
];

// Score validation rules
const scoreValidation = [
  body('aroma').optional().isFloat({ min: 6, max: 10 }),
  body('flavor').optional().isFloat({ min: 6, max: 10 }),
  body('aftertaste').optional().isFloat({ min: 6, max: 10 }),
  body('acidity').optional().isFloat({ min: 6, max: 10 }),
  body('body').optional().isFloat({ min: 6, max: 10 }),
  body('balance').optional().isFloat({ min: 6, max: 10 }),
  body('sweetness').optional().isFloat({ min: 6, max: 10 }),
  body('cleanliness').optional().isFloat({ min: 6, max: 10 }),
  body('uniformity').optional().isFloat({ min: 6, max: 10 }),
  body('overall').optional().isFloat({ min: 6, max: 10 }),
  body('defects').optional().isArray(),
  body('notes').optional().isString(),
  body('privateNotes').optional().isString(),
  body('flavorDescriptors').optional().isArray(),
  body('isSubmitted').optional().isBoolean(),
];

// Routes
// Temporary test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Sessions routes are working!',
    timestamp: new Date().toISOString()
  });
});

// All authenticated users can view and create sessions
router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/', sessionValidation, createSession);
router.put('/:id', sessionValidation, updateSession);
// Delete requires ownership check (handled in controller) or ADMIN role
router.delete('/:id', deleteSession);

// Session management
router.post('/:id/start', startSession);
router.post('/:id/complete', completeSession);

// Sample management
router.post('/:id/samples', [
  body('sampleId').notEmpty().withMessage('Sample ID is required'),
  body('position').isInt({ min: 1 }).withMessage('Position must be a positive integer'),
  body('isBlind').optional().isBoolean(),
  body('blindCode').optional().isString(),
  body('grindSize').optional().isString(),
  body('waterTemp').optional().isFloat(),
  body('brewRatio').optional().isString(),
  body('steepTime').optional().isInt(),
], addSampleToSession);

router.delete('/:id/samples/:sampleId', removeSampleFromSession);

// Scoring
router.get('/:id/scores', getSessionScores);
router.post('/:id/samples/:sampleId/scores', scoreValidation, submitScore);

export default router;
