import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSamples,
  getSample,
  createSample,
  updateSample,
  deleteSample,
} from '../controllers/samplesController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Validation schemas
const createSampleValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('origin').trim().isLength({ min: 1, max: 100 }).withMessage('Origin is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('code').optional().trim().isLength({ max: 50 }).withMessage('Code must be less than 50 characters'),
  body('region').optional().trim().isLength({ max: 100 }).withMessage('Region must be less than 100 characters'),
  body('farm').optional().trim().isLength({ max: 100 }).withMessage('Farm must be less than 100 characters'),
  body('producer').optional().trim().isLength({ max: 100 }).withMessage('Producer must be less than 100 characters'),
  body('variety').optional().trim().isLength({ max: 100 }).withMessage('Variety must be less than 100 characters'),
  body('altitude').optional().isInt({ min: 0, max: 10000 }).withMessage('Altitude must be between 0 and 10000 meters'),
  body('processingMethod').optional().isIn(['WASHED', 'NATURAL', 'HONEY', 'SEMI_WASHED', 'WET_HULLED', 'ANAEROBIC', 'CARBONIC_MACERATION', 'OTHER']),
  body('roastLevel').optional().isIn(['LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK', 'FRENCH', 'ITALIAN']),
  body('moisture').optional().isFloat({ min: 0, max: 100 }).withMessage('Moisture must be between 0 and 100%'),
  body('density').optional().isFloat({ min: 0 }).withMessage('Density must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const updateSampleValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('origin').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Origin is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('code').optional().trim().isLength({ max: 50 }).withMessage('Code must be less than 50 characters'),
  body('region').optional().trim().isLength({ max: 100 }).withMessage('Region must be less than 100 characters'),
  body('farm').optional().trim().isLength({ max: 100 }).withMessage('Farm must be less than 100 characters'),
  body('producer').optional().trim().isLength({ max: 100 }).withMessage('Producer must be less than 100 characters'),
  body('variety').optional().trim().isLength({ max: 100 }).withMessage('Variety must be less than 100 characters'),
  body('altitude').optional().isInt({ min: 0, max: 10000 }).withMessage('Altitude must be between 0 and 10000 meters'),
  body('processingMethod').optional().isIn(['WASHED', 'NATURAL', 'HONEY', 'SEMI_WASHED', 'WET_HULLED', 'ANAEROBIC', 'CARBONIC_MACERATION', 'OTHER']),
  body('roastLevel').optional().isIn(['LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK', 'FRENCH', 'ITALIAN']),
  body('moisture').optional().isFloat({ min: 0, max: 100 }).withMessage('Moisture must be between 0 and 100%'),
  body('density').optional().isFloat({ min: 0 }).withMessage('Density must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

// Routes
router.get('/', authenticate, getSamples);
router.get('/:id', authenticate, getSample);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'CUPPER'), createSampleValidator, createSample);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'CUPPER'), updateSampleValidator, updateSample);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteSample);

export default router;
