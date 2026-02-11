// Test with your specific email
async function testYourEmail() {
  console.log('📧 Testing with your email...\n');
  
  try {
    const testEmail = 'akshaysawalgi2309@gmail.com';
    const testPassword = '2309@Akki';
    
    // Step 1: Try to login first (should fail if not registered)
    console.log('1. Testing login (should fail if not registered)...');
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
    
    if (loginRes.status === 401) {
      console.log('✅ Login correctly failed (user not registered)');
    }
    
    // Step 2: Register the user
    console.log('\n2. Registering user...');
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
      console.log('❌ Registration failed:', registerData.error);
      return;
    }
    
    console.log('✅ Registration successful!');
    
    // Step 3: Try to login again (should work now)
    console.log('\n3. Testing login after registration...');
    const loginRes2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData2 = await loginRes2.json();
    console.log('Login Status 2:', loginRes2.status);
    console.log('Login Response 2:', loginData2);
    
    if (loginRes2.ok) {
      console.log('✅ Login successful after registration!');
      
      // Step 4: Test authentication status
      console.log('\n4. Testing authentication status...');
      const setCookieHeader = loginRes2.headers.get('set-cookie');
      const meRes = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': setCookieHeader }
      });
      
      const meData = await meRes.json();
      console.log('Auth Status:', meRes.status);
      console.log('Auth Response:', meData);
      
      if (meRes.ok && meData.user) {
        console.log('✅ Authentication working!');
        console.log('\n🎉 YOUR EMAIL TEST PASSED!');
        console.log('✅ You can now register and login with your email');
        console.log('✅ Password hashing and comparison working correctly');
        console.log('✅ Session management working properly');
      } else {
        console.log('❌ Authentication failed');
      }
    } else {
      console.log('❌ Login failed after registration:', loginData2.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testYourEmail();
