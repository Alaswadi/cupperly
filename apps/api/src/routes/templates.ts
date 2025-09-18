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

// All routes require authentication
router.use(authenticate);

// Get all templates (accessible to all authenticated users)
router.get('/', getTemplates);

// Get a specific template (accessible to all authenticated users)
router.get('/:id', getTemplate);

// Create a new template (requires MANAGER or ADMIN role)
router.post('/', authorize(['ADMIN', 'MANAGER']), createTemplate);

// Update a template (requires MANAGER or ADMIN role)
router.put('/:id', authorize(['ADMIN', 'MANAGER']), updateTemplate);

// Delete a template (requires ADMIN role)
router.delete('/:id', authorize(['ADMIN']), deleteTemplate);

export default router;
