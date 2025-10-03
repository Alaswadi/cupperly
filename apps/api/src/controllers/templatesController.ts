import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fixInvalidTemplates } from '../utils/fixTemplates';

const prisma = new PrismaClient();

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  scoringSystem: z.enum(['SCA', 'COE', 'CUSTOM']).default('SCA'),
  maxScore: z.number().int().min(1).default(100),
  isPublic: z.boolean().default(false),
  categories: z.array(z.object({
    name: z.string(),
    weight: z.number(),
    description: z.string().optional(),
  })),
});

const updateTemplateSchema = createTemplateSchema.partial();

export const getTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '10', search, scoringSystem } = req.query;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID and User ID are required',
      });
    }

    // Fix any invalid templates and ensure default template exists
    await fixInvalidTemplates(organizationId, userId);

    const where: any = {
      OR: [
        { organizationId },
        { isPublic: true },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (scoringSystem) {
      where.scoringSystem = scoringSystem;
    }

    const [templates, total] = await Promise.all([
      prisma.cuppingTemplate.findMany({
        where,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.cuppingTemplate.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        templates,
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

export const getTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const template = await prisma.cuppingTemplate.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createTemplateSchema.parse(req.body);
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID and User ID are required',
      });
    }

    const template = await prisma.cuppingTemplate.create({
      data: {
        ...validatedData,
        organizationId,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
};

export const updateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateTemplateSchema.parse(req.body);
    const organizationId = req.user?.organizationId;

    // Check if template exists and user has permission
    const existingTemplate = await prisma.cuppingTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template not found or access denied',
      });
    }

    // Don't allow updating default templates
    if (existingTemplate.isDefault) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify default templates',
      });
    }

    const template = await prisma.cuppingTemplate.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
};

export const deleteTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    // Check if template exists and user has permission
    const existingTemplate = await prisma.cuppingTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template not found or access denied',
      });
    }

    // Don't allow deleting default templates
    if (existingTemplate.isDefault) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete default templates',
      });
    }

    await prisma.cuppingTemplate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
