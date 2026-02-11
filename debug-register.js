// Simple test for register endpoint
const testRegister = async () => {
  try {
    console.log('Testing register endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test123@example.com',
        password: 'testpassword123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);
    } catch (e) {
      console.error('JSON parse error:', e);
    }
    
  } catch (error) {
    console.error('Request error:', error);
  }
};

testRegister();
