import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  getFlavorDescriptors,
  createFlavorDescriptor,
  updateFlavorDescriptor,
  deleteFlavorDescriptor,
} from '../controllers/flavorDescriptorsController';

const router = Router();

// Validation rules
const createFlavorDescriptorValidator = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .isIn(['POSITIVE', 'NEGATIVE'])
    .withMessage('Category must be either POSITIVE or NEGATIVE'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
];

const updateFlavorDescriptorValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['POSITIVE', 'NEGATIVE'])
    .withMessage('Category must be either POSITIVE or NEGATIVE'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
];

// Routes
router.get('/', authenticate, getFlavorDescriptors);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createFlavorDescriptorValidator, createFlavorDescriptor);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateFlavorDescriptorValidator, updateFlavorDescriptor);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteFlavorDescriptor);

export default router;
