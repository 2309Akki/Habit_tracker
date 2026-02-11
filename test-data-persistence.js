// Test data persistence across login sessions
async function testDataPersistence() {
  console.log('💾 Testing Data Persistence...\n');
  
  try {
    const testEmail = `persistdata${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Step 1: Register and login
    console.log('1. Registering and logging in...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const registerData = await registerRes.json();
    if (!registerRes.ok) {
      console.log('❌ Registration failed');
      return;
    }
    
    console.log('✅ Registration successful!');
    
    // Step 2: Push some test data
    console.log('\n2. Pushing test data...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    const testData = {
      categories: [
        { id: "cat1", name: "Test Category", color: "#ff0000" },
        { id: "cat2", name: "Another Category", color: "#00ff00" }
      ],
      habits: [
        { 
          id: "habit1", 
          name: "Test Habit", 
          description: "Test description", 
          categoryId: "cat1", 
          frequency: "daily", 
          weeklyDays: [], 
          monthlyDay: null, 
          color: "#ff0000", 
          reminderTime: null 
        }
      ],
      entries: [
        { id: "entry1", habitId: "habit1", date: "2026-02-10", status: "done", note: "Test entry" }
      ]
    };
    
    const pushRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(testData)
    });
    
    const pushData = await pushRes.json();
    console.log('Push Status:', pushRes.status);
    console.log('Push Response:', pushData);
    
    if (!pushRes.ok) {
      console.log('❌ Push failed');
      return;
    }
    
    console.log('✅ Data pushed successfully!');
    
    // Step 3: Pull data to verify it was saved
    console.log('\n3. Pulling data to verify...');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('Pull Status:', pullRes.status);
    console.log('Pulled Categories:', pullData.categories?.length || 0);
    console.log('Pulled Habits:', pullData.habits?.length || 0);
    console.log('Pulled Entries:', pullData.entries?.length || 0);
    
    if (!pullRes.ok) {
      console.log('❌ Pull failed');
      return;
    }
    
    console.log('✅ Data pulled successfully!');
    
    // Step 4: Logout
    console.log('\n4. Logging out...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { 'Cookie': setCookieHeader }
    });
    
    const logoutData = await logoutRes.json();
    console.log('Logout Status:', logoutRes.status);
    
    if (!logoutRes.ok) {
      console.log('❌ Logout failed');
      return;
    }
    
    console.log('✅ Logout successful!');
    
    // Step 5: Login again
    console.log('\n5. Logging in again...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    
    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful!');
    
    // Step 6: Pull data after re-login
    console.log('\n6. Pulling data after re-login...');
    const setCookieHeader2 = loginRes.headers.get('set-cookie');
    const pullRes2 = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader2 }
    });
    
    const pullData2 = await pullRes2.json();
    console.log('Pull Status 2:', pullRes2.status);
    console.log('Pulled Categories 2:', pullData2.categories?.length || 0);
    console.log('Pulled Habits 2:', pullData2.habits?.length || 0);
    console.log('Pulled Entries 2:', pullData2.entries?.length || 0);
    
    if (!pullRes2.ok) {
      console.log('❌ Pull after re-login failed');
      return;
    }
    
    // Step 7: Verify data persistence
    console.log('\n7. Verifying data persistence...');
    const dataPersisted = 
      pullData2.categories.length >= 2 &&
      pullData2.habits.length >= 1 &&
      pullData2.entries.length >= 1;
    
    if (dataPersisted) {
      console.log('✅ Data persisted across login sessions!');
      console.log('\n🎉 DATA PERSISTENCE TEST PASSED!');
      console.log('✅ Your changes are now saved and restored after re-login');
      console.log('✅ Push and Pull functionality working correctly');
    } else {
      console.log('❌ Data persistence failed');
      console.log('Expected: Categories >= 2, Habits >= 1, Entries >= 1');
      console.log('Got:', {
        categories: pullData2.categories.length,
        habits: pullData2.habits.length,
        entries: pullData2.entries.length
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testDataPersistence();
