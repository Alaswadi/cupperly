import { PrismaClient } from '../../generated/client';

const prisma = new PrismaClient();

export const defaultFlavorDescriptors = [
  // POSITIVE FLAVORS
  { name: 'Fruity', category: 'POSITIVE', description: 'Fruit-like flavors and aromas' },
  { name: 'Floral', category: 'POSITIVE', description: 'Flower-like aromas and delicate flavors' },
  { name: 'Sweet', category: 'POSITIVE', description: 'Natural sweetness and sugar-like characteristics' },
  { name: 'Nutty', category: 'POSITIVE', description: 'Nut-like flavors such as almond, hazelnut, or walnut' },
  { name: 'Chocolate', category: 'POSITIVE', description: 'Cocoa and chocolate-like flavors' },
  { name: 'Caramel', category: 'POSITIVE', description: 'Caramelized sugar and toffee-like sweetness' },
  { name: 'Citrus', category: 'POSITIVE', description: 'Bright, acidic citrus fruit characteristics' },
  { name: 'Berry', category: 'POSITIVE', description: 'Berry fruit flavors like blueberry, raspberry, or blackberry' },
  { name: 'Stone Fruit', category: 'POSITIVE', description: 'Peach, apricot, plum-like flavors' },
  { name: 'Tropical', category: 'POSITIVE', description: 'Tropical fruit flavors like mango, pineapple, or papaya' },
  { name: 'Vanilla', category: 'POSITIVE', description: 'Vanilla bean and sweet spice characteristics' },
  { name: 'Honey', category: 'POSITIVE', description: 'Honey-like sweetness and floral notes' },
  { name: 'Wine-like', category: 'POSITIVE', description: 'Fermented fruit and wine-like complexity' },
  { name: 'Spicy', category: 'POSITIVE', description: 'Pleasant spice notes like cinnamon, clove, or cardamom' },
  { name: 'Herbal', category: 'POSITIVE', description: 'Pleasant herb-like characteristics' },
  { name: 'Tea-like', category: 'POSITIVE', description: 'Black tea or green tea characteristics' },
  { name: 'Buttery', category: 'POSITIVE', description: 'Rich, creamy, butter-like mouthfeel' },
  { name: 'Bright', category: 'POSITIVE', description: 'Lively, vibrant acidity and flavor' },
  { name: 'Clean', category: 'POSITIVE', description: 'Pure, clear flavors without off-notes' },
  { name: 'Complex', category: 'POSITIVE', description: 'Multiple layered flavors and aromas' },
  
  // NEGATIVE FLAVORS
  { name: 'Bitter', category: 'NEGATIVE', description: 'Unpleasant bitter taste, often from over-extraction' },
  { name: 'Sour', category: 'NEGATIVE', description: 'Unpleasantly acidic or vinegar-like' },
  { name: 'Astringent', category: 'NEGATIVE', description: 'Dry, puckering sensation in the mouth' },
  { name: 'Musty', category: 'NEGATIVE', description: 'Moldy, damp, or stale aromas and flavors' },
  { name: 'Earthy', category: 'NEGATIVE', description: 'Unpleasant soil-like or dirt flavors' },
  { name: 'Metallic', category: 'NEGATIVE', description: 'Metallic or mineral-like off-flavors' },
  { name: 'Woody', category: 'NEGATIVE', description: 'Unpleasant wood or paper-like flavors' },
  { name: 'Smoky', category: 'NEGATIVE', description: 'Excessive smoke or burnt characteristics' },
  { name: 'Rubber', category: 'NEGATIVE', description: 'Rubber or petroleum-like off-flavors' },
  { name: 'Chemical', category: 'NEGATIVE', description: 'Chemical or medicinal off-flavors' },
  { name: 'Rancid', category: 'NEGATIVE', description: 'Spoiled or rancid oil-like flavors' },
  { name: 'Fermented', category: 'NEGATIVE', description: 'Unpleasant fermentation or alcohol-like flavors' },
  { name: 'Flat', category: 'NEGATIVE', description: 'Lack of acidity or brightness' },
  { name: 'Harsh', category: 'NEGATIVE', description: 'Rough, aggressive, or unpleasant mouthfeel' },
  { name: 'Thin', category: 'NEGATIVE', description: 'Weak body or watery consistency' },
  { name: 'Muddy', category: 'NEGATIVE', description: 'Unclear or muddled flavors' },
  { name: 'Stale', category: 'NEGATIVE', description: 'Old, flat, or past-prime characteristics' },
  { name: 'Cardboard', category: 'NEGATIVE', description: 'Papery or cardboard-like off-flavors' },
  { name: 'Phenolic', category: 'NEGATIVE', description: 'Medicinal or band-aid-like flavors' },
  { name: 'Dirty', category: 'NEGATIVE', description: 'Unclean or contaminated flavors' },
];

export async function seedFlavorDescriptors() {
  console.log('🌱 Seeding default flavor descriptors...');
  
  try {
    // Create default flavor descriptors (not tied to any organization)
    for (const descriptor of defaultFlavorDescriptors) {
      await prisma.flavorDescriptor.upsert({
        where: {
          name_organizationId: {
            name: descriptor.name,
            organizationId: null,
          },
        },
        update: {
          description: descriptor.description,
          category: descriptor.category as 'POSITIVE' | 'NEGATIVE',
        },
        create: {
          name: descriptor.name,
          category: descriptor.category as 'POSITIVE' | 'NEGATIVE',
          description: descriptor.description,
          isDefault: true,
          organizationId: null,
          createdBy: null,
        },
      });
    }
    
    console.log(`✅ Successfully seeded ${defaultFlavorDescriptors.length} flavor descriptors`);
  } catch (error) {
    console.error('❌ Error seeding flavor descriptors:', error);
    throw error;
  }
}

if (require.main === module) {
  seedFlavorDescriptors()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
