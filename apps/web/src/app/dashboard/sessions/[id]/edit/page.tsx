'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { sessionsApi, templatesApi, samplesApi } from '@/lib/api';

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
  samples: Array<{ id: string; name: string; }>;
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

      if (sessionResponse.success) {
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
          sampleIds: sessionData.samples?.map(s => s.id) || [],
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
    
    try {
      setSaving(true);
      
      const submitData = {
        ...formData,
        templateId: formData.templateId || undefined,
        // Convert scheduledAt to proper ISO format
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      };

      const response = await sessionsApi.updateSession(sessionId, submitData);
      
      if (response.success) {
        router.push(`/dashboard/sessions/${sessionId}`);
      } else {
        setError('Failed to update session');
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      setError('Failed to update session');
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Session Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter session name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter session description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Selection</CardTitle>
              </CardHeader>
              <CardContent>
                {samples.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {samples.map((sample) => (
                      <div
                        key={sample.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.sampleIds.includes(sample.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSampleToggle(sample.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{sample.name}</h4>
                            {sample.origin && (
                              <p className="text-sm text-gray-600">{sample.origin}</p>
                            )}
                            {sample.variety && (
                              <p className="text-sm text-gray-500">{sample.variety}</p>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded border-2 ${
                            formData.sampleIds.includes(sample.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.sampleIds.includes(sample.id) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No samples available. Create some samples first.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="template">Cupping Template</Label>
                <select
                  id="template"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blindTasting">Blind Tasting</Label>
                  <Switch
                    id="blindTasting"
                    checked={formData.blindTasting}
                    onCheckedChange={(checked) => handleInputChange('blindTasting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allowComments">Allow Comments</Label>
                  <Switch
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireCalibration">Require Calibration</Label>
                  <Switch
                    id="requireCalibration"
                    checked={formData.requireCalibration}
                    onCheckedChange={(checked) => handleInputChange('requireCalibration', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Session
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
