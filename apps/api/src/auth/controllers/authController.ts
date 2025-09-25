import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../../middleware/auth';
import { TenantRequest } from '../../middleware/tenant';
import { PrismaClient } from '../../generated/client';

const authService = new AuthService();
const prisma = new PrismaClient();

export const registerOrganization = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { organizationName, subdomain, firstName, lastName, email, password } = req.body;

    const result = await authService.registerOrganization({
      organizationName,
      subdomain,
      firstName,
      lastName,
      email,
      password,
    });

    // Set HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', result.tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        organization: result.organization,
        tokens: result.tokens,
      },
      message: 'Organization registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { email, password } = req.body;

    const result = await authService.login(
      { email, password },
      req.tenant?.id
    );

    // Set HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', result.tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);

    res.json({
      success: true,
      data: {
        user: result.user,
        organization: result.organization,
        tokens: result.tokens,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      console.log('🔄 Refresh token attempt failed: No refresh token provided');
      // Clear any existing cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token required',
        },
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.json({
      success: true,
      data: { tokens },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    // If refresh token is invalid, clear cookies and return 401
    console.log('🔄 Refresh token attempt failed:', error instanceof Error ? error.message : 'Unknown error');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    if (error instanceof Error && error.message === 'Invalid refresh token') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        message: 'Token refresh failed',
      },
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
        tenant: req.tenant,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { firstName, lastName, email, bio, avatar } = req.body;
    const userId = req.user!.id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email is already taken',
          },
        });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { email, role, firstName, lastName } = req.body;

    const invitation = await authService.inviteUser({
      email,
      role,
      firstName,
      lastName,
      organizationId: req.user!.organizationId,
      invitedBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: { invitation },
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    next(error);
  }
};
