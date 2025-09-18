'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, samplesApi } from '@/lib/api';
import { CuppingSession, Sample } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime, calculateScaaGrade } from '@/lib/utils';
import Link from 'next/link';
import { 
  Coffee, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const [sessions, setSessions] = useState<CuppingSession[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalSamples: 0,
    avgScore: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sessionsResponse, samplesResponse] = await Promise.all([
        sessionsApi.getSessions(),
        samplesApi.getSamples(),
      ]);

      if (sessionsResponse.success) {
        const sessionData = sessionsResponse.data.sessions;
        setSessions(sessionData.slice(0, 5)); // Show latest 5 sessions
        
        // Calculate stats
        const activeSessions = sessionData.filter(s => s.status === 'ACTIVE').length;
        const completedSessions = sessionData.filter(s => s.status === 'COMPLETED');
        
        // Calculate average score from completed sessions
        let totalScores = 0;
        let scoreCount = 0;
        completedSessions.forEach(session => {
          if (session.scores) {
            session.scores.forEach(score => {
              totalScores += score.totalScore;
              scoreCount++;
            });
          }
        });
        
        setStats(prev => ({
          ...prev,
          totalSessions: sessionData.length,
          activeSessions,
          avgScore: scoreCount > 0 ? totalScores / scoreCount : 0,
        }));
      }

      if (samplesResponse.success) {
        const sampleData = samplesResponse.data.samples;
        setSamples(sampleData.slice(0, 5)); // Show latest 5 samples
        setStats(prev => ({
          ...prev,
          totalSamples: sampleData.length,
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-100';
      case 'SCHEDULED':
        return 'text-yellow-600 bg-yellow-100';
      case 'DRAFT':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {organization?.name} • {formatDateTime(new Date())}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/samples/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sample
            </Button>
          </Link>
          <Link href="/dashboard/sessions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSessions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coffee Samples</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSamples}</div>
            <p className="text-xs text-muted-foreground">
              Ready for cupping
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.avgScore > 0 ? calculateScaaGrade(stats.avgScore) : 'No scores yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Active cuppers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions and Samples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sessions</CardTitle>
              <Link href="/dashboard/sessions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>
              Latest cupping sessions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No sessions yet. Create your first cupping session!
                </p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Link href={`/dashboard/sessions/${session.id}`}>
                        <h4 className="font-medium hover:text-primary-600 cursor-pointer">
                          {session.name}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {session.samples?.length || 0} samples • {formatDateTime(session.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      {session.status === 'ACTIVE' && <Clock className="h-4 w-4 text-green-600" />}
                      {session.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Samples */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Samples</CardTitle>
              <Link href="/dashboard/samples">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>
              Latest coffee samples added to your collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {samples.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No samples yet. Add your first coffee sample!
                </p>
              ) : (
                samples.map((sample) => (
                  <div key={sample.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Link href={`/dashboard/samples/${sample.id}`}>
                        <h4 className="font-medium hover:text-primary-600 cursor-pointer">
                          {sample.name}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {sample.origin} • {sample.variety || 'Unknown variety'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{sample.processingMethod || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(sample.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
