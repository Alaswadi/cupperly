'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Coffee, Settings, Calendar, MapPin, Users, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sessionsApi, templatesApi, samplesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Session {
  id: string;
  name: string;
  description?: string;
  location?: string;
  templateId?: string;
  blindTasting: boolean;
  allowComments: boolean;
  requireCalibration: boolean;
  scheduledAt?: string;
  samples: Array<{
    id: string; // SessionSample ID
    sampleId: string; // Actual Sample ID
    sample: {
      id: string;
      name: string;
    };
  }>;
  tags: string[];
}

interface Template {
  id: string;
  name: string;
  description?: string;
}

interface Sample {
  id: string;
  name: string;
  origin?: string;
  variety?: string;
}

export default function EditSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = params.id as string;

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
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionResponse, templatesResponse, samplesResponse] = await Promise.all([
        sessionsApi.getSession(sessionId),
        templatesApi.getTemplates(),
        samplesApi.getSamples()
      ]);

      if (sessionResponse.success && sessionResponse.data) {
        const sessionData = sessionResponse.data;
        setSession(sessionData);
        
        // Format scheduledAt for datetime-local input
        const scheduledAt = sessionData.scheduledAt 
          ? new Date(sessionData.scheduledAt).toISOString().slice(0, 16)
          : '';

        setFormData({
          name: sessionData.name || '',
          description: sessionData.description || '',
          location: sessionData.location || '',
          templateId: sessionData.templateId || '',
          blindTasting: sessionData.blindTasting,
          allowComments: sessionData.allowComments,
          requireCalibration: sessionData.requireCalibration,
          scheduledAt,
          sampleIds: sessionData.samples?.map(s => s.sampleId) || [],
          tags: sessionData.tags || [],
        });
      } else {
        setError('Failed to load session');
      }

      if (templatesResponse.success) {
        const templateList = templatesResponse.data.templates || templatesResponse.data || [];
        setTemplates(templateList);
      }

      if (samplesResponse.success) {
        const sampleList = samplesResponse.data.samples || samplesResponse.data || [];
        setSamples(sampleList);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    try {
      setSaving(true);

      const submitData = {
        ...formData,
        templateId: formData.templateId || undefined,
        // Convert scheduledAt to proper ISO format
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      };

      const response = await sessionsApi.updateSession(sessionId, submitData as any);

      if (response.success) {
        toast.success('Session updated successfully!');
        router.push(`/dashboard/sessions/${sessionId}`);
      } else {
        setError('Failed to update session');
        toast.error('Failed to update session');
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      setError('Failed to update session');
      toast.error('Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The session you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/dashboard/sessions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/sessions/${sessionId}`}>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Session</span>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
          <p className="text-gray-600 mt-2">Update session details and configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-coffee-brown" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <p className="text-sm text-gray-600">Update session details</p>
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
                    placeholder="Enter session name"
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
                    placeholder="Enter session description"
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
                        placeholder="Enter location"
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
              </div>
            </div>

            {/* Sample Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sample Selection</h3>
                    <p className="text-sm text-gray-600">Choose samples for this session</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {samples.length > 0 ? (
                  <div className="space-y-3">
                    {samples.map((sample) => (
                      <div
                        key={sample.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.sampleIds.includes(sample.id)
                            ? 'border-coffee-brown bg-coffee-brown/5'
                            : 'border-gray-200 hover:border-coffee-brown/50'
                        }`}
                        onClick={() => handleSampleToggle(sample.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.sampleIds.includes(sample.id)
                              ? 'bg-coffee-brown border-coffee-brown'
                              : 'border-gray-300'
                          }`}>
                            {formData.sampleIds.includes(sample.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{sample.name}</h4>
                            {sample.origin && (
                              <p className="text-sm text-gray-600">{sample.origin}</p>
                            )}
                            {sample.variety && (
                              <p className="text-xs text-gray-500">{sample.variety}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No samples available. Create some samples first.</p>
                  </div>
                )}
                {formData.sampleIds.length > 0 && (
                  <div className="mt-4 p-3 bg-coffee-brown/5 rounded-lg">
                    <p className="text-sm text-coffee-brown font-medium">
                      {formData.sampleIds.length} sample(s) selected for this session
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Template</h3>
                    <p className="text-sm text-gray-600">Choose cupping template</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                  Cupping Template
                </label>
                <select
                  id="template"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-transparent pr-8"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session Settings */}
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

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full bg-coffee-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Update Session</span>
                  </>
                )}
              </button>

              <Link href={`/dashboard/sessions/${sessionId}`}>
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
