const axios = require('axios');

async function testRegister() {
  try {
    console.log('🔍 회원가입 테스트 시작...\n');
    
    const timestamp = Date.now();
    const userData = {
      username: `user${timestamp}`,
      email: `user${timestamp}@test.com`,
      password: 'password123',
      phone: '010-1234-5678'
    };
    
    console.log('회원가입 시도:', userData.username, userData.email);
    
    const response = await axios.post('http://localhost:5000/api/users/register', userData);
    
    console.log('✅ 회원가입 성공!');
    console.log('응답:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 회원가입 실패:');
    console.error('오류:', error.response?.data || error.message);
  }
}

testRegister();
