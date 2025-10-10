'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { ArrowLeft, Save, Coffee, MapPin, Package, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  COFFEE_ORIGINS,
  getRegionsByCountry,
  getVarietiesByCountry,
  getCountries,
  PROCESSING_METHODS
} from '@/data/coffee-origins';

export default function EditSamplePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableRegions, setAvailableRegions] = useState<any[]>([]);
  const [availableVarieties, setAvailableVarieties] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    region: '',
    variety: '',
    processingMethod: 'WASHED',
    roastLevel: 'MEDIUM',
    producer: '',
    farm: '',
    altitude: '',
    moisture: '',
    density: '',
    screenSize: '',
    description: '',
  });

  const sampleId = params.id as string;

  useEffect(() => {
    if (sampleId) {
      loadSample();
    }
  }, [sampleId]);

  useEffect(() => {
    if (selectedCountry) {
      const regions = getRegionsByCountry(selectedCountry);
      const varieties = getVarietiesByCountry(selectedCountry);
      
      setAvailableRegions(regions);
      setAvailableVarieties(varieties);
      setFormData(prev => ({ ...prev, origin: selectedCountry }));
    }
  }, [selectedCountry]);

  const loadSample = async () => {
    try {
      setIsLoading(true);
      const response = await samplesApi.getSample(sampleId);
      
      if (response.success && response.data) {
        const sampleData = response.data;
        setSample(sampleData);
        setFormData({
          name: sampleData.name || '',
          origin: sampleData.origin || '',
          region: sampleData.region || '',
          variety: sampleData.variety || '',
          processingMethod: sampleData.processingMethod || 'WASHED',
          roastLevel: sampleData.roastLevel || 'MEDIUM',
          producer: sampleData.producer || '',
          farm: sampleData.farm || '',
          altitude: sampleData.altitude?.toString() || '',
          moisture: sampleData.moisture?.toString() || '',
          density: sampleData.density?.toString() || '',
          screenSize: sampleData.screenSize || '',
          description: sampleData.description || '',
        });
        setSelectedCountry(sampleData.origin || '');
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.origin) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsSaving(true);
      const response = await samplesApi.updateSample(sampleId, formData as any);
      
      if (response.success) {
        toast.success('Sample updated successfully!');
        router.push(`/dashboard/samples/${sampleId}`);
      } else {
        toast.error((response.error as any)?.message || response.error || 'Failed to update sample');
      }
    } catch (error) {
      console.error('Error updating sample:', error);
      toast.error('Failed to update sample');
    } finally {
      setIsSaving(false);
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
        <p className="text-gray-600 mb-4">The sample you're trying to edit doesn't exist.</p>
        <Link href="/dashboard/samples">
          <button className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark">
            Back to Samples
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/dashboard/samples/${sampleId}`}>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Sample</h1>
            <p className="text-gray-600 mt-1">Update coffee sample information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
                <Coffee className="h-5 w-5 text-coffee-brown" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600">Essential details about the coffee sample</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="e.g., Ethiopia Yirgacheffe G1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  required
                >
                  <option value="">Select Country</option>
                  {getCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  disabled={!selectedCountry}
                >
                  <option value="">Select Region</option>
                  {availableRegions.map(region => (
                    <option key={region.name} value={region.name}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variety</label>
                <select
                  value={formData.variety}
                  onChange={(e) => handleInputChange('variety', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  disabled={!selectedCountry}
                >
                  <option value="">Select Variety</option>
                  {availableVarieties.map(variety => (
                    <option key={variety} value={variety}>{variety}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Processing & Production */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Processing & Production</h2>
                <p className="text-sm text-gray-600">Details about processing method and production</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Method</label>
                <select
                  value={formData.processingMethod}
                  onChange={(e) => handleInputChange('processingMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                >
                  {PROCESSING_METHODS.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roast Level</label>
                <select
                  value={formData.roastLevel}
                  onChange={(e) => handleInputChange('roastLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                >
                  <option value="LIGHT">Light</option>
                  <option value="MEDIUM_LIGHT">Medium Light</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="MEDIUM_DARK">Medium Dark</option>
                  <option value="DARK">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Producer</label>
                <input
                  type="text"
                  value={formData.producer}
                  onChange={(e) => handleInputChange('producer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="Producer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm</label>
                <input
                  type="text"
                  value={formData.farm}
                  onChange={(e) => handleInputChange('farm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="Farm name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Beaker className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Technical Specifications</h2>
                <p className="text-sm text-gray-600">Physical and technical characteristics</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altitude (masl)</label>
                <input
                  type="number"
                  value={formData.altitude}
                  onChange={(e) => handleInputChange('altitude', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="1800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.moisture}
                  onChange={(e) => handleInputChange('moisture', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="11.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Density (g/ml)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.density}
                  onChange={(e) => handleInputChange('density', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="0.72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Screen Size</label>
                <input
                  type="text"
                  value={formData.screenSize}
                  onChange={(e) => handleInputChange('screenSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="16+"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Description & Notes</h2>
            <p className="text-sm text-gray-600">Additional information about the sample</p>
          </div>
          <div className="p-6">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
              placeholder="Enter any additional notes about this sample..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Link href={`/dashboard/samples/${sampleId}`}>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
