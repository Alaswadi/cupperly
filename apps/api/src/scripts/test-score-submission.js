const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testScoreSubmission() {
  try {
    console.log('🧪 Testing score submission API...');

    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@demo.com',
      password: 'demo123'
    }, {
      headers: {
        'X-Tenant-ID': 'demo'
      }
    });

    const token = loginResponse.data.data?.tokens?.accessToken;
    if (!token) {
      console.error('❌ No access token in response');
      return;
    }
    console.log('✅ Login successful, got access token');

    // Test score submission endpoint
    const sessionId = 'cmfpph4z70004bc2w9dtnynkz';
    const sampleId = 'cmfppgeyc0001bc2wjh9cl9jc';
    
    const scoreData = {
      // Individual score fields (quarter-point increments)
      aroma: 7.5,
      flavor: 8.0,
      aftertaste: 7.75,
      acidity: 8.25,
      body: 7.5,
      balance: 8.0,
      sweetness: 8.5,
      cleanliness: 9.0,
      uniformity: 9.0,
      overall: 8.0,
      notes: 'Test submission with flavor descriptors',
      privateNotes: 'Private test notes',
      flavorDescriptors: [
        {
          id: 'cmfqjjq7q0001i0y4pq318vr1', // Fruity
          intensity: 4
        },
        {
          id: 'cmfqjjq7q0006i0y4mdq35jut', // Chocolate
          intensity: 3
        }
      ],
      isComplete: true,
      isSubmitted: false // Save as draft first
    };

    const submissionResponse = await axios.post(
      `${API_BASE}/sessions/${sessionId}/samples/${sampleId}/score`,
      scoreData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'demo',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Score submission API response:');
    console.log('Status:', submissionResponse.status);
    console.log('Data:', JSON.stringify(submissionResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing score submission API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testScoreSubmission();
