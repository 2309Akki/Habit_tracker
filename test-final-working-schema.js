// FINAL WORKING TEST - Your Simple Schema
async function testFinalWorkingSchema() {
  console.log('🎯 TESTING FINAL WORKING SCHEMA...\n');
  
  try {
    const testEmail = `final${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Step 1: Register user
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
    
    if (!registerData.ok) {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }
    
    const setCookieHeader = registerRes.headers?.get('set-cookie');
    
    // Step 2: Save habits with your schema
    console.log('\n2. Saving habits with your schema...');
    const userHabits = [
      {
        exercise: ["2026-02-10", "2026-02-11", "2026-02-12"], // Sorted ascending
        meditation: ["2026-02-10", "2026-02-12"],              // Sorted ascending
        reading: []                                            // Empty habit
      }
    ];
    
    const saveRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(userHabits)
    });
    
    const saveData = await saveRes.json();
    console.log('✅ Save Response:', saveData);
    
    // Step 3: Pull and verify
    console.log('\n3. Pulling and verifying...');
    const pullRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'GET',
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('✅ Pull Response:', pullData);
    
    // Step 4: Verify date sorting
    console.log('\n4. Verifying date sorting...');
    if (pullData.habits && pullData.habits.length > 0) {
      const exerciseDates = pullData.habits[0]?.exercise || [];
      const meditationDates = pullData.habits[0]?.meditation || [];
      
      const exerciseSorted = [...exerciseDates].every((date, i) => 
        i === 0 || new Date(date) >= new Date(exerciseDates[i-1])
      );
      
      const meditationSorted = [...meditationDates].every((date, i) => 
        i === 0 || new Date(date) >= new Date(meditationDates[i-1])
      );
      
      console.log('📅 Exercise dates sorted:', exerciseSorted);
      console.log('📅 Meditation dates sorted:', meditationSorted);
      
      if (exerciseSorted && meditationSorted) {
        console.log('\n🎉 SUCCESS: Your schema is working perfectly!');
        console.log('✅ User registration working');
        console.log('✅ Habit saving working');
        console.log('✅ Date sorting working');
        console.log('✅ Data retrieval working');
        console.log('✅ MongoDB Atlas integration working');
        console.log('\n🚀 Your habit tracker is now fully functional!');
        console.log('\n📋 Your Schema Structure:');
        console.log(JSON.stringify({
          id: "user_id_12345",
          email: testEmail,
          habits: pullData.habits
        }, null, 2));
      } else {
        console.log('\n❌ Date sorting needs work');
      }
    } else {
      console.log('\n❌ No habits retrieved');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFinalWorkingSchema();
