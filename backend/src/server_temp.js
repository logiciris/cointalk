const app = require('./app');
const config = require('./config/config');

// 데이터베이스 없이 서버 시작
const startServer = async () => {
  try {
    // 서버 실행
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      console.log(`🚀 CoinTalk API 서버가 포트 ${PORT}에서 실행 중입니다. (DB 없이)`);
      console.log(`📁 환경: ${config.server.env}`);
      console.log('🔗 API 문서: http://localhost:' + PORT + '/api/debug');
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

startServer();
