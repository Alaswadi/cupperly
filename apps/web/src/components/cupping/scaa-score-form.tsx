'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateScaaGrade } from '@/lib/utils';

// SCAA Standard scoring schema
const scaaScoreSchema = z.object({
  aroma: z.number().min(0).max(10),
  flavor: z.number().min(0).max(10),
  aftertaste: z.number().min(0).max(10),
  acidity: z.number().min(0).max(10),
  body: z.number().min(0).max(10),
  balance: z.number().min(0).max(10),
  sweetness: z.number().min(0).max(10),
  cleanliness: z.number().min(0).max(10),
  uniformity: z.number().min(0).max(10),
  overall: z.number().min(0).max(10),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  defects: z.array(z.object({
    type: z.string(),
    intensity: z.number(),
    description: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScaaScoreForm>({
    resolver: zodResolver(scaaScoreSchema),
    defaultValues: {
      aroma: initialScore?.aroma || 0,
      flavor: initialScore?.flavor || 0,
      aftertaste: initialScore?.aftertaste || 0,
      acidity: initialScore?.acidity || 0,
      body: initialScore?.body || 0,
      balance: initialScore?.balance || 0,
      sweetness: initialScore?.sweetness || 0,
      cleanliness: initialScore?.cleanliness || 0,
      uniformity: initialScore?.uniformity || 0,
      overall: initialScore?.overall || 0,
      notes: initialScore?.notes || '',
      privateNotes: initialScore?.privateNotes || '',
      defects: initialScore?.defects || [],
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
    await onSubmit({ ...data, isSubmitted: false });
    setIsDraft(true);
  };

  const handleSubmitFinal = async (data: ScaaScoreForm) => {
    await onSubmit({ ...data, isSubmitted: true });
    setIsDraft(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.5) return 'text-yellow-600';
    if (score >= 6.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SCAA Cupping Score - {sampleName}</span>
          <div className="text-right">
            <div className="text-2xl font-bold">
              <span className={getScoreColor(totalScore)}>{totalScore.toFixed(1)}</span>
              <span className="text-gray-400">/100</span>
            </div>
            <div className="text-sm text-gray-600">
              {calculateScaaGrade(totalScore)}
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Score each category from 0-10 according to SCAA standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Scoring Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCAA_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <Label htmlFor={category.name} className="text-sm font-medium">
                  {category.label}
                </Label>
                <p className="text-xs text-gray-500">{category.description}</p>
                <Input
                  id={category.name}
                  type="number"
                  min="0"
                  max="10"
                  step="0.25"
                  disabled={readOnly}
                  {...register(category.name as keyof ScaaScoreForm, {
                    valueAsNumber: true,
                  })}
                  className={errors[category.name as keyof ScaaScoreForm] ? 'border-red-500' : ''}
                />
                {errors[category.name as keyof ScaaScoreForm] && (
                  <p className="text-xs text-red-600">
                    Score must be between 0 and 10
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Cupping Notes</Label>
              <textarea
                id="notes"
                rows={3}
                disabled={readOnly}
                {...register('notes')}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the coffee's characteristics, flavors, and overall impression..."
              />
            </div>

            <div>
              <Label htmlFor="privateNotes">Private Notes</Label>
              <textarea
                id="privateNotes"
                rows={2}
                disabled={readOnly}
                {...register('privateNotes')}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Personal notes (only visible to you)..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex justify-between pt-6 border-t">
              <div className="text-sm text-gray-500">
                <p>Total Score: <span className="font-medium">{totalScore.toFixed(1)}/100</span></p>
                <p>Grade: <span className="font-medium">{calculateScaaGrade(totalScore)}</span></p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit(handleSaveDraft)}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(handleSubmitFinal)}
                  disabled={isSubmitting}
                >
                  Submit Score
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
