require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPrismaModels() {
  try {
    console.log('🔍 Checking available Prisma models...');
    
    // List all available models
    console.log('Available models on prisma object:');
    const models = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] !== null && 
      typeof prisma[key].findMany === 'function'
    );
    
    console.log('Models:', models);
    
    // Try to access flavorDescriptor specifically
    console.log('\nTesting flavorDescriptor access:');
    console.log('prisma.flavorDescriptor:', typeof prisma.flavorDescriptor);
    
    // Try alternative names
    console.log('prisma.flavor_descriptors:', typeof prisma.flavor_descriptors);
    console.log('prisma.FlavorDescriptor:', typeof prisma.FlavorDescriptor);
    
    // Test a known working model
    console.log('\nTesting known models:');
    console.log('prisma.user:', typeof prisma.user);
    console.log('prisma.organization:', typeof prisma.organization);
    
    // Try to query users to make sure Prisma is working
    const userCount = await prisma.user.count();
    console.log(`\n✅ User count: ${userCount} (Prisma is working)`);
    
  } catch (error) {
    console.error('❌ Error checking Prisma models:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrismaModels();
