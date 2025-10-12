import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📊 Checking existing data...');

  // Check if data already exists
  const existingOrgs = await prisma.organization.count();
  const existingUsers = await prisma.user.count();

  if (existingOrgs > 0 && existingUsers > 0) {
    console.log('✅ Database already seeded!');
    console.log(`   - Organizations: ${existingOrgs}`);
    console.log(`   - Users: ${existingUsers}`);
    console.log('⏭️  Skipping seed...');
    return;
  }

  console.log('📝 Creating initial data...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-roastery' },
    update: {
      name: 'Demo Coffee Roastery',
      description: 'A demonstration coffee roastery for Cupperly',
    },
    create: {
      name: 'Demo Coffee Roastery',
      slug: 'demo-roastery',
      subdomain: 'demo',
      description: 'A demonstration coffee roastery for Cupperly',
      subscriptionStatus: 'TRIAL',
      subscriptionPlan: 'PROFESSIONAL',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('✅ Created demo organization:', demoOrg.name);

  // Create demo admin user with admin@demo.com
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const adminUser1 = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
    },
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      organizationId: demoOrg.id,
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser1.email);

  // Create demo admin user with admin@demo.cupperly.com
  const adminUser2 = await prisma.user.upsert({
    where: { email: 'admin@demo.cupperly.com' },
    update: {
      firstName: 'Demo',
      lastName: 'Admin',
      password: hashedPassword,
    },
    create: {
      email: 'admin@demo.cupperly.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Admin',
      organizationId: demoOrg.id,
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser2.email);

  // Create demo cupper users
  const cupper1 = await prisma.user.upsert({
    where: { email: 'cupper1@demo.cupperly.com' },
    update: {
      firstName: 'Alice',
      lastName: 'Johnson',
    },
    create: {
      email: 'cupper1@demo.cupperly.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      organizationId: demoOrg.id,
      role: 'CUPPER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const cupper2 = await prisma.user.upsert({
    where: { email: 'cupper2@demo.cupperly.com' },
    update: {
      firstName: 'Bob',
      lastName: 'Smith',
    },
    create: {
      email: 'cupper2@demo.cupperly.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      organizationId: demoOrg.id,
      role: 'CUPPER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created cupper users:', [cupper1.email, cupper2.email]);

  // Create default SCA cupping template
  const scaTemplate = await prisma.cuppingTemplate.upsert({
    where: { id: 'sca-default-template' },
    update: {
      name: 'SCA Standard Cupping Form',
      description: 'Standard Specialty Coffee Association cupping form',
    },
    create: {
      id: 'sca-default-template',
      name: 'SCA Standard Cupping Form',
      description: 'Standard Specialty Coffee Association cupping form',
      organizationId: demoOrg.id,
      createdBy: adminUser1.id,
      isDefault: true,
      isPublic: true,
      scoringSystem: 'SCA',
      maxScore: 100,
      categories: {
        categories: [
          { name: 'Aroma', weight: 1, maxScore: 10 },
          { name: 'Flavor', weight: 1, maxScore: 10 },
          { name: 'Aftertaste', weight: 1, maxScore: 10 },
          { name: 'Acidity', weight: 1, maxScore: 10 },
          { name: 'Body', weight: 1, maxScore: 10 },
          { name: 'Balance', weight: 1, maxScore: 10 },
          { name: 'Sweetness', weight: 1, maxScore: 10 },
          { name: 'Cleanliness', weight: 1, maxScore: 10 },
          { name: 'Uniformity', weight: 1, maxScore: 10 },
          { name: 'Overall', weight: 1, maxScore: 10 },
        ],
      },
    },
  });

  console.log('✅ Created SCA template:', scaTemplate.name);

  // Create sample coffee data
  const sample1 = await prisma.sample.upsert({
    where: { id: 'sample-ethiopian-yirgacheffe' },
    update: {},
    create: {
      id: 'sample-ethiopian-yirgacheffe',
      name: 'Ethiopian Yirgacheffe',
      origin: 'Ethiopia',
      region: 'Yirgacheffe',
      variety: 'Heirloom',
      processingMethod: 'WASHED',
      altitude: 1800,
      harvestDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      notes: 'Floral and citrus notes with a tea-like body',
      organizationId: demoOrg.id,
    },
  });

  const sample2 = await prisma.sample.upsert({
    where: { id: 'sample-colombian-supremo' },
    update: {},
    create: {
      id: 'sample-colombian-supremo',
      name: 'Colombian Supremo',
      origin: 'Colombia',
      region: 'Huila',
      variety: 'Caturra',
      processingMethod: 'WASHED',
      altitude: 1600,
      harvestDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      notes: 'Balanced with chocolate and caramel sweetness',
      organizationId: demoOrg.id,
    },
  });

  console.log('✅ Created sample coffees:', [sample1.name, sample2.name]);

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   - Organization: Demo Coffee Roastery');
  console.log('   - Users: 4 (2 admins, 2 cuppers)');
  console.log('   - Templates: 1 (SCA Standard)');
  console.log('   - Samples: 2 (Ethiopian, Colombian)');
  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Email: admin@demo.cupperly.com');
  console.log('   Password: demo123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });