const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');

// 의도적인 취약점: helmet 미사용 (보안 취약점 학습 목적)
// const helmet = require('helmet');

// 라우트 임포트
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const coinRoutes = require('./routes/coins');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const fileRoutes = require('./routes/files');
const i18nRoutes = require('./routes/i18n');
const adminRoutes = require('./routes/admin');
// Prototype Pollution 취약점 관련 라우트 추가
const settingsRoutes = require('./routes/settings');
const recursiveRoutes = require('./routes/recursive');

// 미들웨어 임포트
const { authenticate, optionalAuth } = require('./middlewares/auth');

// 환경 변수 설정
dotenv.config();

const app = express();

// 의도적인 취약점: 과도하게 허용적인 CORS 설정
app.use(cors({
  origin: true,  // 모든 오리진 허용 (취약점)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));  // 큰 JSON 페이로드 허용
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// UTF-8 인코딩 및 CORS 설정을 위한 커스텀 미들웨어
app.use((req, res, next) => {
  // UTF-8 인코딩 설정
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // CORS 헤더 재설정
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  
  next();
});

// 의도적인 보안 취약점들:
// 1. helmet 미사용 (보안 헤더 누락)
// 2. rate limiting 없음 (DDoS/브루트포스 공격에 취약)
// 3. input validation/sanitization 부족

// 세션 설정 (의도적으로 취약하게 설정)
app.use(
  session({
    secret: config.jwt.secret, // JWT 시크릿을 세션 시크릿으로도 사용 (취약점)
    resave: false,
    saveUninitialized: true,  // 의도적으로 true로 설정 (취약점)
    cookie: {
      secure: false,          // HTTPS 없이도 쿠키 전송 (취약점)
      httpOnly: false,        // XSS 공격에 취약
      maxAge: 1000 * 60 * 60 * 24, // 24시간
      sameSite: 'none'        // CSRF 공격에 취약
    },
    name: 'sessionId'         // 기본 세션 이름 사용하지 않음
  })
);

// JSON 응답 처리 개선
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(obj) {
    // UTF-8 인코딩 확실히 설정
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // JSON 문자열화 시 한글 유니코드 이스케이핑 방지
    const jsonString = JSON.stringify(obj, null, 0);
    this.send(jsonString);
  };
  next();
});

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', optionalAuth, postRoutes);
app.use('/api/comments', optionalAuth, commentRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/messages', authenticate, messageRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/admin', adminRoutes);

// Prototype Pollution 취약점 관련 라우트 추가
app.use('/api/settings', settingsRoutes);
app.use('/api/recursive', recursiveRoutes);

// 정적 파일 서빙 (의도적으로 취약한 설정)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'allow',        // 숨김 파일 허용 (취약점)
  index: false,
  maxAge: '1d'
}));

// 업로드된 파일에 직접 접근 가능 (취약점)
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// 의도적인 취약점: 민감한 정보 노출 엔드포인트
app.get('/api/debug', (req, res) => {
  const debugInfo = {
    environment: process.env.NODE_ENV,
    config: {
      database: config.database,
      jwt: config.jwt,
      security: config.security
    },
    serverInfo: {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      loadavg: require('os').loadavg(),
      cpus: require('os').cpus().length
    },
    routes: app._router.stack.map(r => ({
      path: r.route?.path,
      methods: r.route?.methods,
      regexp: r.regexp.toString()
    }))
  };
  
  res.json(debugInfo);
});

// 의도적인 취약점: 사용자 입력을 그대로 출력하는 엔드포인트 (XSS)
app.get('/api/echo/:message', (req, res) => {
  const message = req.params.message;
  res.send(`<h1>Echo: ${message}</h1>`); // XSS 취약점
});

// 의도적인 취약점: 파일 업로드 없이 경로 순회 테스트
app.get('/api/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const path = require('path');
  const fs = require('fs');
  
  // 경로 순회 공격에 취약한 파일 읽기
  const filePath = path.join(__dirname, 'files', filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ 
      error: '파일을 찾을 수 없습니다.',
      attemptedPath: filePath  // 경로 정보 노출 (취약점)
    });
  }
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 에러 핸들링 미들웨어 (의도적으로 취약하게 설정)
app.use((err, req, res, next) => {
  console.error('에러 발생:', err);
  
  // 의도적인 취약점: 상세한 에러 정보 노출 (Error-based SQL Injection을 위해 필요)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.',
    error: {
      stack: err.stack,
      details: err,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
      code: err.code
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

module.exports = app;