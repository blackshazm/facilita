import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjI5NjdmMi1hM2JhLTQ1NjctODA4OS04YWUwZWI2ZmZlNDEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NzgzMTE1NTAsImV4cCI6MTc3ODkxNjM1MH0.8iA_n_83ljr2S6bDCPHU4NkTxt_YSXGCRb78-huEC50';
const batchId = '89d8937e-42ee-4b0c-b7f9-a077b49e2259';

async function check() {
  try {
    const res = await axios.get('http://localhost:3333/admin/payouts/batch/' + batchId, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Batch Status:', res.data.status);
    console.log('Batch Progress:', res.data.processedCount + '/' + res.data.totalCount);
  } catch (err: any) {
    console.error('Check Failed:', err.response?.data || err.message);
  }
}

check();
