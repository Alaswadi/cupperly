'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Save, Coffee, MapPin, Mountain, Package, Calendar, User, Beaker } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  COFFEE_ORIGINS,
  getRegionsByCountry,
  getVarietiesByCountry,
  getCountries,
  PROCESSING_METHODS
} from '@/data/coffee-origins';

export default function NewSamplePage() {
  const { user, organization } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableRegions, setAvailableRegions] = useState<any[]>([]);
  const [availableVarieties, setAvailableVarieties] = useState<string[]>([]);
  const [countryInfo, setCountryInfo] = useState<any>(null);
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
    code: '',
    harvestDate: '',
    roaster: '',
    roastDate: '',
  });

  useEffect(() => {
    if (selectedCountry) {
      const regions = getRegionsByCountry(selectedCountry);
      const varieties = getVarietiesByCountry(selectedCountry);
      const info = COFFEE_ORIGINS.find(o => o.country === selectedCountry);
      
      setAvailableRegions(regions);
      setAvailableVarieties(varieties);
      setCountryInfo(info);
      setFormData(prev => ({ ...prev, origin: selectedCountry }));
    }
  }, [selectedCountry]);

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
      setIsLoading(true);
      const response = await samplesApi.createSample(formData);
      
      if (response.success) {
        toast.success('Sample created successfully!');
        router.push('/dashboard/samples');
      } else {
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to create sample';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating sample:', error);
      toast.error('Failed to create sample');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/samples">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Sample</h1>
            <p className="text-gray-600 mt-1">Create a new coffee sample for cupping sessions</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="e.g., ETH-001, COL-2024-01"
                />
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
                    <option key={method} value={method.toUpperCase().replace(/\s+/g, '_')}>{method}</option>
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

        {/* Harvest & Roasting */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Harvest & Roasting</h2>
                <p className="text-sm text-gray-600">Harvest and roasting information</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roaster</label>
                <input
                  type="text"
                  value={formData.roaster}
                  onChange={(e) => handleInputChange('roaster', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="Roaster name or company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roast Date</label>
                <input
                  type="date"
                  value={formData.roastDate}
                  onChange={(e) => handleInputChange('roastDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
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
          <Link href="/dashboard/samples">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Creating...' : 'Create Sample'}
          </button>
        </div>
      </form>
    </div>
  );
}
