'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewSamplePage() {
  const { user, organization } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await samplesApi.createSample(formData);
      if (response.success) {
        router.push('/dashboard/samples');
      }
    } catch (error) {
      console.error('Failed to create sample:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/samples">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Samples
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Sample</h1>
          <p className="text-gray-600 mt-2">Create a new coffee sample for cupping evaluation</p>
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
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      placeholder="e.g., Ethiopia"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      placeholder="e.g., Yirgacheffe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variety">Variety</Label>
                    <Input
                      id="variety"
                      value={formData.variety}
                      onChange={(e) => handleInputChange('variety', e.target.value)}
                      placeholder="e.g., Heirloom"
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
                  <Label htmlFor="altitude">Altitude</Label>
                  <Input
                    id="altitude"
                    value={formData.altitude}
                    onChange={(e) => handleInputChange('altitude', e.target.value)}
                    placeholder="e.g., 1800-2000 masl"
                  />
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

          {/* Processing & Roasting */}
          <div>
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

            {/* Physical Attributes */}
            <Card className="mt-6">
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
                    min="0"
                    max="100"
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
                    min="0"
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

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating Sample...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Sample
                  </>
                )}
              </Button>
              <Link href="/dashboard/samples">
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
