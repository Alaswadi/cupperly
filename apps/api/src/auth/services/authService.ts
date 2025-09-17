import { PrismaClient } from '../../generated/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface RegisterOrganizationData {
  organizationName: string;
  subdomain: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  organizationId?: string;
}

export interface InviteUserData {
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CUPPER' | 'VIEWER';
  firstName?: string;
  lastName?: string;
  organizationId: string;
  invitedBy: string;
}

export class AuthService {
  async registerOrganization(data: RegisterOrganizationData) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if subdomain is available
    const existingOrg = await prisma.organization.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingOrg) {
      throw new Error('Subdomain is already taken');
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: data.subdomain,
          subdomain: data.subdomain,
          subscriptionStatus: 'TRIAL',
          subscriptionPlan: 'STARTER',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: organization.id,
          role: 'ADMIN',
          emailVerified: false, // Will be verified via email
        },
      });

      return { organization, user };
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: result.user.id,
      organizationId: result.organization.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        subdomain: result.organization.subdomain,
      },
      tokens,
    };
  }

  async login(data: LoginData, organizationId?: string) {
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
        ...(organizationId && { organizationId }),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            subdomain: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check organization subscription
    if (user.organization.subscriptionStatus === 'CANCELED' || 
        user.organization.subscriptionStatus === 'UNPAID') {
      throw new Error('Organization subscription is not active');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        subdomain: user.organization.subdomain,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          emailVerified: true,
        },
      });

      if (!user || !user.emailVerified) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        organizationId: user.organizationId,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async inviteUser(data: InviteUserData) {
    // Check if user is already in the organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        organizationId: data.organizationId,
      },
    });

    if (existingUser) {
      throw new Error('User is already a member of this organization');
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: data.email,
        organizationId: data.organizationId,
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        organizationId: data.organizationId,
        role: data.role,
        token,
        expiresAt,
        invitedBy: data.invitedBy,
      },
      include: {
        organization: {
          select: {
            name: true,
            subdomain: true,
          },
        },
      },
    });

    return invitation;
  }
}
