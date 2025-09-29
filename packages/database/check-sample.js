const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function checkSample() {
  try {
    // Check for the specific sample ID
    const sample = await prisma.sample.findFirst({
      where: {
        id: '1758997136353'
      }
    });

    if (sample) {
      console.log('✅ Sample found in database:');
      console.log('ID:', sample.id);
      console.log('Name:', sample.name);
      console.log('Origin:', sample.origin);
      console.log('Processing Method:', sample.processingMethod);
      console.log('Created At:', sample.createdAt);
    } else {
      console.log('❌ Sample with ID 1758997136353 not found in database');
    }
    
    // Also check all samples in the database
    const allSamples = await prisma.sample.findMany({
      where: {
        organizationId: 'cmg2jkv6j0000q6uak3lrxq96'
      },
      select: {
        id: true,
        name: true,
        origin: true,
        processingMethod: true
      }
    });
    
    console.log('\n📋 All samples in database:');
    allSamples.forEach(s => {
      console.log(`- ${s.id}: ${s.name} (${s.origin}) - ${s.processingMethod || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSample();
