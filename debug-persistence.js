// Debug data persistence issue
async function debugPersistence() {
  console.log('🔍 Debugging Data Persistence...\n');
  
  try {
    const testEmail = `debug${Date.now()}@example.com`;
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
    
    // Step 2: Push custom data
    console.log('\n2. Pushing custom data...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    const customData = {
      categories: [
        { id: "custom1", name: "Custom Category", color: "#ff0000" },
        { id: "custom2", name: "Another Custom", color: "#00ff00" }
      ],
      habits: [
        { 
          id: "custom1", 
          name: "Custom Habit", 
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
        { id: "custom1", habitId: "custom1", date: "2026-02-10", status: "done", note: "Custom entry" }
      ]
    };
    
    console.log('Pushing data:', {
      categories: customData.categories.length,
      habits: customData.habits.length,
      entries: customData.entries.length
    });
    
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
    
    // Step 4: Logout and re-login
    console.log('\n4. Logout and re-login...');
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
    
    // Step 5: Pull after re-login
    console.log('\n5. Pulling after re-login...');
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
    
    // Step 6: Analysis
    console.log('\n📊 Analysis:');
    console.log('Expected after re-login:');
    console.log(`  Custom Categories: ${customData.categories.length}`);
    console.log(`  Custom Habits: ${customData.habits.length}`);
    console.log(`  Custom Entries: ${customData.entries.length}`);
    console.log('Got after re-login:');
    console.log(`  Total Categories: ${pullData2.categories?.length || 0}`);
    console.log(`  Total Habits: ${pullData2.habits?.length || 0}`);
    console.log(`  Total Entries: ${pullData2.entries?.length || 0}`);
    
    // Check if our custom data is present (at least our custom categories)
    const customCategoriesFound = (pullData2.categories || []).filter(cat => 
      cat.name === "Custom Category" || cat.name === "Another Custom"
    ).length;
    
    const customHabitsFound = (pullData2.habits || []).filter(habit => 
      habit.name === "Custom Habit"
    ).length;
    
    const customEntriesFound = (pullData2.entries || []).filter(entry => 
      entry.note === "Custom entry"
    ).length;
    
    const success = 
      customCategoriesFound >= customData.categories.length &&
      customHabitsFound >= customData.habits.length &&
      customEntriesFound >= customData.entries.length;
    
    console.log(`\n${success ? '✅ SUCCESS: Custom data persisted!' : '❌ FAILURE: Custom data not persisted'}`);
    console.log(`Custom Categories Found: ${customCategoriesFound}/${customData.categories.length}`);
    console.log(`Custom Habits Found: ${customHabitsFound}/${customData.habits.length}`);
    console.log(`Custom Entries Found: ${customEntriesFound}/${customData.entries.length}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugPersistence();
