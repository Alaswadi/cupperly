import { Router, Request, Response } from 'express';
import {
  registerOrganization,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  inviteUser,
} from '../auth/controllers/authController';
import {
  registerOrganizationValidator,
  loginValidator,
  updateProfileValidator,
  inviteUserValidator,
} from '../auth/validators/authValidators';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Authentication routes
router.post('/register-organization', registerOrganizationValidator, registerOrganization);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

// Admin routes
router.post('/invite', authenticate, authorize('ADMIN', 'OWNER'), inviteUserValidator, inviteUser);

export default router;
