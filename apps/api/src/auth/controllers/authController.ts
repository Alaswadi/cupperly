import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../../middleware/auth';
import { TenantRequest } from '../../middleware/tenant';

const authService = new AuthService();

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
    next(error);
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
