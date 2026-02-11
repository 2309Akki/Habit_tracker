// Test authentication endpoints
const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    const data = await response.json();
    console.log('Register response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Register error:', error);
  }
};

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Test the endpoints
testRegister();
testLogin();
