'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Coffee, Clock, Users, ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { ScaaScoreForm } from '@/components/cupping/scaa-score-form';
import { sessionsApi, scoresApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

      if (sessionResponse.success && sessionResponse.data) {
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

      if (scoresResponse.success && scoresResponse.data) {
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

      const response = await scoresApi.submitScore(sessionId, (currentSample as any).sampleId, scoreData);

      if (response.success) {
        // Update scores state
        const updatedScores = scores.filter(s => s.sampleId !== (currentSample as any).sampleId);
        updatedScores.push(response.data);
        setScores(updatedScores);

        toast.success('Score submitted successfully!');

        // Move to next sample if not the last one
        if (currentSampleIndex < session.samples.length - 1) {
          setCurrentSampleIndex(currentSampleIndex + 1);
        } else {
          toast.success('All samples completed!');
        }
      } else {
        setError('Failed to submit score');
        toast.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      setError('Failed to submit score');
      toast.error('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentSampleScore = () => {
    if (!session) return undefined;
    const currentSample = session.samples[currentSampleIndex];
    return scores.find(score => score.sampleId === (currentSample as any).sampleId);
  };

  const getCompletedCount = () => {
    return scores.filter(score => score.isSubmitted).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-brown mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Session not found'}</p>
        <Link href="/dashboard/sessions">
          <button className="flex items-center space-x-2 px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark transition-colors mx-auto">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sessions</span>
          </button>
        </Link>
      </div>
    );
  }

  const currentSample = session.samples[currentSampleIndex];
  const currentScore = getCurrentSampleScore();
  const sampleDisplayName = session.blindTasting && currentSample.blindCode 
    ? currentSample.blindCode 
    : currentSample.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-coffee-dark via-coffee-brown to-coffee-dark text-white rounded-t-2xl mx-6 mt-6 overflow-hidden shadow-2xl">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href={`/dashboard/sessions/${sessionId}`}>
                <button className="flex items-center space-x-2 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white hover:bg-white/20 transition-all duration-200 shadow-lg">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Session</span>
                </button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">{session.name}</h1>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex px-5 py-2 text-sm font-semibold rounded-xl bg-green-500/20 text-green-100 border border-green-400/30 backdrop-blur-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    ACTIVE EVALUATION
                  </span>
                  {session.blindTasting && (
                    <span className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Blind Tasting
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                {getCompletedCount()}/{session.samples.length} Completed
              </div>
              <div className="text-coffee-cream mb-4 text-lg">
                Sample {currentSampleIndex + 1} of {session.samples.length}
              </div>
              <div className="w-64 bg-white/20 rounded-full h-4 backdrop-blur-sm shadow-inner">
                <div
                  className="bg-gradient-to-r from-coffee-cream to-white h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${(getCompletedCount() / session.samples.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-coffee-cream mt-3 font-medium">
                {Math.round((getCompletedCount() / session.samples.length) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">

        {/* Enhanced Sample Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-coffee-brown/5 to-coffee-cream/10 p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-coffee-brown to-coffee-dark rounded-2xl flex items-center justify-center shadow-xl">
                  <Coffee className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Sample Navigation</h3>
                  <p className="text-gray-600 mt-1">Navigate between samples for evaluation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentSampleIndex(Math.max(0, currentSampleIndex - 1))}
                  disabled={currentSampleIndex === 0}
                  className="p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 hover:bg-coffee-brown hover:text-white hover:border-coffee-brown disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentSampleIndex(Math.min(session.samples.length - 1, currentSampleIndex + 1))}
                  disabled={currentSampleIndex === session.samples.length - 1}
                  className="p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 hover:bg-coffee-brown hover:text-white hover:border-coffee-brown disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {session.samples.map((sample, index) => {
                const sampleScore = scores.find(s => s.sampleId === (sample as any).sampleId);
                const isCompleted = sampleScore?.isSubmitted;
                const isCurrent = index === currentSampleIndex;
                const sampleDisplayName = session.blindTasting && sample.blindCode ? sample.blindCode : sample.name;

                return (
                  <button
                    key={sample.id}
                    onClick={() => setCurrentSampleIndex(index)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl relative overflow-hidden ${
                      isCurrent
                        ? 'border-coffee-brown bg-gradient-to-br from-coffee-brown to-coffee-dark text-white shadow-2xl transform scale-105'
                        : isCompleted
                          ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 text-green-800 hover:from-green-100 hover:to-green-200'
                          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 text-gray-700 hover:border-coffee-brown/50 hover:from-coffee-brown/5 hover:to-coffee-cream/10'
                    }`}
                  >
                    {/* Sample Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                      isCurrent
                        ? 'bg-white/20'
                        : isCompleted
                          ? 'bg-green-200'
                          : 'bg-coffee-brown/10'
                    }`}>
                      <Coffee className={`h-4 w-4 ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                            ? 'text-green-700'
                            : 'text-coffee-brown'
                      }`} />
                    </div>

                    {/* Sample Name */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="truncate font-bold text-sm">
                        {sampleDisplayName || `Sample ${index + 1}`}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 ml-1 flex-shrink-0" />
                      )}
                    </div>

                    {/* Sample Number */}
                    <div className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-coffee-cream'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}>
                      Position {index + 1}
                    </div>

                    {/* Status Indicator */}
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                      isCurrent
                        ? 'bg-white/30'
                        : isCompleted
                          ? 'bg-green-400'
                          : 'bg-gray-300'
                    }`}></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Current Sample Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 via-coffee-cream/20 to-orange-50 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Coffee className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    {sampleDisplayName || `Sample ${currentSampleIndex + 1}`}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {!session.blindTasting && currentSample.origin && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 shadow-sm">
                        📍 {currentSample.origin}
                      </span>
                    )}
                    {!session.blindTasting && currentSample.variety && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-green-100 text-green-700 shadow-sm">
                        🌱 {currentSample.variety}
                      </span>
                    )}
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-coffee-brown/10 text-coffee-brown shadow-sm">
                      📋 Position {currentSample.position}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                <div className="text-sm text-gray-500 mb-2">Sample Progress</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {currentSampleIndex + 1} of {session.samples.length}
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                  currentScore?.isSubmitted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {currentScore?.isSubmitted ? '✅ Completed' : '⏳ In Progress'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scoring Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <ScaaScoreForm
            sampleName={sampleDisplayName || `Sample ${currentSampleIndex + 1}`}
            initialScore={currentScore}
            onSubmit={handleScoreSubmit}
            isSubmitting={submitting}
            readOnly={currentScore?.isSubmitted || false}
          />
        </div>
      </div>
    </div>
  );
}
