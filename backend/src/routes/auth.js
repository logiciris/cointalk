const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middlewares/auth');
const config = require('../config/config');
const database = require('../utils/database');
const crypto = require('crypto');
const twoFactorController = require('../controllers/twoFactorController');

// JWT 비밀 키
const JWT_SECRET = config.jwt.secret;

// 의도적인 취약점: 로그인 시도 제한 없음 (브루트 포스 공격에 취약)
const loginAttempts = new Map(); // 실제로는 Redis 등을 사용해야 함

// 회원가입
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
    // 의도적인 취약점: 약한 비밀번호 정책
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      // 실제로는 복잡성 검사, 특수문자 포함 등을 검증해야 함
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
      
      const { username, email, password } = req.body;
      
      // 사용자 중복 확인
      const existingUser = await User.findByEmailOrUsername(email, username);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 등록된 이메일 또는 사용자명입니다.'
        });
      }
      
      // 새 사용자 생성
      const newUser = await User.create({
        username,
        email,
        password
      });
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          userId: newUser.id,
          username: newUser.username,
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // 의도적인 취약점: 쿠키에 토큰 저장 시 보안 옵션 미적용
      res.cookie('token', token, {
        httpOnly: false, // XSS 공격에 취약
        secure: false,   // HTTPS만 사용하지 않음
        sameSite: 'none' // CSRF 공격에 취약
      });

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        token,
        user: newUser.toJSON()
      });
    } catch (err) {
      console.error('회원가입 오류:', err);
      
      // 의도적인 취약점: 상세한 에러 메시지 노출
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false,
          message: '이미 존재하는 사용자입니다.',
          error: err.sqlMessage // 데이터베이스 에러 메시지 노출
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: err.message // 상세 에러 정보 노출 (취약점)
      });
    }
  }
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
      
      // 의도적인 취약점: 로그인 시도 횟수 제한 없음
      // 실제로는 계정 잠금, 지연 등을 구현해야 함
      
      // 사용자 찾기
      const user = await User.findByEmail(email);
      
      if (!user) {
        // 의도적인 취약점: 사용자 존재 여부 노출
        return res.status(401).json({ 
          success: false,
          message: '존재하지 않는 이메일입니다.' 
        });
      }
      
      // 비밀번호 확인
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        // 실패한 로그인 시도 기록 (의도적으로 제한하지 않음)
        const attempts = loginAttempts.get(email) || 0;
        loginAttempts.set(email, attempts + 1);
        
        return res.status(401).json({ 
          success: false,
          message: '잘못된 비밀번호입니다.' // 구체적인 실패 이유 노출 (취약점)
        });
      }
      
      // 성공 시 로그인 시도 기록 초기화
      loginAttempts.delete(email);
      
      // 2차 인증 확인
      if (user.two_factor_enabled) {
        // 2차 인증 세션 생성
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
        
        await database.query(
          'INSERT INTO two_factor_sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
          [sessionId, user.id, expiresAt]
        );
        
        return res.json({
          success: true,
          requiresTwoFactor: true,
          sessionId: sessionId,
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
      
      // 의도적인 취약점: 쿠키에 토큰 저장 시 보안 옵션 미적용
      res.cookie('token', token, {
        httpOnly: false, // JavaScript로 접근 가능 (XSS 취약점)
        secure: false,   // HTTP에서도 전송
        sameSite: 'none' // CSRF 공격에 취약
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
        message: '서버 오류가 발생했습니다.',
        error: err.message // 상세 에러 정보 노출 (취약점)
      });
    }
  }
);

// 사용자 정보 조회
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    res.json({
      success: true,
      user: user.toJSON()
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
    
    // 의도적인 취약점: 토큰 블랙리스트 확인 없음
    // 실제로는 로그아웃된 토큰을 블랙리스트에서 확인해야 함
    
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

// 로그아웃
router.post('/logout', authenticate, (req, res) => {
  try {
    // 의도적인 취약점: 토큰 무효화 없음
    // 실제로는 토큰을 블랙리스트에 추가하거나 만료시켜야 함
    
    // 쿠키에서 토큰 삭제
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

// 의도적인 취약점: SQL 인젝션에 취약한 로그인 엔드포인트
router.post('/unsafe-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 주의: 이 엔드포인트는 의도적으로 SQL 인젝션에 취약합니다.
    // 교육 목적으로만 사용하세요.
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
      error: err.message // 데이터베이스 오류 노출 (취약점)
    });
  }
});

// 의도적인 취약점: 디버그 정보 노출 엔드포인트
router.get('/debug', async (req, res) => {
  try {
    // 주의: 이 엔드포인트는 의도적으로 민감한 정보를 노출합니다.
    // 교육 목적으로만 사용하세요.
    const users = await User.getAllUsersUnsafe();
    
    res.json({
      success: true,
      debug: true,
      totalUsers: users.length,
      users: users, // 비밀번호 포함된 모든 사용자 정보 노출
      jwtSecret: JWT_SECRET, // JWT 시크릿 노출
      loginAttempts: Object.fromEntries(loginAttempts) // 로그인 시도 기록 노출
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// 🚨 2차 인증 관련 엔드포인트들

// 2차 인증 검증 (취약점 포함)
router.post('/verify-2fa', twoFactorController.verifyTwoFactor);

// 2차 인증 상태 조회
router.get('/2fa/status', authenticate, twoFactorController.getTwoFactorStatus);

// 2차 인증 설정 시작
router.post('/2fa/setup', authenticate, twoFactorController.setupTwoFactor);

// 2차 인증 설정 확인
router.post('/2fa/confirm', authenticate, twoFactorController.confirmTwoFactor);

// 2차 인증 비활성화
router.post('/2fa/disable', authenticate, twoFactorController.disableTwoFactor);

// 신뢰할 수 있는 디바이스 확인
router.post('/2fa/check-device', authenticate, twoFactorController.checkTrustedDevice);

module.exports = router;
