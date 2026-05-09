import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjI5NjdmMi1hM2JhLTQ1NjctODA4OS04YWUwZWI2ZmZlNDEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NzgzMTE1NTAsImV4cCI6MTc3ODkxNjM1MH0.8iA_n_83ljr2S6bDCPHU4NkTxt_YSXGCRb78-huEC50';

async function test() {
  try {
    console.log('Testing GET /admin/payouts/balance...');
    const res = await axios.get('http://localhost:3333/admin/payouts/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response:', res.data);

    console.log('\nTesting GET /admin/payouts...');
    const res2 = await axios.get('http://localhost:3333/admin/payouts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Total Payouts:', res2.data.total);
    
    const pendingPayouts = res2.data.items.filter((p: any) => p.status === 'PENDING_APPROVAL');
    console.log('Pending Payouts:', pendingPayouts.length);

    if (pendingPayouts.length > 0) {
      const ids = pendingPayouts.slice(0, 3).map((p: any) => p.id);
      console.log('\nTesting POST /admin/payouts/batch with 3 IDs...');
      const res3 = await axios.post('http://localhost:3333/admin/payouts/batch', 
        { payoutIds: ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const batchId = res3.data;
      console.log('Batch Created ID:', batchId);

      console.log('\nTesting GET /admin/payouts/batch/' + batchId + '...');
      const res4 = await axios.get('http://localhost:3333/admin/payouts/batch/' + batchId, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Batch Status:', res4.data.status);
      console.log('Batch Progress:', res4.data.processedCount + '/' + res4.data.totalCount);
    }
  } catch (err: any) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

test();
