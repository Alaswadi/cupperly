import { Router, Request, Response } from 'express';
import { sampleService } from '../services/sampleService';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Sample data is now managed by the SampleService

// Get all samples
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Get samples route hit');

    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const samples = await sampleService.getAllSamples(organizationId);

    res.json({
      success: true,
      data: {
        samples: samples
      }
    });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch samples'
    });
  }
});

// Get single sample
router.get('/:id', async (req: Request, res: Response) => {
  try {
    console.log('📋 Get sample route hit:', req.params.id);

    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const sample = await sampleService.getSampleById(req.params.id, organizationId);

    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found'
      });
    }

    res.json({
      success: true,
      data: sample
    });
  } catch (error) {
    console.error('Error fetching sample:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sample'
    });
  }
});

// Create sample
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Create sample route hit:', req.body);

    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const sampleData = {
      name: req.body.name || 'New Sample',
      origin: req.body.origin || 'Unknown',
      region: req.body.region || null,
      description: req.body.description || null,
      code: req.body.code || null,
      farm: req.body.farm || null,
      producer: req.body.producer || null,
      variety: req.body.variety || null,
      altitude: req.body.altitude ? parseInt(req.body.altitude) : null,
      processingMethod: req.body.processingMethod || null,
      roastLevel: req.body.roastLevel || null,
      moisture: req.body.moisture ? parseFloat(req.body.moisture) : null,
      density: req.body.density ? parseFloat(req.body.density) : null,
      screenSize: req.body.screenSize || null,
      harvestDate: req.body.harvestDate || null,
      roaster: req.body.roaster || null,
      roastDate: req.body.roastDate || null,
      organizationId: organizationId
    };

    const newSample = await sampleService.createSample(sampleData);

    res.status(201).json({
      success: true,
      message: 'Sample created successfully',
      data: newSample
    });
  } catch (error) {
    console.error('Error creating sample:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sample'
    });
  }
});

// Update sample
router.put('/:id', async (req: Request, res: Response) => {
  try {
    console.log('📋 Update sample route hit:', req.params.id, req.body);

    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({
        success: false,
        error: 'Organization ID not found'
      });
    }

    const updateData = {
      name: req.body.name,
      origin: req.body.origin,
      region: req.body.region,
      description: req.body.description,
      code: req.body.code,
      farm: req.body.farm,
      producer: req.body.producer,
      variety: req.body.variety,
      altitude: req.body.altitude ? parseInt(req.body.altitude) : null,
      processingMethod: req.body.processingMethod,
      roastLevel: req.body.roastLevel,
      moisture: req.body.moisture ? parseFloat(req.body.moisture) : null,
      density: req.body.density ? parseFloat(req.body.density) : null,
      screenSize: req.body.screenSize,
      harvestDate: req.body.harvestDate,
      roaster: req.body.roaster,
      roastDate: req.body.roastDate
    };

    const updatedSample = await sampleService.updateSample(req.params.id, organizationId, updateData);

    if (!updatedSample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample updated successfully',
      data: updatedSample
    });
  } catch (error) {
    console.error('Error updating sample:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sample'
    });
  }
});

export default router;
