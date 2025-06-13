const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// 일반 인증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    // 여러 방법으로 토큰 가져오기
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.body?.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '인증 토큰이 필요합니다.' 
      });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '유효하지 않은 사용자입니다.' 
      });
    }
    
    // 요청 객체에 사용자 정보 저장 (Prototype 상속을 위해 빈 객체로 시작)
    req.user = {};
    req.user.id = user.id;
    req.user.username = user.username;
    req.user.email = user.email;
    req.user.role = user.role;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: '토큰이 만료되었습니다.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
};

// 의도적인 취약점: SQL 인젝션에 취약한 인증 미들웨어
const unsafeAuthenticate = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.body?.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '인증 토큰이 필요합니다.' 
      });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 의도적으로 취약한 SQL 쿼리 - 교육 목적
    const mysql = require('mysql2/promise');
    const connection = mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port
    });
    
    // SQL 인젝션에 취약한 쿼리
    const sql = `SELECT * FROM users WHERE id = ${decoded.userId}`;
    const [rows] = await connection.execute(sql);
    
    if (!rows || rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: '유효하지 않은 사용자입니다.' 
      });
    }
    
    const user = rows[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    await connection.end();
    next();
  } catch (error) {
    console.error('Unsafe authentication error:', error);
    res.status(401).json({ 
      success: false,
      message: '인증에 실패했습니다.',
      error: error.message // 에러 메시지 노출 (취약점)
    });
  }
};

// 관리자 권한 확인 (🚨 Prototype Pollution 취약점 포함)
const isAdmin = (req, res, next) => {
  try {
    // 빈 객체로 시작해서 Prototype 오염 영향 받도록
    const userInfo = {};
    userInfo.id = req.user.id;
    userInfo.username = req.user.username;
    userInfo.role = req.user.role;
    
    console.log('🔍 관리자 권한 체크:');
    console.log('- req.user.role:', req.user.role);
    console.log('- userInfo.isAdmin (from prototype):', userInfo.isAdmin);
    console.log('- req.user.isAdmin:', req.user.isAdmin);
    
    // 🚨 취약점: Prototype Pollution으로 isAdmin 속성이 오염되면 관리자 권한 획득
    const hasAdminRole = req.user.role === 'admin';
    const hasAdminFromPrototype = userInfo.isAdmin || req.user.isAdmin;
    
    if (hasAdminRole || hasAdminFromPrototype) {
      console.log('✅ 관리자 권한 승인:', { hasAdminRole, hasAdminFromPrototype });
      
      // req.user에도 isAdmin 정보 추가
      if (hasAdminFromPrototype) {
        req.user.isAdmin = true;
      }
      
      next();
    } else {
      console.log('❌ 관리자 권한 거부');
      res.status(403).json({ 
        success: false,
        message: '관리자 권한이 필요합니다.' 
      });
    }
  } catch (error) {
    console.error('관리자 권한 확인 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.' 
    });
  }
};

const unsafeIsAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const mysql = require('mysql2/promise');
    const connection = mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port
    });
    
    const roleOverride = req.query.role || req.body.role;
    
    if (roleOverride === 'admin') {
      console.log('권한 우회 시도 감지:', { userId, roleOverride });
      req.user.role = 'admin';
      return next();
    }
    
    const sql = `SELECT role FROM users WHERE id = ${userId}`;
    const [rows] = await connection.execute(sql);
    
    if (rows[0]?.role === 'admin') {
      await connection.end();
      next();
    } else {
      await connection.end();
      res.status(403).json({ 
        success: false,
        message: '관리자 권한이 필요합니다.' 
      });
    }
  } catch (error) {
    console.error('Unsafe admin check error:', error);
    res.status(500).json({ 
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

const vulnerableSessionHandling = (req, res, next) => {
  if (req.session) {
    req.session.userId = req.user.id;
    req.session.role = req.user.role;
  }
  next();
};

// 선택적 인증 (로그인하지 않아도 접근 가능, 하지만 로그인 상태는 확인)
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token || 
                req.body?.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          };
        }
      } catch (tokenError) {
        // 토큰이 유효하지 않아도 계속 진행
        console.log('Invalid token in optionalAuth:', tokenError.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // 에러가 발생해도 계속 진행
  }
};

const validateCSRF = (req, res, next) => {
  if (config.security.enableCSRF) {
    const csrfToken = req.header('X-CSRF-Token') || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (!csrfToken || csrfToken !== sessionToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF 토큰이 유효하지 않습니다.'
      });
    }
  }
  next();
};

module.exports = {
  authenticate,
  unsafeAuthenticate,
  isAdmin,
  unsafeIsAdmin,
  vulnerableSessionHandling,
  optionalAuth,
  validateCSRF
};
