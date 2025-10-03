'use client';

import { useState, useEffect } from 'react';
import { ScreenSizeDistribution as ScreenSizeDistributionType } from '@/types';

interface ScreenSizeDistributionProps {
  distribution: ScreenSizeDistributionType;
  onChange: (distribution: ScreenSizeDistributionType) => void;
}

const SAMPLE_WEIGHT = 350; // Standard sample weight in grams

const SCREEN_SIZES = [
  { size: 13, label: 'FT 13', inches: '13/64 inch', key: 'size13' },
  { size: 14, label: 'FT 14', inches: '14/64 inch', key: 'size14' },
  { size: 15, label: 'FT 15', inches: '15/64 inch', key: 'size15' },
  { size: 16, label: 'FT 16', inches: '16/64 inch', key: 'size16' },
  { size: 17, label: 'FT 17', inches: '17/64 inch', key: 'size17' },
  { size: 18, label: 'FT 18', inches: '18/64 inch', key: 'size18' },
  { size: 19, label: 'FT 19', inches: '19/64 inch', key: 'size19' },
  { size: 20, label: 'FT 20', inches: '20/64 inch', key: 'size20' },
];

const PEABERRY_SIZES = [
  { size: 8, label: 'PB 8', key: 'pb8' },
  { size: 9, label: 'PB 9', key: 'pb9' },
  { size: 10, label: 'PB 10', key: 'pb10' },
  { size: 11, label: 'PB 11', key: 'pb11' },
  { size: 12, label: 'PB 12', key: 'pb12' },
  { size: 13, label: 'PB 13', key: 'pb13' },
];

export function ScreenSizeDistributionComponent({ distribution, onChange }: ScreenSizeDistributionProps) {
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [showPeaberries, setShowPeaberries] = useState(false);

  useEffect(() => {
    // Convert percentages back to weights when distribution changes
    const newWeights: Record<string, number> = {};
    Object.entries(distribution || {}).forEach(([key, percentage]) => {
      if (percentage) {
        newWeights[key] = Math.round((percentage / 100) * SAMPLE_WEIGHT);
      }
    });
    setWeights(newWeights);
  }, [distribution]);

  const handleWeightChange = (key: string, weight: number) => {
    const newWeights = {
      ...weights,
      [key]: weight,
    };
    setWeights(newWeights);

    // Calculate percentages from weights
    const newDistribution: ScreenSizeDistributionType = {};
    Object.entries(newWeights).forEach(([k, w]) => {
      if (w > 0) {
        newDistribution[k as keyof ScreenSizeDistributionType] = (w / SAMPLE_WEIGHT) * 100;
      }
    });
    onChange(newDistribution);
  };

  const getWeight = (key: string): number => {
    return weights[key] || 0;
  };

  const getPercentage = (key: string): number => {
    const weight = getWeight(key);
    return weight > 0 ? (weight / SAMPLE_WEIGHT) * 100 : 0;
  };

  const getTotalWeight = (): number => {
    return Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);
  };

  const getBarWidth = (key: string): string => {
    const percentage = getPercentage(key);
    return `${Math.min(percentage, 100)}%`;
  };

  const getBarColor = (key: string): string => {
    const percentage = getPercentage(key);
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 10) return 'bg-amber-400';
    if (percentage < 30) return 'bg-amber-500';
    return 'bg-amber-600';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Screen Size
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPeaberries(!showPeaberries)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              showPeaberries
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Flat Beans Row */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">Flat beans</div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {SCREEN_SIZES.map(({ size, label, key }) => {
            const weight = getWeight(key);
            const percentage = getPercentage(key);
            return (
              <div key={key} className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 text-center">{label}</label>
                <input
                  type="number"
                  min="0"
                  max={SAMPLE_WEIGHT}
                  value={weight || ''}
                  onChange={(e) => handleWeightChange(key, Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {percentage > 0 ? `${percentage.toFixed(1)}%` : ''}
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getBarColor(key)}`}
                    style={{ width: getBarWidth(key) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peaberries Row (Advanced) */}
      {showPeaberries && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Peaberries</div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {PEABERRY_SIZES.map(({ size, label, key }) => {
              const weight = getWeight(key);
              const percentage = getPercentage(key);
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1 text-center">{label}</label>
                  <input
                    type="number"
                    min="0"
                    max={SAMPLE_WEIGHT}
                    value={weight || ''}
                    onChange={(e) => handleWeightChange(key, Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {percentage > 0 ? `${percentage.toFixed(1)}%` : ''}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getBarColor(key)}`}
                      style={{ width: getBarWidth(key) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-200">
        <span className="text-sm text-gray-600">Total</span>
        <div className={`px-4 py-2 rounded-lg font-semibold ${
          getTotalWeight() === SAMPLE_WEIGHT
            ? 'bg-green-100 text-green-700'
            : getTotalWeight() > SAMPLE_WEIGHT
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {getTotalWeight()} / {SAMPLE_WEIGHT} g
        </div>
      </div>

      {getTotalWeight() !== SAMPLE_WEIGHT && getTotalWeight() > 0 && (
        <div className="text-xs text-amber-600 text-right">
          {getTotalWeight() > SAMPLE_WEIGHT
            ? `⚠️ Total exceeds ${SAMPLE_WEIGHT}g sample weight`
            : `Note: Total should equal ${SAMPLE_WEIGHT}g for accurate grading`
          }
        </div>
      )}
    </div>
  );
}

