import { Router, Request, Response } from 'express';
import {
  registerOrganization,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  inviteUser,
  createMember,
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember,
  updateOrganization,
} from '../auth/controllers/authController';
import {
  registerOrganizationValidator,
  loginValidator,
  updateProfileValidator,
  inviteUserValidator,
  createMemberValidator,
  updateTeamMemberValidator,
  updateOrganizationValidator,
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

// Organization routes - ADMIN only
router.put('/organization', authenticate, authorize('ADMIN'), updateOrganizationValidator, updateOrganization);

// Team management routes - ADMIN only
router.get('/team-members', authenticate, authorize('ADMIN'), getTeamMembers);
router.post('/invite', authenticate, authorize('ADMIN'), inviteUserValidator, inviteUser);
router.post('/create-member', authenticate, authorize('ADMIN'), createMemberValidator, createMember);
router.put('/team-members/:id', authenticate, authorize('ADMIN'), updateTeamMemberValidator, updateTeamMember);
router.delete('/team-members/:id', authenticate, authorize('ADMIN'), deleteTeamMember);

export default router;
