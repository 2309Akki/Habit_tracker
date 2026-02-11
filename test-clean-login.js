// Test that new users get clean data (no defaults)
async function testCleanLogin() {
  console.log('🧹 Testing Clean Login (No Default Data)...\n');
  
  try {
    const testEmail = `clean${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Step 1: Register new user
    console.log('1. Registering new user...');
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
    
    // Step 2: Pull data immediately after registration
    console.log('\n2. Pulling data immediately after registration...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('Pull Response:', {
      categories: pullData.categories?.length || 0,
      habits: pullData.habits?.length || 0,
      entries: pullData.entries?.length || 0
    });
    
    // Step 3: Verify no default data
    const hasCategories = (pullData.categories?.length || 0) > 0;
    const hasHabits = (pullData.habits?.length || 0) > 0;
    const hasEntries = (pullData.entries?.length || 0) > 0;
    
    console.log('\n📊 Analysis:');
    console.log('Categories found:', hasCategories);
    console.log('Habits found:', hasHabits);
    console.log('Entries found:', hasEntries);
    
    const isClean = !hasCategories && !hasHabits && !hasEntries;
    
    console.log(`\n${isClean ? '✅ SUCCESS: Clean login - no default data!' : '❌ FAILURE: Default data found!'}`);
    
    if (hasCategories) {
      console.log('Categories found:', pullData.categories.map(c => c.name));
    }
    if (hasHabits) {
      console.log('Habits found:', pullData.habits.map(h => h.name));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCleanLogin();
