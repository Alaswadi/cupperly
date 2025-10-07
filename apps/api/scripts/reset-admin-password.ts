import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // Get admin email from command line argument or use default
    const email = process.argv[2] || 'admin@example.com';
    const newPassword = process.argv[3] || 'Admin123!';

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\n📋 Available users:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      });

      allUsers.forEach((u) => {
        console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - ${u.role} - ${u.organization.name}`);
      });

      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`   Organization: ${user.organization.name} (${user.organization.subdomain})`);

    // Hash the new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`\n🎉 Password reset successfully!`);
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`\n⚠️  Please change this password after logging in!`);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

