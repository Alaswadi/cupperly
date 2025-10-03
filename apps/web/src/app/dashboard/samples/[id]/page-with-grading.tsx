'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GreenBeanGradingForm } from '@/components/samples/grading/GreenBeanGradingForm';
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
  Mountain,
  Beaker,
  Info
} from 'lucide-react';

type TabType = 'overview' | 'grading';

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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
        setSample(null);
      }
    } catch (error) {
      console.error('Failed to load sample:', error);
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
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Back to Samples
          </button>
        </Link>
      </div>
    );
  }

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
          <Link href={`/dashboard/samples/${sample.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'overview'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Info className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'grading'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Beaker className="h-4 w-4" />
              Green Bean Grading
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
                      <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                      <p className="text-gray-900">{sample.region || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Variety</label>
                      <p className="text-gray-900">{sample.variety || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Processing Method</label>
                      <p className="text-gray-900">{sample.processingMethod || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Roast Level</label>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{sample.roastLevel || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Altitude</label>
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{sample.altitude ? `${sample.altitude}m` : 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Sample Code</label>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{sample.code || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {sample.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                    <p className="text-gray-900">{sample.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Producer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Producer Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Producer</label>
                    <p className="text-gray-900">{sample.producer || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Farm</label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{sample.farm || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Physical Attributes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Physical Attributes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moisture</span>
                  <span className="text-sm font-medium text-gray-900">
                    {sample.moisture ? `${sample.moisture}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Density</span>
                  <span className="text-sm font-medium text-gray-900">
                    {sample.density ? `${sample.density} g/L` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Screen Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {sample.screenSize || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Harvest Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {sample.harvestDate ? new Date(sample.harvestDate).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Roast Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {sample.roastDate ? new Date(sample.roastDate).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <GreenBeanGradingForm sampleId={sampleId} />
        </div>
      )}
    </div>
  );
}

