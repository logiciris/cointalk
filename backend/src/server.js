const app = require('./app');
const config = require('./config/config');
const database = require('./utils/database');

// 데이터베이스 연결 확인 후 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    const dbConnected = await database.testConnection();
    if (!dbConnected) {
      console.error('❌ 데이터베이스 연결에 실패했습니다. 서버를 시작할 수 없습니다.');
      process.exit(1);
    }

    // 서버 실행
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      console.log(`🚀 CoinTalk API 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📁 환경: ${config.server.env}`);
      console.log(`🗄️  데이터베이스: ${config.database.host}:${config.database.port}/${config.database.database}`);
      
      // 의도적인 보안 설정 로그
      console.log('\n🔒 보안 설정:');
      console.log(`   CSRF 보호: ${config.security.enableCSRF ? '✅ 활성화' : '❌ 비활성화'}`);
      console.log(`   XSS 보호: ${config.security.xssProtection ? '✅ 활성화' : '❌ 비활성화'}`);
      console.log(`   SQL 인젝션 보호: ${config.security.sqlInjectionProtection ? '✅ 활성화' : '❌ 비활성화'}`);
      console.log(`   쿠키 보안: ${config.security.cookieSecure ? '✅ 활성화' : '❌ 비활성화'}`);
      
      // 의도적인 보안 경고 출력
      if (!config.security.enableCSRF) {
        console.warn('\n⚠️  경고: CSRF 보호가 비활성화되어 있습니다.');
      }
      if (!config.security.xssProtection) {
        console.warn('⚠️  경고: XSS 보호가 비활성화되어 있습니다.');
      }
      if (!config.security.sqlInjectionProtection) {
        console.warn('⚠️  경고: SQL 인젝션 보호가 비활성화되어 있습니다.');
      }
      if (!config.security.cookieSecure) {
        console.warn('⚠️  경고: 쿠키 보안이 비활성화되어 있습니다.');
      }
      
      console.log('\n⚠️  주의: 이 서버는 취약점 학습 목적으로 의도적으로 보안이 약화되어 있습니다.');
      console.log('🔗 API 문서: http://localhost:' + PORT + '/api/debug');
      console.log('');
    });

    // Graceful shutdown 처리
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
      server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
      server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('💥 서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
};

// 처리되지 않은 예외 처리
process.on('uncaughtException', (err) => {
  console.error('💥 처리되지 않은 예외:', err);
  console.log('서버를 종료합니다...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 처리되지 않은 Promise 거부:', reason);
  console.log('서버를 종료합니다...');
  process.exit(1);
});

// 서버 시작
startServer();

module.exports = { startServer };
