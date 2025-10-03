const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultFlavorDescriptors = [
  // Positive flavors
  { name: 'Fruity', category: 'POSITIVE', description: 'Fruit-like flavors and aromas' },
  { name: 'Floral', category: 'POSITIVE', description: 'Flower-like aromas and delicate notes' },
  { name: 'Sweet', category: 'POSITIVE', description: 'Natural sweetness and sugar-like notes' },
  { name: 'Nutty', category: 'POSITIVE', description: 'Nut-like flavors and aromas' },
  { name: 'Chocolate', category: 'POSITIVE', description: 'Chocolate and cocoa notes' },
  { name: 'Caramel', category: 'POSITIVE', description: 'Caramelized sugar notes' },
  { name: 'Citrus', category: 'POSITIVE', description: 'Citrus fruit flavors and acidity' },
  { name: 'Berry', category: 'POSITIVE', description: 'Berry-like flavors and aromas' },
  { name: 'Stone Fruit', category: 'POSITIVE', description: 'Peach, apricot, plum-like notes' },
  { name: 'Tropical', category: 'POSITIVE', description: 'Tropical fruit flavors' },
  { name: 'Vanilla', category: 'POSITIVE', description: 'Vanilla and sweet spice notes' },
  { name: 'Honey', category: 'POSITIVE', description: 'Honey-like sweetness and texture' },
  { name: 'Wine-like', category: 'POSITIVE', description: 'Wine-like complexity and notes' },
  { name: 'Spicy', category: 'POSITIVE', description: 'Pleasant spice notes' },
  { name: 'Herbal', category: 'POSITIVE', description: 'Herb-like flavors and aromas' },
  { name: 'Tea-like', category: 'POSITIVE', description: 'Tea-like delicate flavors' },
  { name: 'Buttery', category: 'POSITIVE', description: 'Butter-like richness and mouthfeel' },
  { name: 'Bright', category: 'POSITIVE', description: 'Bright and lively acidity' },
  { name: 'Clean', category: 'POSITIVE', description: 'Clean and pure flavor profile' },
  { name: 'Complex', category: 'POSITIVE', description: 'Complex and layered flavors' },

  // Negative flavors
  { name: 'Bitter', category: 'NEGATIVE', description: 'Unpleasant bitter taste' },
  { name: 'Sour', category: 'NEGATIVE', description: 'Unpleasant sour or acidic taste' },
  { name: 'Astringent', category: 'NEGATIVE', description: 'Dry, puckering mouthfeel' },
  { name: 'Musty', category: 'NEGATIVE', description: 'Musty, moldy aromas and flavors' },
  { name: 'Earthy', category: 'NEGATIVE', description: 'Unpleasant earthy or dirt-like notes' },
  { name: 'Metallic', category: 'NEGATIVE', description: 'Metallic taste and mouthfeel' },
  { name: 'Woody', category: 'NEGATIVE', description: 'Unpleasant woody or bark-like notes' },
  { name: 'Smoky', category: 'NEGATIVE', description: 'Unpleasant smoky or burnt notes' },
  { name: 'Rubber', category: 'NEGATIVE', description: 'Rubber-like off-flavors' },
  { name: 'Chemical', category: 'NEGATIVE', description: 'Chemical or medicinal off-flavors' },
  { name: 'Rancid', category: 'NEGATIVE', description: 'Rancid or spoiled flavors' },
  { name: 'Fermented', category: 'NEGATIVE', description: 'Over-fermented or alcoholic notes' },
  { name: 'Flat', category: 'NEGATIVE', description: 'Lack of acidity or brightness' },
  { name: 'Harsh', category: 'NEGATIVE', description: 'Harsh or aggressive flavors' },
  { name: 'Thin', category: 'NEGATIVE', description: 'Thin or watery body' },
  { name: 'Muddy', category: 'NEGATIVE', description: 'Muddy or unclear flavor profile' },
  { name: 'Stale', category: 'NEGATIVE', description: 'Stale or old coffee flavors' },
  { name: 'Cardboard', category: 'NEGATIVE', description: 'Cardboard or papery off-flavors' },
  { name: 'Phenolic', category: 'NEGATIVE', description: 'Phenolic or medicinal off-flavors' },
  { name: 'Dirty', category: 'NEGATIVE', description: 'Dirty or unclean flavors' }
];

async function seedFlavorDescriptors() {
  try {
    console.log('🌱 Starting flavor descriptors seed...');

    // Check if flavor descriptors already exist
    const existingCount = await prisma.flavorDescriptor.count();
    if (existingCount > 0) {
      console.log(`✅ Flavor descriptors already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Create default flavor descriptors
    console.log('📝 Creating default flavor descriptors...');
    
    for (const descriptor of defaultFlavorDescriptors) {
      await prisma.flavorDescriptor.create({
        data: {
          ...descriptor,
          isDefault: true,
        },
      });
    }

    console.log(`✅ Successfully created ${defaultFlavorDescriptors.length} flavor descriptors!`);
    
    // Display summary
    const positiveCount = defaultFlavorDescriptors.filter(d => d.category === 'POSITIVE').length;
    const negativeCount = defaultFlavorDescriptors.filter(d => d.category === 'NEGATIVE').length;
    
    console.log(`   📊 Summary:`);
    console.log(`   🟢 Positive flavors: ${positiveCount}`);
    console.log(`   🔴 Negative flavors: ${negativeCount}`);
    console.log(`   📝 Total: ${defaultFlavorDescriptors.length}`);

  } catch (error) {
    console.error('❌ Error seeding flavor descriptors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFlavorDescriptors()
  .then(() => {
    console.log('🎉 Flavor descriptors seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Flavor descriptors seed failed:', error);
    process.exit(1);
  });
