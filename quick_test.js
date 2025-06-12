const axios = require('axios');

async function testAuth() {
  try {
    // 로그인해서 토큰 받기
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('토큰:', token);
    
    // 취약한 엔드포인트 테스트
    console.log('\n1. 정상 접근 시도:');
    try {
      const normalResponse = await axios.get('http://localhost:5000/api/test-vuln/unsafe-admin-test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('성공:', normalResponse.data);
    } catch (error) {
      console.log('실패:', error.response.data.message);
    }
    
    // role 파라미터로 우회 시도
    console.log('\n2. role=admin 파라미터로 우회 시도:');
    try {
      const bypassResponse = await axios.get('http://localhost:5000/api/test-vuln/unsafe-admin-test?role=admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🚨 우회 성공!', bypassResponse.data);
    } catch (error) {
      console.log('우회 실패:', error.response.data.message);
    }
    
  } catch (error) {
    console.error('오류:', error.response?.data || error.message);
  }
}

testAuth();
