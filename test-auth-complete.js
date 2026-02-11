// Complete authentication test
const BASE_URL = 'http://localhost:3000';

async function testRegister() {
  console.log('\n=== Testing Registration ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser1@example.com',
        password: 'testpassword123'
      })
    });
    
    const data = await response.json();
    console.log('Register Status:', response.status);
    console.log('Register Response:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful');
      return data;
    } else {
      console.log('❌ Registration failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Register error:', error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser1@example.com',
        password: 'testpassword123'
      })
    });
    
    const data = await response.json();
    console.log('Login Status:', response.status);
    console.log('Login Response:', data);
    
    if (response.ok) {
      console.log('✅ Login successful');
      return data;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function testAuthStatus() {
  console.log('\n=== Testing Auth Status ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Auth Status:', response.status);
    console.log('Auth Response:', data);
    
    if (response.ok && data.user) {
      console.log('✅ User authenticated:', data.user.email);
      return true;
    } else {
      console.log('❌ User not authenticated');
      return false;
    }
  } catch (error) {
    console.error('❌ Auth status error:', error.message);
    return false;
  }
}

async function testDuplicateRegister() {
  console.log('\n=== Testing Duplicate Registration ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser1@example.com', // Same email
        password: 'differentpassword'
      })
    });
    
    const data = await response.json();
    console.log('Duplicate Register Status:', response.status);
    console.log('Duplicate Register Response:', data);
    
    if (response.status === 409) {
      console.log('✅ Duplicate registration correctly blocked');
      return true;
    } else {
      console.log('❌ Duplicate registration not handled properly');
      return false;
    }
  } catch (error) {
    console.error('❌ Duplicate register error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Authentication Tests...');
  
  // Test registration
  await testRegister();
  
  // Test authentication status after registration
  await testAuthStatus();
  
  // Test login
  await testLogin();
  
  // Test authentication status after login
  await testAuthStatus();
  
  // Test duplicate registration
  await testDuplicateRegister();
  
  console.log('\n🏁 Authentication Tests Complete');
}

runTests();
