'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { BarChart3 } from 'lucide-react';
import { calculateScaaGrade } from '@/lib/utils';
import { FlavorDescriptorSelector } from './flavor-descriptor-selector';

// Custom validation for quarter-point increments
const quarterPointScore = z.number()
  .min(6, "Score must be at least 6")
  .max(10, "Score must be at most 10")
  .refine((val) => {
    // Check if the value is a multiple of 0.25
    return (val * 4) % 1 === 0;
  }, "Score must be in quarter-point increments (e.g., 6.00, 6.25, 6.50, 6.75)");

// SCAA Standard scoring schema
const scaaScoreSchema = z.object({
  aroma: quarterPointScore,
  flavor: quarterPointScore,
  aftertaste: quarterPointScore,
  acidity: quarterPointScore,
  body: quarterPointScore,
  balance: quarterPointScore,
  sweetness: quarterPointScore,
  cleanliness: quarterPointScore,
  uniformity: quarterPointScore,
  overall: quarterPointScore,
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  defects: z.array(z.object({
    type: z.string(),
    intensity: z.number(),
    description: z.string().optional(),
  })).optional(),
  flavorDescriptors: z.array(z.object({
    id: z.string(),
    intensity: z.number().min(1).max(5),
    flavorDescriptor: z.object({
      id: z.string(),
      name: z.string(),
      category: z.enum(['POSITIVE', 'NEGATIVE']),
      description: z.string().optional(),
    }).optional(),
  })).optional(),
});

type ScaaScoreForm = z.infer<typeof scaaScoreSchema>;

