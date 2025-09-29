import { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

const router = Router();
// const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Simple health check without database for now
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        cors: 'enabled',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

export default router;
