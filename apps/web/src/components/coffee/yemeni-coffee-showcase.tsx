'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mountain, Calendar, Coffee, Star, Grape } from 'lucide-react';

export function YemeniCoffeeShowcase() {
  const yemeniRegions = [
    {
      name: "Mocha",
      altitude: "1000-2000 masl",
      description: "Historic port city that gave its name to the famous Mocha coffee. Known for ancient coffee traditions and unique terroir.",
      varieties: ["Mocha", "Typica", "Bourbon", "Jaadi"],
      flavorNotes: ["Wine-like", "Fruity", "Chocolate", "Spicy", "Complex"],
      specialty: "Birthplace of Mocha coffee"
    },
    {
      name: "Haraaz",
      altitude: "1800-2400 masl",
      description: "Mountainous region producing some of Yemen's finest coffees with distinctive wine-like characteristics.",
      varieties: ["Jaadi", "Tuffahi", "Dawairi"],
      flavorNotes: ["Wine-like", "Blueberry", "Dark chocolate", "Spicy"],
      specialty: "Premium high-altitude coffees"
    },
    {
      name: "Bani Matar",
      altitude: "1500-2200 masl",
      description: "Traditional coffee growing region known for its ancient terraced farms and heirloom varieties.",
      varieties: ["Udaini", "Jaadi", "Tuffahi"],
      flavorNotes: ["Fruity", "Wine-like", "Chocolate", "Earthy"],
      specialty: "Ancient terraced farms"
    },
    {
      name: "Raymah",
      altitude: "1600-2300 masl",
      description: "Emerging specialty coffee region with excellent potential for high-quality arabica production.",
      varieties: ["Jaadi", "Tuffahi", "Dawairi"],
      flavorNotes: ["Bright acidity", "Fruity", "Floral", "Complex"],
      specialty: "Emerging specialty region"
    }
  ];

  const yemeniVarieties = [
    {
      name: "Jaadi",
      description: "Most common Yemeni variety, known for its wine-like characteristics and complex flavor profile.",
      characteristics: ["Wine-like", "Complex", "Full-bodied"]
    },
    {
      name: "Tuffahi",
      description: "Apple-like variety with bright acidity and fruity notes, highly prized in specialty markets.",
      characteristics: ["Apple-like", "Bright acidity", "Fruity"]
    },
    {
      name: "Dawairi",
      description: "Traditional variety with earthy undertones and chocolate notes, excellent for natural processing.",
      characteristics: ["Earthy", "Chocolate", "Traditional"]
    },
    {
      name: "Udaini",
      description: "Balanced variety with medium body and sweet characteristics, versatile for different processing methods.",
      characteristics: ["Balanced", "Sweet", "Medium body"]
    },
    {
      name: "Mocha",
      description: "The legendary variety that gave its name to the famous Mocha coffee, with distinctive chocolate notes.",
      characteristics: ["Chocolate", "Legendary", "Historic"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🇾🇪 Yemeni Coffee: The Birthplace of Coffee Culture
        </h2>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Yemen is where coffee cultivation began over 1,000 years ago. Today, Yemeni coffee remains among the world's most 
          unique and sought-after, known for its wine-like characteristics, complex flavor profiles, and ancient processing traditions.
        </p>
      </div>

      {/* Key Facts */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600" />
            Yemeni Coffee Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Harvest Season</h4>
              <p className="text-sm text-gray-600">October - February</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Mountain className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Altitude</h4>
              <p className="text-sm text-gray-600">1000-2400 masl</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coffee className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Processing</h4>
              <p className="text-sm text-gray-600">Natural, Semi-washed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Grape className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Signature</h4>
              <p className="text-sm text-gray-600">Wine-like, Complex</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regions */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Famous Yemeni Coffee Regions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {yemeniRegions.map((region) => (
            <Card key={region.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {region.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mountain className="h-4 w-4" />
                      {region.altitude}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{region.specialty}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{region.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Common Varieties:</h5>
                    <div className="flex flex-wrap gap-2">
                      {region.varieties.map((variety) => (
                        <Badge key={variety} variant="outline" className="text-xs">
                          {variety}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Flavor Profile:</h5>
                    <div className="flex flex-wrap gap-2">
                      {region.flavorNotes.map((note) => (
                        <Badge key={note} className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Varieties */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Traditional Yemeni Coffee Varieties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yemeniVarieties.map((variety) => (
            <Card key={variety.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{variety.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{variety.description}</p>
                <div className="flex flex-wrap gap-2">
                  {variety.characteristics.map((char) => (
                    <Badge key={char} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cultural Note */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-center">☕ Cultural Heritage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700 leading-relaxed">
            Yemeni coffee represents more than just a beverage—it's a living piece of history. The ancient terraced farms, 
            traditional processing methods, and unique varieties have been preserved for over a millennium. Each cup tells 
            the story of Yemen's rich coffee heritage and the dedication of farmers who continue these time-honored traditions 
            in one of the world's most challenging growing environments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
