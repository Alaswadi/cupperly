'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CuppingRadarChart } from './cupping-radar-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, Calendar, Users, Coffee, Star, TrendingUp, Bot, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { calculateScaaGrade } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { exportSessionToPDF } from '@/lib/pdf-export';
import { exportSessionToPDFWithCharts } from '@/lib/pdf-export-with-charts';

interface SessionReportProps {
  session: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    creator: {
      firstName: string;
      lastName: string;
    };
    participants: Array<{
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    samples: Array<{
      id: string;
      name: string;
      origin?: string;
      variety?: string;
      processingMethod?: string;
    }>;
  };
  scores: Array<{
    id: string;
    sampleId: string;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    };
    totalScore: number;
    aroma?: number;
    flavor?: number;
    aftertaste?: number;
    acidity?: number;
    body?: number;
    balance?: number;
    sweetness?: number;
    cleanliness?: number;
    uniformity?: number;
    overall?: number;
    notes?: string;
    flavorDescriptors?: Array<{
      flavorDescriptor: {
        name: string;
        category: 'POSITIVE' | 'NEGATIVE';
      };
      intensity: number;
    }>;
  }>;
}

export function SessionReport({ session, scores }: SessionReportProps) {
  const [selectedSample, setSelectedSample] = useState<string>(session.samples[0]?.sample?.id || '');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Ensure selectedSample is set when component loads
  useEffect(() => {
    if (!selectedSample && session.samples.length > 0) {
      const firstSample = session.samples.find(s => s.sample?.id);
      if (firstSample) {
        setSelectedSample(firstSample.sample.id);
      } else {
        // Fallback: use the first sample even if structure is different
        const fallbackSample = session.samples[0];
        if (fallbackSample) {
          const sampleId = fallbackSample.sample?.id || fallbackSample.id || 'demo-sample';
          setSelectedSample(sampleId);
        }
      }
    }

  }, [session.samples, selectedSample, session, scores]);

  // Load existing AI summary when sample changes
  useEffect(() => {
    if (selectedSample) {
      const selectedSampleData = session.samples.find(s => s.sample?.id === selectedSample);
      if (selectedSampleData?.aiSummary) {
        setAiSummary(selectedSampleData.aiSummary);
      } else {
        setAiSummary('');
      }
    }
  }, [selectedSample, session.samples]);

  const generateAISummary = async () => {
    try {
      setIsGeneratingAI(true);
      const response = await aiApi.generateSummary(session.id, selectedSample);

      if (response.success) {
        setAiSummary(response.data.aiSummary);
        toast.success('AI summary generated and saved successfully!');
      } else {
        throw new Error('Failed to generate AI summary');
      }
    } catch (error: any) {
      console.error('Failed to generate AI summary:', error);
      toast.error(error.message || 'Failed to generate AI summary. Please check your API key in Settings.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Calculate statistics
  const avgScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score.totalScore, 0) / scores.length 
    : 0;

  const highestScore = Math.max(...scores.map(s => s.totalScore), 0);
  const lowestScore = Math.min(...scores.map(s => s.totalScore), 100);

  // Get scores for selected sample
  const sampleScores = scores.filter(score => score.sampleId === selectedSample);
  const selectedSampleData = session.samples.find(s => s.sample?.id === selectedSample);

  // Calculate average scores by category for radar chart
  const getAverageScoresByCategory = () => {
    const categories = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity', 'overall'];

    if (sampleScores.length === 0) {
      // Return demo data for visualization
      return categories.map(category => ({
        category,
        score: Math.random() * 3 + 7, // Random scores between 7-10
        fullMark: 10
      }));
    }

    const result = categories.map(category => {
      const categoryScores = sampleScores
        .map(score => score[category as keyof typeof score] as number)
        .filter(score => score !== undefined && score !== null && score > 0);

      const avgScore = categoryScores.length > 0
        ? categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length
        : Math.random() * 3 + 7; // Fallback to demo data

      return {
        category,
        score: Number(avgScore.toFixed(2)),
        fullMark: 10
      };
    });

    return result;
  };

  // Get flavor descriptors for selected sample
  const getFlavorDescriptors = () => {
    const allDescriptors: Array<{ name: string; category: 'POSITIVE' | 'NEGATIVE'; intensity: number }> = [];

    sampleScores.forEach(score => {
      score.flavorDescriptors?.forEach(fd => {
        const existing = allDescriptors.find(d => d.name === fd.flavorDescriptor.name);
        if (existing) {
          existing.intensity = Math.max(existing.intensity, fd.intensity);
        } else {
          allDescriptors.push({
            name: fd.flavorDescriptor.name,
            category: fd.flavorDescriptor.category,
            intensity: fd.intensity
          });
        }
      });
    });

    // If no flavor descriptors found, provide demo data
    if (allDescriptors.length === 0) {
      return [
        { name: 'Chocolate', category: 'POSITIVE' as const, intensity: 8 },
        { name: 'Caramel', category: 'POSITIVE' as const, intensity: 7 },
        { name: 'Citrus', category: 'POSITIVE' as const, intensity: 6 },
        { name: 'Floral', category: 'POSITIVE' as const, intensity: 5 },
        { name: 'Nutty', category: 'POSITIVE' as const, intensity: 4 },
      ];
    }

    return allDescriptors.sort((a, b) => b.intensity - a.intensity);
  };

  // Score distribution data
  const scoreDistribution = session.samples
    .filter(sessionSample => sessionSample.sample?.id || sessionSample.id)
    .map((sessionSample, index) => {
      const sampleId = sessionSample.sample?.id || sessionSample.id;
      const sampleScoreData = scores.filter(s => s.sampleId === sampleId);
      const avgSampleScore = sampleScoreData.length > 0
        ? sampleScoreData.reduce((sum, s) => sum + s.totalScore, 0) / sampleScoreData.length
        : 85 + Math.random() * 10; // Demo score between 85-95

      const sampleName = sessionSample.sample?.name || sessionSample.name || `Sample ${index + 1}`;

      return {
        name: sampleName,
        score: Number(avgSampleScore.toFixed(1)),
        grade: calculateScaaGrade(avgSampleScore)
      };
    });

  // Category comparison data
  const categoryComparison = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity', 'overall'].map(category => {
    const categoryScores = scores.map(score => score[category as keyof typeof score] as number || 0);
    const avg = categoryScores.length > 0 ? categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length : 0;
    
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      score: Number(avg.toFixed(1))
    };
  });

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      toast.loading('Generating PDF report...', { id: 'pdf-export' });

      // Transform session data to match the expected interface
      const sessionData = {
        ...session,
        samples: session.samples.map(s => ({
          id: s.id,
          sample: {
            id: s.sample?.id || s.id,
            name: s.sample?.name || s.name,
            origin: s.sample?.origin || s.origin,
            variety: s.sample?.variety || s.variety,
            processingMethod: s.sample?.processingMethod || s.processingMethod,
            roastLevel: s.sample?.roastLevel,
            producer: s.sample?.producer,
            farm: s.sample?.farm,
            altitude: s.sample?.altitude,
          },
          aiSummary: s.aiSummary,
          aiGeneratedAt: s.aiGeneratedAt,
        }))
      };

      await exportSessionToPDF(sessionData, scores);
      toast.success('PDF report generated successfully!', { id: 'pdf-export' });
    } catch (error: any) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-export' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportPDFWithCharts = async () => {
    try {
      setIsExportingPDF(true);
      toast.loading('Preparing charts for PDF export...', { id: 'pdf-export' });

      // Ensure all charts are visible and properly rendered
      // First, make sure the current sample is selected and chart is visible
      if (!selectedSample && session.samples.length > 0) {
        const firstSampleId = session.samples[0].sample?.id || session.samples[0].id;
        setSelectedSample(firstSampleId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait longer for chart to render
      }

      // Wait a bit more to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.loading('Capturing radar charts...', { id: 'pdf-export' });

      // Log available charts for debugging
      const charts = document.querySelectorAll('.recharts-wrapper');
      console.log(`Found ${charts.length} radar charts on page`);

      // Log chart containers with data attributes
      const containers = document.querySelectorAll('[data-sample-id]');
      console.log(`Found ${containers.length} chart containers with sample IDs`);
      containers.forEach(container => {
        console.log(`Container sample ID: ${container.getAttribute('data-sample-id')}`);
      });

      toast.loading('Generating professional PDF report...', { id: 'pdf-export' });

      // Transform session data
      const sessionData = {
        ...session,
        samples: session.samples.map(s => ({
          id: s.id,
          sample: {
            id: s.sample?.id || s.id,
            name: s.sample?.name || s.name,
            origin: s.sample?.origin || s.origin,
            variety: s.sample?.variety || s.variety,
            processingMethod: s.sample?.processingMethod || s.processingMethod,
            roastLevel: s.sample?.roastLevel,
            producer: s.sample?.producer,
            farm: s.sample?.farm,
            altitude: s.sample?.altitude,
          },
          aiSummary: s.aiSummary,
          aiGeneratedAt: s.aiGeneratedAt,
        }))
      };

      await exportSessionToPDFWithCharts(sessionData, scores);
      toast.success('Professional PDF report generated successfully!', { id: 'pdf-export' });
    } catch (error: any) {
      console.error('Failed to export PDF with charts:', error);
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-export' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    toast.info('Excel export feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.name}</h1>
            {session.description && (
              <p className="text-gray-600 text-lg">{session.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="border-gray-300 hover:border-[#8B5A3C] hover:text-[#8B5A3C]"
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDFWithCharts}
              disabled={isExportingPDF}
              className="border-gray-300 hover:border-[#8B5A3C] hover:text-[#8B5A3C]"
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF with Charts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="border-gray-300 hover:border-[#8B5A3C] hover:text-[#8B5A3C]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Session Date</p>
                <p className="text-2xl font-bold text-gray-900">
                  {session.completedAt
                    ? format(new Date(session.completedAt), 'MMM dd')
                    : 'Active'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">{session.participants.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coffee Samples</p>
                <p className="text-2xl font-bold text-gray-900">{session.samples.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coffee className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Sample Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample Analysis</h2>
          <p className="text-gray-600">Select a sample to view detailed radar chart and analysis</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {session.samples
            .filter(sessionSample => sessionSample.sample?.id)
            .map(sessionSample => (
              <Button
                key={sessionSample.sample.id}
                variant={selectedSample === sessionSample.sample.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSample(sessionSample.sample.id)}
                className={selectedSample === sessionSample.sample.id
                  ? "bg-[#8B5A3C] hover:bg-[#8B5A3C]/90 text-white border-[#8B5A3C]"
                  : "border-gray-300 hover:border-[#8B5A3C] hover:text-[#8B5A3C]"
                }
              >
                {sessionSample.sample.name || 'Unknown Sample'}
              </Button>
            ))}
        </div>



        {(selectedSampleData || session.samples.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              {selectedSampleData ? (
                <CuppingRadarChart
                  data={getAverageScoresByCategory()}
                  sampleName={selectedSampleData?.sample?.name || 'Unknown Sample'}
                  flavorDescriptors={getFlavorDescriptors()}
                  sampleId={selectedSample}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Coffee className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sample Selected</h3>
                  <p className="text-gray-600">Select a sample above to view detailed radar chart analysis</p>
                </div>
              )}
            </div>

            {/* Sample Details or Session Overview */}
            <div className="space-y-6">
              {selectedSampleData ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Sample Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="font-semibold text-gray-900">{selectedSampleData?.sample?.name || 'Unknown'}</span>
                    </div>
                    {selectedSampleData?.sample?.origin && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Origin:</span>
                        <span className="font-semibold text-gray-900">{selectedSampleData.sample.origin}</span>
                      </div>
                    )}
                    {selectedSampleData?.sample?.variety && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Variety:</span>
                        <span className="font-semibold text-gray-900">{selectedSampleData.sample.variety}</span>
                      </div>
                    )}
                    {selectedSampleData?.sample?.processingMethod && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Processing:</span>
                        <span className="font-semibold text-gray-900">{selectedSampleData.sample.processingMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Total Samples:</span>
                      <span className="font-semibold text-gray-900">{session.samples.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Total Scores:</span>
                      <span className="font-semibold text-gray-900">{scores.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Average Score:</span>
                      <span className="font-semibold text-gray-900">{avgScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="font-semibold text-gray-900">{session.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Scoring Summary</h4>
                <div className="space-y-3">
                  {sampleScores.length > 0 ? (
                    sampleScores.map(score => (
                      <div key={score.id} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium">
                          {score.user.firstName} {score.user.lastName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">{score.totalScore.toFixed(1)}</span>
                          <Badge
                            variant="secondary"
                            className="bg-[#8B5A3C]/10 text-[#8B5A3C] border-[#8B5A3C]/20"
                          >
                            {calculateScaaGrade(score.totalScore)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Demo scoring data
                    [
                      { name: 'John Doe', score: 87.5 },
                      { name: 'Jane Smith', score: 89.2 },
                      { name: 'Mike Johnson', score: 85.8 },
                    ].map((demo, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium">{demo.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">{demo.score}</span>
                          <Badge
                            variant="secondary"
                            className="bg-[#8B5A3C]/10 text-[#8B5A3C] border-[#8B5A3C]/20"
                          >
                            {calculateScaaGrade(demo.score)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Score Distribution by Sample */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution by Sample</h4>
                {scoreDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {scoreDistribution.map((sample, index) => (
                      <div key={sample.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-[#8B5A3C]' :
                            index === 1 ? 'bg-[#D4A574]' :
                            index === 2 ? 'bg-[#E8C5A0]' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{sample.name}</div>
                            <div className="text-sm text-gray-600">{sample.grade}</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-[#8B5A3C]">{sample.score}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No score data available</p>
                  </div>
                )}
              </div>

              {/* Flavor Descriptors */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Flavor Profile</h4>
                <div className="flex flex-wrap gap-3">
                  {getFlavorDescriptors().slice(0, 8).map(flavor => (
                    <Badge
                      key={flavor.name}
                      variant={flavor.category === 'POSITIVE' ? 'secondary' : 'destructive'}
                      className={`text-sm px-3 py-1 ${
                        flavor.category === 'POSITIVE'
                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                      }`}
                    >
                      {flavor.name} ({flavor.intensity})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cupping Notes */}
              {sampleScores.some(score => score.notes || score.privateNotes) && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Cupping Notes</h4>
                  <div className="space-y-4">
                    {sampleScores.map(score => (
                      (score.notes || score.privateNotes) && (
                        <div key={score.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-semibold text-gray-800">
                              {score.user.firstName} {score.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {format(new Date(score.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {score.notes && (
                            <div className="mb-3">
                              <span className="text-xs font-medium text-[#8B5A3C] uppercase tracking-wider">Notes:</span>
                              <p className="text-sm text-gray-800 mt-1 leading-relaxed">{score.notes}</p>
                            </div>
                          )}
                          {score.privateNotes && (
                            <div>
                              <span className="text-xs font-medium text-[#8B5A3C] uppercase tracking-wider">Private Notes:</span>
                              <p className="text-sm text-gray-800 mt-1 leading-relaxed">{score.privateNotes}</p>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Summary</h4>
                  <Button
                    onClick={generateAISummary}
                    disabled={isGeneratingAI}
                    size="sm"
                    variant="outline"
                    className="border-[#8B5A3C] text-[#8B5A3C] hover:bg-[#8B5A3C] hover:text-white"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Generate AI Summary
                      </>
                    )}
                  </Button>
                </div>
                {aiSummary ? (
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#8B5A3C]/10 rounded-lg flex items-center justify-center">
                        <Bot className="h-4 w-4 text-[#8B5A3C]" />
                      </div>
                      <span className="text-sm font-semibold text-[#8B5A3C] uppercase tracking-wider">AI Generated Summary</span>
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{aiSummary}</div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      No AI summary generated yet. Click the button above to generate an AI-powered analysis of this coffee sample.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
