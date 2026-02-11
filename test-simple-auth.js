// Simple authentication test
async function testAuth() {
  console.log('🧪 Testing Authentication...');
  
  try {
    // Test registration
    console.log('\n1. Testing Registration...');
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
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuth();
