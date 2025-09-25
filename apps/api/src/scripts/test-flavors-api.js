const axios = require('axios');

async function testFlavorDescriptorsAPI() {
  try {
    console.log('🧪 Testing flavor descriptors API...');
    
    // First login to get auth token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@demo.com',
      password: 'demo123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'demo'
      },
      withCredentials: true
    });

    const accessToken = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Login successful, got access token');

    // Test GET flavor descriptors
    const flavorsResponse = await axios.get('http://localhost:3001/api/flavor-descriptors', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Tenant-ID': 'demo'
      }
    });

    console.log('✅ Flavor descriptors API response:');
    console.log('Status:', flavorsResponse.status);
    console.log('Data:', JSON.stringify(flavorsResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API call failed!');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testFlavorDescriptorsAPI();
