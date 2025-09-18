'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditSamplePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    code: '',
    description: '',
    notes: '',
  });

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
          code: sampleData.code || '',
          description: sampleData.description || '',
          notes: sampleData.notes || '',
        });
      } else {
        console.error('Failed to load sample:', response.error);
        router.push('/dashboard/samples');
      }
    } catch (error) {
      console.error('Failed to load sample:', error);
      router.push('/dashboard/samples');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample) return;

    setIsSaving(true);

    try {
      const response = await samplesApi.updateSample(sample.id, formData);
      if (response.success) {
        router.push(`/dashboard/samples/${sample.id}`);
      } else {
        console.error('Failed to update sample:', response.error);
      }
    } catch (error) {
      console.error('Failed to update sample:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sample not found</h3>
        <p className="text-gray-500 mb-6">The sample you're trying to edit doesn't exist or has been deleted.</p>
        <Link href="/dashboard/samples">
          <Button>Back to Samples</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/samples/${sample.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sample
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sample</h1>
          <p className="text-gray-600 mt-2">Update the details for {sample.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sample Information</CardTitle>
                <CardDescription>Basic details about the coffee sample</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Sample Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Ethiopian Yirgacheffe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Sample Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g., SM-2024-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      placeholder="e.g., Ethiopia"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      placeholder="e.g., Yirgacheffe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variety">Variety</Label>
                    <Input
                      id="variety"
                      value={formData.variety}
                      onChange={(e) => handleInputChange('variety', e.target.value)}
                      placeholder="e.g., Heirloom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altitude">Altitude (meters)</Label>
                    <Input
                      id="altitude"
                      type="number"
                      value={formData.altitude}
                      onChange={(e) => handleInputChange('altitude', e.target.value)}
                      placeholder="e.g., 2000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="producer">Producer</Label>
                    <Input
                      id="producer"
                      value={formData.producer}
                      onChange={(e) => handleInputChange('producer', e.target.value)}
                      placeholder="Producer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farm">Farm</Label>
                    <Input
                      id="farm"
                      value={formData.farm}
                      onChange={(e) => handleInputChange('farm', e.target.value)}
                      placeholder="Farm name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Additional notes about the sample..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing & Physical Attributes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing & Roasting</CardTitle>
                <CardDescription>Processing method and roast information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="processingMethod">Processing Method</Label>
                  <select
                    id="processingMethod"
                    value={formData.processingMethod}
                    onChange={(e) => handleInputChange('processingMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="WASHED">Washed</option>
                    <option value="NATURAL">Natural</option>
                    <option value="HONEY">Honey</option>
                    <option value="SEMI_WASHED">Semi-Washed</option>
                    <option value="WET_HULLED">Wet Hulled</option>
                    <option value="ANAEROBIC">Anaerobic</option>
                    <option value="CARBONIC_MACERATION">Carbonic Maceration</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="roastLevel">Roast Level</Label>
                  <select
                    id="roastLevel"
                    value={formData.roastLevel}
                    onChange={(e) => handleInputChange('roastLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="LIGHT">Light</option>
                    <option value="MEDIUM_LIGHT">Medium Light</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="MEDIUM_DARK">Medium Dark</option>
                    <option value="DARK">Dark</option>
                    <option value="FRENCH">French</option>
                    <option value="ITALIAN">Italian</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
                <CardDescription>Measured characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moisture">Moisture (%)</Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.1"
                    value={formData.moisture}
                    onChange={(e) => handleInputChange('moisture', e.target.value)}
                    placeholder="e.g., 11.5"
                  />
                </div>

                <div>
                  <Label htmlFor="density">Density (g/ml)</Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.01"
                    value={formData.density}
                    onChange={(e) => handleInputChange('density', e.target.value)}
                    placeholder="e.g., 0.75"
                  />
                </div>

                <div>
                  <Label htmlFor="screenSize">Screen Size</Label>
                  <Input
                    id="screenSize"
                    value={formData.screenSize}
                    onChange={(e) => handleInputChange('screenSize', e.target.value)}
                    placeholder="e.g., 16/18"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/dashboard/samples/${sample.id}`}>
                <Button type="button" variant="outline">
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
