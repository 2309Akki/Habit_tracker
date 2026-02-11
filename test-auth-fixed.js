// Test fixed authentication
async function testAuth() {
  console.log('🧪 Testing Fixed Authentication...\n');
  
  try {
    // Test registration with valid data
    console.log('1. Testing Registration...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123'
      })
    });
    
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);
    
    if (registerRes.ok) {
      console.log('✅ Registration successful!');
      
      // Test login with same credentials
      console.log('\n2. Testing Login...');
      const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpassword123'
        })
      });
      
      const loginData = await loginRes.json();
      console.log('Login Status:', loginRes.status);
      console.log('Login Response:', loginData);
      
      if (loginRes.ok) {
        console.log('✅ Login successful!');
        console.log('\n🎯 Authentication system is working perfectly!');
      } else {
        console.log('❌ Login failed:', loginData.error);
      }
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuth();
