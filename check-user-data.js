// Check what's actually in MongoDB for your email
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI
    }
  }
});

async function checkUserData() {
  try {
    console.log('🔍 Checking MongoDB data for akshaysawalgi2309@gmail.com...\n');
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'akshaysawalgi2309@gmail.com' }
    });
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user.id);
    }
    
    // Get categories
    const categories = await prisma.category.findMany({
      where: { userId: 'akshaysawalgi2309@gmail.com' }
    });
    
    console.log('Categories in MongoDB:', categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });
    
    // Get habits
    const habits = await prisma.habit.findMany({
      where: { userId: 'akshaysawalgi2309@gmail.com' }
    });
    
    console.log('Habits in MongoDB:', habits.length);
    habits.forEach(habit => {
      console.log(`  - ${habit.name} (${habit.id})`);
    });
    
    // Get entries
    const entries = await prisma.entry.findMany({
      where: { userId: 'akshaysawalgi2309@gmail.com' }
    });
    
    console.log('Entries in MongoDB:', entries.length);
    entries.forEach(entry => {
      console.log(`  - ${entry.habitId} on ${entry.date} (${entry.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
