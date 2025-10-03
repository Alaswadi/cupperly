import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    slug: string;
    subdomain: string;
    name: string;
  };
}

export const tenantMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantIdentifier: string | undefined;

    // Extract tenant from subdomain (e.g., demo.cupperly.com)
    const host = req.get('host');
    if (host) {
      // Remove port number if present
      const hostWithoutPort = host.split(':')[0];
      const subdomain = hostWithoutPort.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
        tenantIdentifier = subdomain;
      }
    }

    // Fallback to X-Tenant-ID header
    if (!tenantIdentifier) {
      tenantIdentifier = req.get('X-Tenant-ID');
    }

    // Skip tenant resolution for health checks and some auth routes
    const skipTenantRoutes = ['/api/health', '/api/auth/register-organization'];
    if (skipTenantRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    if (!tenantIdentifier) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Tenant identifier required',
        },
      });
    }

    // Find organization by subdomain or slug
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { subdomain: tenantIdentifier },
          { slug: tenantIdentifier },
        ],
      },
      select: {
        id: true,
        slug: true,
        subdomain: true,
        name: true,
        subscriptionStatus: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Organization not found',
        },
      });
    }

    // Check subscription status
    if (organization.subscriptionStatus === 'CANCELED' || 
        organization.subscriptionStatus === 'UNPAID') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Organization subscription is not active',
        },
      });
    }

    // Attach tenant to request
    req.tenant = {
      id: organization.id,
      slug: organization.slug,
      subdomain: organization.subdomain,
      name: organization.name,
    };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
      },
    });
  }
};
