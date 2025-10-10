import { Router } from 'express';
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
router.post('/', authorize('ADMIN'), createTemplate);
router.put('/:id', authorize('ADMIN'), updateTemplate);
router.delete('/:id', authorize('ADMIN'), deleteTemplate);

export default router;
