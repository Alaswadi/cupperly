import { Router } from 'express';
import {
  registerOrganization,
  login,
  logout,
  refreshToken,
  getProfile,
  inviteUser,
} from '../auth/controllers/authController';
import {
  registerOrganizationValidator,
  loginValidator,
  inviteUserValidator,
} from '../auth/validators/authValidators';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes (no tenant required)
router.post('/register-organization', registerOrganizationValidator, registerOrganization);

// Tenant-specific routes
router.post('/login', loginValidator, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);

// Admin/Manager only routes
router.post('/invite', authenticate, authorize('ADMIN', 'MANAGER'), inviteUserValidator, inviteUser);

export default router;
