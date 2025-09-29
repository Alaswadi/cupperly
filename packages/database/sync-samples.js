const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

// Sample data that matches what's in the API
const sampleData = [
  {
    id: 'sample-1',
    name: 'Ethiopian Yirgacheffe',
    origin: 'Ethiopia',
    region: 'Yirgacheffe',
    description: 'Bright and floral coffee with citrus notes',
    code: 'ETH-001',
    farm: 'Kochere Farm',
    producer: 'Tadesse Meskela',
    variety: 'Heirloom',
    altitude: 2000,
    processingMethod: 'WASHED',
    roastLevel: 'MEDIUM_LIGHT',
    moisture: null,
    density: null,
    screenSize: null,
    organizationId: 'cmg2jkv6j0000q6uak3lrxq96'
  },
  {
    id: 'sample-2',
    name: 'Colombian Huila',
    origin: 'Colombia',
    region: 'Huila',
    description: 'Balanced coffee with chocolate and caramel notes',
    code: 'COL-002',
    farm: 'La Esperanza',
    producer: 'Carlos Rodriguez',
    variety: 'Caturra',
    altitude: 1800,
    processingMethod: 'WASHED',
    roastLevel: 'MEDIUM',
    moisture: null,
    density: null,
    screenSize: null,
    organizationId: 'cmg2jkv6j0000q6uak3lrxq96'
  }
];

async function syncSamples() {
  try {
    console.log('🔄 Syncing samples to database...');
    
    // Clear existing samples for this organization
    await prisma.sample.deleteMany({
      where: {
        organizationId: 'cmg2jkv6j0000q6uak3lrxq96'
      }
    });
    
    console.log('🗑️ Cleared existing samples');
    
    // Insert the sample data
    for (const sample of sampleData) {
      const created = await prisma.sample.create({
        data: sample
      });
      console.log('✅ Created sample:', created.name);
    }
    
    console.log('🎉 Sample sync completed successfully!');
    
    // Verify the data
    const count = await prisma.sample.count({
      where: {
        organizationId: 'cmg2jkv6j0000q6uak3lrxq96'
      }
    });
    
    console.log('📊 Total samples in database:', count);
    
  } catch (error) {
    console.error('❌ Error syncing samples:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncSamples();
