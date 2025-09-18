'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi } from '@/lib/api';
import { CuppingSession } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { 
  Coffee, 
  Users, 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SessionsPage() {
  const { user, organization } = useAuth();
  const [sessions, setSessions] = useState<CuppingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    draftSessions: 0,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await sessionsApi.getSessions();

      if (response.success) {
        const sessionData = response.data.sessions;
        setSessions(sessionData);
        
        // Calculate stats
        const activeSessions = sessionData.filter(s => s.status === 'ACTIVE').length;
        const completedSessions = sessionData.filter(s => s.status === 'COMPLETED').length;
        const draftSessions = sessionData.filter(s => s.status === 'DRAFT').length;
        
        setStats({
          totalSessions: sessionData.length,
          activeSessions,
          completedSessions,
          draftSessions,
        });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'DRAFT':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-2">Manage and organize all your cupping sessions</p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completedSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-gray-600">{stats.draftSessions}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length} of {sessions.length} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {sessions.length === 0 
                  ? 'Create your first cupping session to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {sessions.length === 0 && (
                <Link href="/dashboard/sessions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Session
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/dashboard/sessions/${session.id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary-600 cursor-pointer">
                            {session.name}
                          </h3>
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        {getStatusIcon(session.status)}
                      </div>
                      
                      {session.description && (
                        <p className="text-gray-600 mb-2">{session.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Coffee className="h-4 w-4" />
                          <span>{session.samples?.length || 0} samples</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{session.participants?.length || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(session.createdAt)}</span>
                        </div>
                        {session.location && (
                          <span>📍 {session.location}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/sessions/${session.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {session.status === 'DRAFT' && (
                        <Link href={`/dashboard/sessions/${session.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
