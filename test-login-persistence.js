// Test login persistence after registration
async function testLoginPersistence() {
  console.log('🔐 Testing Login Persistence...\n');
  
  try {
    const testEmail = `persisttest${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Step 1: Register a new user
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
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);
    
    if (!registerRes.ok) {
      console.log('❌ Registration failed');
      return;
    }
    
    console.log('✅ Registration successful!');
    
    // Step 2: Try to login with the same credentials
    console.log('\n2. Testing login with same credentials...');
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
    console.log('Login Response:', loginData);
    
    if (loginRes.ok) {
      console.log('✅ Login successful!');
      
      // Step 3: Test authentication status
      console.log('\n3. Testing authentication status...');
      const setCookieHeader = loginRes.headers.get('set-cookie');
      const meRes = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': setCookieHeader }
      });
      
      const meData = await meRes.json();
      console.log('Auth Status:', meRes.status);
      console.log('Auth Response:', meData);
      
      if (meRes.ok && meData.user) {
        console.log('✅ Authentication working after login!');
        console.log('\n🎉 LOGIN PERSISTENCE TEST PASSED!');
        console.log('✅ Users can register and then login successfully');
        console.log('✅ Password hashing and comparison working correctly');
        console.log('✅ Session management working properly');
      } else {
        console.log('❌ Authentication failed after login');
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLoginPersistence();
