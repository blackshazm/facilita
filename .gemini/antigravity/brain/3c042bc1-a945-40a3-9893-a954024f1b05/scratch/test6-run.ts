import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjI5NjdmMi1hM2JhLTQ1NjctODA4OS04YWUwZWI2ZmZlNDEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NzgzMTE1NTAsImV4cCI6MTc3ODkxNjM1MH0.8iA_n_83ljr2S6bDCPHU4NkTxt_YSXGCRb78-huEC50';
const payoutId = 'f65a8d6a-7566-4d88-a6c9-a87f4da63657';

async function test6() {
  try {
    console.log('Testing POST /admin/payouts/batch with expensive ID...');
    const res = await axios.post('http://localhost:3333/admin/payouts/batch', 
      { payoutIds: [payoutId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const batchId = res.data;
    console.log('Batch Created ID:', batchId);

    // Wait for worker
    await new Promise(r => setTimeout(r, 5000));

    console.log('\nTesting GET /admin/payouts/batch/' + batchId + '...');
    const res4 = await axios.get('http://localhost:3333/admin/payouts/batch/' + batchId, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Batch Status:', res4.data.status);
    console.log('Error Message:', res4.data.errorMessage);
  } catch (err: any) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

test6();
