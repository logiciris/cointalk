const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');

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
const settingsRoutes = require('./routes/settings');
const recursiveRoutes = require('./routes/recursive');

// 미들웨어 임포트
const { authenticate, optionalAuth } = require('./middlewares/auth');

// 환경 변수 설정
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost',
    'http://localhost:80'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// UTF-8 인코딩 및 CORS 설정을 위한 커스텀 미들웨어
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  
  next();
});

// 세션 설정
app.use(
  session({
    secret: config.session?.secret || config.jwt.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'strict'
    },
    name: 'cointalk_session'
  })
);

// JSON 응답 처리 개선
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(obj) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    
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

app.use('/api/settings', settingsRoutes);
app.use('/api/recursive', recursiveRoutes);

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '1d'
}));

app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

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

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('에러 발생:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '서버 오류가 발생했습니다.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { error: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

module.exports = app;
