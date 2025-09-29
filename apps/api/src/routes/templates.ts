import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templatesController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Template routes
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', authorize('ADMIN', 'OWNER'), createTemplate);
router.put('/:id', authorize('ADMIN', 'OWNER'), updateTemplate);
router.delete('/:id', authorize('ADMIN', 'OWNER'), deleteTemplate);

export default router;
