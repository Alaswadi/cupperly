const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@demo.com',
      password: 'demo123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'demo'
      },
      withCredentials: true
    });

    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed!');
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testLogin();
