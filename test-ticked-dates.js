// TEST TICKED DATES PRESERVATION
async function testTickedDates() {
  console.log('🎯 TESTING TICKED DATES PRESERVATION...\n');
  
  try {
    const testEmail = `ticked${Date.now()}@example.com`;
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
    
    // Step 2: Save habits with TICKED DATES (frontend format)
    console.log('\n2. Saving habits with TICKED DATES...');
    const habitsWithEntries = {
      categories: [],
      habits: [
        {
          id: 'habit_exercise',
          name: 'Exercise',
          description: 'Daily workout',
          categoryId: 'health',
          frequency: 'daily',
          weeklyDays: [],
          monthlyDay: null,
          color: '#f97316',
          reminderTime: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'habit_meditation',
          name: 'Meditation',
          description: 'Daily meditation',
          categoryId: 'health',
          frequency: 'daily',
          weeklyDays: [],
          monthlyDay: null,
          color: '#3b82f6',
          reminderTime: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      entries: [
        {
          id: 'entry_exercise_1',
          habitId: 'habit_exercise',
          date: '2026-02-10',
          status: 'done',
          note: 'Completed workout',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'entry_exercise_2',
          habitId: 'habit_exercise',
          date: '2026-02-12',
          status: 'done',
          note: 'Great workout',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'entry_meditation_1',
          habitId: 'habit_meditation',
          date: '2026-02-11',
          status: 'done',
          note: 'Peaceful meditation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    
    const saveRes = await fetch('http://localhost:3000/api/sync/replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      },
      body: JSON.stringify(habitsWithEntries)
    });
    
    const saveData = await saveRes.json();
    console.log('✅ Save Response:', saveData);
    
    // Step 3: Pull and verify TICKED DATES are preserved
    console.log('\n3. Pulling and verifying TICKED DATES...');
    const pullRes = await fetch('http://localhost:3000/api/sync/pull', {
      method: 'GET',
      headers: { 'Cookie': setCookieHeader }
    });
    
    const pullData = await pullRes.json();
    console.log('✅ Pull Response:', pullData);
    
    // Step 4: Verify ticked dates preservation
    console.log('\n4. Verifying ticked dates preservation...');
    
    if (pullData.habits && pullData.entries) {
      const exerciseEntries = pullData.entries.filter((entry) => 
        entry.habitId === 'habit_exercise'
      );
      const meditationEntries = pullData.entries.filter((entry) => 
        entry.habitId === 'habit_meditation'
      );
      
      console.log('📅 Exercise entries found:', exerciseEntries.length);
      console.log('📅 Exercise dates:', exerciseEntries.map((e) => e.date));
      
      console.log('📅 Meditation entries found:', meditationEntries.length);
      console.log('📅 Meditation dates:', meditationEntries.map((e) => e.date));
      
      const exerciseDatesCorrect = exerciseEntries.length === 2 && 
        exerciseEntries.some((e) => e.date === '2026-02-10') &&
        exerciseEntries.some((e) => e.date === '2026-02-12');
      
      const meditationDatesCorrect = meditationEntries.length === 1 && 
        meditationEntries.some((e) => e.date === '2026-02-11');
      
      if (exerciseDatesCorrect && meditationDatesCorrect) {
        console.log('\n🎉 SUCCESS: Ticked dates preserved perfectly!');
        console.log('✅ Exercise dates preserved: 2026-02-10, 2026-02-12');
        console.log('✅ Meditation dates preserved: 2026-02-11');
        console.log('✅ All entries converted back correctly');
        console.log('✅ Your simple schema working with ticked dates!');
        console.log('\n🚀 Your habit tracker now preserves all ticked dates!');
      } else {
        console.log('\n❌ Ticked dates not preserved correctly');
        console.log('Expected Exercise dates: 2026-02-10, 2026-02-12');
        console.log('Expected Meditation dates: 2026-02-11');
      }
    } else {
      console.log('\n❌ No habits or entries retrieved');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testTickedDates();
