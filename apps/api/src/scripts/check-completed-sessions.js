const { PrismaClient } = require('../../generated/client');
const prisma = new PrismaClient();

async function checkSessions() {
  try {
    const sessions = await prisma.session.findMany({
      where: { status: 'COMPLETED' },
      include: {
        samples: {
          include: {
            sample: true,
            scores: {
              include: {
                user: true,
                flavorDescriptors: {
                  include: {
                    flavorDescriptor: true
                  }
                }
              }
            }
          }
        }
      },
      take: 3
    });
    
    console.log('Found', sessions.length, 'completed sessions');
    sessions.forEach(session => {
      console.log('Session:', session.name, 'ID:', session.id);
      console.log('  Samples:', session.samples.length);
      session.samples.forEach(sample => {
        console.log('    Sample:', sample.sample.name, 'Scores:', sample.scores.length);
        console.log('    AI Summary:', sample.aiSummary ? 'Yes' : 'No');
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
