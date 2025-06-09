const crypto = require('crypto');

// 간단한 해시 생성 (테스트용)
const password = 'Ad12!@Min13!#';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('SHA256 hash:', hash);

// bcrypt 대신 사용할 수 있는 해시
const bcrypt = require('bcryptjs');
const bcryptHash = bcrypt.hashSync(password, 10);
console.log('BCrypt hash:', bcryptHash);