interface ScaaScoreFormProps {
  sampleName: string;
  initialScore?: Partial<ScaaScoreForm>;
  onSubmit: (data: ScaaScoreForm & { isSubmitted: boolean }) => Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

const SCAA_CATEGORIES = [
  {
    name: 'aroma',
    label: 'Aroma',
    description: 'The fragrance and aroma of the coffee',
    weight: 1,
  },
  {
    name: 'flavor',
    label: 'Flavor',
    description: 'The taste characteristics of the coffee',
    weight: 1,
  },
  {
    name: 'aftertaste',
    label: 'Aftertaste',
    description: 'The lingering taste after swallowing',
    weight: 1,
  },
  {
    name: 'acidity',
    label: 'Acidity',
    description: 'The brightness and liveliness of the coffee',
    weight: 1,
  },
  {
    name: 'body',
    label: 'Body',
    description: 'The weight and mouthfeel of the coffee',
    weight: 1,
  },
  {
    name: 'balance',
    label: 'Balance',
    description: 'How well the flavors work together',
    weight: 1,
  },
  {
    name: 'sweetness',
    label: 'Sweetness',
    description: 'The natural sweetness of the coffee',
    weight: 1,
  },
  {
    name: 'cleanliness',
    label: 'Cleanliness',
    description: 'Freedom from defects and off-flavors',
    weight: 1,
  },
  {
    name: 'uniformity',
    label: 'Uniformity',
    description: 'Consistency across multiple cups',
    weight: 1,
  },
  {
    name: 'overall',
    label: 'Overall',
    description: 'Overall impression and quality',
    weight: 1,
  },
];

export function ScaaScoreForm({
  sampleName,
  initialScore,
  onSubmit,
  isSubmitting = false,
  readOnly = false,
}: ScaaScoreFormProps) {
  const [totalScore, setTotalScore] = useState(0);
  const [isDraft, setIsDraft] = useState(true);
  const [flavorDescriptors, setFlavorDescriptors] = useState<Array<{
    id: string;
    intensity: number;
    flavorDescriptor?: any;
  }>>(initialScore?.flavorDescriptors?.filter((fd): fd is { id: string; intensity: number; flavorDescriptor?: any } =>
    typeof fd.id === 'string' && typeof fd.intensity === 'number'
  ) || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScaaScoreForm>({
    resolver: zodResolver(scaaScoreSchema),
    defaultValues: {
      aroma: initialScore?.aroma || 6,
      flavor: initialScore?.flavor || 6,
      aftertaste: initialScore?.aftertaste || 6,
      acidity: initialScore?.acidity || 6,
      body: initialScore?.body || 6,
      balance: initialScore?.balance || 6,
      sweetness: initialScore?.sweetness ?? 10, // Default to 10 (perfect score)
      cleanliness: initialScore?.cleanliness ?? 10, // Default to 10 (perfect score)
      uniformity: initialScore?.uniformity ?? 10, // Default to 10 (perfect score)
      overall: initialScore?.overall || 6,
      notes: initialScore?.notes || '',
      privateNotes: initialScore?.privateNotes || '',
      defects: initialScore?.defects || [],
      flavorDescriptors: initialScore?.flavorDescriptors || [],
    },
  });

  // Watch all score fields to calculate total
  const watchedScores = watch([
    'aroma', 'flavor', 'aftertaste', 'acidity', 'body',
    'balance', 'sweetness', 'cleanliness', 'uniformity', 'overall'
  ]);

  useEffect(() => {
    const total = watchedScores.reduce((sum, score) => sum + (score || 0), 0);
    setTotalScore(total);
  }, [watchedScores]);

  const handleSaveDraft = async (data: ScaaScoreForm) => {
    await onSubmit({ ...data, flavorDescriptors, isSubmitted: false });
    setIsDraft(true);
  };

  const handleSubmitFinal = async (data: ScaaScoreForm) => {
    await onSubmit({ ...data, flavorDescriptors, isSubmitted: true });
    setIsDraft(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">SCAA Cupping Score</h3>
              <p className="text-sm text-gray-600">{sampleName}</p>
            </div>
          </div>
          <div className="text-right bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg px-6 py-3 border border-amber-200 shadow-sm">
            <div className="text-3xl font-bold mb-1">
              <span className={getScoreColor(totalScore)}>{totalScore.toFixed(1)}</span>
              <span className="text-gray-400 text-xl">/100</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {calculateScaaGrade(totalScore)}
            </div>
          </div>
        </div>
      </div>
      {/* Clean Content */}
      <div className="p-6 bg-gray-50">
        <form className="space-y-6">
          {/* Enhanced Scoring Categories */}
          <div className="space-y-4">
            {SCAA_CATEGORIES.map((category) => {
              const watchedValue = watch(category.name as keyof ScaaScoreForm);
              const currentValue = typeof watchedValue === 'number' ? watchedValue : 6;

              const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 6 && value <= 10) {
                  // Round to nearest 0.25
                  const rounded = Math.round(value * 4) / 4;
                  setValue(category.name as keyof ScaaScoreForm, rounded);
                }
              };

              return (
                <div key={category.name} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-coffee-brown/30 transition-all duration-200 shadow-sm hover:shadow-md">
                  {/* Header with Label and Score Input */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-9 h-9 bg-coffee-brown/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-coffee-brown font-bold text-base">
                          {category.label.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={category.name} className="text-base font-semibold text-gray-900 block">
                          {category.label}
                        </Label>
                        <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                      </div>
                    </div>

                    {/* Score Input Box */}
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        value={currentValue.toFixed(2)}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value < 6) {
                            setValue(category.name as keyof ScaaScoreForm, 6);
                          } else if (value > 10) {
                            setValue(category.name as keyof ScaaScoreForm, 10);
                          }
                        }}
                        min={6}
                        max={10}
                        step={0.25}
                        disabled={readOnly}
                        className="w-20 px-3 py-2 text-center text-lg font-bold text-coffee-brown bg-coffee-brown/5 border-2 border-coffee-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-gray-400 text-sm font-medium">/10</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-3">
                    <Slider
                      value={[currentValue]}
                      onValueChange={(value) => {
                        setValue(category.name as keyof ScaaScoreForm, value[0]);
                      }}
                      max={10}
                      min={6}
                      step={0.25}
                      disabled={readOnly}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-400">
                      <span>6 - Below Standard</span>
                      <span>8 - Good</span>
                      <span>10 - Outstanding</span>
                    </div>
                  </div>

                  {errors[category.name as keyof ScaaScoreForm] && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">
                        {errors[category.name as keyof ScaaScoreForm]?.message ||
                         "Score must be between 6 and 10 in quarter-point increments"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Notes Section */}
          <div className="bg-gradient-to-br from-coffee-cream/10 to-orange-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Cupping Notes</h4>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                  Cupping Notes
                </Label>
                <textarea
                  id="notes"
                  rows={4}
                  disabled={readOnly}
                  {...register('notes')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Describe the coffee's characteristics, flavors, and overall impression..."
                />
              </div>

              <div>
                <Label htmlFor="privateNotes" className="text-sm font-medium text-gray-700 mb-2 block">
                  Private Notes
                </Label>
                <textarea
                  id="privateNotes"
                  rows={3}
                  disabled={readOnly}
                  {...register('privateNotes')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Personal notes (only visible to you)..."
                />
              </div>
            </div>
          </div>

          {/* Flavor Descriptors */}
          <FlavorDescriptorSelector
            selectedDescriptors={flavorDescriptors}
            onDescriptorsChange={setFlavorDescriptors}
            readOnly={readOnly}
          />

          {/* Enhanced Action Buttons */}
          {!readOnly && (
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Current Score</div>
                  <div className="text-2xl font-bold text-coffee-brown">
                    {totalScore.toFixed(1)}<span className="text-gray-400 text-lg">/100</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {calculateScaaGrade(totalScore)}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSubmit(handleSaveDraft)}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-coffee-brown text-coffee-brown rounded-xl font-medium hover:bg-coffee-brown hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(handleSubmitFinal)}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-coffee-brown to-coffee-dark text-white rounded-xl font-medium hover:from-coffee-dark hover:to-coffee-brown disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Score'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
