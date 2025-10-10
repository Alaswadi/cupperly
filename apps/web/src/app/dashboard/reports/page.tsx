'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, scoresApi } from '@/lib/api';
import { CuppingSession, Score } from '@/types';
import { exportSessionToPDFWithCharts } from '@/lib/pdf-export-with-charts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Coffee,
  Star,
  MapPin,
  FileText,
  Users,
  Eye,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { user, organization } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7');
  const [sessions, setSessions] = useState<CuppingSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalSamples: 0,
    avgScore: 0,
    uniqueOrigins: 0,
    completedSessions: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);

      // Load sessions data
      const sessionsResponse = await sessionsApi.getSessions();

      let totalSessions = 0;
      let completedSessions = 0;
      let activeSessions = 0;
      let sessionsData: CuppingSession[] = [];
      let totalSamples = 0;
      let uniqueOrigins = 0;
      let totalScore = 0;
      let scoreCount = 0;

      if (sessionsResponse.success && sessionsResponse.data) {
        sessionsData = sessionsResponse.data.sessions;
        setSessions(sessionsData);
        totalSessions = sessionsData.length;
        completedSessions = sessionsData.filter(s => s.status === 'COMPLETED').length;
        activeSessions = sessionsData.filter(s => s.status === 'ACTIVE').length;

        // Calculate total samples and unique regions
        const allSamples = sessionsData.flatMap(session => session.samples);
        totalSamples = allSamples.length;
        const regions = new Set(allSamples.map(sample => sample.sample?.region).filter(Boolean));
        uniqueOrigins = regions.size;

        // Calculate average score from all sessions
        for (const session of sessionsData) {
          if (session.scores && session.scores.length > 0) {
            const sessionScores = session.scores.filter(score => score.totalScore > 0);
            totalScore += sessionScores.reduce((sum, score) => sum + score.totalScore, 0);
            scoreCount += sessionScores.length;
          }
        }
      }

      setStats({
        totalSessions,
        totalSamples,
        avgScore: scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 0,
        uniqueOrigins,
        completedSessions,
        activeSessions,
      });
    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };



  const handleExportAllReports = async () => {
    try {
      setIsExportingPDF(true);
      toast.loading('Generating comprehensive PDF report...', { id: 'pdf-export-all' });

      const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

      if (completedSessions.length === 0) {
        toast.error('No completed sessions to export.', { id: 'pdf-export-all' });
        return;
      }

      // For now, export the first completed session as an example
      // In a full implementation, you might want to create a combined report
      const firstSession = completedSessions[0];
      const scoresResponse = await scoresApi.getSessionScores(firstSession.id);

      if (scoresResponse.success) {
        const sessionData = {
          ...firstSession,
          samples: firstSession.samples.map((s: any) => ({
            id: s.id,
            sample: {
              id: s.id,
              name: s.name,
              origin: s.origin,
              variety: s.variety,
              processingMethod: s.processingMethod,
            }
          }))
        };

        await exportSessionToPDFWithCharts(sessionData as any, scoresResponse.data as any);
        toast.success('PDF report generated successfully!', { id: 'pdf-export-all' });
      }
    } catch (error: any) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-export-all' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Calculate real quality scores over time
  const getQualityScoresOverTime = () => {
    const scoresByDate = new Map();

    sessions.forEach(session => {
      if (session.scores && session.scores.length > 0) {
        // Use completion date, or creation date as fallback
        const dateKey = session.completedAt || session.createdAt;
        if (dateKey) {
          const date = format(new Date(dateKey), 'MMM dd');
          const validScores = session.scores.filter(score => score.totalScore > 0);

          if (validScores.length > 0) {
            const avgScore = validScores.reduce((sum, score) => sum + score.totalScore, 0) / validScores.length;

            if (scoresByDate.has(date)) {
              const existing = scoresByDate.get(date);
              scoresByDate.set(date, {
                date,
                score: (existing.score + avgScore) / 2,
                count: existing.count + 1
              });
            } else {
              scoresByDate.set(date, { date, score: avgScore, count: 1 });
            }
          }
        }
      }
    });

    return Array.from(scoresByDate.values())
      .sort((a, b) => new Date(a.date + ', 2024').getTime() - new Date(b.date + ', 2024').getTime())
      .map(item => ({ date: item.date, score: Number(item.score.toFixed(1)) }));
  };

  // Calculate real region distribution
  const getRegionDistribution = () => {
    const regionCounts = new Map();
    const colors = ['#8B5A3C', '#D4A574', '#A67C52', '#C4956C', '#E6C79C', '#B8956A', '#9A7B5C'];

    sessions.forEach(session => {
      session.samples.forEach(sessionSample => {
        const region = sessionSample.sample?.region || 'Unknown Region';
        regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
      });
    });

    return Array.from(regionCounts.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 regions
  };

  const qualityScoresData = getQualityScoresOverTime();
  const regionsData = getRegionDistribution();

  // Calculate real varieties comparison
  const getVarietiesComparison = () => {
    const varietyStats = new Map();

    sessions.forEach(session => {
      session.samples.forEach(sessionSample => {
        const variety = sessionSample.sample?.variety || 'Unknown Variety';

        if (!varietyStats.has(variety)) {
          varietyStats.set(variety, { totalScore: 0, count: 0, samples: 0 });
        }

        const stats = varietyStats.get(variety);
        stats.samples += 1;

        // Add scores for this sample
        if (session.scores) {
          const sampleScores = session.scores.filter(score =>
            score.sampleId === sessionSample.sampleId && score.totalScore > 0
          );
          sampleScores.forEach(score => {
            stats.totalScore += score.totalScore;
            stats.count += 1;
          });
        }
      });
    });

    return Array.from(varietyStats.entries())
      .map(([variety, stats]) => ({
        variety,
        avgScore: stats.count > 0 ? Number((stats.totalScore / stats.count).toFixed(1)) : 0,
        count: stats.samples
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 varieties
  };

  // Calculate real session activity over time
  const getSessionActivity = () => {
    const activityByDate = new Map();

    sessions.forEach(session => {
      const dateKey = session.completedAt || session.startedAt || session.createdAt;
      if (dateKey) {
        const date = format(new Date(dateKey), 'MMM dd');

        if (activityByDate.has(date)) {
          const existing = activityByDate.get(date);
          activityByDate.set(date, {
            date,
            sessions: existing.sessions + 1,
            samples: existing.samples + session.samples.length
          });
        } else {
          activityByDate.set(date, {
            date,
            sessions: 1,
            samples: session.samples.length
          });
        }
      }
    });

    return Array.from(activityByDate.values())
      .sort((a, b) => new Date(a.date + ', 2024').getTime() - new Date(b.date + ', 2024').getTime())
      .slice(-7); // Last 7 days of activity
  };

  const varietiesData = getVarietiesComparison();
  const activityData = getSessionActivity();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'sessions', name: 'Session Reports', icon: FileText },
    { id: 'quality', name: 'Quality Analysis', icon: Star },
    { id: 'origin', name: 'Origin Analysis', icon: MapPin },
    { id: 'processing', name: 'Varieties Analysis', icon: Coffee },
  ];





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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and analytics for your coffee cupping sessions and sample evaluations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportAllReports}
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Coffee className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgScore || '--'}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Samples Evaluated</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSamples.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Regions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueOrigins}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">Date Range:</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDateRange('7')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  dateRange === '7'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setDateRange('30')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  dateRange === '30'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setDateRange('90')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  dateRange === '90'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Last 3 months
              </button>
              <button
                onClick={() => setDateRange('custom')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  dateRange === 'custom'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">All Categories</option>
                <option value="arabica">Arabica</option>
                <option value="robusta">Robusta</option>
                <option value="specialty">Specialty</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Apply Filters
              </Button>
              <Button variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quality Scores Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quality Scores Over Time</h3>
            <LineChartIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            {qualityScoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityScoresData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Average Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5A3C"
                    strokeWidth={3}
                    dot={{ fill: '#8B5A3C', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <LineChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No scoring data available</p>
                  <p className="text-sm">Complete some cupping sessions to see score trends</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample Region Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sample Region Distribution</h3>
            <PieChartIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            {regionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {regionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No region data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coffee Varieties Samples */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Coffee Varieties Samples</h3>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            {varietiesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varietiesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="variety" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'avgScore' ? `${value} (avg)` : value,
                      name === 'avgScore' ? 'Average Score' : name
                    ]}
                    labelFormatter={(label) => `Coffee Variety: ${label}`}
                  />
                  <Bar dataKey="avgScore" fill="#8B5A3C" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No variety data available</p>
                  <p className="text-sm">Add samples with coffee varieties to see comparisons</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cupping Session Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cupping Session Activity</h3>
            <AreaChartIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === 'sessions' ? 'Sessions' : 'Samples'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stackId="1"
                    stroke="#8B5A3C"
                    fill="#8B5A3C"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="samples"
                    stackId="2"
                    stroke="#D4A574"
                    fill="#D4A574"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <AreaChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No session activity data available</p>
                  <p className="text-sm">Create cupping sessions to see activity trends</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Export PDF</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Session Performance</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuppers</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sessions.slice(0, 5).map(session => {
                          const avgScore = session.scores && session.scores.length > 0
                            ? (session.scores.reduce((sum, score) => sum + score.totalScore, 0) / session.scores.length).toFixed(1)
                            : '--';

                          return (
                            <tr key={session.id}>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.name}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {session.completedAt
                                  ? format(new Date(session.completedAt), 'MMM dd, yyyy')
                                  : session.startedAt
                                  ? format(new Date(session.startedAt), 'MMM dd, yyyy')
                                  : format(new Date(session.createdAt), 'MMM dd, yyyy')
                                }
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{session.samples.length}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{avgScore}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{session.participants.length}</td>
                            </tr>
                          );
                        })}
                        {sessions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                              No sessions found. Create a cupping session to see data here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Session Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Completed Sessions</span>
                      <span className="text-lg font-bold text-green-600">{stats.completedSessions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Active Sessions</span>
                      <span className="text-lg font-bold text-blue-600">{stats.activeSessions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                      <span className="text-lg font-bold text-purple-600">
                        {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Avg Samples per Session</span>
                      <span className="text-lg font-bold text-gray-900">
                        {stats.totalSessions > 0 ? Math.round(stats.totalSamples / stats.totalSessions) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Avg Participants per Session</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {stats.totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.participants.length, 0) / stats.totalSessions) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-[#8B5A3C]/5 to-[#D4A574]/5 rounded-xl p-6 border border-[#8B5A3C]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Session Reports</h4>
                    <p className="text-gray-600">Generate detailed reports with radar charts and comprehensive analysis</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[#8B5A3C]">
                    <FileText className="h-8 w-8" />
                    <span className="text-sm font-medium">{sessions.length} Sessions Available</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Sessions Available</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create your first cupping session to start generating detailed reports and analytics.
                    </p>
                    <Button className="bg-[#8B5A3C] hover:bg-[#8B5A3C]/90 text-white">
                      <Coffee className="h-4 w-4 mr-2" />
                      Create Session
                    </Button>
                  </div>
                ) : (
                  sessions.map(session => {
                    const avgScore = session.scores && session.scores.length > 0
                      ? (session.scores.reduce((sum, score) => sum + score.totalScore, 0) / session.scores.length).toFixed(1)
                      : null;

                    return (
                      <div
                        key={session.id}
                        className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-[#8B5A3C]/20 transition-all duration-300 overflow-hidden"
                      >
                        {/* Status Indicator */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          session.status === 'COMPLETED' ? 'bg-[#8B5A3C]' :
                          session.status === 'ACTIVE' ? 'bg-[#D4A574]' : 'bg-gray-300'
                        }`} />

                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#8B5A3C] transition-colors">
                                  {session.name}
                                </h3>
                                <Badge
                                  variant={session.status === 'COMPLETED' ? 'default' : session.status === 'ACTIVE' ? 'secondary' : 'outline'}
                                  className={`${
                                    session.status === 'COMPLETED'
                                      ? 'bg-[#8B5A3C]/10 text-[#8B5A3C] border-[#8B5A3C]/20'
                                      : session.status === 'ACTIVE'
                                      ? 'bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20'
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  } font-medium`}
                                >
                                  {session.status}
                                </Badge>
                              </div>
                              {session.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">{session.description}</p>
                              )}
                            </div>

                            {avgScore && (
                              <div className="ml-4 text-right">
                                <div className="text-2xl font-bold text-[#8B5A3C]">{avgScore}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Score</div>
                              </div>
                            )}
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {session.completedAt
                                    ? format(new Date(session.completedAt), 'MMM dd')
                                    : session.startedAt
                                    ? format(new Date(session.startedAt), 'MMM dd')
                                    : format(new Date(session.createdAt), 'MMM dd')
                                  }
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.completedAt ? 'Completed' : session.startedAt ? 'Started' : 'Created'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{session.participants.length}</div>
                                <div className="text-xs text-gray-500">Participants</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Coffee className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{session.samples.length}</div>
                                <div className="text-xs text-gray-500">Samples</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Star className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {session.creator.firstName} {session.creator.lastName}
                                </div>
                                <div className="text-xs text-gray-500">Creator</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                if (session.status === 'COMPLETED') {
                                  window.location.href = `/dashboard/sessions/${session.id}/report`;
                                }
                              }}
                              disabled={session.status !== 'COMPLETED'}
                              className={`${
                                session.status === 'COMPLETED'
                                  ? 'bg-[#8B5A3C] hover:bg-[#8B5A3C]/90 text-white shadow-lg hover:shadow-xl'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              } transition-all duration-200 font-medium px-6 py-2`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {session.status === 'COMPLETED' ? 'View Report' : 'Report Unavailable'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-8">
              {/* Quality Analysis Header */}
              <div className="bg-gradient-to-r from-[#8B5A3C]/5 to-[#D4A574]/5 rounded-xl p-6 border border-[#8B5A3C]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Quality Analysis</h4>
                    <p className="text-gray-600">Comprehensive quality metrics and scoring trends</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[#8B5A3C]">
                    <BarChart3 className="h-8 w-8" />
                    <span className="text-sm font-medium">Quality Insights</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quality Scores Over Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Quality Scores Over Time</h5>
                  {qualityScoresData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={qualityScoresData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => [`${value}`, 'Average Score']}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8B5A3C"
                          strokeWidth={3}
                          dot={{ fill: '#8B5A3C', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8B5A3C', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No quality data available yet</p>
                    </div>
                  )}
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Score Distribution</h5>
                  {sessions.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const scoreRanges = [
                          { range: '90-100', label: 'Outstanding', color: '#8B5A3C', count: 0 },
                          { range: '80-89', label: 'Excellent', color: '#D4A574', count: 0 },
                          { range: '70-79', label: 'Very Good', color: '#E8C5A0', count: 0 },
                          { range: '60-69', label: 'Good', color: '#F5E6D3', count: 0 },
                          { range: '<60', label: 'Below Average', color: '#E5E7EB', count: 0 }
                        ];

                        sessions.forEach(session => {
                          if (session.scores && session.scores.length > 0) {
                            session.scores.forEach(score => {
                              if (score.totalScore >= 90) scoreRanges[0].count++;
                              else if (score.totalScore >= 80) scoreRanges[1].count++;
                              else if (score.totalScore >= 70) scoreRanges[2].count++;
                              else if (score.totalScore >= 60) scoreRanges[3].count++;
                              else scoreRanges[4].count++;
                            });
                          }
                        });

                        const totalScores = scoreRanges.reduce((sum, range) => sum + range.count, 0);

                        return scoreRanges.map(range => (
                          <div key={range.range} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: range.color }}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {range.range} - {range.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{range.count}</span>
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    backgroundColor: range.color,
                                    width: totalScores > 0 ? `${(range.count / totalScores) * 100}%` : '0%'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No scoring data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'origin' && (
            <div className="space-y-8">
              {/* Origin Analysis Header */}
              <div className="bg-gradient-to-r from-[#8B5A3C]/5 to-[#D4A574]/5 rounded-xl p-6 border border-[#8B5A3C]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Origin Analysis</h4>
                    <p className="text-gray-600">Regional performance and origin comparisons</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[#8B5A3C]">
                    <MapPin className="h-8 w-8" />
                    <span className="text-sm font-medium">Regional Insights</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sample Region Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Sample Region Distribution</h5>
                  {regionsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={regionsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {regionsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No regional data available yet</p>
                    </div>
                  )}
                </div>

                {/* Top Performing Regions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Top Performing Regions</h5>
                  {(() => {
                    const regionPerformance = new Map();

                    sessions.forEach(session => {
                      session.samples.forEach(sessionSample => {
                        const region = sessionSample.sample?.region || 'Unknown Region';
                        if (!regionPerformance.has(region)) {
                          regionPerformance.set(region, { totalScore: 0, count: 0, samples: 0 });
                        }

                        const performance = regionPerformance.get(region);
                        performance.samples += 1;

                        if (session.scores && session.scores.length > 0) {
                          const sampleScores = session.scores.filter(score =>
                            score.sessionSampleId === sessionSample.id
                          );
                          sampleScores.forEach(score => {
                            performance.totalScore += score.totalScore;
                            performance.count += 1;
                          });
                        }
                      });
                    });

                    const topRegions = Array.from(regionPerformance.entries())
                      .map(([region, performance]) => ({
                        region,
                        avgScore: performance.count > 0 ? (performance.totalScore / performance.count) : 0,
                        samples: performance.samples
                      }))
                      .filter(item => item.samples > 0)
                      .sort((a, b) => b.avgScore - a.avgScore)
                      .slice(0, 6);

                    return topRegions.length > 0 ? (
                      <div className="space-y-4">
                        {topRegions.map((region, index) => (
                          <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-[#8B5A3C]' :
                                index === 1 ? 'bg-[#D4A574]' :
                                index === 2 ? 'bg-[#E8C5A0]' : 'bg-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{region.region}</div>
                                <div className="text-sm text-gray-600">{region.samples} samples</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-[#8B5A3C]">{region.avgScore.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">Avg Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">No regional performance data available yet</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="space-y-8">
              {/* Varieties Analysis Header */}
              <div className="bg-gradient-to-r from-[#8B5A3C]/5 to-[#D4A574]/5 rounded-xl p-6 border border-[#8B5A3C]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Varieties Analysis</h4>
                    <p className="text-gray-600">Coffee variety performance and distribution insights</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[#8B5A3C]">
                    <Coffee className="h-8 w-8" />
                    <span className="text-sm font-medium">Variety Insights</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coffee Varieties Samples */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Coffee Varieties Samples</h5>
                  {varietiesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={varietiesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="variety"
                          stroke="#6b7280"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => [
                            name === 'avgScore' ? `${value} avg score` : `${value} samples`,
                            name === 'avgScore' ? 'Average Score' : 'Sample Count'
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          fill="#8B5A3C"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Coffee className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No variety data available yet</p>
                    </div>
                  )}
                </div>

                {/* Top Performing Varieties */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Top Performing Varieties</h5>
                  {varietiesData.length > 0 ? (
                    <div className="space-y-4">
                      {varietiesData
                        .sort((a, b) => b.avgScore - a.avgScore)
                        .slice(0, 6)
                        .map((variety, index) => (
                          <div key={variety.variety} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-[#8B5A3C]' :
                                index === 1 ? 'bg-[#D4A574]' :
                                index === 2 ? 'bg-[#E8C5A0]' : 'bg-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{variety.variety}</div>
                                <div className="text-sm text-gray-600">{variety.count} samples</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-[#8B5A3C]">{variety.avgScore.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">Avg Score</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No variety performance data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
