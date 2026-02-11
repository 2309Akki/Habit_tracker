// COMPLETE SOLUTION TEST
async function testCompleteSolution() {
  console.log('🎯 TESTING COMPLETE SOLUTION...\n');
  
  try {
    const testEmail = `complete${Date.now()}@example.com`;
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
    console.log('✅ Register Response:', registerData);
    
    // Step 2: Save complete data structure
    console.log('\n2. Saving complete data...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    
    const completeData = {
      categories: [
        { id: "health", name: "Health", color: "#22c55e" },
        { id: "work", name: "Work", color: "#3b82f6" }
      ],
      habits: [
        { 
          id: "exercise", 
          name: "Exercise", 
          description: "Daily exercise", 
          categoryId: "health", // String name - will be mapped to ObjectId
          frequency: "daily", 
          weeklyDays: [], 
          monthlyDay: null, 
          color: "#f97316", 
          reminderTime: null 
        }
      ],
      entries: [
        { 
          id: "entry1", 
          habitId: "exercise", // String name - will be mapped to ObjectId
          date: "2026-02-11", 
          status: "done", 
          note: "Completed workout" 
        }
      ]
    };
    
    const saveRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(completeData)
    });
    
    const saveData = await saveRes.json();
    console.log('✅ Save Response:', saveData);
    
    // Step 3: Pull and verify
    console.log('\n3. Pulling and verifying...');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('✅ Pull Response:', {
      categories: pullData.categories?.length || 0,
      habits: pullData.habits?.length || 0,
      entries: pullData.entries?.length || 0
    });
    
    // Step 4: Verify data integrity
    console.log('\n4. Verifying data integrity...');
    if (pullData.categories?.length > 0 && pullData.habits?.length > 0 && pullData.entries?.length > 0) {
      console.log('🎉 SUCCESS: Complete solution working!');
      console.log('📁 Categories:', pullData.categories.map(c => `${c.name} (${c.id})`));
      console.log('🎯 Habits:', pullData.habits.map(h => `${h.name} -> ${h.categoryId}`));
      console.log('📝 Entries:', pullData.entries.map(e => `${e.habitId} on ${e.date} (${e.status})`));
      
      // Step 5: Test logout/login persistence
      console.log('\n5. Testing logout/login persistence...');
      
      // Logout
      const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Cookie': setCookieHeader }
      });
      
      console.log('🚪 Logout Response:', await logoutRes.json());
      
      // Login again
      const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      
      const loginData = await loginRes.json();
      const loginCookie = loginRes.headers?.get('set-cookie');
      
      console.log('🔑 Login Response:', loginData);
      
      // Pull after re-login
      const finalPullRes = await fetch('http://localhost:3000/api/sync/pull', {
        headers: { 'Cookie': loginCookie }
      });
      
      const finalPullData = await finalPullRes.json();
      console.log('🔄 Final Pull After Re-login:', {
        categories: finalPullData.categories?.length || 0,
        habits: finalPullData.habits?.length || 0,
        entries: finalPullData.entries?.length || 0
      });
      
      if (finalPullData.categories?.length > 0 && finalPullData.habits?.length > 0 && finalPullData.entries?.length > 0) {
        console.log('\n🏆 COMPLETE SUCCESS: Full data persistence working!');
        console.log('✅ Your habit tracker is now fully functional with MongoDB Atlas!');
      } else {
        console.log('\n❌ Partial success: Login persistence needs work');
      }
      
    } else {
      console.log('\n❌ FAILURE: Data not saved correctly');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCompleteSolution();
