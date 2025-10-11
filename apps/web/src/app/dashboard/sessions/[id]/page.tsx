'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Play, Users, Calendar, MapPin, FileText, Settings, Coffee, Clock, Eye, EyeOff, BarChart3, CheckCircle } from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    name: string;
    description?: string;
  };
  samples: Array<{
    id: string; // SessionSample ID
    sampleId: string; // Actual Sample ID
    position: number;
    isBlind: boolean;
    blindCode?: string;
    sample: {
      id: string;
      name: string;
      origin?: string;
      variety?: string;
    };
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
  const { user } = useAuth();
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
        toast.success('Session started successfully!');
        // Optionally redirect to the active session view or scoring interface
        router.push(`/dashboard/sessions/${sessionId}/evaluate`);
      } else {
        setError('Failed to start session');
        toast.error('Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setError('Failed to start session');
      toast.error('Failed to start session');
    } finally {
      setStarting(false);
    }
  };

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await sessionsApi.getSession(sessionId);
      if (response.success && response.data) {
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sessions">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sessions</span>
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(session.status)}`}>
                {session.status === 'COMPLETED' ? 'Completed' : session.status === 'ACTIVE' ? 'In Progress' : session.status}
              </span>
              {session.blindTasting && (
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  Blind Tasting
                </span>
              )}
              {session.allowComments && (
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  Comments Enabled
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {/* Only show edit if user is ADMIN or session creator */}
          {(user?.role === 'ADMIN' || session.createdBy === user?.id) && (
            <Link href={`/dashboard/sessions/${session.id}/edit`}>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </Link>
          )}
          {session.status === 'DRAFT' && (
            <button
              onClick={handleStartSession}
              disabled={starting}
              className="flex items-center space-x-2 px-4 py-2 bg-coffee-brown text-white rounded-lg text-sm hover:bg-coffee-dark transition-colors disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{starting ? 'Starting...' : 'Start Session'}</span>
            </button>
          )}
          {session.status === 'ACTIVE' && (
            <Link href={`/dashboard/sessions/${sessionId}/evaluate`}>
              <button className="flex items-center space-x-2 px-4 py-2 bg-coffee-brown text-white rounded-lg text-sm hover:bg-coffee-dark transition-colors">
                <Coffee className="h-4 w-4" />
                <span>Evaluate</span>
              </button>
            </Link>
          )}
          {session.status === 'COMPLETED' && (
            <Link href={`/dashboard/sessions/${sessionId}/report`}>
              <button className="flex items-center space-x-2 px-4 py-2 bg-coffee-brown text-white rounded-lg text-sm hover:bg-coffee-dark transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>View Report</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-coffee-brown" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
                  <p className="text-sm text-gray-600">Details about this cupping session</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {session.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{session.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {session.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>{session.location}</span>
                    </div>
                  </div>
                )}

                {session.scheduledAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>{formatDate(session.scheduledAt)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>{formatDate(session.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>{session.template?.name || 'No template'}</span>
                  </div>
                </div>
              </div>

              {session.tags && session.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-coffee-brown/10 text-coffee-brown">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Samples */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Samples ({session.samples?.length || 0})</h3>
                  <p className="text-sm text-gray-600">Coffee samples for this session</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {session.samples && session.samples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.samples.map((sessionSample) => (
                    <Link key={sessionSample.id} href={`/dashboard/samples/${sessionSample.sample.id}`}>
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-coffee-brown transition-all cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-coffee-brown/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Coffee className="h-4 w-4 text-coffee-brown" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{sessionSample.sample.name}</h4>
                            {sessionSample.sample.origin && (
                              <p className="text-sm text-gray-600 mt-1">{sessionSample.sample.origin}</p>
                            )}
                            {sessionSample.sample.variety && (
                              <p className="text-xs text-gray-500 mt-1">{sessionSample.sample.variety}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No samples assigned to this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-600">Session configuration</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {session.blindTasting ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                  </div>
                  <span className="text-sm text-gray-900">Blind Tasting</span>
                </div>
                <span className={`text-sm font-medium ${session.blindTasting ? 'text-green-600' : 'text-gray-500'}`}>
                  {session.blindTasting ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">Comments</span>
                </div>
                <span className={`text-sm font-medium ${session.allowComments ? 'text-green-600' : 'text-gray-500'}`}>
                  {session.allowComments ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">Calibration</span>
                </div>
                <span className={`text-sm font-medium ${session.requireCalibration ? 'text-green-600' : 'text-gray-500'}`}>
                  {session.requireCalibration ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>
          </div>

          {/* Template */}
          {session.template && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Template</h3>
                    <p className="text-sm text-gray-600">Cupping template used</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-2">{session.template.name}</h4>
                {session.template.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{session.template.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                  <p className="text-sm text-gray-600">Session metrics</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">Participants</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {session._count?.participants || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">Evaluations</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {session._count?.evaluations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Coffee className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">Samples</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {session.samples?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
