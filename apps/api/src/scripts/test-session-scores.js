const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSessionScores() {
  try {
    console.log('🧪 Testing session scores API...');

    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@demo.com',
      password: 'demo123'
    }, {
      headers: {
        'X-Tenant-ID': 'demo'
      }
    });

    console.log('✅ Login successful');
    console.log('🔍 Login response:', JSON.stringify(loginResponse.data, null, 2));

    const token = loginResponse.data.data?.tokens?.accessToken;
    if (!token) {
      console.error('❌ No access token in response');
      return;
    }
    console.log('🔍 Token preview:', token.substring(0, 50) + '...');

    // Test session scores endpoint
    const sessionId = 'cmfpph4z70004bc2w9dtnynkz'; // Use the session ID from the error logs
    
    const scoresResponse = await axios.get(`${API_BASE}/sessions/${sessionId}/scores`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': 'demo'
      }
    });

    console.log('✅ Session scores API response:');
    console.log('Status:', scoresResponse.status);
    console.log('Data:', JSON.stringify(scoresResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing session scores API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSessionScores();
