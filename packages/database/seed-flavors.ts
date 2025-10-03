import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

const defaultFlavorDescriptors = [
  // POSITIVE Flavors (20)
  { name: 'Floral', category: 'POSITIVE', description: 'Delicate flower-like aromas and flavors' },
  { name: 'Fruity', category: 'POSITIVE', description: 'Fresh fruit characteristics' },
  { name: 'Citrus', category: 'POSITIVE', description: 'Bright citrus notes like lemon, orange, lime' },
  { name: 'Berry', category: 'POSITIVE', description: 'Berry flavors like blueberry, strawberry, raspberry' },
  { name: 'Stone Fruit', category: 'POSITIVE', description: 'Peach, apricot, plum characteristics' },
  { name: 'Tropical', category: 'POSITIVE', description: 'Tropical fruit notes like mango, pineapple, passion fruit' },
  { name: 'Chocolate', category: 'POSITIVE', description: 'Rich chocolate flavors' },
  { name: 'Caramel', category: 'POSITIVE', description: 'Sweet caramel notes' },
  { name: 'Vanilla', category: 'POSITIVE', description: 'Smooth vanilla characteristics' },
  { name: 'Nutty', category: 'POSITIVE', description: 'Nut-like flavors such as almond, hazelnut, walnut' },
  { name: 'Honey', category: 'POSITIVE', description: 'Sweet honey characteristics' },
  { name: 'Brown Sugar', category: 'POSITIVE', description: 'Rich brown sugar sweetness' },
  { name: 'Spicy', category: 'POSITIVE', description: 'Pleasant spice notes like cinnamon, clove, cardamom' },
  { name: 'Wine-like', category: 'POSITIVE', description: 'Wine-like fermented fruit characteristics' },
  { name: 'Tea-like', category: 'POSITIVE', description: 'Tea-like astringency and flavor' },
  { name: 'Bright', category: 'POSITIVE', description: 'Lively, vibrant acidity' },
  { name: 'Clean', category: 'POSITIVE', description: 'Pure, clear flavor profile' },
  { name: 'Balanced', category: 'POSITIVE', description: 'Well-balanced flavor components' },
  { name: 'Complex', category: 'POSITIVE', description: 'Multiple layered flavors' },
  { name: 'Smooth', category: 'POSITIVE', description: 'Smooth, pleasant mouthfeel' },

  // NEGATIVE Flavors (20)
  { name: 'Bitter', category: 'NEGATIVE', description: 'Unpleasant bitter taste' },
  { name: 'Sour', category: 'NEGATIVE', description: 'Overly sour or acidic' },
  { name: 'Astringent', category: 'NEGATIVE', description: 'Harsh, drying sensation' },
  { name: 'Musty', category: 'NEGATIVE', description: 'Moldy, stale characteristics' },
  { name: 'Earthy', category: 'NEGATIVE', description: 'Unpleasant earthy, dirty flavors' },
  { name: 'Grassy', category: 'NEGATIVE', description: 'Green, grassy off-flavors' },
  { name: 'Woody', category: 'NEGATIVE', description: 'Unpleasant woody characteristics' },
  { name: 'Papery', category: 'NEGATIVE', description: 'Paper-like off-flavors' },
  { name: 'Cardboard', category: 'NEGATIVE', description: 'Cardboard-like staleness' },
  { name: 'Metallic', category: 'NEGATIVE', description: 'Metallic off-flavors' },
  { name: 'Chemical', category: 'NEGATIVE', description: 'Chemical or medicinal flavors' },
  { name: 'Rubber', category: 'NEGATIVE', description: 'Rubber-like off-flavors' },
  { name: 'Petroleum', category: 'NEGATIVE', description: 'Petroleum or fuel-like flavors' },
  { name: 'Rancid', category: 'NEGATIVE', description: 'Rancid, spoiled characteristics' },
  { name: 'Fermented', category: 'NEGATIVE', description: 'Over-fermented, alcoholic flavors' },
  { name: 'Moldy', category: 'NEGATIVE', description: 'Mold-like off-flavors' },
  { name: 'Animal', category: 'NEGATIVE', description: 'Unpleasant animal-like flavors' },
  { name: 'Smoky', category: 'NEGATIVE', description: 'Unpleasant smoky characteristics' },
  { name: 'Burnt', category: 'NEGATIVE', description: 'Burnt, over-roasted flavors' },
  { name: 'Flat', category: 'NEGATIVE', description: 'Lack of flavor or character' }
];

async function seedFlavorDescriptors() {
  try {
    console.log('🌱 Seeding default flavor descriptors...');

    // Check if flavor descriptors already exist
    const existingCount = await prisma.flavorDescriptor.count({
      where: { isDefault: true }
    });

    if (existingCount > 0) {
      console.log(`✅ ${existingCount} default flavor descriptors already exist. Skipping seed.`);
      return;
    }

    // Create default flavor descriptors
    const created = await prisma.flavorDescriptor.createMany({
      data: defaultFlavorDescriptors.map(descriptor => ({
        ...descriptor,
        isDefault: true,
        organizationId: null, // Global default descriptors
        createdBy: null
      }))
    });

    console.log(`✅ Created ${created.count} default flavor descriptors`);

    // Display the created descriptors
    const positiveCount = defaultFlavorDescriptors.filter(d => d.category === 'POSITIVE').length;
    const negativeCount = defaultFlavorDescriptors.filter(d => d.category === 'NEGATIVE').length;
    
    console.log(`   📈 ${positiveCount} POSITIVE descriptors`);
    console.log(`   📉 ${negativeCount} NEGATIVE descriptors`);

  } catch (error) {
    console.error('❌ Error seeding flavor descriptors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFlavorDescriptors()
  .then(() => {
    console.log('✅ Flavor descriptors seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Flavor descriptors seed failed:', error);
    process.exit(1);
  });

