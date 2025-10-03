'use client';

import { GreenBeanGrading } from '@/types';
import { GradeClassificationBadge } from './GradeClassificationBadge';
import { formatDefectType } from '@/lib/utils/formatters';
import {
  AlertTriangle,
  Droplets,
  Beaker,
  Scale,
  Palette,
  Grid3X3,
  Calendar,
  User,
  Award
} from 'lucide-react';

interface GradingSummaryCardProps {
  grading: GreenBeanGrading;
}

export function GradingSummaryCard({ grading }: GradingSummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Green Bean Grading</h3>
          </div>
          <GradeClassificationBadge
            classification={grading.classification || 'SPECIALTY_GRADE'}
            grade={grading.grade}
            size="md"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Defect Summary */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Defect Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-600">Primary</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{grading.primaryDefects}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-600">Secondary</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{grading.secondaryDefects}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">Full Defects</div>
              <div className="text-2xl font-bold text-gray-900">
                {grading.fullDefectEquivalents.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        {(grading.moistureContent || grading.waterActivity || grading.bulkDensity ||
          grading.beanColorAssessment || grading.uniformityScore) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quality Metrics</h4>
            <div className="space-y-2">
              {grading.moistureContent && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Moisture Content</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {grading.moistureContent.toFixed(1)}%
                  </span>
                </div>
              )}
              {grading.waterActivity && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Water Activity</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {grading.waterActivity.toFixed(2)}
                  </span>
                </div>
              )}
              {grading.bulkDensity && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Bulk Density</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {grading.bulkDensity.toFixed(1)} g/L
                  </span>
                </div>
              )}
              {grading.beanColorAssessment && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Bean Color Assessment</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {grading.beanColorAssessment}
                  </span>
                </div>
              )}
              {grading.uniformityScore && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Uniformity Score</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {grading.uniformityScore}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Quality Score */}
        {grading.qualityScore && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-amber-900 mb-1">Overall Quality Score</div>
                <div className="text-xs text-amber-700">Based on all grading factors</div>
              </div>
              <div className="text-4xl font-bold text-amber-900">
                {grading.qualityScore.toFixed(0)}
                <span className="text-xl text-amber-700">/100</span>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            {grading.gradedBy && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Graded by: {grading.gradedBy}</span>
              </div>
            )}
            {grading.gradedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Graded: {new Date(grading.gradedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {grading.notes && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{grading.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

