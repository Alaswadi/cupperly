import pool from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DefectItem {
  type: string;
  count: number;
  category: 1 | 2;
  description?: string;
}

export interface ScreenSizeDistribution {
  size14?: number;
  size15?: number;
  size16?: number;
  size17?: number;
  size18?: number;
  size19?: number;
  size20?: number;
}

export interface GreenBeanGrading {
  id: string;
  sampleId: string;
  gradingSystem: string;
  primaryDefects: number;
  secondaryDefects: number;
  fullDefectEquivalents: number;
  defectBreakdown: DefectItem[];
  screenSizeDistribution?: ScreenSizeDistribution;
  averageScreenSize?: number;
  uniformityPercentage?: number;
  moistureContent?: number;
  waterActivity?: number;
  bulkDensity?: number;
  beanColorAssessment?: string;
  uniformityScore?: number;
  grade?: string;
  classification?: string;
  qualityScore?: number;
  gradedBy?: string;
  gradedAt?: Date;
  certifiedBy?: string;
  certificationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGradingDTO {
  sampleId: string;
  gradingSystem?: string;
  primaryDefects?: number;
  secondaryDefects?: number;
  defectBreakdown?: DefectItem[];
  screenSizeDistribution?: ScreenSizeDistribution;
  moistureContent?: number;
  waterActivity?: number;
  bulkDensity?: number;
  beanColorAssessment?: string;
  uniformityScore?: number;
  gradedBy?: string;
  certifiedBy?: string;
  certificationDate?: Date;
  notes?: string;
}

export interface UpdateGradingDTO {
  gradingSystem?: string;
  primaryDefects?: number;
  secondaryDefects?: number;
  defectBreakdown?: DefectItem[];
  screenSizeDistribution?: ScreenSizeDistribution;
  moistureContent?: number;
  waterActivity?: number;
  bulkDensity?: number;
  beanColorAssessment?: string;
  uniformityScore?: number;
  gradedBy?: string;
  certifiedBy?: string;
  certificationDate?: Date;
  notes?: string;
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate full defect equivalents based on SCA standard
 * 1 primary defect = 1 full defect
 * 5 secondary defects = 1 full defect
 */
export function calculateFullDefectEquivalents(
  primaryDefects: number,
  secondaryDefects: number
): number {
  return primaryDefects + (secondaryDefects / 5);
}

/**
 * Determine grade classification based on full defect count (SCA standard)
 */
export function determineGradeClassification(fullDefects: number): string {
  if (fullDefects <= 5) return 'SPECIALTY_GRADE';
  if (fullDefects <= 8) return 'PREMIUM_GRADE';
  if (fullDefects <= 23) return 'EXCHANGE_GRADE';
  return 'BELOW_STANDARD';
}

/**
 * Determine grade label based on classification
 */
export function determineGradeLabel(classification: string): string {
  switch (classification) {
    case 'SPECIALTY_GRADE':
      return 'Grade 1';
    case 'PREMIUM_GRADE':
      return 'Grade 2';
    case 'EXCHANGE_GRADE':
      return 'Grade 3';
    case 'BELOW_STANDARD':
      return 'Below Standard';
    default:
      return 'Ungraded';
  }
}

/**
 * Calculate quality score (0-100) based on various factors
 */
export function calculateQualityScore(grading: Partial<GreenBeanGrading>): number {
  let score = 100;

  // Deduct points for defects (max 40 points)
  const defectDeduction = Math.min(grading.fullDefectEquivalents || 0, 40);
  score -= defectDeduction;

  // Deduct points for poor moisture content (max 10 points)
  if (grading.moistureContent) {
    const idealMoisture = 11; // 11% is ideal
    const moistureDiff = Math.abs(grading.moistureContent - idealMoisture);
    score -= Math.min(moistureDiff * 2, 10);
  }

  // Deduct points for poor water activity (max 10 points)
  if (grading.waterActivity) {
    const idealWaterActivity = 0.60; // 0.60 is ideal
    const waterActivityDiff = Math.abs(grading.waterActivity - idealWaterActivity);
    score -= Math.min(waterActivityDiff * 100, 10);
  }

  // Add points for good bulk density (max 10 points)
  // Ideal density for specialty coffee: 650-750 g/L
  if (grading.bulkDensity) {
    const idealDensity = 700; // 700 g/L is ideal
    const densityDiff = Math.abs(grading.bulkDensity - idealDensity);
    const densityPoints = Math.max(0, 10 - (densityDiff / 50) * 10);
    score += densityPoints;
  }

  // Add points for good uniformity (max 10 points)
  if (grading.uniformityScore) {
    score += (grading.uniformityScore / 10) * 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate average screen size from distribution
 */
export function calculateAverageScreenSize(distribution: ScreenSizeDistribution): number {
  const sizes = [13, 14, 15, 16, 17, 18, 19, 20];
  let totalBeans = 0;
  let weightedSum = 0;

  sizes.forEach(size => {
    const count = distribution[`size${size}` as keyof ScreenSizeDistribution] || 0;
    totalBeans += count;
    weightedSum += size * count;
  });

  return totalBeans > 0 ? weightedSum / totalBeans : 0;
}

/**
 * Calculate uniformity percentage (percentage of beans in dominant size)
 */
export function calculateUniformityPercentage(distribution: ScreenSizeDistribution): number {
  const sizes = [14, 15, 16, 17, 18, 19, 20];
  const counts = sizes.map(size => distribution[`size${size}` as keyof ScreenSizeDistribution] || 0);
  const totalBeans = counts.reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...counts);

  return totalBeans > 0 ? (maxCount / totalBeans) * 100 : 0;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class GreenBeanGradingService {
  /**
   * Get grading by sample ID
   */
  async getGradingBySampleId(sampleId: string): Promise<GreenBeanGrading | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM green_bean_gradings WHERE "sampleId" = $1`,
        [sampleId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.mapRowToGrading(row);
    } catch (error) {
      console.error('Error fetching grading:', error);
      throw error;
    }
  }

  /**
   * Create new grading
   */
  async createGrading(data: CreateGradingDTO): Promise<GreenBeanGrading> {
    try {
      const gradingId = uuidv4();
      const primaryDefects = data.primaryDefects || 0;
      const secondaryDefects = data.secondaryDefects || 0;
      const fullDefectEquivalents = calculateFullDefectEquivalents(primaryDefects, secondaryDefects);
      const classification = determineGradeClassification(fullDefectEquivalents);
      const grade = determineGradeLabel(classification);

      // Calculate screen size metrics if distribution provided
      let averageScreenSize = null;
      let uniformityPercentage = null;
      if (data.screenSizeDistribution) {
        averageScreenSize = calculateAverageScreenSize(data.screenSizeDistribution);
        uniformityPercentage = calculateUniformityPercentage(data.screenSizeDistribution);
      }

      // Calculate quality score
      const qualityScore = calculateQualityScore({
        fullDefectEquivalents,
        moistureContent: data.moistureContent,
        waterActivity: data.waterActivity,
        bulkDensity: data.bulkDensity,
        uniformityScore: data.uniformityScore,
      });

      const result = await pool.query(
        `INSERT INTO green_bean_gradings (
          id, "sampleId", "gradingSystem", "primaryDefects", "secondaryDefects",
          "fullDefectEquivalents", "defectBreakdown", "screenSizeDistribution",
          "averageScreenSize", "uniformityPercentage", "moistureContent",
          "waterActivity", "bulkDensity", "beanColorAssessment", "uniformityScore",
          grade, classification, "qualityScore", "gradedBy", "gradedAt",
          "certifiedBy", "certificationDate", notes, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
        ) RETURNING *`,
        [
          gradingId,
          data.sampleId,
          data.gradingSystem || 'SCA',
          primaryDefects,
          secondaryDefects,
          fullDefectEquivalents,
          JSON.stringify(data.defectBreakdown || []),
          data.screenSizeDistribution ? JSON.stringify(data.screenSizeDistribution) : null,
          averageScreenSize,
          uniformityPercentage,
          data.moistureContent || null,
          data.waterActivity || null,
          data.bulkDensity || null,
          data.beanColorAssessment ? data.beanColorAssessment : null,
          data.uniformityScore || null,
          grade,
          classification,
          qualityScore,
          data.gradedBy || null,
          data.gradedBy ? new Date() : null,
          data.certifiedBy || null,
          data.certificationDate || null,
          data.notes || null,
        ]
      );

      return this.mapRowToGrading(result.rows[0]);
    } catch (error) {
      console.error('Error creating grading:', error);
      throw error;
    }
  }

  /**
   * Update existing grading
   */
  async updateGrading(sampleId: string, data: UpdateGradingDTO): Promise<GreenBeanGrading> {
    try {
      // Get existing grading
      const existing = await this.getGradingBySampleId(sampleId);
      if (!existing) {
        throw new Error('Grading not found');
      }

      const primaryDefects = data.primaryDefects !== undefined ? data.primaryDefects : existing.primaryDefects;
      const secondaryDefects = data.secondaryDefects !== undefined ? data.secondaryDefects : existing.secondaryDefects;
      const fullDefectEquivalents = calculateFullDefectEquivalents(primaryDefects, secondaryDefects);
      const classification = determineGradeClassification(fullDefectEquivalents);
      const grade = determineGradeLabel(classification);

      // Calculate screen size metrics if distribution provided
      let averageScreenSize = existing.averageScreenSize;
      let uniformityPercentage = existing.uniformityPercentage;
      const screenSizeDistribution = data.screenSizeDistribution || existing.screenSizeDistribution;

      if (data.screenSizeDistribution) {
        averageScreenSize = calculateAverageScreenSize(data.screenSizeDistribution);
        uniformityPercentage = calculateUniformityPercentage(data.screenSizeDistribution);
      }

      // Calculate quality score
      const qualityScore = calculateQualityScore({
        fullDefectEquivalents,
        moistureContent: data.moistureContent !== undefined ? data.moistureContent : existing.moistureContent,
        waterActivity: data.waterActivity !== undefined ? data.waterActivity : existing.waterActivity,
        bulkDensity: data.bulkDensity !== undefined ? data.bulkDensity : existing.bulkDensity,
        uniformityScore: data.uniformityScore !== undefined ? data.uniformityScore : existing.uniformityScore,
      });

      const result = await pool.query(
        `UPDATE green_bean_gradings SET
          "gradingSystem" = $1,
          "primaryDefects" = $2,
          "secondaryDefects" = $3,
          "fullDefectEquivalents" = $4,
          "defectBreakdown" = $5,
          "screenSizeDistribution" = $6,
          "averageScreenSize" = $7,
          "uniformityPercentage" = $8,
          "moistureContent" = $9,
          "waterActivity" = $10,
          "bulkDensity" = $11,
          "beanColorAssessment" = $12,
          "uniformityScore" = $13,
          grade = $14,
          classification = $15,
          "qualityScore" = $16,
          "gradedBy" = $17,
          "gradedAt" = $18,
          "certifiedBy" = $19,
          "certificationDate" = $20,
          notes = $21,
          "updatedAt" = NOW()
        WHERE "sampleId" = $22
        RETURNING *`,
        [
          data.gradingSystem || existing.gradingSystem,
          primaryDefects,
          secondaryDefects,
          fullDefectEquivalents,
          JSON.stringify(data.defectBreakdown || existing.defectBreakdown),
          screenSizeDistribution ? JSON.stringify(screenSizeDistribution) : null,
          averageScreenSize,
          uniformityPercentage,
          data.moistureContent !== undefined ? data.moistureContent : existing.moistureContent,
          data.waterActivity !== undefined ? data.waterActivity : existing.waterActivity,
          data.bulkDensity !== undefined ? data.bulkDensity : existing.bulkDensity,
          data.beanColorAssessment !== undefined ? data.beanColorAssessment : existing.beanColorAssessment,
          data.uniformityScore !== undefined ? data.uniformityScore : existing.uniformityScore,
          grade,
          classification,
          qualityScore,
          data.gradedBy || existing.gradedBy,
          data.gradedBy ? new Date() : existing.gradedAt,
          data.certifiedBy !== undefined ? data.certifiedBy : existing.certifiedBy,
          data.certificationDate !== undefined ? data.certificationDate : existing.certificationDate,
          data.notes !== undefined ? data.notes : existing.notes,
          sampleId,
        ]
      );

      return this.mapRowToGrading(result.rows[0]);
    } catch (error) {
      console.error('Error updating grading:', error);
      throw error;
    }
  }

  /**
   * Delete grading
   */
  async deleteGrading(sampleId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM green_bean_gradings WHERE "sampleId" = $1`,
        [sampleId]
      );

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting grading:', error);
      throw error;
    }
  }

