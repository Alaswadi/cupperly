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
  Package,
  Thermometer,
  User,
  Building,
  Mountain
} from 'lucide-react';

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sampleId = params.id as string;

  useEffect(() => {
    if (sampleId) {
      loadSample();
    }
  }, [sampleId]);

  const loadSample = async () => {
    try {
      setIsLoading(true);
      console.log('Loading sample:', sampleId);
      const response = await samplesApi.getSample(sampleId);
      console.log('Sample response:', response);
      
      if (response.success) {
        setSample(response.data);
        console.log('Sample loaded successfully:', response.data);
      } else {
        console.error('Failed to load sample - API returned error:', response);
        setSample(null);
      }
    } catch (error) {
      console.error('Failed to load sample - Exception:', error);
      setSample(null);
    } finally {
      setIsLoading(false);
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
        <p className="text-gray-600 mb-4">The sample you are looking for does not exist.</p>
        <Link href="/dashboard/samples">
          <button className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
            Back to Samples
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/samples">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{sample?.name}</h1>
            <p className="text-gray-600 mt-1">Sample Details and Information</p>
          </div>
          <Link href={`/dashboard/samples/${sample?.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Sample Name</label>
                    <p className="text-lg font-semibold text-gray-900">{sample?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Origin</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.origin || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Variety</label>
                    <p className="text-gray-900">{sample?.variety || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Sample Code</label>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.code || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Processing Method</label>
                    <p className="text-gray-900">{sample?.processingMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roast Level</label>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.roastLevel || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample?.createdAt ? new Date(sample.createdAt).toLocaleDateString() : 'Unknown'}
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
                      <p className="text-gray-900">{sample?.producer || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Farm</label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.farm || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Altitude</label>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample?.altitude ? `${sample.altitude} masl` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.region || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Harvest & Roasting */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Harvest & Roasting</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Harvest Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample?.harvestDate ? new Date(sample.harvestDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roaster</label>
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample?.roaster || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roast Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {sample?.roastDate ? new Date(sample.roastDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link href={`/dashboard/samples/${sample?.id}/edit`} className="block">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="h-4 w-4 text-gray-600" />
                  <span>Edit Sample</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sample Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Sample ID</p>
                <p className="text-gray-900 font-mono">{sample?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {sample?.updatedAt ? new Date(sample.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
