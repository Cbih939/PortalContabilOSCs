import axios from 'axios';

async function testApi() {
  try {
    // We don't have a valid token, but we can test if the route exists by checking if it returns 401 instead of 404
    const res = await axios.get('http://localhost:3000/api/reports/charts', {
      validateStatus: () => true
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testApi();
