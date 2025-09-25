require('dotenv').config();
const { PrismaClient } = require('../generated/client');

const prisma = new PrismaClient();

async function checkFlavorDescriptors() {
  try {
    console.log('🔍 Checking flavor descriptors in database...');
    
    const flavors = await prisma.flavorDescriptor.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isDefault: true,
        organizationId: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`📊 Found ${flavors.length} flavor descriptors:`);
    
    if (flavors.length === 0) {
      console.log('❌ No flavor descriptors found in database!');
      console.log('💡 You need to seed flavor descriptors.');
    } else {
      const positive = flavors.filter(f => f.category === 'POSITIVE');
      const negative = flavors.filter(f => f.category === 'NEGATIVE');
      
      console.log(`\n✅ Positive flavors: ${positive.length}`);
      positive.slice(0, 5).forEach((flavor, index) => {
        console.log(`   ${index + 1}. ${flavor.name} (${flavor.isDefault ? 'Default' : 'Custom'})`);
      });
      if (positive.length > 5) console.log(`   ... and ${positive.length - 5} more`);
      
      console.log(`\n✅ Negative flavors: ${negative.length}`);
      negative.slice(0, 5).forEach((flavor, index) => {
        console.log(`   ${index + 1}. ${flavor.name} (${flavor.isDefault ? 'Default' : 'Custom'})`);
      });
      if (negative.length > 5) console.log(`   ... and ${negative.length - 5} more`);
    }

  } catch (error) {
    console.error('❌ Error checking flavor descriptors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFlavorDescriptors();
