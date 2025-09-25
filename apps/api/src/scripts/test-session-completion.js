const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSessionCompletion() {
  try {
    console.log('🧪 Testing session auto-completion...');

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

    const sessionId = 'cmfpph4z70004bc2w9dtnynkz';
    const sampleId = 'cmfppgeyc0001bc2wjh9cl9jc';

    // First, check current session status
    const sessionResponse = await axios.get(`${API_BASE}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': 'demo'
      }
    });

    console.log('📊 Current session status:', sessionResponse.data.data.status);
    console.log('👥 Participants:', sessionResponse.data.data.participants?.length || 0);
    console.log('☕ Samples:', sessionResponse.data.data.sessionSamples?.length || 0);

    // Submit a final score (isSubmitted: true)
    const scoreData = {
      aroma: 8.0,
      flavor: 8.25,
      aftertaste: 7.75,
      acidity: 8.5,
      body: 7.5,
      balance: 8.0,
      sweetness: 8.75,
      cleanliness: 9.0,
      uniformity: 9.0,
      overall: 8.25,
      notes: 'Final submission to test auto-completion',
      privateNotes: 'Testing session completion logic',
      flavorDescriptors: [
        {
          id: 'cmfqjjq7q0001i0y4pq318vr1', // Fruity
          intensity: 4
        }
      ],
      isComplete: true,
      isSubmitted: true // This should trigger auto-completion check
    };

    console.log('📝 Submitting final score...');
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

    console.log('✅ Score submitted successfully');
    console.log('📊 Score status:', {
      isComplete: submissionResponse.data.data.isComplete,
      isSubmitted: submissionResponse.data.data.isSubmitted,
      submittedAt: submissionResponse.data.data.submittedAt
    });

    // Wait a moment for auto-completion to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check session status again
    const updatedSessionResponse = await axios.get(`${API_BASE}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': 'demo'
      }
    });

    console.log('🔄 Updated session status:', updatedSessionResponse.data.data.status);
    if (updatedSessionResponse.data.data.completedAt) {
      console.log('🎉 Session completed at:', updatedSessionResponse.data.data.completedAt);
    }

    // Check how many scores are submitted
    const scoresResponse = await axios.get(`${API_BASE}/sessions/${sessionId}/scores`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': 'demo'
      }
    });

    const submittedScores = scoresResponse.data.data.filter(score => score.isSubmitted);
    console.log('📈 Submitted scores:', submittedScores.length);
    console.log('📊 Total scores:', scoresResponse.data.data.length);

  } catch (error) {
    console.error('❌ Error testing session completion:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSessionCompletion();
