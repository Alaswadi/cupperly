'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YemeniCoffeeShowcase } from '@/components/coffee/yemeni-coffee-showcase';
import { COFFEE_ORIGINS } from '@/data/coffee-origins';
import { 
  MapPin, 
  Mountain, 
  Calendar, 
  Coffee, 
  Search, 
  Globe,
  ArrowLeft,
  Star,
  Leaf
} from 'lucide-react';
import Link from 'next/link';

export default function CoffeeOriginsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [showYemeniShowcase, setShowYemeniShowcase] = useState(true);

  const continents = Array.from(new Set(COFFEE_ORIGINS.map(o => o.continent))).sort();

  const filteredOrigins = COFFEE_ORIGINS.filter(origin => {
    const matchesSearch = origin.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         origin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         origin.flavorProfile.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesContinent = selectedContinent === 'all' || origin.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Coffee Origins Guide</h1>
          <p className="text-gray-600 mt-2">Explore the world's finest coffee-producing regions and their unique characteristics</p>
        </div>
      </div>

      {/* Yemeni Coffee Showcase Toggle */}
      <div className="mb-8">
        <Button 
          onClick={() => setShowYemeniShowcase(!showYemeniShowcase)}
          variant={showYemeniShowcase ? "default" : "outline"}
          className="mb-4"
        >
          {showYemeniShowcase ? "Hide" : "Show"} Yemeni Coffee Showcase
        </Button>
        
        {showYemeniShowcase && <YemeniCoffeeShowcase />}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by country, flavor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Continents</option>
                {continents.map((continent) => (
                  <option key={continent} value={continent}>{continent}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Origins Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredOrigins.map((origin) => (
          <Card key={origin.country} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {origin.country}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {origin.continent}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mountain className="h-4 w-4" />
                      {origin.altitudeRange}
                    </span>
                  </CardDescription>
                </div>
                {origin.specialty && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Specialty
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{origin.description}</p>
              
              <div className="space-y-4">
                {/* Harvest Season */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">Harvest Season:</span>
                  </div>
                  <span className="text-gray-700">{origin.harvestSeason}</span>
                </div>

                {/* Flavor Profile */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="h-4 w-4 text-brown-600" />
                    <span className="font-medium text-gray-900">Flavor Profile:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {origin.flavorProfile.map((flavor) => (
                      <Badge key={flavor} className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Processing Methods */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Processing Methods:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {origin.processingMethods.map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Regions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-900">Famous Regions:</span>
                  </div>
                  <div className="space-y-2">
                    {origin.regions.slice(0, 3).map((region) => (
                      <div key={region.name} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{region.name}</span>
                          <span className="text-xs text-gray-500">{region.altitude}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{region.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {region.flavorNotes.slice(0, 4).map((note) => (
                            <Badge key={note} variant="secondary" className="text-xs">
                              {note}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    {origin.regions.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{origin.regions.length - 3} more regions
                      </p>
                    )}
                  </div>
                </div>

                {/* Varieties */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900">Common Varieties:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {origin.varieties.map((variety) => (
                      <Badge key={variety} variant="outline" className="text-xs">
                        {variety}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrigins.length === 0 && (
        <div className="text-center py-12">
          <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No origins found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
