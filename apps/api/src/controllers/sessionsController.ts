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
                  region: true,
                  variety: true,
                },
              },
            },
          },
          scores: {
            select: {
              id: true,
              totalScore: true,
              isSubmitted: true,
              isComplete: true,
              userId: true,
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

    // Keep the original session structure for reports
    const transformedSession = {
      ...session,
      // Keep samples as SessionSample objects with full sample data
      samples: session.samples || [],
    };

    res.json({
      success: true,
      data: transformedSession,
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
    console.log('🎯 Create session request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Session validation errors:', errors.array());
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
      data: session,
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
      console.error('Validation errors:', errors.array());
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

    const { sampleIds, ...sessionData } = req.body;

    // Update session and samples in a transaction
    const session = await prisma.$transaction(async (tx) => {
      // Update the session
      const updatedSession = await tx.cuppingSession.update({
        where: { id },
        data: sessionData,
      });

      // Handle sample updates if sampleIds is provided
      if (sampleIds !== undefined) {
        // Verify all samples exist and belong to the organization
        if (sampleIds.length > 0) {
          const samples = await tx.sample.findMany({
            where: {
              id: { in: sampleIds },
              organizationId: req.user!.organizationId,
            },
          });

          if (samples.length !== sampleIds.length) {
            throw new Error('One or more samples not found');
          }
        }

        // Remove existing samples
        await tx.sessionSample.deleteMany({
          where: { sessionId: id },
        });

        // Add new samples
        if (sampleIds.length > 0) {
          await Promise.all(
            sampleIds.map((sampleId: string, index: number) =>
              tx.sessionSample.create({
                data: {
                  sessionId: id,
                  sampleId,
                  position: index + 1,
                  isBlind: sessionData.blindTasting ?? existingSession.blindTasting,
                  blindCode: (sessionData.blindTasting ?? existingSession.blindTasting)
                    ? `Sample ${String.fromCharCode(65 + index)}`
                    : undefined,
                },
              })
            )
          );
        }
      }

      return updatedSession;
    });

    res.json({
      success: true,
      data: session,
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

    // Calculate SCAA total score - convert string values to floats
    const scaaScores = {
      aroma: scoreData.aroma ? parseFloat(scoreData.aroma) : null,
      flavor: scoreData.flavor ? parseFloat(scoreData.flavor) : null,
      aftertaste: scoreData.aftertaste ? parseFloat(scoreData.aftertaste) : null,
      acidity: scoreData.acidity ? parseFloat(scoreData.acidity) : null,
      body: scoreData.body ? parseFloat(scoreData.body) : null,
      balance: scoreData.balance ? parseFloat(scoreData.balance) : null,
      sweetness: scoreData.sweetness ? parseFloat(scoreData.sweetness) : null,
      cleanliness: scoreData.cleanliness ? parseFloat(scoreData.cleanliness) : null,
      uniformity: scoreData.uniformity ? parseFloat(scoreData.uniformity) : null,
      overall: scoreData.overall ? parseFloat(scoreData.overall) : null,
    };

    const totalScore = calculateScaaScore(scaaScores);

    // Handle flavor descriptors
    const flavorDescriptors = scoreData.flavorDescriptors || [];

    // Create or update score in a transaction to handle flavor descriptors
    const score = await prisma.$transaction(async (tx) => {
      // Create or update the score
      const updatedScore = await tx.score.upsert({
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

      // Handle flavor descriptors
      if (flavorDescriptors.length > 0) {
        // Delete existing flavor descriptors for this score
        await tx.scoreFlavorDescriptor.deleteMany({
          where: { scoreId: updatedScore.id },
        });

        // Create new flavor descriptor associations
        for (const descriptor of flavorDescriptors) {
          await tx.scoreFlavorDescriptor.create({
            data: {
              scoreId: updatedScore.id,
              flavorDescriptorId: descriptor.id,
              intensity: descriptor.intensity || 3,
            },
          });
        }
      }

      return updatedScore;
    });

    // Check if all participants have submitted scores for all samples
    // If so, automatically complete the session
    if (scoreData.isSubmitted) {
      await checkAndCompleteSession(sessionId);
    }

    res.json({
      success: true,
      data: score,
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
        flavorDescriptors: {
          include: {
            flavorDescriptor: true,
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
      data: scores,
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
        position: parseInt(position, 10),
        isBlind,
        blindCode,
        grindSize,
        waterTemp: waterTemp ? parseFloat(waterTemp) : null,
        brewRatio,
        steepTime: steepTime ? parseInt(steepTime, 10) : null,
      },
      include: {
        sample: true,
      },
    });

    res.status(201).json({
      success: true,
      data: sessionSample,
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

// Helper function to check if all participants have submitted scores for all samples
// and automatically complete the session if so
async function checkAndCompleteSession(sessionId: string) {
  try {
    // Get session with participants and samples
    const session = await prisma.cuppingSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
        samples: true,
      },
    });

    if (!session || session.status !== 'ACTIVE') {
      return;
    }

    // Count total expected scores (participants × samples)
    const totalExpectedScores = session.participants.length * session.samples.length;

    // Count actual submitted scores
    const submittedScoresCount = await prisma.score.count({
      where: {
        sessionId,
        isSubmitted: true,
      },
    });

    // If all scores are submitted, complete the session
    if (submittedScoresCount >= totalExpectedScores) {
      await prisma.cuppingSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      console.log(`✅ Session ${sessionId} automatically completed - all scores submitted`);
    }
  } catch (error) {
    console.error('Error checking session completion:', error);
    // Don't throw error to avoid breaking the score submission
  }
}
