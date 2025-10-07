import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Settings routes - ADMIN only
router.get('/', authorize('ADMIN'), getSettings);
router.put('/', authorize('ADMIN'), updateSettings);

export default router;
