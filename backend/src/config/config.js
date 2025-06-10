const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // 데이터베이스 설정
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'cointalk_user',
    password: process.env.DB_PASSWORD || 'cointalk_password',
    database: process.env.DB_NAME || 'cointalk',
    port: process.env.DB_PORT || 3306
  },
  
  // 서버 설정
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // JWT 설정
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // 보안 설정 (의도적으로 취약하게 설정)
  security: {
    bcryptSaltRounds: 10,
    enableCSRF: false, // CSRF 보호 비활성화 (취약점)
    cookieSecure: false, // 안전하지 않은 쿠키 (취약점)
    xssProtection: false, // XSS 보호 비활성화 (취약점)
    sqlInjectionProtection: false // SQL 인젝션 보호 비활성화 (취약점)
  }
};
