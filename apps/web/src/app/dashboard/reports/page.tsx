'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, samplesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  Coffee,
  Star,
  MapPin,
  Filter,
  FileText
} from 'lucide-react';

export default function ReportsPage() {
  const { user, organization } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
      const [sessionsResponse, samplesResponse] = await Promise.all([
        sessionsApi.getSessions(),
        samplesApi.getSamples(),
      ]);

      let totalSessions = 0;
      let completedSessions = 0;
      let activeSessions = 0;

      if (sessionsResponse.success) {
        const sessions = sessionsResponse.data.sessions;
        totalSessions = sessions.length;
        completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
        activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;
      }

      let totalSamples = 0;
      let uniqueOrigins = 0;

      if (samplesResponse.success) {
        const samples = samplesResponse.data.samples;
        totalSamples = samples.length;
        uniqueOrigins = new Set(samples.map(s => s.origin)).size;
      }

      setStats({
        totalSessions,
        totalSamples,
        avgScore: 0, // TODO: Calculate from actual scores
        uniqueOrigins,
        completedSessions,
        activeSessions,
      });
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'quality', name: 'Quality Analysis', icon: Star },
    { id: 'origin', name: 'Origin Analysis', icon: MapPin },
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
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Samples</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalSamples}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgScore || '--'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Origins</p>
                <p className="text-3xl font-bold text-purple-600">{stats.uniqueOrigins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Session Performance</h4>
                  <div className="space-y-3">
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
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Sample Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Samples</span>
                      <span className="text-lg font-bold text-gray-900">{stats.totalSamples}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Unique Origins</span>
                      <span className="text-lg font-bold text-green-600">{stats.uniqueOrigins}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Avg per Session</span>
                      <span className="text-lg font-bold text-blue-600">
                        {stats.totalSessions > 0 ? Math.round(stats.totalSamples / stats.totalSessions) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Detailed charts and analytics will be implemented here.</p>
                  <p className="text-sm">This will include session trends, score distributions, and performance metrics.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Analysis</h3>
              <p>Quality analysis charts and insights will be implemented here.</p>
              <p className="text-sm">This will include score distributions, quality trends, and comparative analysis.</p>
            </div>
          )}

          {activeTab === 'origin' && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Origin Analysis</h3>
              <p>Origin-based analysis and geographic insights will be implemented here.</p>
              <p className="text-sm">This will include origin performance, regional comparisons, and sourcing insights.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
