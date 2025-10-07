'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi } from '@/lib/api';
import { CuppingSession } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime, calculateScaaGrade } from '@/lib/utils';
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
  Filter,
  SortDesc,
  List,
  Grid3X3,
  Eye,
  Edit,
  Copy,
  Archive,
  MoreHorizontal,
  Play,
  Trophy
} from 'lucide-react';

export default function SessionsPage() {
  const { user, organization } = useAuth();
  const [sessions, setSessions] = useState<CuppingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalSessions: 0,
    thisMonth: 0,
    avgScore: 0,
    activeSessions: 0,
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
        const thisMonth = sessionData.filter(s => {
          const sessionDate = new Date(s.createdAt);
          const now = new Date();
          return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
        }).length;

        // Calculate real average score from completed sessions
        let totalScore = 0;
        let scoreCount = 0;
        sessionData.forEach(session => {
          if (session.scores && session.scores.length > 0) {
            session.scores.forEach(score => {
              if (score.totalScore > 0) {
                totalScore += score.totalScore;
                scoreCount++;
              }
            });
          }
        });
        const avgScore = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 0;

        setStats({
          totalSessions: sessionData.length,
          thisMonth: thisMonth,
          avgScore,
          activeSessions: activeSessions,
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
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleAllSessions = () => {
    setSelectedSessions(prev =>
      prev.length === filteredSessions.length ? [] : filteredSessions.map(s => s.id)
    );
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.samples?.some(sessionSample =>
                           sessionSample.sample?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sessionSample.sample?.origin?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = !statusFilter || session.status === statusFilter;
    const matchesOrigin = !originFilter || session.samples?.some(sessionSample =>
      sessionSample.sample?.origin?.toLowerCase().includes(originFilter.toLowerCase())
    );
    return matchesSearch && matchesStatus && matchesOrigin;
  });

  const sessionsPerPage = 10;
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h2>
        <p className="text-gray-600">Manage and organize all your cupping sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
              <FileText className="text-coffee-brown text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgScore}</p>
            </div>
            <div className="w-12 h-12 bg-coffee-cream/20 rounded-lg flex items-center justify-center">
              <Trophy className="text-coffee-cream text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Play className="text-orange-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left side - Search and Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  className="border-none outline-none text-sm text-gray-700 bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>

              {/* Sort Button */}
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <SortDesc className="h-4 w-4" />
                <span>Sort</span>
              </button>
            </div>

            {/* Right side - View Controls and Actions */}
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-coffee-brown text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-coffee-brown text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8">
                  <option value="">Bulk Actions</option>
                  <option value="export">Export Selected</option>
                  <option value="archive">Archive Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button className="bg-coffee-brown text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm hover:bg-coffee-dark transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ACTIVE">In Progress</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8"
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                >
                  <option value="">All Origins</option>
                  <option value="ethiopia">Ethiopia</option>
                  <option value="colombia">Colombia</option>
                  <option value="guatemala">Guatemala</option>
                  <option value="brazil">Brazil</option>
                  <option value="kenya">Kenya</option>
                </select>
              </div>

              {/* Score Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
                <div className="space-y-2">
                  <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>80+</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setOriginFilter('');
                  setSearchTerm('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button className="px-4 py-2 bg-coffee-brown text-white rounded-lg text-sm hover:bg-coffee-dark">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions Table/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                      onChange={toggleAllSessions}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coffee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSessions.length === 0 && !searchTerm && !statusFilter && !originFilter ? (
                  // Sample data when no real sessions exist
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dec 15, 2024</div>
                        <div className="text-xs text-gray-500">14:30 PM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Ethiopia Yirgacheffe G1
                        </Link>
                        <div className="text-xs text-gray-500">Natural Process</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Gedeb, Ethiopia</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">87.5</div>
                        <div className="text-xs text-gray-500">Excellent</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dec 14, 2024</div>
                        <div className="text-xs text-gray-500">10:15 AM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Colombia Huila
                        </Link>
                        <div className="text-xs text-gray-500">Washed Process</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Huila, Colombia</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">82.3</div>
                        <div className="text-xs text-gray-500">Very Good</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dec 13, 2024</div>
                        <div className="text-xs text-gray-500">16:45 PM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Guatemala Antigua
                        </Link>
                        <div className="text-xs text-gray-500">Semi-Washed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Antigua, Guatemala</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">85.7</div>
                        <div className="text-xs text-gray-500">Excellent</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </>
                ) : paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter || originFilter ? 'No sessions found matching your criteria.' : 'No sessions yet. Create your first cupping session!'}
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedSessions.includes(session.id)}
                          onChange={() => toggleSessionSelection(session.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(session.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</div>
                        <div className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/sessions/${session.id}`} className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          {session.name}
                        </Link>
                        <div className="text-xs text-gray-500">{session.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          if (!session.samples || session.samples.length === 0) return 'No samples';
                          if (session.samples.length === 1) return session.samples[0].sample?.origin || 'Unknown origin';
                          const uniqueOrigins = [...new Set(session.samples.map(s => s.sample?.origin).filter(Boolean))];
                          return uniqueOrigins.length === 1 ? uniqueOrigins[0] : 'Multiple origins';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (!session.scores || session.scores.length === 0) {
                            return (
                              <>
                                <div className="text-sm font-semibold text-gray-900">--</div>
                                <div className="text-xs text-gray-500">Pending</div>
                              </>
                            );
                          }

                          const completedScores = session.scores.filter(score => score.isSubmitted);
                          if (completedScores.length === 0) {
                            return (
                              <>
                                <div className="text-sm font-semibold text-gray-900">--</div>
                                <div className="text-xs text-gray-500">In Progress</div>
                              </>
                            );
                          }

                          const avgScore = completedScores.reduce((sum, score) => sum + score.totalScore, 0) / completedScores.length;
                          const grade = calculateScaaGrade(avgScore);

                          return (
                            <>
                              <div className="text-sm font-semibold text-gray-900">{avgScore.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">{grade}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.samples?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status === 'COMPLETED' ? 'Completed' : session.status === 'ACTIVE' ? 'In Progress' : session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/sessions/${session.id}`}>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          {/* Only show edit if session is not completed AND (user is ADMIN or session creator) */}
                          {session.status !== 'COMPLETED' && (user?.role === 'ADMIN' || session.createdBy === user?.id) && (
                            <Link href={`/dashboard/sessions/${session.id}/edit`}>
                              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          {/* Only show archive if user is ADMIN or session creator */}
                          {(user?.role === 'ADMIN' || session.createdBy === user?.id) && (
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600" title="Archive">
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View (placeholder for now)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">Grid view coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
