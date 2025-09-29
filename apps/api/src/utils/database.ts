import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cupperly',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Test database connection
pool.on('connect', () => {
  console.log('📋 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('📋 Database connection error:', err);
});

export default pool;

// Database helper functions
export const dbHelpers = {
  // Get all samples for an organization
  async getSamples(organizationId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM samples WHERE "organizationId" = $1 ORDER BY "createdAt" DESC',
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching samples from database:', error);
      return [];
    }
  },

  // Get a single sample
  async getSample(id: string, organizationId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM samples WHERE id = $1 AND "organizationId" = $2',
        [id, organizationId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching sample from database:', error);
      return null;
    }
  },

  // Create a new sample
  async createSample(sampleData: any) {
    try {
      const result = await pool.query(`
        INSERT INTO samples (
          "organizationId", name, origin, region, description, code, farm, producer, 
          variety, altitude, "processingMethod", "roastLevel", moisture, density, "screenSize",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
        ) RETURNING *
      `, [
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
        sampleData.screenSize
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating sample in database:', error);
      return null;
    }
  },

  // Update a sample
  async updateSample(id: string, organizationId: string, updateData: any) {
    try {
      const result = await pool.query(`
        UPDATE samples SET 
          name = COALESCE($1, name),
          origin = COALESCE($2, origin),
          region = COALESCE($3, region),
          description = COALESCE($4, description),
          code = COALESCE($5, code),
          farm = COALESCE($6, farm),
          producer = COALESCE($7, producer),
          variety = COALESCE($8, variety),
          altitude = COALESCE($9, altitude),
          "processingMethod" = COALESCE($10, "processingMethod"),
          "roastLevel" = COALESCE($11, "roastLevel"),
          moisture = COALESCE($12, moisture),
          density = COALESCE($13, density),
          "screenSize" = COALESCE($14, "screenSize"),
          "updatedAt" = NOW()
        WHERE id = $15 AND "organizationId" = $16
        RETURNING *
      `, [
        updateData.name,
        updateData.origin,
        updateData.region,
        updateData.description,
        updateData.code,
        updateData.farm,
        updateData.producer,
        updateData.variety,
        updateData.altitude,
        updateData.processingMethod,
        updateData.roastLevel,
        updateData.moisture,
        updateData.density,
        updateData.screenSize,
        id,
        organizationId
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating sample in database:', error);
      return null;
    }
  }
};
