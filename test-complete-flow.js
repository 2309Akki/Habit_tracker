// Complete authentication flow test
async function testCompleteFlow() {
  console.log('🧪 Testing Complete Authentication Flow...\n');
  
  try {
    // Step 1: Register a new user
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
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);
    console.log('Register Response Headers:', Object.fromEntries(registerRes.headers.entries()));
    
    if (!registerRes.ok) {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }
    
    console.log('✅ Registration successful!');
    
    // Step 2: Check authentication status
    console.log('\n2. Checking authentication status...');
    const setCookieHeader = registerRes.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    // Extract session token from cookie for login test
    const sessionMatch = registerRes.headers.get('set-cookie')?.match(/ht_session=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;
    console.log('Session token from registration:', sessionToken);
    
    if (!sessionToken) {
      console.log('❌ No session token found in response');
      return;
    }
    
    // Step 3: Test login with same credentials
    console.log('\n3. Testing login with same credentials...');
    
    // Get the registered email from the registration response
    const registeredEmail = registerData.user?.email;
    console.log('registerData.user:', registerData.user);
    console.log('registeredEmail:', registeredEmail);
    
    if (!registeredEmail) {
      console.log('❌ No email found in registration response');
      return;
    }
    
    console.log('Using registered email for login:', registeredEmail);
    
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);
    
    if (loginRes.ok) {
      console.log('✅ Login successful!');
      
      // Step 4: Check auth status after login
      console.log('\n4. Checking auth status after login...');
      const meRes = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': loginRes.headers.get('set-cookie') }
      });
      
      const meData = await meRes.json();
      console.log('Auth Status:', meRes.status);
      console.log('Auth Response:', meData);
      
      if (meRes.ok && meData.user) {
        console.log('✅ Complete authentication flow working!');
        console.log('\n🎯 Multi-user authentication system is FULLY FUNCTIONAL!');
        console.log('\n📱 You can now test in the browser:');
        console.log('   - Go to http://localhost:3000');
        console.log('   - Click Settings tab');
        console.log('   - Try registering different users');
        console.log('   - Test login/logout functionality');
      } else {
        console.log('❌ Auth status check failed');
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCompleteFlow();
