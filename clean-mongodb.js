// Clean MongoDB database for fresh start
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI
    }
  }
});

async function cleanDatabase() {
  try {
    console.log('🧹 Cleaning MongoDB database...');
    
    // Delete all user data
    await prisma.entry.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
