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
      sweetness: initialScore?.sweetness || 6,
      cleanliness: initialScore?.cleanliness || 6,
      uniformity: initialScore?.uniformity || 6,
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
    <div className="w-full max-w-6xl mx-auto">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-coffee-brown/10 via-coffee-cream/20 to-coffee-brown/10 p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-coffee-brown to-coffee-dark rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">SCAA Cupping Score</h3>
              <p className="text-coffee-brown font-medium">{sampleName}</p>
            </div>
          </div>
          <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="text-4xl font-bold mb-2">
              <span className={getScoreColor(totalScore)}>{totalScore.toFixed(1)}</span>
              <span className="text-gray-400 text-2xl">/100</span>
            </div>
            <div className="text-lg font-semibold text-gray-700 mb-1">
              {calculateScaaGrade(totalScore)}
            </div>
            <div className="text-xs text-gray-500">
              Score each category from 0-10 according to SCAA standards
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Content */}
      <div className="p-8">
        <form className="space-y-8">
          {/* Enhanced Scoring Categories */}
          <div className="space-y-6">
            {SCAA_CATEGORIES.map((category) => {
              const watchedValue = watch(category.name as keyof ScaaScoreForm);
              const currentValue = typeof watchedValue === 'number' ? watchedValue : 0;

              return (
                <div key={category.name} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-coffee-brown/10 rounded-xl flex items-center justify-center">
                        <span className="text-coffee-brown font-bold text-lg">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <Label htmlFor={category.name} className="text-xl font-bold text-gray-900">
                        {category.label}
                      </Label>
                    </div>
                    <div className="bg-gradient-to-r from-coffee-brown/10 to-coffee-cream/20 px-6 py-3 rounded-xl border border-coffee-brown/20">
                      <span className="text-2xl font-bold text-coffee-brown">
                        {currentValue.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-lg ml-1">/10</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">{category.description}</p>

                  <div className="space-y-4">
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
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm">6 - Below Standard</span>
                      <span className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm">8 - Good</span>
                      <span className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm">10 - Outstanding</span>
                    </div>
                  </div>

                  {errors[category.name as keyof ScaaScoreForm] && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">
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
