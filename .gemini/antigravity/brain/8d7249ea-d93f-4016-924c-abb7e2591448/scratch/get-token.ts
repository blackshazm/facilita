async function main() {
  const phone = '+5511999999999';
  const code = '123456'; 
  
  try {
    const res = await fetch('http://localhost:3333/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone, 
        code,
        deviceId: 'test-device-id'
      })
    });
    
    const data: any = await res.json();
    if (data.accessToken) {
      console.log('TOKEN:' + data.accessToken);
    } else {
      console.log('Error:', JSON.stringify(data));
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();
