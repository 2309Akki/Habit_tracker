// Test logout functionality
async function testLogout() {
  console.log('🧪 Testing Logout Functionality...\n');
  
  try {
    // First, register and login to get a session
    console.log('1. Registering new user...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `logouttest${Date.now()}@example.com`,
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
    
    // Test logout
    console.log('\n2. Testing logout...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': setCookieHeader
      }
    });
    
    const logoutData = await logoutRes.json();
    console.log('Logout Status:', logoutRes.status);
    console.log('Logout Response:', logoutData);
    
    if (logoutRes.ok) {
      console.log('✅ Logout successful!');
    } else {
      console.log('❌ Logout failed:', logoutData.error);
    }
    
    // Test if session is cleared
    console.log('\n3. Testing if session is cleared...');
    const meRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Cookie': setCookieHeader }
    });
    
    const meData = await meRes.json();
    console.log('Auth Status:', meRes.status);
    console.log('Auth Response:', meData);
    
    if (meRes.ok && !meData.user) {
      console.log('✅ Session cleared successfully!');
      console.log('\n🎯 Logout functionality is working perfectly!');
    } else {
      console.log('❌ Session still active');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogout();
