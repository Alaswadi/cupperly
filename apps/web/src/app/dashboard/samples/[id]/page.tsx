'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { samplesApi } from '@/lib/api';
import { Sample } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { 
  ArrowLeft,
  Coffee, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Package,
  Thermometer,
  Droplets,
  Mountain,
  User,
  Building,
  Tag
} from 'lucide-react';

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!sample || !confirm('Are you sure you want to delete this sample? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await samplesApi.deleteSample(sample.id);
      
      if (response.success) {
        router.push('/dashboard/samples');
      } else {
        console.error('Failed to delete sample:', response.error);
      }
    } catch (error) {
      console.error('Failed to delete sample:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProcessingMethodColor = (method: string) => {
    const colors = {
      WASHED: 'bg-blue-100 text-blue-800',
      NATURAL: 'bg-green-100 text-green-800',
      HONEY: 'bg-yellow-100 text-yellow-800',
      SEMI_WASHED: 'bg-purple-100 text-purple-800',
      WET_HULLED: 'bg-indigo-100 text-indigo-800',
      ANAEROBIC: 'bg-red-100 text-red-800',
      CARBONIC_MACERATION: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[method as keyof typeof colors] || colors.OTHER;
  };

  const getRoastLevelColor = (level: string) => {
    const colors = {
      LIGHT: 'bg-amber-100 text-amber-800',
      MEDIUM_LIGHT: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      MEDIUM_DARK: 'bg-red-100 text-red-800',
      DARK: 'bg-gray-100 text-gray-800',
      FRENCH: 'bg-gray-200 text-gray-900',
      ITALIAN: 'bg-gray-300 text-gray-900',
    };
    return colors[level as keyof typeof colors] || colors.MEDIUM;
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
        <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sample not found</h3>
        <p className="text-gray-500 mb-6">The sample you're looking for doesn't exist or has been deleted.</p>
        <Link href="/dashboard/samples">
          <Button>Back to Samples</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/samples">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Samples
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sample.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <MapPin className="h-4 w-4" />
              <span>{sample.origin}</span>
              {sample.region && <span>• {sample.region}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/samples/${sample.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
              <CardDescription>Basic details about this coffee sample</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sample.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{sample.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sample.variety && (
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Variety:</span>
                    <span className="text-sm font-medium">{sample.variety}</span>
                  </div>
                )}
                
                {sample.altitude && (
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Altitude:</span>
                    <span className="text-sm font-medium">{sample.altitude}m</span>
                  </div>
                )}
                
                {sample.producer && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Producer:</span>
                    <span className="text-sm font-medium">{sample.producer}</span>
                  </div>
                )}
                
                {sample.farm && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Farm:</span>
                    <span className="text-sm font-medium">{sample.farm}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sample.processingMethod && (
                  <span className={`px-3 py-1 rounded-full text-sm ${getProcessingMethodColor(sample.processingMethod)}`}>
                    {sample.processingMethod.replace('_', ' ')}
                  </span>
                )}
                {sample.roastLevel && (
                  <span className={`px-3 py-1 rounded-full text-sm ${getRoastLevelColor(sample.roastLevel)}`}>
                    {sample.roastLevel.replace('_', ' ')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Physical Attributes */}
          {(sample.moisture || sample.density || sample.screenSize) && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
                <CardDescription>Measured characteristics of the coffee beans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sample.moisture && (
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Moisture</p>
                        <p className="font-medium">{sample.moisture}%</p>
                      </div>
                    </div>
                  )}
                  
                  {sample.density && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Density</p>
                        <p className="font-medium">{sample.density} g/ml</p>
                      </div>
                    </div>
                  )}
                  
                  {sample.screenSize && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Screen Size</p>
                        <p className="font-medium">{sample.screenSize}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDateTime(sample.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium">{formatDateTime(sample.updatedAt)}</span>
              </div>
              
              {sample.code && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{sample.code}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {sample.tags && sample.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sample.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
