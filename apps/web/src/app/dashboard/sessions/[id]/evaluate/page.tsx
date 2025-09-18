'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coffee, Clock, Users } from 'lucide-react';
import { ScaaScoreForm } from '@/components/cupping/scaa-score-form';
import { sessionsApi, scoresApi } from '@/lib/api';

interface Session {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: string;
  blindTasting: boolean;
  allowComments: boolean;
  requireCalibration: boolean;
  scheduledAt?: string;
  startedAt?: string;
  template?: {
    id: string;
    name: string;
    description?: string;
  };
  samples: Array<{
    id: string;
    name: string;
    origin?: string;
    variety?: string;
    position: number;
    isBlind: boolean;
    blindCode?: string;
  }>;
}

interface Score {
  id: string;
  sampleId: string;
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
  privateNotes?: string;
  isSubmitted: boolean;
  totalScore: number;
}

export default function SessionEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = params.id as string;

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      const [sessionResponse, scoresResponse] = await Promise.all([
        sessionsApi.getSession(sessionId),
        scoresApi.getSessionScores(sessionId)
      ]);

      if (sessionResponse.success) {
        const sessionData = sessionResponse.data;
        
        // Check if session is active
        if (sessionData.status !== 'ACTIVE') {
          setError('This session is not active for evaluation');
          return;
        }
        
        setSession(sessionData);
      } else {
        setError('Failed to load session');
      }

      if (scoresResponse.success) {
        setScores(scoresResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (scoreData: any) => {
    if (!session) return;
    
    try {
      setSubmitting(true);
      const currentSample = session.samples[currentSampleIndex];
      
      const response = await scoresApi.submitScore(sessionId, currentSample.id, scoreData);
      
      if (response.success) {
        // Update scores state
        const updatedScores = scores.filter(s => s.sampleId !== currentSample.id);
        updatedScores.push(response.data);
        setScores(updatedScores);
        
        // Move to next sample if not the last one
        if (currentSampleIndex < session.samples.length - 1) {
          setCurrentSampleIndex(currentSampleIndex + 1);
        }
      } else {
        setError('Failed to submit score');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      setError('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentSampleScore = () => {
    if (!session) return undefined;
    const currentSample = session.samples[currentSampleIndex];
    return scores.find(score => score.sampleId === currentSample.id);
  };

  const getCompletedCount = () => {
    return scores.filter(score => score.isSubmitted).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Session not found'}</p>
          <Button onClick={() => router.push('/dashboard/sessions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const currentSample = session.samples[currentSampleIndex];
  const currentScore = getCurrentSampleScore();
  const sampleDisplayName = session.blindTasting && currentSample.blindCode 
    ? currentSample.blindCode 
    : currentSample.name;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
              {session.blindTasting && (
                <Badge variant="outline">Blind Tasting</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Progress: {getCompletedCount()}/{session.samples.length} completed
          </div>
          <div className="text-xs text-gray-500">
            Sample {currentSampleIndex + 1} of {session.samples.length}
          </div>
        </div>
      </div>

      {/* Sample Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coffee className="w-5 h-5 mr-2" />
            Sample Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {session.samples.map((sample, index) => {
              const sampleScore = scores.find(s => s.sampleId === sample.id);
              const isCompleted = sampleScore?.isSubmitted;
              const isCurrent = index === currentSampleIndex;
              
              return (
                <Button
                  key={sample.id}
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSampleIndex(index)}
                  className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                >
                  {session.blindTasting && sample.blindCode ? sample.blindCode : sample.name}
                  {isCompleted && " ✓"}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Form */}
      <ScaaScoreForm
        sampleName={sampleDisplayName}
        initialScore={currentScore}
        onSubmit={handleScoreSubmit}
        isSubmitting={submitting}
        readOnly={currentScore?.isSubmitted || false}
      />
    </div>
  );
}
