// Test real data persistence with fixed auth/me route
async function testRealData() {
  console.log('🧪 Testing Real Data Persistence...\n');
  
  try {
    const testEmail = `real${Date.now()}@example.com`;
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
        { id: "custom1", name: "My Category", color: "#ff0000" },
        { id: "custom2", name: "Work", color: "#00ff00" }
      ],
      habits: [
        { 
          id: "habit1", 
          name: "My Custom Habit", 
          description: "Custom description", 
          categoryId: "custom1", 
          frequency: "daily", 
          weeklyDays: [], 
          monthlyDay: null, 
          color: "#ff0000", 
          reminderTime: null 
        }
      ],
      entries: [
        { id: "entry1", habitId: "habit1", date: "2026-02-10", status: "done", note: "Custom entry" }
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
    
    // Step 4: Check auth/me
    console.log('\n4. Checking auth/me...');
    const authRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const authData = await authRes.json();
    console.log('Auth/me Response:', authData);
    
    // Step 5: Logout and re-login
    console.log('\n5. Logout and re-login...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { 'Cookie': setCookieHeader }
    });
    
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    
    // Step 6: Pull after re-login
    console.log('\n6. Pulling after re-login...');
    const setCookieHeader2 = loginRes.headers.get('set-cookie');
    const pullRes2 = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader2 }
    });
    
    const pullData2 = await pullRes2.json();
    console.log('Pull Response 2:', {
      categories: pullData2.categories?.length || 0,
      habits: pullData2.habits?.length || 0,
      entries: pullData2.entries?.length || 0
    });
    
    // Step 7: Analysis
    console.log('\n📊 Final Analysis:');
    console.log('Expected after re-login:');
    console.log(`  Categories: ${customData.categories.length}`);
    console.log(`  Habits: ${customData.habits.length}`);
    console.log(`  Entries: ${customData.entries.length}`);
    console.log('Got after re-login:');
    console.log(`  Categories: ${pullData2.categories?.length || 0}`);
    console.log(`  Habits: ${pullData2.habits?.length || 0}`);
    console.log(`  Entries: ${pullData2.entries?.length || 0}`);
    
    const success = 
      (pullData2.categories?.length || 0) >= customData.categories.length &&
      (pullData2.habits?.length || 0) >= customData.habits.length &&
      (pullData2.entries?.length || 0) >= customData.entries.length;
    
    console.log(`\n${success ? '✅ SUCCESS: Real data persistence working!' : '❌ FAILURE: Data not persisted'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testRealData();
