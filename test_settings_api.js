// 설정 저장 테스트
async function testSettingsSave() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('로그인이 필요합니다.');
      return;
    }
    
    console.log('토큰:', token);
    
    const testSettings = {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        posts: true
      }
    };
    
    console.log('전송할 설정:', testSettings);
    
    const response = await fetch('http://localhost:5000/api/settings/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ settings: testSettings })
    });
    
    console.log('응답 상태:', response.status);
    
    const data = await response.json();
    console.log('응답 데이터:', data);
    
    if (data.success) {
      console.log('✅ 설정 저장 성공!');
    } else {
      console.log('❌ 설정 저장 실패:', data.message);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 설정 로드 테스트
async function testSettingsLoad() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/settings/preferences', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('로드된 설정:', data);
    
  } catch (error) {
    console.error('설정 로드 오류:', error);
  }
}

console.log('테스트 함수들이 준비되었습니다.');
console.log('testSettingsSave() - 설정 저장 테스트');
console.log('testSettingsLoad() - 설정 로드 테스트');
