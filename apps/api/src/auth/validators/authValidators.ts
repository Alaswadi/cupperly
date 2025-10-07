import { body, ValidationChain } from 'express-validator';

export const registerOrganizationValidator: ValidationChain[] = [
  body('organizationName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  
  body('subdomain')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Subdomain must be 3-30 characters, lowercase letters, numbers, and hyphens only'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const inviteUserValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('role')
    .isIn(['ADMIN', 'CUPPER'])
    .withMessage('Valid role is required'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
];

export const acceptInvitationValidator: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Invitation token is required'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const forgotPasswordValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

export const resetPasswordValidator: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const updateProfileValidator: ValidationChain[] = [
  body('firstName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),

  body('lastName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),

  body('avatar')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

export const changePasswordValidator: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

export const createMemberValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),

  body('role')
    .isIn(['ADMIN', 'CUPPER'])
    .withMessage('Valid role is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const updateTeamMemberValidator: ValidationChain[] = [
  body('firstName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),

  body('lastName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('role')
    .optional({ values: 'falsy' })
    .isIn(['ADMIN', 'CUPPER'])
    .withMessage('Valid role is required'),

  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
];

export const updateOrganizationValidator: ValidationChain[] = [
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),

  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
];
