'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
      const response = await samplesApi.getSample(sampleId);
      
      if (response.success) {
        setSample(response.data);
      } else {
        router.push('/dashboard/samples');
      }
    } catch (error) {
      console.error('Failed to load sample:', error);
      router.push('/dashboard/samples');
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
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
                    <p className="text-gray-900">{sample?.origin || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Variety</label>
                    <p className="text-gray-900">{sample?.variety || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Sample Code</label>
                    <p className="text-gray-900">{sample?.code || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Processing Method</label>
                    <p className="text-gray-900">{sample?.processingMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roast Level</label>
                    <p className="text-gray-900">{sample?.roastLevel || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Harvest Date</label>
                    <p className="text-gray-900">
                      {sample?.harvestDate ? new Date(sample.harvestDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roaster</label>
                    <p className="text-gray-900">{sample?.roaster || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Harvest & Roasting</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Roast Date</label>
                    <p className="text-gray-900">
                      {sample?.roastDate ? new Date(sample.roastDate).toLocaleDateString() : 'Not specified'}
                    </p>
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
                  Edit Sample
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
