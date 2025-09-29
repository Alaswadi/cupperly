const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function getOrgId() {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: 'demo-roastery' }
    });
    
    if (org) {
      console.log('Organization ID:', org.id);
      console.log('Organization Name:', org.name);
    } else {
      console.log('No organization found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getOrgId();
