import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '../generated/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// SCAA Standard scoring calculation
const calculateScaaScore = (scores: {
  aroma: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  sweetness: number;
  cleanliness: number;
  uniformity: number;
  overall: number;
}) => {
  // SCAA standard: each category is worth 10 points, total 100 points
  return Object.values(scores).reduce((total, score) => total + score, 0);
};

export const getSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [sessions, total] = await Promise.all([
      prisma.cuppingSession.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              scoringSystem: true,
            },
          },
          participants: {
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
          samples: {
            include: {
              sample: {
                select: {
                  id: true,
                  name: true,
                  origin: true,
                },
              },
            },
          },
          _count: {
            select: {
              scores: true,
            },
          },
        },
      }),
      prisma.cuppingSession.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        sessions,
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

export const getSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const session = await prisma.cuppingSession.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        template: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        samples: {
          include: {
            sample: true,
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
          orderBy: { position: 'asc' },
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
            sessionSample: {
              include: {
                sample: {
                  select: {
                    id: true,
                    name: true,
                    origin: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    res.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (
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

    const { sampleIds, ...sessionData } = req.body;

    // Verify all samples exist and belong to the organization
    const samples = await prisma.sample.findMany({
      where: {
        id: { in: sampleIds },
        organizationId: req.user!.organizationId,
      },
    });

    if (samples.length !== sampleIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'One or more samples not found',
        },
      });
    }

    // Create session with samples in a transaction
    const session = await prisma.$transaction(async (tx) => {
      // Create the session
      const newSession = await tx.cuppingSession.create({
        data: {
          ...sessionData,
          organizationId: req.user!.organizationId,
          createdBy: req.user!.id,
          tags: sessionData.tags || [],
        },
      });

      // Add creator as participant with HEAD_JUDGE role
      await tx.sessionParticipant.create({
        data: {
          sessionId: newSession.id,
          userId: req.user!.id,
          role: 'HEAD_JUDGE',
          isCalibrated: true,
          calibratedAt: new Date(),
        },
      });

      // Add samples to session
      const sessionSamples = await Promise.all(
        sampleIds.map((sampleId: string, index: number) =>
          tx.sessionSample.create({
            data: {
              sessionId: newSession.id,
              sampleId,
              position: index + 1,
              isBlind: sessionData.blindTasting,
              blindCode: sessionData.blindTasting ? `Sample ${String.fromCharCode(65 + index)}` : undefined,
            },
          })
        )
      );

      return { ...newSession, samples: sessionSamples };
    });

    res.status(201).json({
      success: true,
      data: { session },
      message: 'Session created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
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

    // Check if session exists and belongs to organization
    const existingSession = await prisma.cuppingSession.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    // Don't allow updates to active or completed sessions
    if (existingSession.status === 'ACTIVE' || existingSession.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot update active or completed sessions',
        },
      });
    }

    const session = await prisma.cuppingSession.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      data: { session },
      message: 'Session updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if session exists and belongs to organization
    const existingSession = await prisma.cuppingSession.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    // Don't allow deletion of active sessions
    if (existingSession.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete active sessions',
        },
      });
    }

    await prisma.cuppingSession.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const startSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const session = await prisma.cuppingSession.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    if (session.status !== 'DRAFT' && session.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Session cannot be started',
        },
      });
    }

    const updatedSession = await prisma.cuppingSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { session: updatedSession },
      message: 'Session started successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const session = await prisma.cuppingSession.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    if (session.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only active sessions can be completed',
        },
      });
    }

    const updatedSession = await prisma.cuppingSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { session: updatedSession },
      message: 'Session completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// SCAA Scoring Functions
