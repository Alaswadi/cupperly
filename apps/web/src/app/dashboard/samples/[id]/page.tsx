'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { 
  ArrowLeft,
  Coffee, 
  MapPin, 
  Calendar,
  Edit,
  Archive,
  Package,
  Thermometer,
  Droplets,
  Mountain,
  User,
  Building,
  Tag,
  Beaker,
  CheckCircle,
  Clock,
  PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);

  const sampleId = params.id as string;

  useEffect(() => {
    if (sampleId) {
      loadSample();
    }
  }, [sampleId]);

  const loadSample = async () => {
    try {
      setIsLoading(true);
      const response = await samplesApi.getSample(sampleId);
      
      if (response.success) {
        setSample(response.data);
      } else {
        toast.error('Failed to load sample');
        router.push('/dashboard/samples');
      }
    } catch (error) {
      console.error('Failed to load sample:', error);
      toast.error('Failed to load sample');
      router.push('/dashboard/samples');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!sample) return;
    
    try {
      setIsArchiving(true);
      // Add archive API call here when available
      toast.success('Sample archived successfully');
      router.push('/dashboard/samples');
    } catch (error) {
      console.error('Failed to archive sample:', error);
      toast.error('Failed to archive sample');
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample not found</h2>
        <p className="text-gray-600 mb-4">The sample you're looking for doesn't exist.</p>
        <Link href="/dashboard/samples">
          <button className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
            Back to Samples
          </button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
      case 'in use':
        return <PlayCircle className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/samples">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{sample.name}</h1>
            <p className="text-gray-600 mt-1">Sample Details and Information</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('available')}`}>
              {getStatusIcon('available')}
              Available
            </span>
            <Link href={`/dashboard/samples/${sample.id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </Link>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              {isArchiving ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-coffee-brown" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Sample Name</label>
                    <p className="text-lg font-semibold text-gray-900">{sample.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Origin</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.origin || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Variety</label>
                    <p className="text-gray-900">{sample.variety || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Processing Method</label>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.processingMethod || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roast Level</label>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.roastLevel || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample.createdAt ? new Date(sample.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Production Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mountain className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Production Details</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Producer</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.producer || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Farm</label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.farm || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Altitude</label>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample.altitude ? `${sample.altitude} masl` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.region || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link href={`/dashboard/samples/${sample.id}/edit`} className="block">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Edit Sample</p>
                    <p className="text-sm text-gray-500">Update sample information</p>
                  </div>
                </button>
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Coffee className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Use in Session</p>
                  <p className="text-sm text-gray-500">Add to cupping session</p>
                </div>
              </button>
              <button 
                onClick={handleArchive}
                disabled={isArchiving}
                className="w-full flex items-center gap-3 px-4 py-3 text-left border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <Archive className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Archive Sample</p>
                  <p className="text-sm text-orange-600">Remove from active samples</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sample Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sample Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Sample ID</p>
                <p className="text-gray-900 font-mono">{sample.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="text-gray-900">{user?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {sample.updatedAt ? new Date(sample.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
