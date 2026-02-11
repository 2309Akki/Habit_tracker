// Complete authentication system test
async function testCompleteAuth() {
  console.log('🧪 Testing Complete Authentication System...\n');
  
  try {
    // Test 1: Register new user
    console.log('1. Registering new user...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `testuser${Date.now()}@example.com`,
        password: 'testpassword123'
      })
    });
    
    const registerData = await registerRes.json();
    if (!registerRes.ok) {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }
    
    console.log('✅ Registration successful!');
    
    // Extract session token
    const setCookieHeader = registerRes.headers.get('set-cookie');
    const sessionMatch = setCookieHeader?.match(/ht_session=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;
    
    if (!sessionToken) {
      console.log('❌ No session token found');
      return;
    }
    
    console.log('Session token:', sessionToken);
    
    // Test 2: Check authentication status
    console.log('\n2. Checking authentication status...');
    const meRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const meData = await meRes.json();
    console.log('Auth Status:', meRes.status);
    console.log('Auth Response:', meData);
    
    if (!meRes.ok || !meData.user) {
      console.log('❌ Authentication check failed');
      return;
    }
    
    console.log('✅ User is authenticated');
    
    // Test 3: Logout
    console.log('\n3. Testing logout...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': setCookieHeader
      }
    });
    
    const logoutData = await logoutRes.json();
    console.log('Logout Status:', logoutRes.status);
    console.log('Logout Response:', logoutData);
    
    if (!logoutRes.ok) {
      console.log('❌ Logout failed:', logoutData.error);
      return;
    }
    
    console.log('✅ Logout successful!');
    
    // Test 4: Verify session is cleared
    console.log('\n4. Verifying session is cleared...');
    const meRes2 = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const meData2 = await meRes2.json();
    console.log('Auth Status 2:', meRes2.status);
    console.log('Auth Response 2:', meData2);
    
    if (meRes2.ok && !meData2.user) {
      console.log('✅ Session cleared successfully!');
      console.log('\n🎯 COMPLETE AUTHENTICATION SYSTEM IS WORKING PERFECTLY!');
      console.log('\n📱 Multi-user habit tracker is ready for production!');
    } else {
      console.log('❌ Session still active');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCompleteAuth();
