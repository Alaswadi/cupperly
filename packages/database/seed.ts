import { PrismaClient } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-roastery' },
    update: {},
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

  // Create demo admin user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.cupperly.com' },
    update: {},
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

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo cupper users
  const cupperUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'cupper1@demo.cupperly.com' },
      update: {},
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
    }),
    prisma.user.upsert({
      where: { email: 'cupper2@demo.cupperly.com' },
      update: {},
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
    }),
  ]);

  console.log('✅ Created cupper users:', cupperUsers.map(u => u.email));

  // Create default SCA cupping template
  const scaTemplate = await prisma.cuppingTemplate.upsert({
    where: { id: 'sca-default-template' },
    update: {},
    create: {
      id: 'sca-default-template',
      name: 'SCA Standard Cupping Form',
      description: 'Standard Specialty Coffee Association cupping form',
      organizationId: demoOrg.id,
      createdBy: adminUser.id,
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

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });