'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, scoresApi } from '@/lib/api';
import { CuppingSession, Score } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SessionReport } from '@/components/reports/session-report';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SessionReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<CuppingSession | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadSessionReport();
    }
  }, [params.id]);

  const loadSessionReport = async () => {
    try {
      setIsLoading(true);

      // Load session data with full details
      const sessionResponse = await sessionsApi.getSession(params.id as string);
      if (!sessionResponse.success) {
        toast.error('Failed to load session');
        router.push('/dashboard/reports');
        return;
      }

      setSession(sessionResponse.data);

      // Load session scores
      const scoresResponse = await scoresApi.getSessionScores(params.id as string);
      if (scoresResponse.success) {
        setScores(scoresResponse.data);
      } else {
        toast.error('Failed to load session scores');
      }

    } catch (error) {
      console.error('Error loading session report:', error);
      toast.error('Failed to load session report');
      router.push('/dashboard/reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToReports = () => {
    router.push('/dashboard/reports');
  };

  const handleBackToSession = () => {
    router.push(`/dashboard/sessions/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
        <p className="text-gray-600 mb-4">The requested session could not be found.</p>
        <Button onClick={handleBackToReports}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToReports}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <Button variant="outline" onClick={handleBackToSession}>
              View Session
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Report</h1>
            <p className="text-gray-600">Detailed analysis and insights</p>
          </div>
        </div>
      </div>

      {/* Session Report Component */}
      <SessionReport session={session} scores={scores} />
    </div>
  );
}
