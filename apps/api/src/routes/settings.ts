import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Settings routes
router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
