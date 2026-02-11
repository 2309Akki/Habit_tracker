const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI
    }
  }
});

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    users.forEach(u => console.log(`  - ${u.email}`));
    
    // Check categories
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories.length);
    categories.forEach(c => console.log(`  - ${c.name} (${c.userId})`));
    
    // Check habits
    const habits = await prisma.habit.findMany();
    console.log('Habits:', habits.length);
    habits.forEach(h => console.log(`  - ${h.name} (${h.userId})`));
    
    // Check entries
    const entries = await prisma.entry.findMany();
    console.log('Entries:', entries.length);
    entries.forEach(e => console.log(`  - ${e.habitId} (${e.userId})`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
