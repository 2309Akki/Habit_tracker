// Test working version with direct MongoDB IDs
async function testWorking() {
  console.log('🔧 Testing Working Version...\n');
  
  try {
    const testEmail = `working${Date.now()}@example.com`;
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
    
    // Step 2: Add data with direct IDs (no mapping needed)
    console.log('\n2. Adding data with direct IDs...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    
    // First, create categories to get their MongoDB IDs
    const createRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify({
        categories: [
          { id: "health", name: "Health", color: "#22c55e" },
          { id: "work", name: "Work", color: "#3b82f6" }
        ],
        habits: [],
        entries: []
      })
    });
    
    const createData = await createRes.json();
    console.log('Create Categories Response:', createData);
    
    // Step 3: Get the created categories with their MongoDB IDs
    console.log('\n3. Getting created categories...');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('Categories with IDs:', pullData.categories);
    
    // Step 4: Add habits using real MongoDB category IDs
    if (pullData.categories && pullData.categories.length > 0) {
      const healthCategory = pullData.categories.find(c => c.name === "Health");
      const workCategory = pullData.categories.find(c => c.name === "Work");
      
      const habitsData = {
        categories: pullData.categories,
        habits: [
          { 
            id: "exercise", 
            name: "Exercise", 
            description: "Daily exercise", 
            categoryId: healthCategory?.id, // Use real MongoDB ID
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
      
      console.log('\n4. Adding habits with real category IDs...');
      const habitRes = await fetch('http://localhost:3000/api/sync/replace', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': setCookieHeader
        },
        body: JSON.stringify(habitsData)
      });
      
      const habitData = await habitRes.json();
      console.log('Add Habits Response:', habitData);
      
      // Step 5: Final pull test
      console.log('\n5. Final pull test...');
      const finalRes = await fetch('http://localhost:3000/api/sync/pull', {
        headers: { 'Cookie': setCookieHeader }
      });
      
      const finalData = await finalRes.json();
      console.log('Final Pull Response:', {
        categories: finalData.categories?.length || 0,
        habits: finalData.habits?.length || 0,
        entries: finalData.entries?.length || 0
      });
      
      if (finalData.categories?.length > 0 && finalData.habits?.length > 0) {
        console.log('\n✅ SUCCESS: Data persistence working!');
        console.log('Categories:', finalData.categories.map(c => `${c.name} (${c.id})`));
        console.log('Habits:', finalData.habits.map(h => `${h.name} -> ${h.categoryId}`));
      } else {
        console.log('\n❌ FAILURE: Data not persisted');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testWorking();
