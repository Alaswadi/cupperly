'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionsApi, templatesApi, samplesApi } from '@/lib/api';
import { CuppingTemplate, Sample } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Save, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default function NewSessionPage() {
  const { user, organization } = useAuth();
  const router = useRouter();
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
      if (response.success && Array.isArray(response.data)) {
        setSamples(response.data);
      } else {
        console.error('Invalid samples response:', response);
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
    setIsLoading(true);

    try {
      // Prepare form data, removing empty templateId
      const submitData = {
        ...formData,
        templateId: formData.templateId || undefined,
        // Convert scheduledAt to proper ISO format with seconds
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      };



      const response = await sessionsApi.createSession(submitData);
      if (response.success) {
        router.push('/dashboard/sessions');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/sessions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Basic information about the cupping session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Session Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Weekly Quality Control"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the session purpose..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Main Lab"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="templateId">Cupping Template</Label>
                  <select
                    id="templateId"
                    value={formData.templateId}
                    onChange={(e) => handleInputChange('templateId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">No template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.isDefault && '(Default)'}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
                <CardDescription>Configure session behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="blindTasting">Blind Tasting</Label>
                    <p className="text-sm text-gray-500">Hide sample information from cuppers</p>
                  </div>
                  <input
                    id="blindTasting"
                    type="checkbox"
                    checked={formData.blindTasting}
                    onChange={(e) => handleInputChange('blindTasting', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowComments">Allow Comments</Label>
                    <p className="text-sm text-gray-500">Enable cupper notes and comments</p>
                  </div>
                  <input
                    id="allowComments"
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireCalibration">Require Calibration</Label>
                    <p className="text-sm text-gray-500">Mandatory calibration before scoring</p>
                  </div>
                  <input
                    id="requireCalibration"
                    type="checkbox"
                    checked={formData.requireCalibration}
                    onChange={(e) => handleInputChange('requireCalibration', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sample Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Selection</CardTitle>
                <CardDescription>Choose samples for this cupping session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {!Array.isArray(samples) || samples.length === 0 ? (
                    <p className="text-gray-500 text-sm">No samples available. Create some samples first.</p>
                  ) : (
                    samples.map((sample) => (
                      <div key={sample.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`sample-${sample.id}`}
                          checked={formData.sampleIds.includes(sample.id)}
                          onChange={() => handleSampleToggle(sample.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label htmlFor={`sample-${sample.id}`} className="text-sm">
                          {sample.name} - {sample.origin} {sample.region && `(${sample.region})`}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {formData.sampleIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.sampleIds.length} sample(s) selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
              <Link href="/dashboard/sessions">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
