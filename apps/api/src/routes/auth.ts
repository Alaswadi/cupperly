import { Router } from 'express';
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

// Public routes (no tenant required)
router.post('/register-organization', registerOrganizationValidator, registerOrganization);

// Tenant-specific routes
router.post('/login', (req, res, next) => {
  console.log('🔐 Login route hit:', req.body);
  next();
}, loginValidator, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

// Admin/Manager only routes
router.post('/invite', authenticate, authorize('ADMIN', 'MANAGER'), inviteUserValidator, inviteUser);

export default router;
