import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { greenBeanGradingService } from '../services/greenBeanGradingService';

const router = Router();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateGrading = [
  body('gradingSystem').optional().isString().isIn(['SCA']),
  body('primaryDefects').optional().isInt({ min: 0 }),
  body('secondaryDefects').optional().isInt({ min: 0 }),
  body('defectBreakdown').optional().isArray(),
  body('defectBreakdown.*.type').optional().isString(),
  body('defectBreakdown.*.count').optional().isInt({ min: 0 }),
  body('defectBreakdown.*.category').optional().isIn([1, 2]),
  body('screenSizeDistribution').optional().isObject(),
  body('moistureContent').optional().isFloat({ min: 0, max: 100 }),
  body('waterActivity').optional().isFloat({ min: 0, max: 1 }),
  body('bulkDensity').optional().isFloat({ min: 0 }),
  body('beanColorAssessment').optional().isString(),
  body('uniformityScore').optional().isInt({ min: 1, max: 10 }),
  body('notes').optional().isString(),
];

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/samples/:sampleId/grading
 * Get grading for a specific sample
 */
router.get('/:sampleId/grading', async (req: Request, res: Response) => {
  try {
    const { sampleId } = req.params;

    const grading = await greenBeanGradingService.getGradingBySampleId(sampleId);

    if (!grading) {
      return res.status(404).json({
        success: false,
        error: 'Grading not found for this sample',
      });
    }

    res.json({
      success: true,
      data: grading,
    });
  } catch (error) {
    console.error('Error fetching grading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch grading',
    });
  }
});

/**
 * POST /api/samples/:sampleId/grading
 * Create grading for a sample
 */
router.post(
  '/:sampleId/grading',
  validateGrading,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { sampleId } = req.params;

      // Check if grading already exists
      const existingGrading = await greenBeanGradingService.getGradingBySampleId(sampleId);
      if (existingGrading) {
        return res.status(409).json({
          success: false,
          error: 'Grading already exists for this sample. Use PUT to update.',
        });
      }

      const gradingData = {
        sampleId,
        gradingSystem: req.body.gradingSystem,
        primaryDefects: req.body.primaryDefects,
        secondaryDefects: req.body.secondaryDefects,
        defectBreakdown: req.body.defectBreakdown,
        screenSizeDistribution: req.body.screenSizeDistribution,
        moistureContent: req.body.moistureContent,
        waterActivity: req.body.waterActivity,
        bulkDensity: req.body.bulkDensity,
        beanColorAssessment: req.body.beanColorAssessment,
        uniformityScore: req.body.uniformityScore,
        gradedBy: req.body.gradedBy,
        certifiedBy: req.body.certifiedBy,
        certificationDate: req.body.certificationDate,
        notes: req.body.notes,
      };

      const grading = await greenBeanGradingService.createGrading(gradingData);

      res.status(201).json({
        success: true,
        message: 'Grading created successfully',
        data: grading,
      });
    } catch (error) {
      console.error('Error creating grading:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create grading',
      });
    }
  }
);

/**
 * PUT /api/samples/:sampleId/grading
 * Update grading for a sample
 */
router.put(
  '/:sampleId/grading',
  validateGrading,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { sampleId } = req.params;

      const gradingData = {
        gradingSystem: req.body.gradingSystem,
        primaryDefects: req.body.primaryDefects,
        secondaryDefects: req.body.secondaryDefects,
        defectBreakdown: req.body.defectBreakdown,
        screenSizeDistribution: req.body.screenSizeDistribution,
        moistureContent: req.body.moistureContent,
        waterActivity: req.body.waterActivity,
        bulkDensity: req.body.bulkDensity,
        beanColorAssessment: req.body.beanColorAssessment,
        uniformityScore: req.body.uniformityScore,
        gradedBy: req.body.gradedBy,
        certifiedBy: req.body.certifiedBy,
        certificationDate: req.body.certificationDate,
        notes: req.body.notes,
      };

      const grading = await greenBeanGradingService.updateGrading(sampleId, gradingData);

      res.json({
        success: true,
        message: 'Grading updated successfully',
        data: grading,
      });
    } catch (error: any) {
      console.error('Error updating grading:', error);
      
      if (error.message === 'Grading not found') {
        return res.status(404).json({
          success: false,
          error: 'Grading not found',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update grading',
      });
    }
  }
);

/**
 * DELETE /api/samples/:sampleId/grading
 * Delete grading for a sample
 */
router.delete('/:sampleId/grading', async (req: Request, res: Response) => {
  try {
    const { sampleId } = req.params;

    const deleted = await greenBeanGradingService.deleteGrading(sampleId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Grading not found',
      });
    }

    res.json({
      success: true,
      message: 'Grading deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting grading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete grading',
    });
  }
});

/**
 * POST /api/samples/:sampleId/grading/calculate
 * Calculate grade preview without saving
 */
router.post(
  '/:sampleId/grading/calculate',
  [
    body('primaryDefects').isInt({ min: 0 }),
    body('secondaryDefects').isInt({ min: 0 }),
    body('moistureContent').optional().isFloat({ min: 0, max: 100 }),
    body('waterActivity').optional().isFloat({ min: 0, max: 1 }),
    body('colorScore').optional().isInt({ min: 1, max: 10 }),
    body('uniformityScore').optional().isInt({ min: 1, max: 10 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const preview = greenBeanGradingService.calculateGradePreview({
        primaryDefects: req.body.primaryDefects,
        secondaryDefects: req.body.secondaryDefects,
        moistureContent: req.body.moistureContent,
        waterActivity: req.body.waterActivity,
        bulkDensity: req.body.bulkDensity,
        uniformityScore: req.body.uniformityScore,
      });

      res.json({
        success: true,
        data: preview,
      });
    } catch (error) {
      console.error('Error calculating grade preview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate grade preview',
      });
    }
  }
);

export default router;

