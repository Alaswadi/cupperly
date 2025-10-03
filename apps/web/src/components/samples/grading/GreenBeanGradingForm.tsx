'use client';

import { useState, useEffect } from 'react';
import { GreenBeanGrading, GradingSystem, DefectItem, GradeClassification, ScreenSizeDistribution } from '@/types';
import { greenBeanGradingApi } from '@/lib/api';
import { DefectCalculator } from './DefectCalculator';
import { GradeClassificationBadge } from './GradeClassificationBadge';
import { ScreenSizeDistributionComponent } from './ScreenSizeDistribution';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save, Trash2, Beaker, Droplets, Scale, Palette, Grid3X3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GreenBeanGradingFormProps {
  sampleId: string;
  onSaved?: (grading: GreenBeanGrading) => void;
  onGradingUpdate?: (grading: GreenBeanGrading | null) => void;
}

export function GreenBeanGradingForm({ sampleId, onSaved, onGradingUpdate }: GreenBeanGradingFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingGrading, setExistingGrading] = useState<GreenBeanGrading | null>(null);
  
  const [formData, setFormData] = useState({
    gradingSystem: 'SCA' as GradingSystem,
    primaryDefects: 0,
    secondaryDefects: 0,
    defectBreakdown: [] as DefectItem[],
    fullDefectEquivalents: 0,
    classification: 'SPECIALTY_GRADE' as GradeClassification,
    grade: 'Grade 1',
    screenSizeDistribution: {} as ScreenSizeDistribution,
    moistureContent: undefined as number | undefined,
    waterActivity: undefined as number | undefined,
    bulkDensity: undefined as number | undefined,
    beanColorAssessment: undefined as string | undefined,
    uniformityScore: undefined as number | undefined,
    notes: '',
  });

  useEffect(() => {
    loadGrading();
  }, [sampleId]);

  const loadGrading = async () => {
    try {
      setIsLoading(true);
      const response = await greenBeanGradingApi.getGrading(sampleId);
      
      if (response.success && response.data) {
        setExistingGrading(response.data);
        setFormData({
          gradingSystem: response.data.gradingSystem,
          primaryDefects: response.data.primaryDefects,
          secondaryDefects: response.data.secondaryDefects,
          defectBreakdown: response.data.defectBreakdown,
          fullDefectEquivalents: response.data.fullDefectEquivalents,
          classification: response.data.classification || 'SPECIALTY_GRADE',
          grade: response.data.grade || 'Grade 1',
          screenSizeDistribution: response.data.screenSizeDistribution || {},
          moistureContent: response.data.moistureContent,
          waterActivity: response.data.waterActivity,
          bulkDensity: response.data.bulkDensity,
          beanColorAssessment: response.data.beanColorAssessment,
          uniformityScore: response.data.uniformityScore,
          notes: response.data.notes || '',
        });
      }
    } catch (error: any) {
      // 404 is expected if no grading exists yet
      if (error?.response?.status !== 404) {
        console.error('Error loading grading:', error);
        toast.error('Failed to load grading data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefectChange = (defectData: {
    primaryDefects: number;
    secondaryDefects: number;
    defectBreakdown: DefectItem[];
    fullDefectEquivalents: number;
    classification: GradeClassification;
    grade: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...defectData,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const gradingData = {
        gradingSystem: formData.gradingSystem,
        primaryDefects: formData.primaryDefects,
        secondaryDefects: formData.secondaryDefects,
        defectBreakdown: formData.defectBreakdown,
        screenSizeDistribution: formData.screenSizeDistribution,
        moistureContent: formData.moistureContent,
        waterActivity: formData.waterActivity,
        bulkDensity: formData.bulkDensity,
        beanColorAssessment: formData.beanColorAssessment || undefined,
        uniformityScore: formData.uniformityScore,
        notes: formData.notes,
      };

      let response;
      if (existingGrading) {
        response = await greenBeanGradingApi.updateGrading(sampleId, gradingData);
        toast.success('Grading updated successfully!');
      } else {
        response = await greenBeanGradingApi.createGrading(sampleId, gradingData);
        toast.success('Grading created successfully!');
      }

      if (response.success && response.data) {
        setExistingGrading(response.data);
        if (onSaved) {
          onSaved(response.data);
        }
        if (onGradingUpdate) {
          onGradingUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Error saving grading:', error);
      toast.error('Failed to save grading');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGrading) return;

    if (!confirm('Are you sure you want to delete this grading? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      await greenBeanGradingApi.deleteGrading(sampleId);
      toast.success('Grading deleted successfully');
      setExistingGrading(null);
      setFormData({
        gradingSystem: 'SCA',
        primaryDefects: 0,
        secondaryDefects: 0,
        defectBreakdown: [],
        fullDefectEquivalents: 0,
        classification: 'SPECIALTY_GRADE',
        grade: 'Grade 1',
        screenSizeDistribution: {},
        moistureContent: undefined,
        waterActivity: undefined,
        bulkDensity: undefined,
        beanColorAssessment: undefined,
        uniformityScore: undefined,
        notes: '',
      });
      if (onGradingUpdate) {
        onGradingUpdate(null);
      }
    } catch (error) {
      console.error('Error deleting grading:', error);
      toast.error('Failed to delete grading');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Green Bean Grading</h3>
          <p className="text-sm text-gray-500 mt-1">
            Grade green coffee beans according to SCA standards
          </p>
        </div>
        {existingGrading && (
          <GradeClassificationBadge
            classification={formData.classification}
            grade={formData.grade}
            size="lg"
          />
        )}
      </div>

      {/* Defect Calculator */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Defect Analysis</h4>
        <DefectCalculator
          value={{
            primaryDefects: formData.primaryDefects,
            secondaryDefects: formData.secondaryDefects,
            defectBreakdown: formData.defectBreakdown,
          }}
          onChange={handleDefectChange}
        />
      </div>

      {/* Screen Size Distribution */}
      <div>
        <ScreenSizeDistributionComponent
          distribution={formData.screenSizeDistribution}
          onChange={(distribution) => setFormData({ ...formData, screenSizeDistribution: distribution })}
        />
      </div>

      {/* Additional Assessments */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Additional Assessments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Moisture Content */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Droplets className="h-4 w-4 text-gray-400" />
              Moisture Content (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.moistureContent || ''}
              onChange={(e) => setFormData({ ...formData, moistureContent: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="10-12% ideal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Ideal range: 10-12%</p>
          </div>

          {/* Water Activity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Beaker className="h-4 w-4 text-gray-400" />
              Water Activity (aw)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.waterActivity || ''}
              onChange={(e) => setFormData({ ...formData, waterActivity: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="0.55-0.65 ideal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Ideal range: 0.55-0.65</p>
          </div>

          {/* Bulk Density */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Scale className="h-4 w-4 text-gray-400" />
              Bulk Density (g/L)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.bulkDensity || ''}
              onChange={(e) => setFormData({ ...formData, bulkDensity: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="Enter bulk density"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Bean Color Assessment */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Palette className="h-4 w-4 text-gray-400" />
              Bean Color Assessment
            </label>
            <select
              value={formData.beanColorAssessment || ''}
              onChange={(e) => setFormData({ ...formData, beanColorAssessment: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select color assessment</option>
              <option value="Bluish-Green">Bluish-Green (Ideal)</option>
              <option value="Green">Green (Good)</option>
              <option value="Greenish">Greenish (Acceptable)</option>
              <option value="Yellowish">Yellowish (Aged)</option>
              <option value="Pale">Pale (Poor)</option>
              <option value="Brownish">Brownish (Defective)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Bluish-Green indicates fresh, high-quality beans</p>
          </div>

          {/* Uniformity Score */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Grid3X3 className="h-4 w-4 text-gray-400" />
              Uniformity Score (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.uniformityScore || ''}
              onChange={(e) => setFormData({ ...formData, uniformityScore: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Rate overall uniformity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">10 = Excellent uniformity</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Add any additional notes about the grading..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div>
          {existingGrading && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete Grading
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {existingGrading ? 'Update Grading' : 'Save Grading'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

