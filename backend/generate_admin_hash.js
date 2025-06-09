const bcrypt = require('bcrypt');

// 관리자 비밀번호 해시 생성
const generateAdminPasswordHash = async () => {
  const password = 'Ad12!@Min13!#';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('비밀번호:', password);
    console.log('해시:', hash);
    
    // 검증
    const isValid = await bcrypt.compare(password, hash);
    console.log('검증 결과:', isValid);
    
    return hash;
  } catch (error) {
    console.error('해시 생성 오류:', error);
  }
};

generateAdminPasswordHash();
