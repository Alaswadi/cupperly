require('dotenv').config();
const { PrismaClient } = require('../generated/client');

const prisma = new PrismaClient();

async function checkOrganizations() {
  try {
    console.log('🔍 Checking organizations in database...');
    
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${organizations.length} organizations:`);
    
    if (organizations.length === 0) {
      console.log('❌ No organizations found in database!');
      console.log('💡 You need to create an organization first.');
    } else {
      organizations.forEach((org, index) => {
        console.log(`\n${index + 1}. ${org.name}`);
        console.log(`   ID: ${org.id}`);
        console.log(`   Slug: ${org.slug}`);
        console.log(`   Subdomain: ${org.subdomain}`);
        console.log(`   Status: ${org.subscriptionStatus}`);
        console.log(`   Created: ${org.createdAt}`);
      });
    }

    // Check users too
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    console.log(`\n👥 Found ${users.length} users:`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Org ID: ${user.organizationId}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking organizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganizations();
