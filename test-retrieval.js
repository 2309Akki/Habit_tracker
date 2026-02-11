// Test data retrieval directly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI
    }
  }
});

async function testRetrieval() {
  try {
    const testEmail = 'final1770740958156@example.com';
    console.log('🔍 Testing data retrieval for:', testEmail);
    
    // Test 1: Direct category query
    console.log('\n1. Testing direct category query...');
    const categories = await prisma.category.findMany({
      where: { userId: testEmail }
    });
    console.log('Categories found:', categories.length);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`));
    
    // Test 2: Direct habit query  
    console.log('\n2. Testing direct habit query...');
    const habits = await prisma.habit.findMany({
      where: { userId: testEmail }
    });
    console.log('Habits found:', habits.length);
    habits.forEach(habit => console.log(`  - ${habit.name} (${habit.id}) -> ${habit.categoryId}`));
    
    // Test 3: Direct entry query
    console.log('\n3. Testing direct entry query...');
    const entries = await prisma.entry.findMany({
      where: { userId: testEmail }
    });
    console.log('Entries found:', entries.length);
    entries.forEach(entry => console.log(`  - ${entry.habitId} on ${entry.date} (${entry.status})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRetrieval();
