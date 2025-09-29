// Sample service with full database persistence
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cupperly',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Test database connection
pool.on('connect', () => {
  console.log('📋 SampleService: Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('📋 SampleService: Database connection error:', err);
});

export interface Sample {
  id: string;
  name: string;
  origin: string;
  region?: string | null;
  description?: string | null;
  code?: string | null;
  farm?: string | null;
  producer?: string | null;
  variety?: string | null;
  altitude?: number | null;
  processingMethod?: string | null;
  roastLevel?: string | null;
  moisture?: number | null;
  density?: number | null;
  screenSize?: string | null;
  harvestDate?: string | null;
  roaster?: string | null;
  roastDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

class SampleService {
  // No more in-memory storage - everything goes to database

  // Get all samples for an organization
  async getAllSamples(organizationId: string): Promise<Sample[]> {
    try {
      console.log('📋 SampleService: Getting all samples for org:', organizationId);
      const result = await pool.query(
        'SELECT * FROM samples WHERE "organizationId" = $1 ORDER BY "createdAt" DESC',
        [organizationId]
      );

      const samples = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        origin: row.origin,
        region: row.region,
        description: row.description,
        code: row.code,
        farm: row.farm,
        producer: row.producer,
        variety: row.variety,
        altitude: row.altitude,
        processingMethod: row.processingMethod,
        roastLevel: row.roastLevel,
        moisture: row.moisture,
        density: row.density,
        screenSize: row.screenSize,
        harvestDate: row.harvestDate ? row.harvestDate.toISOString() : null,
        roaster: row.roaster,
        roastDate: row.roastDate ? row.roastDate.toISOString() : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        organizationId: row.organizationId
      }));

      console.log('📋 SampleService: Found', samples.length, 'samples in database');
      return samples;
    } catch (error) {
      console.error('📋 SampleService: Error getting samples from database:', error);
      return [];
    }
  }

  // Get a single sample by ID
  async getSampleById(id: string, organizationId: string): Promise<Sample | null> {
    try {
      console.log('📋 SampleService: Getting sample:', id);
      const result = await pool.query(
        'SELECT * FROM samples WHERE id = $1 AND "organizationId" = $2',
        [id, organizationId]
      );

      if (result.rows.length === 0) {
        console.log('📋 SampleService: Sample not found:', id);
        return null;
      }

      const row = result.rows[0];
      const sample: Sample = {
        id: row.id,
        name: row.name,
        origin: row.origin,
        region: row.region,
        description: row.description,
        code: row.code,
        farm: row.farm,
        producer: row.producer,
        variety: row.variety,
        altitude: row.altitude,
        processingMethod: row.processingMethod,
        roastLevel: row.roastLevel,
        moisture: row.moisture,
        density: row.density,
        screenSize: row.screenSize,
        harvestDate: row.harvestDate ? row.harvestDate.toISOString() : null,
        roaster: row.roaster,
        roastDate: row.roastDate ? row.roastDate.toISOString() : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        organizationId: row.organizationId
      };

      console.log('📋 SampleService: Found sample:', sample.name);
      return sample;
    } catch (error) {
      console.error('📋 SampleService: Error getting sample from database:', error);
      return null;
    }
  }

  // Create a new sample
  async createSample(sampleData: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sample> {
    try {
      console.log('📋 SampleService: Creating sample:', sampleData.name);

      // Generate a unique ID
      const sampleId = Date.now().toString();

      const result = await pool.query(`
        INSERT INTO samples (
          id, "organizationId", name, origin, region, description, code, farm, producer,
          variety, altitude, "processingMethod", "roastLevel", moisture, density, "screenSize",
          "harvestDate", roaster, "roastDate", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
        ) RETURNING *
      `, [
        sampleId,
        sampleData.organizationId,
        sampleData.name,
        sampleData.origin,
        sampleData.region,
        sampleData.description,
        sampleData.code,
        sampleData.farm,
        sampleData.producer,
        sampleData.variety,
        sampleData.altitude,
        sampleData.processingMethod,
        sampleData.roastLevel,
        sampleData.moisture,
        sampleData.density,
        sampleData.screenSize,
        sampleData.harvestDate ? new Date(sampleData.harvestDate) : null,
        sampleData.roaster,
        sampleData.roastDate ? new Date(sampleData.roastDate) : null
      ]);

      const row = result.rows[0];
      const newSample: Sample = {
        id: row.id,
        name: row.name,
        origin: row.origin,
        region: row.region,
        description: row.description,
        code: row.code,
        farm: row.farm,
        producer: row.producer,
        variety: row.variety,
        altitude: row.altitude,
        processingMethod: row.processingMethod,
        roastLevel: row.roastLevel,
        moisture: row.moisture,
        density: row.density,
        screenSize: row.screenSize,
        harvestDate: row.harvestDate ? row.harvestDate.toISOString() : null,
        roaster: row.roaster,
        roastDate: row.roastDate ? row.roastDate.toISOString() : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        organizationId: row.organizationId
      };

      console.log('📋 SampleService: Sample created in database with ID:', newSample.id);
      return newSample;
    } catch (error) {
      console.error('📋 SampleService: Error creating sample in database:', error);
      throw new Error('Failed to create sample');
    }
  }

  // Update an existing sample
  async updateSample(id: string, organizationId: string, updateData: Partial<Sample>): Promise<Sample | null> {
    try {
      console.log('📋 SampleService: Updating sample:', id);

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updateData.name);
      }
      if (updateData.origin !== undefined) {
        updateFields.push(`origin = $${paramIndex++}`);
        updateValues.push(updateData.origin);
      }
      if (updateData.region !== undefined) {
        updateFields.push(`region = $${paramIndex++}`);
        updateValues.push(updateData.region);
      }
      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updateData.description);
      }
      if (updateData.code !== undefined) {
        updateFields.push(`code = $${paramIndex++}`);
        updateValues.push(updateData.code);
      }
      if (updateData.farm !== undefined) {
        updateFields.push(`farm = $${paramIndex++}`);
        updateValues.push(updateData.farm);
      }
      if (updateData.producer !== undefined) {
        updateFields.push(`producer = $${paramIndex++}`);
        updateValues.push(updateData.producer);
      }
      if (updateData.variety !== undefined) {
        updateFields.push(`variety = $${paramIndex++}`);
        updateValues.push(updateData.variety);
      }
      if (updateData.altitude !== undefined) {
        updateFields.push(`altitude = $${paramIndex++}`);
        updateValues.push(updateData.altitude);
      }
      if (updateData.processingMethod !== undefined) {
        updateFields.push(`"processingMethod" = $${paramIndex++}`);
        updateValues.push(updateData.processingMethod);
      }
      if (updateData.roastLevel !== undefined) {
        updateFields.push(`"roastLevel" = $${paramIndex++}`);
        updateValues.push(updateData.roastLevel);
      }
      if (updateData.moisture !== undefined) {
        updateFields.push(`moisture = $${paramIndex++}`);
        updateValues.push(updateData.moisture);
      }
      if (updateData.density !== undefined) {
        updateFields.push(`density = $${paramIndex++}`);
        updateValues.push(updateData.density);
      }
      if (updateData.screenSize !== undefined) {
        updateFields.push(`"screenSize" = $${paramIndex++}`);
        updateValues.push(updateData.screenSize);
      }
      if (updateData.harvestDate !== undefined) {
        updateFields.push(`"harvestDate" = $${paramIndex++}`);
        updateValues.push(updateData.harvestDate ? new Date(updateData.harvestDate) : null);
      }
      if (updateData.roaster !== undefined) {
        updateFields.push(`roaster = $${paramIndex++}`);
        updateValues.push(updateData.roaster);
      }
      if (updateData.roastDate !== undefined) {
        updateFields.push(`"roastDate" = $${paramIndex++}`);
        updateValues.push(updateData.roastDate ? new Date(updateData.roastDate) : null);
      }

      // Always update the updatedAt field
      updateFields.push(`"updatedAt" = NOW()`);

      // Add WHERE clause parameters
      updateValues.push(id, organizationId);

      const result = await pool.query(`
        UPDATE samples SET
          ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND "organizationId" = $${paramIndex++}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        console.log('📋 SampleService: Sample not found for update:', id);
        return null;
      }

      const row = result.rows[0];
      const updatedSample: Sample = {
        id: row.id,
        name: row.name,
        origin: row.origin,
        region: row.region,
        description: row.description,
        code: row.code,
        farm: row.farm,
        producer: row.producer,
        variety: row.variety,
        altitude: row.altitude,
        processingMethod: row.processingMethod,
        roastLevel: row.roastLevel,
        moisture: row.moisture,
        density: row.density,
        screenSize: row.screenSize,
        harvestDate: row.harvestDate ? row.harvestDate.toISOString() : null,
        roaster: row.roaster,
        roastDate: row.roastDate ? row.roastDate.toISOString() : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        organizationId: row.organizationId
      };

      console.log('📋 SampleService: Sample updated in database:', updatedSample.id);
      return updatedSample;
    } catch (error) {
      console.error('📋 SampleService: Error updating sample in database:', error);
      return null;
    }
  }

  // Delete a sample
  async deleteSample(id: string, organizationId: string): Promise<boolean> {
    try {
      console.log('📋 SampleService: Deleting sample:', id);

      const result = await pool.query(
        'DELETE FROM samples WHERE id = $1 AND "organizationId" = $2 RETURNING id',
        [id, organizationId]
      );

      if (result.rows.length === 0) {
        console.log('📋 SampleService: Sample not found for deletion:', id);
        return false;
      }

      console.log('📋 SampleService: Sample deleted from database:', id);
      return true;
    } catch (error) {
      console.error('📋 SampleService: Error deleting sample from database:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const sampleService = new SampleService();
