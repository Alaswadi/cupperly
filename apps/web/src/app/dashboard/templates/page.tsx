'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { templatesApi } from '@/lib/api';
import { CuppingTemplate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { 
  Beaker, 
  Star, 
  Calendar,
  Plus,
  Search,
  Filter,
  FileText,
  Globe,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TemplatesPage() {
  const { user, organization } = useAuth();
  const [templates, setTemplates] = useState<CuppingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalTemplates: 0,
    customTemplates: 0,
    defaultTemplates: 0,
    publicTemplates: 0,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await templatesApi.getTemplates();

      if (response.success) {
        const templateData = response.data.templates;
        setTemplates(templateData);
        
        // Calculate stats
        const customTemplates = templateData.filter(t => !t.isDefault).length;
        const defaultTemplates = templateData.filter(t => t.isDefault).length;
        const publicTemplates = templateData.filter(t => t.isPublic).length;
        
        setStats({
          totalTemplates: templateData.length,
          customTemplates,
          defaultTemplates,
          publicTemplates,
        });
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoringSystemColor = (system: string) => {
    switch (system) {
      case 'SCA':
        return 'bg-blue-100 text-blue-800';
      case 'COE':
        return 'bg-green-100 text-green-800';
      case 'CUSTOM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = systemFilter === 'all' || template.scoringSystem === systemFilter;
    return matchesSearch && matchesSystem;
  });

  const uniqueSystems = Array.from(new Set(templates.map(t => t.scoringSystem))).filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Manage cupping templates and scoring systems</p>
        </div>
        <Link href="/templates/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Beaker className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom</p>
                <p className="text-3xl font-bold text-green-600">{stats.customTemplates}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Default</p>
                <p className="text-3xl font-bold text-blue-600">{stats.defaultTemplates}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Public</p>
                <p className="text-3xl font-bold text-purple-600">{stats.publicTemplates}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Systems</option>
                {uniqueSystems.map((system) => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            {filteredTemplates.length} of {templates.length} templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {templates.length === 0 ? 'No templates yet' : 'No templates match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {templates.length === 0 
                  ? 'Create your first cupping template to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {templates.length === 0 && (
                <Link href="/templates/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Template
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/templates/${template.id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary-600 cursor-pointer">
                            {template.name}
                          </h3>
                        </Link>
                        {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                        {template.isPublic ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getScoringSystemColor(template.scoringSystem)}`}>
                      {template.scoringSystem}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      Max: {template.maxScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(template.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/templates/${template.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {!template.isDefault && (
                        <Link href={`/templates/${template.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
