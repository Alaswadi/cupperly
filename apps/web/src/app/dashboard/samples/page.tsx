'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { 
  Coffee, 
  MapPin, 
  Calendar,
  Plus,
  Search,
  Filter,
  Package,
  Beaker,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SamplesPage() {
  const { user, organization } = useAuth();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalSamples: 0,
    uniqueOrigins: 0,
    avgScore: 0,
    recentSamples: 0,
  });

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      setIsLoading(true);
      const response = await samplesApi.getSamples();

      if (response.success) {
        const sampleData = response.data.samples;
        setSamples(sampleData);
        
        // Calculate stats
        const uniqueOrigins = new Set(sampleData.map(s => s.origin)).size;
        const recentSamples = sampleData.filter(s => {
          const createdDate = new Date(s.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length;
        
        setStats({
          totalSamples: sampleData.length,
          uniqueOrigins,
          avgScore: 0, // TODO: Calculate from scores when available
          recentSamples,
        });
      }
    } catch (error) {
      console.error('Failed to load samples:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProcessingMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'washed':
        return 'bg-blue-100 text-blue-800';
      case 'natural':
        return 'bg-green-100 text-green-800';
      case 'honey':
        return 'bg-yellow-100 text-yellow-800';
      case 'semi-washed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoastLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'light':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'dark':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.producer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = originFilter === 'all' || sample.origin === originFilter;
    return matchesSearch && matchesOrigin;
  });

  const uniqueOrigins = Array.from(new Set(samples.map(s => s.origin))).filter(Boolean);

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
          <h1 className="text-3xl font-bold text-gray-900">Samples</h1>
          <p className="text-gray-600 mt-2">Manage your coffee samples and track their characteristics</p>
        </div>
        <Link href="/dashboard/samples/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Sample
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Samples</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSamples}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Origins</p>
                <p className="text-3xl font-bold text-green-600">{stats.uniqueOrigins}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Recent</p>
                <p className="text-3xl font-bold text-purple-600">{stats.recentSamples}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
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
                  placeholder="Search samples by name, origin, variety, or producer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Origins</option>
                {uniqueOrigins.map((origin) => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Samples List */}
      <Card>
        <CardHeader>
          <CardTitle>All Samples</CardTitle>
          <CardDescription>
            {filteredSamples.length} of {samples.length} samples
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSamples.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {samples.length === 0 ? 'No samples yet' : 'No samples match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {samples.length === 0 
                  ? 'Add your first coffee sample to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {samples.length === 0 && (
                <Link href="/dashboard/samples/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Sample
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSamples.map((sample) => (
                <div key={sample.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link href={`/dashboard/samples/${sample.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary-600 cursor-pointer mb-1">
                          {sample.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{sample.origin}</span>
                        {sample.region && <span>• {sample.region}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {sample.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{sample.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sample.variety && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {sample.variety}
                      </span>
                    )}
                    {sample.processingMethod && (
                      <span className={`px-2 py-1 rounded-full text-xs ${getProcessingMethodColor(sample.processingMethod)}`}>
                        {sample.processingMethod}
                      </span>
                    )}
                    {sample.roastLevel && (
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoastLevelColor(sample.roastLevel)}`}>
                        {sample.roastLevel}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(sample.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/samples/${sample.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
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
