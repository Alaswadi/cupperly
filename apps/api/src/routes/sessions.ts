import { Router } from 'express';
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

// Validation schemas
const createSessionValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('templateId').optional().matches(/^c[a-z0-9]{24}$/).withMessage('Template ID must be a valid ID'),
  body('blindTasting').isBoolean().withMessage('Blind tasting must be a boolean'),
  body('allowComments').isBoolean().withMessage('Allow comments must be a boolean'),
  body('requireCalibration').isBoolean().withMessage('Require calibration must be a boolean'),
  body('scheduledAt').optional().isISO8601().withMessage('Scheduled date must be a valid ISO date'),
  body('sampleIds').isArray().withMessage('Sample IDs must be an array'),
  body('sampleIds.*').matches(/^c[a-z0-9]{24}$/).withMessage('Each sample ID must be a valid ID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const updateSessionValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('templateId').optional().matches(/^c[a-z0-9]{24}$/).withMessage('Template ID must be a valid ID'),
  body('blindTasting').optional().isBoolean().withMessage('Blind tasting must be a boolean'),
  body('allowComments').optional().isBoolean().withMessage('Allow comments must be a boolean'),
  body('requireCalibration').optional().isBoolean().withMessage('Require calibration must be a boolean'),
  body('scheduledAt').optional().isISO8601().withMessage('Scheduled date must be a valid ISO date'),
  body('sampleIds').optional().isArray().withMessage('Sample IDs must be an array'),
  body('sampleIds.*').optional().matches(/^c[a-z0-9]{24}$/).withMessage('Each sample ID must be a valid ID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const addSampleValidator = [
  body('sampleId').matches(/^c[a-z0-9]{24}$/).withMessage('Sample ID must be a valid ID'),
  body('position').isInt({ min: 1 }).withMessage('Position must be a positive integer'),
  body('isBlind').isBoolean().withMessage('Is blind must be a boolean'),
  body('blindCode').optional().trim().isLength({ max: 10 }).withMessage('Blind code must be less than 10 characters'),
  body('grindSize').optional().trim().isLength({ max: 50 }).withMessage('Grind size must be less than 50 characters'),
  body('waterTemp').optional().isFloat({ min: 0, max: 100 }).withMessage('Water temperature must be between 0 and 100°C'),
  body('brewRatio').optional().trim().isLength({ max: 20 }).withMessage('Brew ratio must be less than 20 characters'),
  body('steepTime').optional().isInt({ min: 0 }).withMessage('Steep time must be a positive integer'),
];

const submitScoreValidator = [
  body('aroma').isFloat({ min: 0, max: 10 }).withMessage('Aroma score must be between 0 and 10'),
  body('flavor').isFloat({ min: 0, max: 10 }).withMessage('Flavor score must be between 0 and 10'),
  body('aftertaste').isFloat({ min: 0, max: 10 }).withMessage('Aftertaste score must be between 0 and 10'),
  body('acidity').isFloat({ min: 0, max: 10 }).withMessage('Acidity score must be between 0 and 10'),
  body('body').isFloat({ min: 0, max: 10 }).withMessage('Body score must be between 0 and 10'),
  body('balance').isFloat({ min: 0, max: 10 }).withMessage('Balance score must be between 0 and 10'),
  body('sweetness').isFloat({ min: 0, max: 10 }).withMessage('Sweetness score must be between 0 and 10'),
  body('cleanliness').isFloat({ min: 0, max: 10 }).withMessage('Cleanliness score must be between 0 and 10'),
  body('uniformity').isFloat({ min: 0, max: 10 }).withMessage('Uniformity score must be between 0 and 10'),
  body('overall').isFloat({ min: 0, max: 10 }).withMessage('Overall score must be between 0 and 10'),
  body('defects').optional().isArray().withMessage('Defects must be an array'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('privateNotes').optional().trim().isLength({ max: 1000 }).withMessage('Private notes must be less than 1000 characters'),
];

// Session routes
router.get('/', authenticate, getSessions);
router.get('/:id', authenticate, getSession);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'CUPPER'), createSessionValidator, createSession);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateSessionValidator, updateSession);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteSession);

// Session control routes
router.post('/:id/start', authenticate, authorize('ADMIN', 'MANAGER'), startSession);
router.post('/:id/complete', authenticate, authorize('ADMIN', 'MANAGER'), completeSession);

// Sample management routes
router.post('/:id/samples', authenticate, authorize('ADMIN', 'MANAGER'), addSampleValidator, addSampleToSession);
router.delete('/:id/samples/:sampleId', authenticate, authorize('ADMIN', 'MANAGER'), removeSampleFromSession);

// Scoring routes
router.get('/:id/scores', authenticate, getSessionScores);
router.post('/:id/samples/:sampleId/score', authenticate, submitScoreValidator, submitScore);

export default router;
