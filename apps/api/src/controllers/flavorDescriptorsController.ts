import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getFlavorDescriptors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get both default descriptors and organization-specific descriptors
    const descriptors = await prisma.flavorDescriptor.findMany({
      where: {
        OR: [
          { isDefault: true }, // Default system descriptors
          { organizationId: req.user!.organizationId }, // Organization-specific descriptors
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' }, // Default descriptors first
        { category: 'asc' }, // Then by category (NEGATIVE, POSITIVE)
        { name: 'asc' }, // Then alphabetically
      ],
    });

    res.json({
      success: true,
      data: descriptors,
    });
  } catch (error) {
    next(error);
  }
};

export const createFlavorDescriptor = async (
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

    const { name, category, description } = req.body;

    // Check if descriptor with same name already exists in organization
    const existing = await prisma.flavorDescriptor.findFirst({
      where: {
        name,
        organizationId: req.user!.organizationId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'A flavor descriptor with this name already exists in your organization',
        },
      });
    }

    const descriptor = await prisma.flavorDescriptor.create({
      data: {
        name,
        category,
        description,
        organizationId: req.user!.organizationId,
        createdBy: req.user!.id,
        isDefault: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: descriptor,
      message: 'Flavor descriptor created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateFlavorDescriptor = async (
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
    const { name, category, description } = req.body;

    // Check if descriptor exists and belongs to organization
    const existing = await prisma.flavorDescriptor.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
        isDefault: false, // Can't update default descriptors
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Flavor descriptor not found or cannot be modified',
        },
      });
    }

    const descriptor = await prisma.flavorDescriptor.update({
      where: { id },
      data: {
        name,
        category,
        description,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: descriptor,
      message: 'Flavor descriptor updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlavorDescriptor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if descriptor exists and belongs to organization
    const existing = await prisma.flavorDescriptor.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
        isDefault: false, // Can't delete default descriptors
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Flavor descriptor not found or cannot be deleted',
        },
      });
    }

    await prisma.flavorDescriptor.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Flavor descriptor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
