import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function updateRoles() {
  try {
    console.log('🔄 Updating MANAGER and VIEWER roles to CUPPER...');

    // Update all MANAGER users to CUPPER using raw SQL
    const managersResult = await prisma.$executeRaw`
      UPDATE users
      SET role = 'CUPPER'
      WHERE role = 'MANAGER'
    `;

    console.log(`✅ Updated ${managersResult} MANAGER users to CUPPER`);

    // Update all VIEWER users to CUPPER using raw SQL
    const viewersResult = await prisma.$executeRaw`
      UPDATE users
      SET role = 'CUPPER'
      WHERE role = 'VIEWER'
    `;

    console.log(`✅ Updated ${viewersResult} VIEWER users to CUPPER`);

    console.log('✅ All roles updated successfully!');
  } catch (error) {
    console.error('❌ Error updating roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateRoles();

