const axios = require('axios');

async function testCreatePost() {
  try {
    // 1. 로그인 요청
    console.log('로그인 시도...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    if (!loginResponse.data.success) {
      console.error('로그인 실패:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('로그인 성공, 토큰 획득:', token);
    
    // 2. 게시물 작성 요청
    console.log('게시물 작성 시도...');
    const postData = {
      title: '테스트 스크립트로 작성된 게시물',
      content: '이 게시물은 테스트 스크립트를 통해 작성되었습니다.',
      tags: ['테스트', '자동화'],
      allowHtml: true
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/posts', postData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('게시물 작성 결과:', createResponse.data);
  } catch (error) {
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('오류 응답:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청이 전송됐지만 응답이 없는 경우
      console.error('응답 없음:', error.request);
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('요청 오류:', error.message);
    }
  }
}

testCreatePost();
