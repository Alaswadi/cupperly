const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function addSamples() {
  try {
    // Get the demo organization
    const org = await prisma.organization.findFirst({
      where: { slug: 'demo-roastery' }
    });
    
    if (!org) {
      console.log('No organization found');
      return;
    }
    
    console.log('Adding samples to organization:', org.name);
    
    // Add some sample coffee samples
    const samples = [
      {
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
        organizationId: org.id
      },
      {
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
        organizationId: org.id
      }
    ];
    
    for (const sampleData of samples) {
      const sample = await prisma.sample.create({
        data: sampleData
      });
      console.log('Created sample:', sample.name);
    }
    
    console.log('✅ Samples added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSamples();
