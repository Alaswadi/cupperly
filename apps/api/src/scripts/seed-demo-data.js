require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seed...');

    // Check if demo organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'demo' },
          { subdomain: 'demo' },
        ],
      },
    });

    let organization;
    if (existingOrg) {
      console.log('✅ Demo organization already exists!');
      console.log(`   Name: ${existingOrg.name}`);
      console.log(`   Slug: ${existingOrg.slug}`);
      console.log(`   Subdomain: ${existingOrg.subdomain}`);
      organization = existingOrg;
    } else {

      // Create demo organization
      console.log('📝 Creating demo organization...');
      organization = await prisma.organization.create({
        data: {
          name: 'Demo Coffee Lab',
          slug: 'demo',
          subdomain: 'demo',
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: 'PROFESSIONAL',
          settings: {
            allowGuestAccess: true,
            defaultCuppingTemplate: 'SCA Standard',
            timezone: 'UTC',
          },
        },
      });

      console.log('✅ Demo organization created!');
      console.log(`   ID: ${organization.id}`);
      console.log(`   Name: ${organization.name}`);
    }

    // Hash password for both users
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@demo.com',
        organizationId: organization.id,
      },
    });

    let adminUser;
    if (existingAdmin) {
      console.log('✅ Demo admin user already exists!');
      adminUser = existingAdmin;
    } else {
      // Create demo admin user
      console.log('👤 Creating demo admin user...');

      adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'ADMIN',
        emailVerified: true,
        password: hashedPassword,
        organizationId: organization.id,
      },
    });

      console.log('✅ Demo admin user created!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: demo123`);
      console.log(`   Role: ${adminUser.role}`);
    }

    // Create demo cupper user
    console.log('👤 Creating demo cupper user...');
    const evaluatorUser = await prisma.user.create({
      data: {
        email: 'cupper@demo.com',
        firstName: 'Demo',
        lastName: 'Cupper',
        role: 'CUPPER',
        emailVerified: true,
        password: hashedPassword,
        organizationId: organization.id,
      },
    });

    console.log('✅ Demo cupper user created!');
    console.log(`   Email: ${evaluatorUser.email}`);
    console.log(`   Password: demo123`);
    console.log(`   Role: ${evaluatorUser.role}`);

    // Create default SCA template if it doesn't exist
    console.log('📋 Creating default SCA template...');
    const existingTemplate = await prisma.cuppingTemplate.findFirst({
      where: {
        name: 'SCA Standard',
        organizationId: organization.id,
      },
    });

    if (!existingTemplate) {
      const template = await prisma.cuppingTemplate.create({
        data: {
          name: 'SCA Standard',
          description: 'Standard SCA cupping form with 10 categories',
          isDefault: true,
          organizationId: organization.id,
          createdBy: adminUser.id,
          categories: [
            { name: 'Aroma', weight: 1, maxScore: 10 },
            { name: 'Flavor', weight: 1, maxScore: 10 },
            { name: 'Aftertaste', weight: 1, maxScore: 10 },
            { name: 'Acidity', weight: 1, maxScore: 10 },
            { name: 'Body', weight: 1, maxScore: 10 },
            { name: 'Balance', weight: 1, maxScore: 10 },
            { name: 'Uniformity', weight: 1, maxScore: 10 },
            { name: 'Clean Cup', weight: 1, maxScore: 10 },
            { name: 'Sweetness', weight: 1, maxScore: 10 },
            { name: 'Overall', weight: 1, maxScore: 10 },
          ],
        },
      });

      console.log('✅ SCA Standard template created!');
      console.log(`   ID: ${template.id}`);
    } else {
      console.log('✅ SCA Standard template already exists!');
    }

    console.log('\n🎉 Demo data seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@demo.com / demo123');
    console.log('   Cupper: cupper@demo.com / demo123');
    console.log('   Tenant ID: demo');
    console.log('\n🌐 You can now login at: http://localhost:3000/auth/login');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDemoData()
  .then(() => {
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
