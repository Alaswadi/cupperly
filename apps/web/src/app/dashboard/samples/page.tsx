'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { samplesApi, sessionsApi } from '@/lib/api';
import { Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import {
  Coffee,
  MapPin,
  Calendar,
  Plus,
  Search,
  Filter,
  Package,
  Eye,
  Edit,
  Archive,
  MoreHorizontal,
  CheckCircle,
  PlayCircle,
  Clock,
  Grid3X3,
  List,
  Globe,
  Star,
  TrendingUp,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SamplesPage() {
  const { user, organization } = useAuth();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [processFilter, setProcessFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [stats, setStats] = useState({
    totalSamples: 0,
    uniqueOrigins: 0,
    avgScore: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      setIsLoading(true);

      // Fetch both samples and sessions data in parallel
      const [samplesResponse, sessionsResponse] = await Promise.all([
        samplesApi.getSamples(),
        sessionsApi.getSessions()
      ]);

      if (samplesResponse.success && samplesResponse.data) {
        const sampleData = samplesResponse.data.samples || samplesResponse.data || [];
        setSamples(Array.isArray(sampleData) ? sampleData : []);

        // Calculate stats from actual data
        const totalSamples = sampleData.length;

        // Count unique origins
        const uniqueOrigins = new Set(
          sampleData.map((s: Sample) => s.origin).filter(Boolean)
        ).size;

        // Calculate samples added this month
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = sampleData.filter((s: Sample) => {
          const createdAt = new Date(s.createdAt);
          return createdAt >= thisMonthStart;
        }).length;

        // Calculate average score from sessions (same logic as sessions page)
        let avgScore = 0;
        if (sessionsResponse.success && sessionsResponse.data) {
          const sessionData = sessionsResponse.data.sessions;
          let totalScore = 0;
          let scoreCount = 0;

          sessionData.forEach((session: any) => {
            if (session.scores && session.scores.length > 0) {
              session.scores.forEach((score: any) => {
                if (score.totalScore > 0) {
                  totalScore += score.totalScore;
                  scoreCount++;
                }
              });
            }
          });

          avgScore = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 0;
        }

        setStats({
          totalSamples,
          uniqueOrigins,
          avgScore,
          thisMonth,
        });
      }
    } catch (error) {
      console.error('Failed to load samples:', error);
      toast.error('Failed to load samples');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSampleSelection = (sampleId: string) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId) 
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const toggleAllSamples = () => {
    setSelectedSamples(
      selectedSamples.length === filteredSamples.length ? [] : filteredSamples.map(s => s.id)
    );
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (!confirm('Are you sure you want to delete this sample? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await samplesApi.deleteSample(sampleId);
      if (response.success) {
        toast.success('Sample deleted successfully');
        loadSamples(); // Reload the samples list
      } else {
        toast.error(response.error || 'Failed to delete sample');
      }
    } catch (error: any) {
      console.error('Failed to delete sample:', error);
      toast.error(error.response?.data?.error || 'Failed to delete sample');
    }
  };

  const handleArchiveSample = async (sampleId: string) => {
    // For now, archive will just show a message
    // In the future, you can add an 'archived' field to the Sample model
    toast.success('Archive functionality coming soon!');
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    if (selectedSamples.length === 0) {
      toast.error('Please select at least one sample');
      return;
    }

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedSamples.length} sample(s)? This action cannot be undone.`)) {
        return;
      }

      try {
        const deletePromises = selectedSamples.map(id => samplesApi.deleteSample(id));
        await Promise.all(deletePromises);
        toast.success(`${selectedSamples.length} sample(s) deleted successfully`);
        setSelectedSamples([]);
        setBulkAction('');
        loadSamples();
      } catch (error: any) {
        console.error('Failed to delete samples:', error);
        toast.error(error.response?.data?.error || 'Failed to delete some samples');
      }
    } else if (bulkAction === 'archive') {
      toast.success('Bulk archive functionality coming soon!');
      setBulkAction('');
    } else if (bulkAction === 'export') {
      toast.success('Bulk export functionality coming soon!');
      setBulkAction('');
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.producer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = !originFilter || sample.origin?.toLowerCase().includes(originFilter.toLowerCase());
    const matchesProcess = !processFilter || sample.processingMethod?.toLowerCase().includes(processFilter.toLowerCase());
    return matchesSearch && matchesOrigin && matchesProcess;
  });

  const samplesPerPage = 10;
  const totalPages = Math.ceil(filteredSamples.length / samplesPerPage);
  const paginatedSamples = filteredSamples.slice(
    (currentPage - 1) * samplesPerPage,
    currentPage * samplesPerPage
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Samples</h2>
        <p className="text-gray-600">Manage and organize all your coffee samples for cupping sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Samples</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSamples}</p>
            </div>
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
              <Package className="text-coffee-brown text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Origins</p>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueOrigins}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="text-blue-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '—'}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="text-amber-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search samples by name or ID..." 
                  className="border-none outline-none text-sm text-gray-700 bg-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded text-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Bulk Actions */}
              {selectedSamples.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Actions</option>
                    <option value="export">Export Selected</option>
                    <option value="archive">Archive Selected</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="bg-coffee-brown text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm hover:bg-coffee-dark transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              <Link href="/dashboard/samples/new">
                <button className="flex items-center space-x-2 px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Sample</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Process</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={processFilter}
                  onChange={(e) => setProcessFilter(e.target.value)}
                >
                  <option value="">All Processes</option>
                  <option value="natural">Natural</option>
                  <option value="washed">Washed</option>
                  <option value="honey">Honey</option>
                  <option value="anaerobic">Anaerobic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roast Level</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Levels</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => {
                  setOriginFilter('');
                  setProcessFilter('');
                  setStatusFilter('');
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

      {/* Table View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedSamples.length === filteredSamples.length && filteredSamples.length > 0}
                      onChange={toggleAllSamples}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roast Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSamples.length === 0 && !searchTerm && !originFilter && !processFilter && !statusFilter ? (
                  // Sample data when no real samples exist
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SM-2024-001</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Ethiopia Yirgacheffe G1
                        </Link>
                        <div className="text-xs text-gray-500">Lot: YRG-2024-A</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Gedeb, Ethiopia</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Natural</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Dec 10, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">18°C, 55% RH</div>
                        <div className="text-xs text-gray-500">Cool Storage</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SM-2024-002</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Colombia Huila Supremo
                        </Link>
                        <div className="text-xs text-gray-500">Lot: HUI-2024-B</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Huila, Colombia</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Washed</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Dec 08, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">20°C, 60% RH</div>
                        <div className="text-xs text-gray-500">Room Temp</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">In Use</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SM-2024-003</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href="#" className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          Guatemala Antigua SHB
                        </Link>
                        <div className="text-xs text-gray-500">Lot: ANT-2024-C</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Antigua, Guatemala</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Honey</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Dec 05, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">16°C, 50% RH</div>
                        <div className="text-xs text-gray-500">Cold Storage</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </>
                ) : paginatedSamples.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || originFilter || processFilter || statusFilter ? 'No samples found matching your criteria.' : 'No samples yet. Create your first sample!'}
                    </td>
                  </tr>
                ) : (
                  paginatedSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedSamples.includes(sample.id)}
                          onChange={() => toggleSampleSelection(sample.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/samples/${sample.id}`} className="text-sm font-medium text-gray-900 hover:text-coffee-brown">
                          {sample.name}
                        </Link>
                        <div className="text-xs text-gray-500">{sample.variety || 'Unknown variety'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sample.origin || 'Unknown origin'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sample.processingMethod || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {sample.roastDate ? new Date(sample.roastDate).toLocaleDateString() : 'Not roasted'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Storage info</div>
                        <div className="text-xs text-gray-500">Conditions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/samples/${sample.id}`}>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coffee-brown" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/samples/${sample.id}/edit`}>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleArchiveSample(sample.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600"
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSample(sample.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * samplesPerPage) + 1} to {Math.min(currentPage * samplesPerPage, filteredSamples.length)} of {filteredSamples.length} samples
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? 'bg-coffee-brown text-white border-coffee-brown'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedSamples.length === 0 && !searchTerm && !originFilter && !processFilter && !statusFilter ? (
            // Sample cards when no real samples exist
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500">SM-2024-001</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ethiopia Yirgacheffe G1</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Gedeb, Ethiopia
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Natural Process
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Dec 10, 2024
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
                    View Details
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 border border-gray-300 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500">SM-2024-002</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">In Use</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Colombia Huila Supremo</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Huila, Colombia
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Washed Process
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Dec 08, 2024
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
                    View Details
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 border border-gray-300 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : paginatedSamples.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchTerm || originFilter || processFilter || statusFilter ? 'No samples found matching your criteria.' : 'No samples yet. Create your first sample!'}
            </div>
          ) : (
            paginatedSamples.map((sample) => (
              <div key={sample.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500">{sample.id}</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{sample.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {sample.origin || 'Unknown origin'}
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {sample.processingMethod || 'Unknown process'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {sample.roastDate ? new Date(sample.roastDate).toLocaleDateString() : 'Not roasted'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/samples/${sample.id}`} className="flex-1">
                    <button className="w-full px-3 py-2 text-sm bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
                      View Details
                    </button>
                  </Link>
                  <Link href={`/dashboard/samples/${sample.id}/edit`}>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 border border-gray-300 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
