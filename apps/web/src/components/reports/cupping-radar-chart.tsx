'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface CuppingRadarChartProps {
  data: Array<{
    category: string;
    score: number;
    fullMark: number;
  }>;
  sampleName: string;
  flavorDescriptors?: Array<{
    name: string;
    category: 'POSITIVE' | 'NEGATIVE';
    intensity: number;
  }>;
  className?: string;
  sampleId?: string;
}

export function CuppingRadarChart({
  data,
  sampleName,
  flavorDescriptors = [],
  className = "",
  sampleId
}: CuppingRadarChartProps) {
  // Transform SCAA categories to match the radar chart format
  const radarData = [
    { category: 'Aroma', score: data.find(d => d.category === 'aroma')?.score || 0, fullMark: 10 },
    { category: 'Flavor', score: data.find(d => d.category === 'flavor')?.score || 0, fullMark: 10 },
    { category: 'Aftertaste', score: data.find(d => d.category === 'aftertaste')?.score || 0, fullMark: 10 },
    { category: 'Acidity', score: data.find(d => d.category === 'acidity')?.score || 0, fullMark: 10 },
    { category: 'Body', score: data.find(d => d.category === 'body')?.score || 0, fullMark: 10 },
    { category: 'Balance', score: data.find(d => d.category === 'balance')?.score || 0, fullMark: 10 },
    { category: 'Sweetness', score: data.find(d => d.category === 'sweetness')?.score || 0, fullMark: 10 },
    { category: 'Cleanliness', score: data.find(d => d.category === 'cleanliness')?.score || 0, fullMark: 10 },
    { category: 'Uniformity', score: data.find(d => d.category === 'uniformity')?.score || 0, fullMark: 10 },
    { category: 'Overall', score: data.find(d => d.category === 'overall')?.score || 0, fullMark: 10 },
  ];

  // Get all flavor descriptors for display, sorted by intensity
  const allFlavors = flavorDescriptors
    .sort((a, b) => b.intensity - a.intensity);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      data-sample-id={sampleId}
    >
      {/* Header with sample name */}
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-700">
          {sampleName}
        </h4>
      </div>

      {/* Radar Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid 
              stroke="#e5e7eb" 
              strokeWidth={1}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ 
                fontSize: 12, 
                fill: '#6b7280',
                textAnchor: 'middle'
              }}
              className="text-sm"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickCount={6}
            />
            <Radar
              name={sampleName}
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Flavor Descriptors */}
      {allFlavors.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {allFlavors.map((flavor) => (
            <div
              key={flavor.name}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                flavor.category === 'POSITIVE'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {flavor.name} ({flavor.intensity})
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
