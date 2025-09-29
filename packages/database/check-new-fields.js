const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function checkNewFields() {
  try {
    // Force fresh query by disconnecting and reconnecting
    await prisma.$disconnect();

    // Check the specific sample
    const sample = await prisma.sample.findFirst({
      where: {
        id: '1759080201236'
      },
      select: {
        id: true,
        name: true,
        code: true,
        harvestDate: true,
        roaster: true,
        roastDate: true,
        updatedAt: true
      }
    });

    if (sample) {
      console.log('✅ Sample found with new fields:');
      console.log('ID:', sample.id);
      console.log('Name:', sample.name);
      console.log('Code:', sample.code);
      console.log('Harvest Date:', sample.harvestDate);
      console.log('Roaster:', sample.roaster);
      console.log('Roast Date:', sample.roastDate);
      console.log('Updated At:', sample.updatedAt);

      // Also check via API to compare
      console.log('\n🔄 Checking via API...');
      const response = await fetch('http://localhost:3001/api/samples/1759080201236');
      const apiData = await response.json();
      if (apiData.success) {
        const apiSample = apiData.data;
        console.log('API Harvest Date:', apiSample.harvestDate);
        console.log('API Roaster:', apiSample.roaster);
        console.log('API Roast Date:', apiSample.roastDate);
      }
    } else {
      console.log('❌ Sample not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewFields();
