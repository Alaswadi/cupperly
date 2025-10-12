const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('Resetting password for admin@demo.com...');
    
    // Hash the password 'demo123'
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Update the admin user
    const user = await prisma.user.update({
      where: { email: 'admin@demo.com' },
      data: { password: hashedPassword }
    });
    
    console.log('');
    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@demo.com');
    console.log('   Password: demo123');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    
    if (error.code === 'P2025') {
      console.error('User admin@demo.com not found!');
      console.error('You may need to seed the database first:');
      console.error('  .\\docker-setup-db.ps1');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

