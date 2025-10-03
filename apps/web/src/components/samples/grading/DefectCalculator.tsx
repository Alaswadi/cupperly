'use client';

import { useState, useEffect } from 'react';
import { DefectItem, GradeClassification } from '@/types';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle, Plus, Trash2 } from 'lucide-react';

// SCA Standard Defect Types
const PRIMARY_DEFECT_TYPES = [
  { value: 'full_black', label: 'Full Black' },
  { value: 'full_sour', label: 'Full Sour' },
  { value: 'dried_cherry', label: 'Dried Cherry/Pod' },
  { value: 'fungus_damage', label: 'Fungus Damage' },
  { value: 'foreign_matter', label: 'Foreign Matter' },
  { value: 'severe_insect', label: 'Severe Insect Damage' },
];

const SECONDARY_DEFECT_TYPES = [
  { value: 'partial_black', label: 'Partial Black' },
  { value: 'partial_sour', label: 'Partial Sour' },
  { value: 'parchment', label: 'Parchment' },
  { value: 'floater', label: 'Floater' },
  { value: 'immature', label: 'Immature/Unripe' },
  { value: 'withered', label: 'Withered' },
  { value: 'shell', label: 'Shell' },
  { value: 'broken_chipped', label: 'Broken/Chipped/Cut' },
  { value: 'hull_husk', label: 'Hull/Husk' },
  { value: 'slight_insect', label: 'Slight Insect Damage' },
];

interface DefectCalculatorProps {
  value?: {
    primaryDefects: number;
    secondaryDefects: number;
    defectBreakdown: DefectItem[];
  };
  onChange: (value: {
    primaryDefects: number;
    secondaryDefects: number;
    defectBreakdown: DefectItem[];
    fullDefectEquivalents: number;
    classification: GradeClassification;
    grade: string;
  }) => void;
}

export function DefectCalculator({ value, onChange }: DefectCalculatorProps) {
  const [defectBreakdown, setDefectBreakdown] = useState<DefectItem[]>(value?.defectBreakdown || []);

  // Calculate totals from breakdown
  const primaryDefects = defectBreakdown
    .filter(d => d.category === 1)
    .reduce((sum, d) => sum + d.count, 0);
  
  const secondaryDefects = defectBreakdown
    .filter(d => d.category === 2)
    .reduce((sum, d) => sum + d.count, 0);

  const fullDefectEquivalents = primaryDefects + (secondaryDefects / 5);

  // Determine classification
  const getClassification = (fullDefects: number): GradeClassification => {
    if (fullDefects <= 5) return 'SPECIALTY_GRADE';
    if (fullDefects <= 8) return 'PREMIUM_GRADE';
    if (fullDefects <= 23) return 'EXCHANGE_GRADE';
    return 'BELOW_STANDARD';
  };

  const getGradeLabel = (classification: GradeClassification): string => {
    switch (classification) {
      case 'SPECIALTY_GRADE': return 'Grade 1';
      case 'PREMIUM_GRADE': return 'Grade 2';
      case 'EXCHANGE_GRADE': return 'Grade 3';
      case 'BELOW_STANDARD': return 'Below Standard';
      default: return 'Ungraded';
    }
  };

  const classification = getClassification(fullDefectEquivalents);
  const grade = getGradeLabel(classification);

  // Notify parent of changes
  useEffect(() => {
    onChange({
      primaryDefects,
      secondaryDefects,
      defectBreakdown,
      fullDefectEquivalents,
      classification,
      grade,
    });
  }, [defectBreakdown]);

  const addDefect = (category: 1 | 2) => {
    const newDefect: DefectItem = {
      type: category === 1 ? PRIMARY_DEFECT_TYPES[0].value : SECONDARY_DEFECT_TYPES[0].value,
      count: 1,
      category,
    };
    setDefectBreakdown([...defectBreakdown, newDefect]);
  };

  const updateDefect = (index: number, field: keyof DefectItem, value: any) => {
    const updated = [...defectBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    setDefectBreakdown(updated);
  };

  const removeDefect = (index: number) => {
    setDefectBreakdown(defectBreakdown.filter((_, i) => i !== index));
  };

  const getClassificationColor = (classification: GradeClassification) => {
    switch (classification) {
      case 'SPECIALTY_GRADE': return 'text-green-600 bg-green-50 border-green-200';
      case 'PREMIUM_GRADE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'EXCHANGE_GRADE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'BELOW_STANDARD': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getClassificationIcon = (classification: GradeClassification) => {
    switch (classification) {
      case 'SPECIALTY_GRADE': return <CheckCircle className="h-6 w-6" />;
      case 'PREMIUM_GRADE': return <AlertCircle className="h-6 w-6" />;
      case 'EXCHANGE_GRADE': return <AlertTriangle className="h-6 w-6" />;
      case 'BELOW_STANDARD': return <XCircle className="h-6 w-6" />;
      default: return <AlertCircle className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Defects (Category 1) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Primary Defects (Category 1)</h4>
            <p className="text-xs text-gray-500 mt-1">1 primary defect = 1 full defect equivalent</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{primaryDefects}</div>
            <div className="text-xs text-gray-500">Total Count</div>
          </div>
        </div>

        <div className="space-y-2">
          {defectBreakdown
            .map((defect, index) => ({ defect, index }))
            .filter(({ defect }) => defect.category === 1)
            .map(({ defect, index }) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={defect.type}
                  onChange={(e) => updateDefect(index, 'type', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {PRIMARY_DEFECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={defect.count}
                  onChange={(e) => updateDefect(index, 'count', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeDefect(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>

        <button
          onClick={() => addDefect(1)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Primary Defect
        </button>
      </div>

      {/* Secondary Defects (Category 2) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Secondary Defects (Category 2)</h4>
            <p className="text-xs text-gray-500 mt-1">5 secondary defects = 1 full defect equivalent</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{secondaryDefects}</div>
            <div className="text-xs text-gray-500">Total Count</div>
          </div>
        </div>

        <div className="space-y-2">
          {defectBreakdown
            .map((defect, index) => ({ defect, index }))
            .filter(({ defect }) => defect.category === 2)
            .map(({ defect, index }) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={defect.type}
                  onChange={(e) => updateDefect(index, 'type', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {SECONDARY_DEFECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={defect.count}
                  onChange={(e) => updateDefect(index, 'count', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeDefect(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>

        <button
          onClick={() => addDefect(2)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Secondary Defect
        </button>
      </div>

      {/* Results Summary */}
      <div className={`border-2 rounded-lg p-6 ${getClassificationColor(classification)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getClassificationIcon(classification)}
            <div>
              <div className="text-sm font-medium opacity-75">Classification</div>
              <div className="text-2xl font-bold">{grade}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium opacity-75">Full Defect Equivalents</div>
            <div className="text-3xl font-bold">{fullDefectEquivalents.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-current opacity-50">
          <div className="text-xs">
            <strong>SCA Grading Scale:</strong> Specialty (0-5) • Premium (6-8) • Exchange (9-23) • Below Standard (24+)
          </div>
        </div>
      </div>
    </div>
  );
}

