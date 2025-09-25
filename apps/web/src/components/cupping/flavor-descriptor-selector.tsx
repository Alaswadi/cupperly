'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Search } from 'lucide-react';
import { FlavorDescriptor, ScoreFlavorDescriptor } from '@/types';
import { flavorDescriptorsApi } from '@/lib/api';

interface FlavorDescriptorSelectorProps {
  selectedDescriptors: Array<{
    id: string;
    intensity: number;
    flavorDescriptor?: FlavorDescriptor;
  }>;
  onDescriptorsChange: (descriptors: Array<{
    id: string;
    intensity: number;
    flavorDescriptor?: FlavorDescriptor;
  }>) => void;
  readOnly?: boolean;
}

export function FlavorDescriptorSelector({
  selectedDescriptors,
  onDescriptorsChange,
  readOnly = false,
}: FlavorDescriptorSelectorProps) {
  const [availableDescriptors, setAvailableDescriptors] = useState<FlavorDescriptor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescriptor, setNewDescriptor] = useState({
    name: '',
    category: 'POSITIVE' as 'POSITIVE' | 'NEGATIVE',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlavorDescriptors();
  }, []);

  const loadFlavorDescriptors = async () => {
    try {
      setLoading(true);
      const response = await flavorDescriptorsApi.getFlavorDescriptors();
      if (response.success) {
        setAvailableDescriptors(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load flavor descriptors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDescriptors = availableDescriptors.filter(descriptor =>
    descriptor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedDescriptors.some(selected => selected.id === descriptor.id)
  );

  const positiveDescriptors = filteredDescriptors.filter(d => d.category === 'POSITIVE');
  const negativeDescriptors = filteredDescriptors.filter(d => d.category === 'NEGATIVE');

  const handleAddDescriptor = (descriptor: FlavorDescriptor) => {
    const newSelection = {
      id: descriptor.id,
      intensity: 3,
      flavorDescriptor: descriptor,
    };
    onDescriptorsChange([...selectedDescriptors, newSelection]);
  };

  const handleRemoveDescriptor = (descriptorId: string) => {
    onDescriptorsChange(selectedDescriptors.filter(d => d.id !== descriptorId));
  };

  const handleIntensityChange = (descriptorId: string, intensity: number) => {
    onDescriptorsChange(
      selectedDescriptors.map(d =>
        d.id === descriptorId ? { ...d, intensity } : d
      )
    );
  };

  const handleCreateCustomDescriptor = async () => {
    try {
      const response = await flavorDescriptorsApi.createFlavorDescriptor(newDescriptor);
      if (response.success) {
        setAvailableDescriptors([...availableDescriptors, response.data]);
        setNewDescriptor({ name: '', category: 'POSITIVE', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to create flavor descriptor:', error);
    }
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = {
      1: 'Very Light',
      2: 'Light',
      3: 'Medium',
      4: 'Strong',
      5: 'Very Strong',
    };
    return labels[intensity as keyof typeof labels] || 'Medium';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flavor Descriptors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading flavor descriptors...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Flavor Descriptors
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Descriptors */}
        {selectedDescriptors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Flavors</Label>
            <div className="flex flex-wrap gap-2">
              {selectedDescriptors.map((selected) => {
                const descriptor = selected.flavorDescriptor || 
                  availableDescriptors.find(d => d.id === selected.id);
                
                if (!descriptor) return null;
                
                return (
                  <div
                    key={selected.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      descriptor.category === 'POSITIVE'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <span className="text-sm font-medium">{descriptor.name}</span>
                    {!readOnly && (
                      <>
                        <Select
                          value={selected.intensity.toString()}
                          onValueChange={(value) => 
                            handleIntensityChange(selected.id, parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(intensity => (
                              <SelectItem key={intensity} value={intensity.toString()}>
                                {intensity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveDescriptor(selected.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {readOnly && (
                      <span className="text-xs opacity-75">
                        {getIntensityLabel(selected.intensity)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Custom Descriptor Form */}
        {showAddForm && !readOnly && (
          <div className="border rounded-lg p-4 space-y-3">
            <Label className="text-sm font-medium">Create Custom Flavor Descriptor</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="descriptor-name" className="text-xs">Name</Label>
                <Input
                  id="descriptor-name"
                  value={newDescriptor.name}
                  onChange={(e) => setNewDescriptor({ ...newDescriptor, name: e.target.value })}
                  placeholder="e.g., Jasmine"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="descriptor-category" className="text-xs">Category</Label>
                <Select
                  value={newDescriptor.category}
                  onValueChange={(value: 'POSITIVE' | 'NEGATIVE') => 
                    setNewDescriptor({ ...newDescriptor, category: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">Positive</SelectItem>
                    <SelectItem value="NEGATIVE">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="descriptor-description" className="text-xs">Description (optional)</Label>
              <Input
                id="descriptor-description"
                value={newDescriptor.description}
                onChange={(e) => setNewDescriptor({ ...newDescriptor, description: e.target.value })}
                placeholder="Brief description of this flavor"
                className="h-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateCustomDescriptor}
                disabled={!newDescriptor.name}
              >
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Search and Available Descriptors */}
        {!readOnly && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search flavor descriptors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Positive Descriptors */}
            {positiveDescriptors.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-green-700">Positive Flavors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {positiveDescriptors.map((descriptor) => (
                    <Button
                      key={descriptor.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDescriptor(descriptor)}
                      className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50"
                    >
                      {descriptor.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Negative Descriptors */}
            {negativeDescriptors.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-red-700">Negative Flavors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {negativeDescriptors.map((descriptor) => (
                    <Button
                      key={descriptor.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDescriptor(descriptor)}
                      className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {descriptor.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
