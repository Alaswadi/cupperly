import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '../../generated/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getSamples = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, search, origin, processingMethod, roastLevel } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    // Add search filters
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { origin: { contains: search as string, mode: 'insensitive' } },
        { variety: { contains: search as string, mode: 'insensitive' } },
        { producer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (origin) {
      where.origin = { contains: origin as string, mode: 'insensitive' };
    }

    if (processingMethod) {
      where.processingMethod = processingMethod;
    }

    if (roastLevel) {
      where.roastLevel = roastLevel;
    }

    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sample.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        samples,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSample = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const sample = await prisma.sample.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        sessionSamples: {
          include: {
            session: {
              select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        scores: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!sample) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Sample not found',
        },
      });
    }

    res.json({
      success: true,
      data: sample,
    });
  } catch (error) {
    next(error);
  }
};

export const createSample = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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

    // Transform numeric fields from strings to proper types
    const sampleData = {
      ...req.body,
      organizationId: req.user!.organizationId,
      tags: req.body.tags || [],
      // Convert string numbers to proper types (handle empty strings)
      altitude: req.body.altitude && req.body.altitude.trim() !== '' ? parseInt(req.body.altitude, 10) : null,
      moisture: req.body.moisture && req.body.moisture.trim() !== '' ? parseFloat(req.body.moisture) : null,
      density: req.body.density && req.body.density.trim() !== '' ? parseFloat(req.body.density) : null,
    };

    const sample = await prisma.sample.create({
      data: sampleData,
    });

    res.status(201).json({
      success: true,
      data: sample,
      message: 'Sample created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSample = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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

    const { id } = req.params;

    // Check if sample exists and belongs to organization
    const existingSample = await prisma.sample.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!existingSample) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Sample not found',
        },
      });
    }

    // Transform numeric fields from strings to proper types
    const updateData = {
      ...req.body,
      // Convert string numbers to proper types if they exist (handle empty strings)
      ...(req.body.altitude !== undefined && { altitude: req.body.altitude && req.body.altitude.trim() !== '' ? parseInt(req.body.altitude, 10) : null }),
      ...(req.body.moisture !== undefined && { moisture: req.body.moisture && req.body.moisture.trim() !== '' ? parseFloat(req.body.moisture) : null }),
      ...(req.body.density !== undefined && { density: req.body.density && req.body.density.trim() !== '' ? parseFloat(req.body.density) : null }),
    };

    const sample = await prisma.sample.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: sample,
      message: 'Sample updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSample = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if sample exists and belongs to organization
    const existingSample = await prisma.sample.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!existingSample) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Sample not found',
        },
      });
    }

    // Check if sample is used in any sessions
    const sessionSamples = await prisma.sessionSample.findMany({
      where: { sampleId: id },
    });

    if (sessionSamples.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete sample that is used in cupping sessions',
        },
      });
    }

    await prisma.sample.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Sample deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
