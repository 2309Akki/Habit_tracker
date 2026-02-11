// Test the final fix for data persistence
async function testFinalFix() {
  console.log('🔧 Testing Final Fix for Data Persistence...\n');
  
  try {
    const testEmail = `final${Date.now()}@example.com`;
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
    
    // Step 2: Add custom data
    console.log('\n2. Adding custom data...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    
    const customData = {
      categories: [
        { id: "health", name: "Health", color: "#22c55e" },
        { id: "work", name: "Work", color: "#3b82f6" }
      ],
      habits: [
        { 
          id: "exercise", 
          name: "Exercise", 
          description: "Daily exercise", 
          categoryId: "health", 
          frequency: "daily", 
          weeklyDays: [], 
          monthlyDay: null, 
          color: "#f97316", 
          reminderTime: null 
        }
      ],
      entries: [
        { id: "entry1", habitId: "exercise", date: "2026-02-10", status: "done", note: "Completed workout" }
      ]
    };
    
    const pushRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(customData)
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
          where: { userId: testEmail }
        });
        
        const habits = await prisma.habit.findMany({
          where: { userId: testEmail }
        });
        
        const entries = await prisma.entry.findMany({
          where: { userId: testEmail }
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

testFinalFix();
