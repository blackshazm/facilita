const axios = require('axios');

async function createTestUser() {
  try {
    // 1. Request OTP (simulated/bypassed in dev if configured, but let's try)
    // Actually, let's just use the direct database insertion if we can, 
    // or call the verify-otp endpoint if the service allows a bypass.
    
    const baseUrl = 'http://localhost:3333';
    
    console.log('Registering test user...');
    const regResponse = await axios.post(`${baseUrl}/auth/otp/verify`, {
      phone: '5511999999999',
      code: '123456', // Assuming bypass in dev or fixed OTP
      deviceId: 'test-device-id'
    });
    
    console.log('Registration successful:', regResponse.data);
    return regResponse.data.accessToken;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
  }
}

createTestUser();
