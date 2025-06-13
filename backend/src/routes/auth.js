const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const config = require('../config/config');
const database = require('../utils/database');
const crypto = require('crypto');
const twoFactorController = require('../controllers/twoFactorController');

// JWT 비밀 키
const JWT_SECRET = config.jwt.secret;

const loginAttempts = new Map();

// 회원가입 - userController 사용
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('사용자명은 3~20자 사이여야 합니다.')
      .isAlphanumeric()
      .withMessage('사용자명은 영문과 숫자만 포함할 수 있습니다.'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('유효한 이메일 주소를 입력하세요.'),
    body('phone')
      .optional({ checkFalsy: true })
      .matches(/^01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}$/)
      .withMessage('올바른 핸드폰 번호 형식을 입력하세요.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ],
  userController.register
);

// 로그인
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('유효한 이메일 주소를 입력하세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력하세요.')
  ],
  async (req, res) => {
    try {
      // 유효성 검사 오류 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: '입력값이 유효하지 않습니다.',
          errors: errors.array() 
        });
      }
      
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: '이메일 또는 비밀번호가 잘못되었습니다.' 
        });
      }
      
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        const attempts = loginAttempts.get(email) || 0;
        loginAttempts.set(email, attempts + 1);
        
        return res.status(401).json({ 
          success: false,
          message: '이메일 또는 비밀번호가 잘못되었습니다.'
        });
      }
      
      // 성공 시 로그인 시도 기록 초기화
      loginAttempts.delete(email);
      
      // 2차 인증 확인
      if (user.two_factor_enabled) {
        // 🚨 취약점: 1차 로그인 성공 시 이미 JWT 토큰 생성
        const token = jwt.sign(
          { 
            userId: user.id,
            username: user.username,
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: config.jwt.expiresIn }
        );
        
        // 2차 인증 세션 생성
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
        
        await database.query(
          'INSERT INTO two_factor_sessions (id, user_id, email, expires_at, token) VALUES (?, ?, ?, ?, ?)',
          [sessionId, user.id, user.email, expiresAt, token]
        );
        
        return res.json({
          success: true,
          requiresTwoFactor: true,
          sessionId: sessionId,
          token: token, // 🚨 1차 로그인에서 이미 토큰 발급
          message: '1차 인증 완료. 2차 인증을 진행하세요.',
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
      
      // 마지막 로그인 시간 업데이트
      await user.updateLastLogin();
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: '로그인 성공',
        token,
        user: user.toJSON()
      });
    } catch (err) {
      console.error('로그인 오류:', err);
      res.status(500).json({ 
        success: false,
        message: '서버 오류가 발생했습니다.'
      });
    }
  }
);

// 사용자 정보 조회 (Prototype Pollution 취약점 포함)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 사용자 정보를 빈 객체로 시작해서 Prototype 오염 영향 받도록 수정
    const userInfo = {};
    userInfo.id = user.id;
    userInfo.username = user.username;
    userInfo.email = user.email;
    userInfo.role = user.role;
    userInfo.created_at = user.created_at;
    userInfo.updated_at = user.updated_at;
    
    // Prototype 오염으로 추가된 속성들도 명시적으로 포함
    console.log('userInfo.isAdmin (from prototype):', userInfo.isAdmin);
    if (userInfo.isAdmin) {
      userInfo.isAdmin = true; // 명시적으로 설정
    }
    
    res.json({
      success: true,
      user: userInfo
    });
  } catch (err) {
    console.error('사용자 정보 조회 오류:', err);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 토큰 검증
router.post('/verify-token', async (req, res) => {
  try {
    const token = req.body.token || req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({ 
        success: false, 
        valid: false, 
        message: '토큰이 제공되지 않았습니다.' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.json({ 
        success: false, 
        valid: false, 
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    res.json({
      success: true,
      valid: true,
      user: user.toJSON()
    });
  } catch (err) {
    // JWT 검증 실패
    if (err.name === 'TokenExpiredError') {
      return res.json({ 
        success: false, 
        valid: false, 
        message: '토큰이 만료되었습니다.' 
      });
    }
    
    res.json({ 
      success: false, 
      valid: false, 
      message: '유효하지 않은 토큰입니다.' 
    });
  }
});

router.post('/logout', authenticate, (req, res) => {
  try {
    res.clearCookie('token');
    
    res.json({ 
      success: true,
      message: '로그아웃되었습니다.' 
    });
  } catch (err) {
    console.error('로그아웃 오류:', err);
    res.status(500).json({ 
      success: false,
      message: '로그아웃 중 오류가 발생했습니다.' 
    });
  }
});

router.post('/unsafe-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.unsafeFindByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '로그인 실패' 
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: '로그인 실패' 
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Unsafe 로그인 오류:', err);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: err.message
    });
  }
});

router.get('/debug', async (req, res) => {
  try {
    const users = await User.getAllUsersUnsafe();
    
    res.json({
      success: true,
      debug: true,
      totalUsers: users.length,
      users: users,
      jwtSecret: JWT_SECRET,
      loginAttempts: Object.fromEntries(loginAttempts)
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.post('/verify-2fa', twoFactorController.verifyTwoFactor);

router.get('/2fa/status', authenticate, twoFactorController.getTwoFactorStatus);

router.post('/2fa/setup', authenticate, twoFactorController.setupTwoFactor);

router.post('/2fa/confirm', authenticate, twoFactorController.confirmTwoFactor);

router.post('/2fa/disable', authenticate, twoFactorController.disableTwoFactor);

router.post('/2fa/check-device', authenticate, twoFactorController.checkTrustedDevice);

// 사용자 메뉴 권한 확인 API
router.get('/menu-permissions', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 빈 객체로 시작해서 Prototype 오염 영향 받도록
    const userInfo = {};
    userInfo.id = user.id;
    userInfo.username = user.username;
    userInfo.role = user.role;
    
    // Prototype 오염 확인
    console.log('메뉴 권한 확인 - userInfo.isAdmin:', userInfo.isAdmin);
    console.log('메뉴 권한 확인 - req.user.isAdmin:', req.user.isAdmin);
    
    // 관리자 권한 체크 (role 또는 prototype pollution으로 추가된 isAdmin)
    const hasAdminAccess = userInfo.role === 'admin' || userInfo.isAdmin || req.user.isAdmin;
    
    // 메뉴 구성
    const menus = [
      { name: '내 프로필', path: `/profile/${user.username}`, icon: 'bi-person' },
      { name: '설정', path: '/settings', icon: 'bi-gear' },
      { name: '저장됨', path: '/saved', icon: 'bi-bookmark' }
    ];
    
    // 관리자 권한이 있으면 관리자 메뉴 추가
    if (hasAdminAccess) {
      menus.splice(-1, 0, { 
        name: '관리자 패널', 
        path: '/admin', 
        icon: 'bi-shield-check',
        isAdmin: true 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      hasAdminAccess,
      menus
    });
  } catch (err) {
    console.error('메뉴 권한 확인 오류:', err);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;
