export interface CoffeeOrigin {
  country: string;
  continent: string;
  regions: CoffeeRegion[];
  varieties: string[];
  processingMethods: string[];
  altitudeRange: string;
  harvestSeason: string;
  description: string;
  flavorProfile: string[];
  specialty: boolean;
}

export interface CoffeeRegion {
  name: string;
  altitude: string;
  description: string;
  varieties: string[];
  flavorNotes: string[];
}

export const COFFEE_ORIGINS: CoffeeOrigin[] = [
  {
    country: "Yemen",
    continent: "Asia",
    regions: [
      {
        name: "Mocha",
        altitude: "1000-2000 masl",
        description: "Historic port city that gave its name to the famous Mocha coffee. Known for ancient coffee traditions and unique terroir.",
        varieties: ["Mocha", "Typica", "Bourbon", "Jaadi"],
        flavorNotes: ["Wine-like", "Fruity", "Chocolate", "Spicy", "Complex"]
      },
      {
        name: "Haraaz",
        altitude: "1800-2400 masl",
        description: "Mountainous region producing some of Yemen's finest coffees with distinctive wine-like characteristics.",
        varieties: ["Jaadi", "Tuffahi", "Dawairi"],
        flavorNotes: ["Wine-like", "Blueberry", "Dark chocolate", "Spicy"]
      },
      {
        name: "Bani Matar",
        altitude: "1500-2200 masl",
        description: "Traditional coffee growing region known for its ancient terraced farms and heirloom varieties.",
        varieties: ["Udaini", "Jaadi", "Tuffahi"],
        flavorNotes: ["Fruity", "Wine-like", "Chocolate", "Earthy"]
      },
      {
        name: "Raymah",
        altitude: "1600-2300 masl",
        description: "Emerging specialty coffee region with excellent potential for high-quality arabica production.",
        varieties: ["Jaadi", "Tuffahi", "Dawairi"],
        flavorNotes: ["Bright acidity", "Fruity", "Floral", "Complex"]
      },
      {
        name: "Ibb",
        altitude: "1400-2100 masl",
        description: "Central highlands region known for consistent quality and traditional farming methods.",
        varieties: ["Udaini", "Jaadi", "Bourbon"],
        flavorNotes: ["Balanced", "Chocolate", "Nutty", "Medium body"]
      }
    ],
    varieties: ["Mocha", "Jaadi", "Tuffahi", "Dawairi", "Udaini", "Typica", "Bourbon"],
    processingMethods: ["Natural", "Semi-washed"],
    altitudeRange: "1000-2400 masl",
    harvestSeason: "October - February",
    description: "Yemen is the birthplace of coffee cultivation and home to some of the world's most unique and ancient coffee varieties. Yemeni coffee is renowned for its wine-like characteristics, complex flavor profiles, and traditional processing methods that have remained unchanged for centuries.",
    flavorProfile: ["Wine-like", "Fruity", "Chocolate", "Spicy", "Complex", "Full-bodied"],
    specialty: true
  },
  {
    country: "Ethiopia",
    continent: "Africa",
    regions: [
      {
        name: "Yirgacheffe",
        altitude: "1700-2200 masl",
        description: "Famous for bright, floral, and tea-like coffees with exceptional clarity.",
        varieties: ["Heirloom", "Typica", "Bourbon"],
        flavorNotes: ["Floral", "Citrus", "Tea-like", "Bright acidity"]
      },
      {
        name: "Sidamo",
        altitude: "1400-2200 masl",
        description: "Large region producing diverse flavor profiles from fruity to wine-like.",
        varieties: ["Heirloom", "Typica"],
        flavorNotes: ["Wine-like", "Fruity", "Complex", "Full-bodied"]
      },
      {
        name: "Harrar",
        altitude: "1500-2100 masl",
        description: "Eastern region known for natural processed coffees with wine-like characteristics.",
        varieties: ["Heirloom", "Longberry"],
        flavorNotes: ["Wine-like", "Blueberry", "Chocolate", "Earthy"]
      }
    ],
    varieties: ["Heirloom", "Typica", "Bourbon", "Longberry"],
    processingMethods: ["Washed", "Natural", "Honey"],
    altitudeRange: "1400-2200 masl",
    harvestSeason: "October - February",
    description: "The birthplace of coffee, Ethiopia offers incredible diversity in flavor profiles and ancient heirloom varieties.",
    flavorProfile: ["Floral", "Fruity", "Wine-like", "Bright acidity", "Complex"],
    specialty: true
  },
  {
    country: "Colombia",
    continent: "South America",
    regions: [
      {
        name: "Huila",
        altitude: "1200-2100 masl",
        description: "Southern region known for exceptional quality and diverse microclimates.",
        varieties: ["Caturra", "Castillo", "Colombia", "Typica"],
        flavorNotes: ["Caramel", "Chocolate", "Fruity", "Balanced"]
      },
      {
        name: "Nariño",
        altitude: "1500-2300 masl",
        description: "High-altitude region producing bright, complex coffees.",
        varieties: ["Caturra", "Castillo", "Bourbon"],
        flavorNotes: ["Bright acidity", "Citrus", "Floral", "Complex"]
      },
      {
        name: "Tolima",
        altitude: "1200-1900 masl",
        description: "Central region with volcanic soils producing well-balanced coffees.",
        varieties: ["Caturra", "Castillo", "Bourbon"],
        flavorNotes: ["Chocolate", "Caramel", "Nutty", "Medium body"]
      }
    ],
    varieties: ["Caturra", "Castillo", "Colombia", "Bourbon", "Typica"],
    processingMethods: ["Washed", "Honey", "Natural"],
    altitudeRange: "1200-2300 masl",
    harvestSeason: "October - February (main), April - June (mitaca)",
    description: "Colombia is renowned for consistently high-quality arabica coffee with excellent balance and clarity.",
    flavorProfile: ["Balanced", "Chocolate", "Caramel", "Nutty", "Medium acidity"],
    specialty: true
  },
  {
    country: "Brazil",
    continent: "South America",
    regions: [
      {
        name: "Cerrado",
        altitude: "800-1300 masl",
        description: "Flat plateau region ideal for mechanized farming and consistent quality.",
        varieties: ["Bourbon", "Mundo Novo", "Catuai"],
        flavorNotes: ["Chocolate", "Nutty", "Low acidity", "Full body"]
      },
      {
        name: "Sul de Minas",
        altitude: "700-1400 masl",
        description: "Traditional coffee region with rolling hills and family farms.",
        varieties: ["Bourbon", "Mundo Novo", "Catuai"],
        flavorNotes: ["Sweet", "Chocolate", "Caramel", "Balanced"]
      }
    ],
    varieties: ["Bourbon", "Mundo Novo", "Catuai", "Acaia", "Topazio"],
    processingMethods: ["Natural", "Pulped Natural", "Washed"],
    altitudeRange: "400-1400 masl",
    harvestSeason: "May - September",
    description: "World's largest coffee producer, known for consistent quality and innovative processing methods.",
    flavorProfile: ["Chocolate", "Nutty", "Sweet", "Low acidity", "Full body"],
    specialty: true
  },
  {
    country: "Jamaica",
    continent: "North America",
    regions: [
      {
        name: "Blue Mountain",
        altitude: "900-1700 masl",
        description: "World-famous region producing some of the most expensive and sought-after coffees.",
        varieties: ["Typica", "Blue Mountain"],
        flavorNotes: ["Mild", "Sweet", "Balanced", "Clean", "Smooth"]
      }
    ],
    varieties: ["Typica", "Blue Mountain"],
    processingMethods: ["Washed"],
    altitudeRange: "900-1700 masl",
    harvestSeason: "September - March",
    description: "Jamaica Blue Mountain is one of the world's most prestigious and expensive coffees, known for its mild flavor and perfect balance.",
    flavorProfile: ["Mild", "Sweet", "Balanced", "Clean", "Smooth"],
    specialty: true
  },
  {
    country: "Kenya",
    continent: "Africa",
    regions: [
      {
        name: "Central Kenya",
        altitude: "1400-2100 masl",
        description: "High-altitude region producing bright, wine-like coffees with exceptional clarity.",
        varieties: ["SL28", "SL34", "Ruiru 11", "Batian"],
        flavorNotes: ["Black currant", "Wine-like", "Bright acidity", "Full body"]
      }
    ],
    varieties: ["SL28", "SL34", "Ruiru 11", "Batian"],
    processingMethods: ["Washed", "Double fermentation"],
    altitudeRange: "1400-2100 masl",
    harvestSeason: "October - December (main), May - July (fly)",
    description: "Kenya produces some of the world's most distinctive coffees with bright acidity and wine-like characteristics.",
    flavorProfile: ["Black currant", "Wine-like", "Bright acidity", "Full body", "Complex"],
    specialty: true
  },
  {
    country: "Guatemala",
    continent: "North America",
    regions: [
      {
        name: "Antigua",
        altitude: "1500-1700 masl",
        description: "Volcanic region producing full-bodied coffees with smoky undertones.",
        varieties: ["Bourbon", "Caturra", "Catuai"],
        flavorNotes: ["Smoky", "Spicy", "Chocolate", "Full body"]
      },
      {
        name: "Huehuetenango",
        altitude: "1500-2000 masl",
        description: "High-altitude region known for bright, wine-like coffees.",
        varieties: ["Bourbon", "Caturra", "Typica"],
        flavorNotes: ["Wine-like", "Fruity", "Bright acidity", "Complex"]
      }
    ],
    varieties: ["Bourbon", "Caturra", "Catuai", "Typica"],
    processingMethods: ["Washed", "Natural", "Honey"],
    altitudeRange: "1200-2000 masl",
    harvestSeason: "December - March",
    description: "Guatemala produces distinctive coffees with volcanic soil influence and diverse microclimates.",
    flavorProfile: ["Smoky", "Spicy", "Chocolate", "Wine-like", "Full body"],
    specialty: true
  },
  {
    country: "Costa Rica",
    continent: "North America",
    regions: [
      {
        name: "Tarrazú",
        altitude: "1200-1900 masl",
        description: "Premier coffee region known for bright acidity and clean flavors.",
        varieties: ["Caturra", "Catuai", "Villa Sarchi"],
        flavorNotes: ["Bright acidity", "Citrus", "Clean", "Balanced"]
      },
      {
        name: "West Valley",
        altitude: "1000-1600 masl",
        description: "Innovative region experimenting with processing methods.",
        varieties: ["Caturra", "Catuai", "Geisha"],
        flavorNotes: ["Honey-like", "Fruity", "Complex", "Sweet"]
      }
    ],
    varieties: ["Caturra", "Catuai", "Villa Sarchi", "Geisha"],
    processingMethods: ["Washed", "Honey", "Natural", "Anaerobic"],
    altitudeRange: "800-1900 masl",
    harvestSeason: "November - February",
    description: "Costa Rica is known for innovation in processing and consistently high-quality specialty coffee.",
    flavorProfile: ["Bright acidity", "Clean", "Balanced", "Honey-like", "Complex"],
    specialty: true
  },
  {
    country: "Panama",
    continent: "North America",
    regions: [
      {
        name: "Boquete",
        altitude: "1200-1800 masl",
        description: "Famous for Geisha variety and record-breaking auction prices.",
        varieties: ["Geisha", "Caturra", "Catuai"],
        flavorNotes: ["Floral", "Jasmine", "Tropical fruit", "Tea-like"]
      }
    ],
    varieties: ["Geisha", "Caturra", "Catuai", "Typica"],
    processingMethods: ["Washed", "Natural", "Honey"],
    altitudeRange: "1000-1800 masl",
    harvestSeason: "December - March",
    description: "Panama is famous for the Geisha variety and produces some of the world's most expensive coffees.",
    flavorProfile: ["Floral", "Jasmine", "Tropical fruit", "Tea-like", "Complex"],
    specialty: true
  },
  {
    country: "Indonesia",
    continent: "Asia",
    regions: [
      {
        name: "Sumatra",
        altitude: "1000-1500 masl",
        description: "Known for wet-hulled processing and earthy, herbal flavors.",
        varieties: ["Typica", "Catimor", "Lini S"],
        flavorNotes: ["Earthy", "Herbal", "Low acidity", "Full body"]
      },
      {
        name: "Java",
        altitude: "900-1400 masl",
        description: "Historic coffee region with government-owned estates.",
        varieties: ["Typica", "Catimor"],
        flavorNotes: ["Rustic", "Earthy", "Heavy body", "Low acidity"]
      }
    ],
    varieties: ["Typica", "Catimor", "Lini S", "Ateng"],
    processingMethods: ["Wet Hulled", "Washed", "Natural"],
    altitudeRange: "400-1500 masl",
    harvestSeason: "May - September",
    description: "Indonesia produces unique coffees with distinctive processing methods and earthy characteristics.",
    flavorProfile: ["Earthy", "Herbal", "Low acidity", "Full body", "Rustic"],
    specialty: true
  },
  {
    country: "Hawaii",
    continent: "North America",
    regions: [
      {
        name: "Kona",
        altitude: "150-900 masl",
        description: "Only commercial coffee grown in the United States, known for smooth flavor.",
        varieties: ["Typica", "Bourbon"],
        flavorNotes: ["Smooth", "Mild", "Nutty", "Low acidity"]
      }
    ],
    varieties: ["Typica", "Bourbon", "Caturra"],
    processingMethods: ["Washed", "Natural"],
    altitudeRange: "150-900 masl",
    harvestSeason: "August - January",
    description: "Hawaiian Kona coffee is the only commercial coffee grown in the United States, prized for its smooth, mild flavor.",
    flavorProfile: ["Smooth", "Mild", "Nutty", "Low acidity", "Clean"],
    specialty: true
  }
];

export const COFFEE_VARIETIES = [
  // Yemeni Varieties
  "Mocha", "Jaadi", "Tuffahi", "Dawairi", "Udaini",
  // Common Arabica Varieties
  "Typica", "Bourbon", "Caturra", "Catuai", "Mundo Novo",
  "SL28", "SL34", "Geisha", "Pacamara", "Maragogype",
  "Heirloom", "Blue Mountain", "Castillo", "Colombia",
  "Ruiru 11", "Batian", "Acaia", "Topazio"
];

export const PROCESSING_METHODS = [
  "Washed", "Natural", "Honey", "Semi-washed", "Wet Hulled",
  "Anaerobic", "Carbonic Maceration", "Double Fermentation",
  "Pulped Natural", "Other"
];

export const getRegionsByCountry = (country: string): CoffeeRegion[] => {
  const origin = COFFEE_ORIGINS.find(o => o.country === country);
  return origin?.regions || [];
};

export const getVarietiesByCountry = (country: string): string[] => {
  const origin = COFFEE_ORIGINS.find(o => o.country === country);
  return origin?.varieties || [];
};

export const getCountries = (): string[] => {
  return COFFEE_ORIGINS.map(o => o.country).sort();
};
