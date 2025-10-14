'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, templatesApi, samplesApi } from '@/lib/api';
import { CuppingTemplate, Sample } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Save, Calendar, MapPin, Users, Coffee, Settings, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewSessionPage() {
  const { user, organization } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<CuppingTemplate[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    templateId: '',
    blindTasting: true,
    allowComments: true,
    requireCalibration: false,
    scheduledAt: '',
    sampleIds: [] as string[],
    tags: [] as string[],
  });

  useEffect(() => {
    loadTemplates();
    loadSamples();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.getTemplates();
      if (response.success && response.data) {
        const templateList = response.data.templates || response.data || [];
        setTemplates(templateList);

        // Auto-select SCA Standard template as default
        const scaTemplate = templateList.find((t: any) =>
          t.name === "SCA Standard" || t.isDefault
        );
        if (scaTemplate) {
          setFormData(prev => ({
            ...prev,
            templateId: scaTemplate.id
          }));
        }
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  };

  const loadSamples = async () => {
    try {
      const response = await samplesApi.getSamples();
      if (response.success) {
        // Handle different response structures - API returns data.samples
        const sampleList = response.data.samples || response.data || [];
        setSamples(Array.isArray(sampleList) ? sampleList : []);

        // Check if there's a pre-selected sample from URL params
        const preSelectedSampleId = searchParams.get('sampleId');
        if (preSelectedSampleId) {
          // Verify the sample exists in the loaded samples
          const sampleExists = sampleList.some((s: Sample) => s.id === preSelectedSampleId);
          if (sampleExists) {
            setFormData(prev => ({
              ...prev,
              sampleIds: [preSelectedSampleId],
            }));
            toast.success('Sample pre-selected for this session');
          }
        }
      } else {
        console.error('Failed to load samples:', response);
        setSamples([]);
      }
    } catch (error) {
      console.error('Failed to load samples:', error);
      setSamples([]);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSampleToggle = (sampleId: string) => {
    setFormData(prev => ({
      ...prev,
      sampleIds: prev.sampleIds.includes(sampleId)
        ? prev.sampleIds.filter(id => id !== sampleId)
        : [...prev.sampleIds, sampleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Session name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data, removing empty templateId
      const submitData = {
        ...formData,
        templateId: formData.templateId || undefined,
        // Convert scheduledAt to proper ISO format with seconds
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      };

      const response = await sessionsApi.createSession(submitData as any);
      if (response.success) {
        toast.success('Session created successfully!');
        router.push('/dashboard/sessions');
      } else {
        toast.error('Failed to create session');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/sessions">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sessions</span>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
          <p className="text-gray-600 mt-2">Set up a new cupping session for evaluation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-coffee-brown" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                    <p className="text-sm text-gray-600">Basic information about the cupping session</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Weekly Quality Control"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the session purpose..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Main Lab"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                    Cupping Template
                  </label>
                  <select
                    id="templateId"
                    value={formData.templateId}
                    onChange={(e) => handleInputChange('templateId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent pr-8"
                  >
                    <option value="">No template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.isDefault && '(Default)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Session Settings</h3>
                    <p className="text-sm text-gray-600">Configure session behavior</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {formData.blindTasting ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div>
                      <label htmlFor="blindTasting" className="text-sm font-medium text-gray-900 cursor-pointer">Blind Tasting</label>
                      <p className="text-sm text-gray-500">Hide sample information from cuppers</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      formData.blindTasting
                        ? 'bg-coffee-brown border-coffee-brown'
                        : 'border-gray-300 hover:border-coffee-brown/50'
                    }`}
                    onClick={() => handleInputChange('blindTasting', !formData.blindTasting)}
                  >
                    {formData.blindTasting && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <label htmlFor="allowComments" className="text-sm font-medium text-gray-900 cursor-pointer">Allow Comments</label>
                      <p className="text-sm text-gray-500">Enable cupper notes and comments</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      formData.allowComments
                        ? 'bg-coffee-brown border-coffee-brown'
                        : 'border-gray-300 hover:border-coffee-brown/50'
                    }`}
                    onClick={() => handleInputChange('allowComments', !formData.allowComments)}
                  >
                    {formData.allowComments && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <label htmlFor="requireCalibration" className="text-sm font-medium text-gray-900 cursor-pointer">Require Calibration</label>
                      <p className="text-sm text-gray-500">Mandatory calibration before scoring</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      formData.requireCalibration
                        ? 'bg-coffee-brown border-coffee-brown'
                        : 'border-gray-300 hover:border-coffee-brown/50'
                    }`}
                    onClick={() => handleInputChange('requireCalibration', !formData.requireCalibration)}
                  >
                    {formData.requireCalibration && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sample Selection</h3>
                    <p className="text-sm text-gray-600">Choose samples for this cupping session</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {!Array.isArray(samples) || samples.length === 0 ? (
                    <div className="text-center py-8">
                      <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No samples available. Create some samples first.</p>
                    </div>
                  ) : (
                    samples.map((sample) => (
                      <div
                        key={sample.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleSampleToggle(sample.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            formData.sampleIds.includes(sample.id)
                              ? 'bg-coffee-brown border-coffee-brown'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.sampleIds.includes(sample.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{sample.name}</h4>
                          {sample.origin && (
                            <p className="text-sm text-gray-600">
                              {sample.origin}
                              {sample.region && ` • ${sample.region}`}
                              {sample.variety && ` • ${sample.variety}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {formData.sampleIds.length > 0 && (
                  <div className="mt-4 p-3 bg-coffee-brown/5 rounded-lg">
                    <p className="text-sm text-coffee-brown font-medium">
                      {formData.sampleIds.length} sample(s) selected for this session
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full bg-coffee-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Session...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Create Session</span>
                  </>
                )}
              </button>
              <Link href="/dashboard/sessions">
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
