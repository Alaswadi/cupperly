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
} from '../auth/controllers/authController';
import {
  registerOrganizationValidator,
  loginValidator,
  updateProfileValidator,
  inviteUserValidator,
  createMemberValidator,
  updateTeamMemberValidator,
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

// Team management routes
router.get('/team-members', authenticate, getTeamMembers);
router.post('/invite', authenticate, authorize('ADMIN', 'OWNER'), inviteUserValidator, inviteUser);
router.post('/create-member', authenticate, authorize('ADMIN', 'OWNER'), createMemberValidator, createMember);
router.put('/team-members/:id', authenticate, authorize('ADMIN', 'OWNER'), updateTeamMemberValidator, updateTeamMember);
router.delete('/team-members/:id', authenticate, authorize('ADMIN', 'OWNER'), deleteTeamMember);

export default router;
