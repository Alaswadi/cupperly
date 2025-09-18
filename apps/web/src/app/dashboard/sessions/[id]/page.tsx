'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Play, Users, Calendar, MapPin, FileText, Settings, Coffee } from 'lucide-react';
import { sessionsApi } from '@/lib/api';

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
  createdAt: string;
  updatedAt: string;
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
  }>;
  tags: string[];
  _count?: {
    participants: number;
    evaluations: number;
  };
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const sessionId = params.id as string;

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const handleStartSession = async () => {
    try {
      setStarting(true);
      const response = await sessionsApi.startSession(sessionId);

      if (response.success) {
        // Reload session data to get updated status
        await loadSession();
        // Optionally redirect to the active session view or scoring interface
        // router.push(`/dashboard/sessions/${sessionId}/score`);
      } else {
        setError('Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setError('Failed to start session');
    } finally {
      setStarting(false);
    }
  };

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await sessionsApi.getSession(sessionId);
      if (response.success) {
        setSession(response.data);
      } else {
        setError('Failed to load session');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The session you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/dashboard/sessions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/sessions')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(session.status)}>
                {session.status}
              </Badge>
              {session.blindTasting && (
                <Badge variant="outline">Blind Tasting</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/sessions/${session.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {session.status === 'DRAFT' && (
            <Button onClick={handleStartSession} disabled={starting}>
              <Play className="w-4 h-4 mr-2" />
              {starting ? 'Starting...' : 'Start Session'}
            </Button>
          )}
          {session.status === 'ACTIVE' && (
            <Button onClick={() => router.push(`/dashboard/sessions/${sessionId}/evaluate`)}>
              <Coffee className="w-4 h-4 mr-2" />
              Evaluate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{session.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">{session.location}</span>
                    </div>
                  </div>
                )}
                
                {session.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">{formatDate(session.scheduledAt)}</span>
                    </div>
                  </div>
                )}
              </div>

              {session.tags && session.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Samples */}
          <Card>
            <CardHeader>
              <CardTitle>Samples ({session.samples?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {session.samples && session.samples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/samples/${sample.id}`)}
                    >
                      <h4 className="font-medium text-gray-900">{sample.name}</h4>
                      {sample.origin && (
                        <p className="text-sm text-gray-600">{sample.origin}</p>
                      )}
                      {sample.variety && (
                        <p className="text-sm text-gray-500">{sample.variety}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No samples assigned to this session.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blind Tasting</span>
                <span className="text-sm font-medium">
                  {session.blindTasting ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Comments</span>
                <span className="text-sm font-medium">
                  {session.allowComments ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Calibration</span>
                <span className="text-sm font-medium">
                  {session.requireCalibration ? 'Required' : 'Optional'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Template */}
          {session.template && (
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium text-gray-900">{session.template.name}</h4>
                {session.template.description && (
                  <p className="text-sm text-gray-600 mt-1">{session.template.description}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Participants</span>
                <span className="text-sm font-medium">
                  {session._count?.participants || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Evaluations</span>
                <span className="text-sm font-medium">
                  {session._count?.evaluations || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(session.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