export const submitScore = async (
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

    const { id: sessionId, sampleId } = req.params;
    const scoreData = req.body;

    // Verify session exists and is active
    const session = await prisma.cuppingSession.findFirst({
      where: {
        id: sessionId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    if (session.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only score active sessions',
        },
      });
    }

    // Verify session sample exists
    const sessionSample = await prisma.sessionSample.findFirst({
      where: {
        sessionId,
        sampleId,
      },
    });

    if (!sessionSample) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Sample not found in session',
        },
      });
    }

    // Calculate SCAA total score
    const scaaScores = {
      aroma: scoreData.aroma,
      flavor: scoreData.flavor,
      aftertaste: scoreData.aftertaste,
      acidity: scoreData.acidity,
      body: scoreData.body,
      balance: scoreData.balance,
      sweetness: scoreData.sweetness,
      cleanliness: scoreData.cleanliness,
      uniformity: scoreData.uniformity,
      overall: scoreData.overall,
    };

    const totalScore = calculateScaaScore(scaaScores);

    // Create or update score
    const score = await prisma.score.upsert({
      where: {
        sessionId_sampleId_userId: {
          sessionId,
          sampleId,
          userId: req.user!.id,
        },
      },
      update: {
        ...scaaScores,
        totalScore,
        scores: scaaScores,
        defects: scoreData.defects || [],
        notes: scoreData.notes,
        privateNotes: scoreData.privateNotes,
        isComplete: true,
        isSubmitted: scoreData.isSubmitted || false,
        submittedAt: scoreData.isSubmitted ? new Date() : null,
      },
      create: {
        sessionId,
        sessionSampleId: sessionSample.id,
        sampleId,
        userId: req.user!.id,
        ...scaaScores,
        totalScore,
        maxScore: 100,
        scores: scaaScores,
        defects: scoreData.defects || [],
        notes: scoreData.notes,
        privateNotes: scoreData.privateNotes,
        isComplete: true,
        isSubmitted: scoreData.isSubmitted || false,
        submittedAt: scoreData.isSubmitted ? new Date() : null,
      },
      include: {
        user: {
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
      data: { score },
      message: 'Score submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionScores = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId } = req.params;

    // Verify session exists and user has access
    const session = await prisma.cuppingSession.findFirst({
      where: {
        id: sessionId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    const scores = await prisma.score.findMany({
      where: {
        sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sessionSample: {
          include: {
            sample: {
              select: {
                id: true,
                name: true,
                origin: true,
              },
            },
          },
        },
      },
      orderBy: [
        { sessionSample: { position: 'asc' } },
        { user: { firstName: 'asc' } },
      ],
    });

    res.json({
      success: true,
      data: { scores },
    });
  } catch (error) {
    next(error);
  }
};

export const addSampleToSession = async (
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

    const { id: sessionId } = req.params;
    const { sampleId, position, isBlind, blindCode, grindSize, waterTemp, brewRatio, steepTime } = req.body;

    // Verify session exists and is not active/completed
    const session = await prisma.cuppingSession.findFirst({
      where: {
        id: sessionId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    if (session.status === 'ACTIVE' || session.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot modify active or completed sessions',
        },
      });
    }

    // Verify sample exists and belongs to organization
    const sample = await prisma.sample.findFirst({
      where: {
        id: sampleId,
        organizationId: req.user!.organizationId,
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

    const sessionSample = await prisma.sessionSample.create({
      data: {
        sessionId,
        sampleId,
        position,
        isBlind,
        blindCode,
        grindSize,
        waterTemp,
        brewRatio,
        steepTime,
      },
      include: {
        sample: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { sessionSample },
      message: 'Sample added to session successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const removeSampleFromSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId, sampleId } = req.params;

    // Verify session exists and is not active/completed
    const session = await prisma.cuppingSession.findFirst({
      where: {
        id: sessionId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
        },
      });
    }

    if (session.status === 'ACTIVE' || session.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot modify active or completed sessions',
        },
      });
    }

    // Find and delete the session sample
    const sessionSample = await prisma.sessionSample.findFirst({
      where: {
        sessionId,
        sampleId,
      },
    });

    if (!sessionSample) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Sample not found in session',
        },
      });
    }

    await prisma.sessionSample.delete({
      where: {
        id: sessionSample.id,
      },
    });

    res.json({
      success: true,
      message: 'Sample removed from session successfully',
    });
  } catch (error) {
    next(error);
  }
};
