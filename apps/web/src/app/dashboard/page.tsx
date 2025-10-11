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
  CheckCircle,
  Trophy,
  FlaskConical,
  Search,
  Eye,
  Download,
  MoreHorizontal,
  Edit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ScoreDistributionChart } from '@/components/dashboard/score-distribution-chart';

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const [sessions, setSessions] = useState<CuppingSession[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalSamples: 0,
    avgScore: 0,
    monthlyGrowth: 12,
    scoreDistribution: [12, 35, 89, 67, 28, 16],
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

      if (sessionsResponse.success && sessionsResponse.data) {
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

      if (samplesResponse.success && samplesResponse.data) {
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

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.samples?.some((sample) =>
      sample.sample?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.sample?.origin?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sessionsPerPage = 5;
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Track your cupping sessions and analyze coffee quality</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Sessions Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              <p className="text-sm text-green-600 mt-1">+{stats.monthlyGrowth}% this month</p>
            </div>
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
              <Calendar className="text-coffee-brown text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '0.0'}
              </p>
              <p className="text-sm text-blue-600 mt-1">SCA Protocol</p>
            </div>
            <div className="w-12 h-12 bg-coffee-cream/20 rounded-lg flex items-center justify-center">
              <Trophy className="text-coffee-cream text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Active Samples Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Samples</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSamples}</p>
              <p className="text-sm text-orange-600 mt-1">Pending evaluation</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-orange-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Score Distribution</h3>
            <div className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${dateFilter === '7' ? 'bg-coffee-brown text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setDateFilter('7')}
              >
                7 Days
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${dateFilter === '30' ? 'bg-coffee-brown text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setDateFilter('30')}
              >
                30 Days
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${dateFilter === '90' ? 'bg-coffee-brown text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setDateFilter('90')}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ScoreDistributionChart data={stats.scoreDistribution} />
        </div>
      </div>

      {/* Recent Cupping Sessions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cupping Sessions</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search coffee name..."
                  className="border-none outline-none text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  className="border-none outline-none text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg pr-8"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coffee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSessions.length === 0 && !searchTerm ? (
                // Sample data when no real sessions exist
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 15, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ethiopia Yirgacheffe</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Gedeb, Ethiopia</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">87.5</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 14, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Colombia Huila</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Huila, Colombia</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">82.3</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 13, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Guatemala Antigua</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Antigua, Guatemala</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">85.7</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 12, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Brazil Santos</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">São Paulo, Brazil</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">79.2</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 11, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Kenya AA</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Nyeri, Kenya</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">88.9</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No sessions found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(session.createdAt).split(' ')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {session.samples?.[0]?.sample?.origin || 'Multiple origins'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status === 'COMPLETED' ? 'Completed' : session.status === 'ACTIVE' ? 'In Progress' : session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Link href={`/dashboard/sessions/${session.id}`}>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/reports`}>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </Link>
                        {session.status !== 'COMPLETED' && (
                          <Link href={`/dashboard/sessions/${session.id}/edit`}>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                        )}
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, filteredSessions.length)} of {filteredSessions.length} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-coffee-brown text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link href="/dashboard/sessions/new">
        <button className="fixed bottom-8 right-8 bg-coffee-brown hover:bg-coffee-dark text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  );
}