  /**
   * Calculate grade preview without saving
   */
  calculateGradePreview(data: {
    primaryDefects: number;
    secondaryDefects: number;
    moistureContent?: number;
    waterActivity?: number;
    bulkDensity?: number;
    uniformityScore?: number;
  }) {
    const fullDefectEquivalents = calculateFullDefectEquivalents(
      data.primaryDefects,
      data.secondaryDefects
    );
    const classification = determineGradeClassification(fullDefectEquivalents);
    const grade = determineGradeLabel(classification);
    const qualityScore = calculateQualityScore({
      fullDefectEquivalents,
      moistureContent: data.moistureContent,
      waterActivity: data.waterActivity,
      bulkDensity: data.bulkDensity,
      uniformityScore: data.uniformityScore,
    });

    return {
      fullDefectEquivalents,
      classification,
      grade,
      qualityScore,
    };
  }

  /**
   * Map database row to GreenBeanGrading object
   */
  private mapRowToGrading(row: any): GreenBeanGrading {
    return {
      id: row.id,
      sampleId: row.sampleId,
      gradingSystem: row.gradingSystem,
      primaryDefects: row.primaryDefects,
      secondaryDefects: row.secondaryDefects,
      fullDefectEquivalents: parseFloat(row.fullDefectEquivalents),
      defectBreakdown: typeof row.defectBreakdown === 'string'
        ? JSON.parse(row.defectBreakdown)
        : row.defectBreakdown,
      screenSizeDistribution: row.screenSizeDistribution
        ? (typeof row.screenSizeDistribution === 'string'
          ? JSON.parse(row.screenSizeDistribution)
          : row.screenSizeDistribution)
        : undefined,
      averageScreenSize: row.averageScreenSize ? parseFloat(row.averageScreenSize) : undefined,
      uniformityPercentage: row.uniformityPercentage ? parseFloat(row.uniformityPercentage) : undefined,
      moistureContent: row.moistureContent ? parseFloat(row.moistureContent) : undefined,
      waterActivity: row.waterActivity ? parseFloat(row.waterActivity) : undefined,
      bulkDensity: row.bulkDensity ? parseFloat(row.bulkDensity) : undefined,
      beanColorAssessment: row.beanColorAssessment,
      uniformityScore: row.uniformityScore,
      grade: row.grade,
      classification: row.classification,
      qualityScore: row.qualityScore ? parseFloat(row.qualityScore) : undefined,
      gradedBy: row.gradedBy,
      gradedAt: row.gradedAt ? new Date(row.gradedAt) : undefined,
      certifiedBy: row.certifiedBy,
      certificationDate: row.certificationDate ? new Date(row.certificationDate) : undefined,
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export const greenBeanGradingService = new GreenBeanGradingService();

