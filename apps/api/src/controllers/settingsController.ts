import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

export const getSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.user!.organizationId,
      },
      select: {
        settings: true,
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

    res.json({
      success: true,
      data: organization.settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { aiProvider, geminiApiKey, openRouterApiKey, openRouterModel, ...otherSettings } = req.body;

    // Get current settings
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.user!.organizationId,
      },
      select: {
        settings: true,
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

    // Merge with existing settings
    const currentSettings = organization.settings as Record<string, any>;
    const updatedSettings = {
      ...currentSettings,
      ...otherSettings,
    };

    // Update AI provider settings
    if (aiProvider !== undefined) {
      updatedSettings.aiProvider = aiProvider;
    }

    // Only update API keys and model if provided
    if (geminiApiKey !== undefined) {
      updatedSettings.geminiApiKey = geminiApiKey;
    }

    if (openRouterApiKey !== undefined) {
      updatedSettings.openRouterApiKey = openRouterApiKey;
    }

    if (openRouterModel !== undefined) {
      updatedSettings.openRouterModel = openRouterModel;
    }

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: req.user!.organizationId,
      },
      data: {
        settings: updatedSettings,
      },
      select: {
        settings: true,
      },
    });

    res.json({
      success: true,
      data: updatedOrganization.settings,
    });
  } catch (error) {
    next(error);
  }
};
