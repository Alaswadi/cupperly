'use client';

import { useState } from 'react';
import { GreenBeanGrading } from '@/types';
import { GradeClassificationBadge } from './GradeClassificationBadge';
import { formatDefectType, formatProcessingMethod } from '@/lib/utils/formatters';
import { generateGradingPDF } from '@/lib/utils/pdfGenerator';
import {
  Award,
  AlertTriangle,
  Droplets,
  Beaker,
  Scale,
  Palette,
  Grid3X3,
  TrendingUp,
  FileText,
  Download,
  Printer,
  Loader2
} from 'lucide-react';

interface GreenBeanGradingReportProps {
  grading: GreenBeanGrading;
  sampleName?: string;
  sampleOrigin?: string;
  sampleRegion?: string;
  sampleVariety?: string;
  processingMethod?: string;
}

export function GreenBeanGradingReport({ grading, sampleName, sampleOrigin, sampleRegion, sampleVariety, processingMethod }: GreenBeanGradingReportProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      await generateGradingPDF({
        grading,
        sampleName,
        sampleOrigin,
        sampleRegion,
        sampleVariety,
        processingMethod,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getQualityScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getQualityScoreBg = (score?: number) => {
    if (!score) return 'bg-gray-50';
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const calculateScreenSizePercentages = () => {
    if (!grading.screenSizeDistribution) return [];
    
    const sizes = [13, 14, 15, 16, 17, 18, 19, 20];
    return sizes.map(size => ({
      size,
      percentage: (grading.screenSizeDistribution as any)[`size${size}`] || 0
    })).filter(item => item.percentage > 0);
  };

  return (
    <div className="bg-white">
      {/* Header - Print/Download Actions */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Green Bean Grading Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div id="grading-report-content" className="space-y-6">
        {/* Report Header */}
        <div className="border-b-2 border-gray-900 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Green Coffee Bean Grading Report
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                {sampleName && <div><span className="font-medium">Sample:</span> {sampleName}</div>}
                {sampleOrigin && <div><span className="font-medium">Origin:</span> {sampleOrigin}</div>}
                {sampleRegion && <div><span className="font-medium">Region:</span> {sampleRegion}</div>}
                {sampleVariety && <div><span className="font-medium">Variety:</span> {sampleVariety}</div>}
                {processingMethod && <div><span className="font-medium">Processing:</span> {formatProcessingMethod(processingMethod)}</div>}
                <div><span className="font-medium">Grading System:</span> SCA (Specialty Coffee Association)</div>
                {grading.gradedAt && (
                  <div><span className="font-medium">Date:</span> {new Date(grading.gradedAt).toLocaleDateString()}</div>
                )}
                {grading.gradedBy && (
                  <div><span className="font-medium">Graded By:</span> {grading.gradedBy}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <GradeClassificationBadge
                classification={grading.classification || 'SPECIALTY_GRADE'}
                grade={grading.grade}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Overall Quality Score */}
        <div className={`${getQualityScoreBg(grading.qualityScore)} rounded-lg p-6 border-2 border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Overall Quality Score</h3>
              </div>
              <p className="text-sm text-gray-600">
                Calculated based on defects, moisture, water activity, density, and uniformity
              </p>
            </div>
            <div className={`text-6xl font-bold ${getQualityScoreColor(grading.qualityScore)}`}>
              {grading.qualityScore ? grading.qualityScore.toFixed(1) : 'N/A'}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
        </div>

        {/* Defect Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Defect Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
              <div className="text-sm font-medium text-red-600 mb-1">Primary Defects (Cat 1)</div>
              <div className="text-3xl font-bold text-red-900">{grading.primaryDefects}</div>
              <div className="text-xs text-red-600 mt-1">1 defect = 1 full equivalent</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <div className="text-sm font-medium text-yellow-600 mb-1">Secondary Defects (Cat 2)</div>
              <div className="text-3xl font-bold text-yellow-900">{grading.secondaryDefects}</div>
              <div className="text-xs text-yellow-600 mt-1">5 defects = 1 full equivalent</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
              <div className="text-sm font-medium text-gray-600 mb-1">Full Defect Equivalents</div>
              <div className="text-3xl font-bold text-gray-900">
                {grading.fullDefectEquivalents.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {grading.fullDefectEquivalents <= 5 ? 'Specialty Grade' :
                 grading.fullDefectEquivalents <= 8 ? 'Premium Grade' :
                 grading.fullDefectEquivalents <= 23 ? 'Exchange Grade' : 'Below Standard'}
              </div>
            </div>
          </div>

          {/* Defect Breakdown */}
          {grading.defectBreakdown && grading.defectBreakdown.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Defect Breakdown</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-semibold text-gray-700">Defect Type</th>
                      <th className="text-center py-2 font-semibold text-gray-700">Category</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grading.defectBreakdown.map((defect, index) => (
                      <tr key={index} className="border-b border-gray-200 last:border-0">
                        <td className="py-2 text-gray-900">{formatDefectType(defect.type)}</td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            defect.category === 1 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            Cat {defect.category}
                          </span>
                        </td>
                        <td className="text-right py-2 font-medium text-gray-900">{defect.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Physical & Chemical Properties */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-blue-600" />
            Physical & Chemical Properties
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {grading.moistureContent && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Moisture Content</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{grading.moistureContent.toFixed(1)}%</div>
                <div className="text-xs text-blue-700 mt-1">Ideal: 10-12%</div>
              </div>
            )}
            {grading.waterActivity && (
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <Beaker className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm font-medium text-cyan-900">Water Activity (aw)</span>
                </div>
                <div className="text-2xl font-bold text-cyan-900">{grading.waterActivity.toFixed(2)}</div>
                <div className="text-xs text-cyan-700 mt-1">Ideal: 0.55-0.65</div>
              </div>
            )}
            {grading.bulkDensity && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Bulk Density</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{grading.bulkDensity.toFixed(1)} g/L</div>
                <div className="text-xs text-purple-700 mt-1">Ideal: 650-750 g/L</div>
              </div>
            )}
            {grading.beanColorAssessment && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Bean Color Assessment</span>
                </div>
                <div className="text-xl font-bold text-amber-900">{grading.beanColorAssessment}</div>
                <div className="text-xs text-amber-700 mt-1">Visual assessment</div>
              </div>
            )}
          </div>
        </div>

        {/* Screen Size Distribution */}
        {grading.screenSizeDistribution && calculateScreenSizePercentages().length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              Screen Size Distribution
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                {calculateScreenSizePercentages().map(({ size, percentage }) => (
                  <div key={size}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Screen {size} ({size}/64 inch)</span>
                      <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {grading.averageScreenSize && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Average Screen Size</span>
                    <span className="text-lg font-bold text-gray-900">{grading.averageScreenSize.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Uniformity */}
        {grading.uniformityScore && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uniformity Assessment</h3>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-900 mb-1">Uniformity Score</div>
                  <div className="text-xs text-green-700">Bean size and color consistency</div>
                </div>
                <div className="text-4xl font-bold text-green-900">
                  {grading.uniformityScore}<span className="text-xl text-green-700">/10</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {grading.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Additional Notes
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{grading.notes}</p>
            </div>
          </div>
        )}

        {/* Certification */}
        {grading.certifiedBy && (
          <div className="border-t-2 border-gray-900 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Certified By</div>
                <div className="text-lg font-semibold text-gray-900">{grading.certifiedBy}</div>
              </div>
              {grading.certificationDate && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Certification Date</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(grading.certificationDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

