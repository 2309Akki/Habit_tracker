// Test with simple data structure
async function testSimple() {
  console.log('🔧 Testing Simple Data Structure...\n');
  
  try {
    const testEmail = `simple${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Step 1: Register
    console.log('1. Registering user...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const registerData = await registerRes.json();
    console.log('Register Response:', registerData);
    
    // Step 2: Add simple data with correct structure
    console.log('\n2. Adding simple data...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    
    const simpleData = {
      categories: [
        { id: "cat1", name: "Health", color: "#22c55e" },
        { id: "cat2", name: "Work", color: "#3b82f6" }
      ],
      habits: [
        { 
          id: "habit1", 
          name: "Exercise", 
          description: "Daily exercise", 
          categoryName: "Health", // Use categoryName instead of categoryId
          frequency: "daily", 
          weeklyDays: [], 
          monthlyDay: null, 
          color: "#f97316", 
          reminderTime: null 
        }
      ],
      entries: [
        { id: "entry1", habitName: "Exercise", date: "2026-02-10", status: "done", note: "Completed workout" }
      ]
    };
    
    const pushRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(simpleData)
    });
    
    const pushData = await pushRes.json();
    console.log('Push Response:', pushData);
    
    // Step 3: Pull immediately
    console.log('\n3. Pulling immediately...');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('Pull Response:', {
      categories: pullData.categories?.length || 0,
      habits: pullData.habits?.length || 0,
      entries: pullData.entries?.length || 0
    });
    
    // Step 4: Check MongoDB directly
    console.log('\n4. Checking MongoDB directly...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.MONGODB_URI
        }
      }
    });
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (user) {
        const categories = await prisma.category.findMany({
          where: { userId: user.id }
        });
        
        const habits = await prisma.habit.findMany({
          where: { userId: user.id }
        });
        
        const entries = await prisma.entry.findMany({
          where: { userId: user.id }
        });
        
        console.log('MongoDB Direct Check:');
        console.log(`  Categories: ${categories.length}`);
        console.log(`  Habits: ${habits.length}`);
        console.log(`  Entries: ${entries.length}`);
        
        categories.forEach(cat => {
          console.log(`    - ${cat.name} (${cat.id})`);
        });
        
        habits.forEach(habit => {
          console.log(`    - ${habit.name} (${habit.id}) -> ${habit.categoryId}`);
        });
      }
      
    } catch (error) {
      console.error('MongoDB check error:', error.message);
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSimple();
