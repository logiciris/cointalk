const database = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { validationResult } = require('express-validator');
// Node.js 18에서 내장된 fetch 사용 (node-fetch 대신)

// 사용자 컨트롤러
class UserController {
  // 사용자 로그인 (안전한 버전)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // 이메일로 사용자 조회 (안전한 쿼리)
      const user = await database.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user || user.length === 0) {
        return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
      }
      
      // 비밀번호 검증
      const isMatch = await bcrypt.compare(password, user[0].password);
      
      if (!isMatch) {
        return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
      }
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user[0].id, username: user[0].username },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email,
          role: user[0].role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 사용자 로그인 (SQL 인젝션에 취약한 버전)
  async unsafeLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      // 의도적으로 취약한 쿼리 작성 (SQL 인젝션 취약점)
      // 예: email = "' OR '1'='1" 같은 입력으로 인증 우회 가능
      const sql = `SELECT * FROM users WHERE email = '${email}'`;
      const user = await database.unsafeQuery(sql);
      
      if (!user || user.length === 0) {
        return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
      }
      
      // 비밀번호 검증 (실제로는 여기까지 오지 않을 수 있음)
      // SQL 인젝션으로 조건이 항상 참이 될 수 있기 때문
      const isMatch = await bcrypt.compare(password, user[0].password);
      
      if (!isMatch) {
        return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
      }
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user[0].id, username: user[0].username },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email,
          role: user[0].role
        }
      });
    } catch (error) {
      console.error('Unsafe login error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 사용자 정보 조회 (SQL 인젝션에 취약한 버전)
  async unsafeGetUser(req, res) {
    try {
      const { id } = req.params;
      
      // 의도적으로 취약한 쿼리 작성 (SQL 인젝션 취약점)
      // 예: id = "1 OR 1=1" 같은 입력으로 모든 사용자 정보 조회 가능
      const sql = `SELECT id, username, email, profile_picture, bio, role FROM users WHERE id = ${id}`;
      const user = await database.unsafeQuery(sql);
      
      if (!user || user.length === 0) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      
      res.json(user[0]);
    } catch (error) {
      console.error('Unsafe get user error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 사용자 검색 (SQL 인젝션에 취약한 버전)
  async unsafeSearchUsers(req, res) {
    try {
      const { keyword } = req.query;
      
      // 의도적으로 취약한 쿼리 작성 (SQL 인젝션 취약점)
      // 예: keyword = "a' OR '1'='1" 같은 입력으로 모든 사용자 정보 조회 가능
      const sql = `SELECT id, username, email, profile_picture FROM users WHERE username LIKE '%${keyword}%' OR email LIKE '%${keyword}%'`;
      const users = await database.unsafeQuery(sql);
      
      res.json(users);
    } catch (error) {
      console.error('Unsafe search users error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 사용자 프로필 업데이트 (SQL 인젝션에 취약한 버전)
  async unsafeUpdateProfile(req, res) {
    try {
      const { id } = req.params;
      const { bio } = req.body;
      
      // 의도적으로 취약한 쿼리 작성 (SQL 인젝션 취약점)
      // 예: bio = "updated', role='admin" 같은 입력으로 관리자 권한 획득 가능
      const sql = `UPDATE users SET bio = '${bio}' WHERE id = ${id}`;
      await database.unsafeQuery(sql);
      
      res.json({ message: '프로필이 업데이트되었습니다.' });
    } catch (error) {
      console.error('Unsafe update profile error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 사용자 등록 (안전한 버전) - 2차 인증 자동 활성화
  async register(req, res) {
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
      
      const { username, email, password, phone } = req.body;
      
      // 이메일 또는 사용자명 중복 검사
      const existingUser = await database.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );
      
      if (existingUser && existingUser.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: '이미 사용 중인 이메일 또는 사용자명입니다.' 
        });
      }
      
      // 비밀번호 해시 생성
      const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 사용자 등록 (2차 인증 기본 활성화)
      const result = await database.insert('users', {
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'user',
        two_factor_enabled: true  // 🚨 모든 신규 사용자에게 2차 인증 활성화
      });
      
      const userId = result.insertId;
      
      // 새 사용자에게 기본 지갑 생성 (1억원 = 100,000,000원)
      try {
        await database.insert('user_wallets', {
          user_id: userId,
          balance: 100000000.00  // 1억원 지급
        });
        console.log(`💰 User ${username} wallet created with 100M KRW`);
      } catch (walletError) {
        console.error('Wallet creation failed:', walletError);
        // 지갑 생성 실패해도 회원가입은 성공으로 처리
      }
      
      // 🚨 2차 인증 코드 생성 (6자리 랜덤 숫자)
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const crypto = require('crypto');
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }
      
      // 2차 인증 데이터 삽입
      try {
        await database.query(
          'INSERT INTO two_factor_auth (user_id, secret_key, backup_codes, enabled, enabled_at) VALUES (?, ?, ?, TRUE, NOW())',
          [userId, twoFactorCode, JSON.stringify(backupCodes)]
        );
        console.log(`🔒 User ${username} 2FA enabled with code: ${twoFactorCode}`);
      } catch (twoFactorError) {
        console.error('2FA setup failed:', twoFactorError);
        // 2FA 설정 실패해도 회원가입은 성공으로 처리
      }
      
      res.status(201).json({
        success: true,
        requiresTwoFactor: true,
        twoFactorCode: twoFactorCode,
        backupCodes: backupCodes,
        message: '회원가입이 완료되었습니다. 보안을 위해 2차 인증이 활성화되었습니다.',
        user: {
          id: userId,
          username,
          email,
          role: 'user',
          two_factor_enabled: true
        },
        info: `모든 계정에는 보안을 위해 2차 인증이 기본 활성화됩니다. 당신의 2차 인증 코드: ${twoFactorCode}`
      });
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false,
          message: '이미 존재하는 사용자입니다.'
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 사용자 프로필 조회 (username으로)
  async getUserProfile(req, res) {
    try {
      const { username } = req.params;
      
      const user = await database.query(
        'SELECT id, username, email, phone, bio, profile_picture, created_at FROM users WHERE username = ?',
        [username]
      );
      
      if (!user || user.length === 0) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      
      res.json({
        success: true,
        user: {
          ...user[0],
          joinDate: user[0].created_at,
          followers: 0, // TODO: 팔로워 수 계산
          following: 0  // TODO: 팔로잉 수 계산
        }
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  // 프로필 정보 조회 (안전한 버전)
  async getProfile(req, res) {
    try {
      const userId = req.user.id; // 인증된 사용자 정보
      
      const user = await database.query(
        'SELECT id, username, email, phone, bio, profile_picture, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user || user.length === 0) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      
      res.json(user[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  // 프로필 정보 업데이트 (안전한 버전)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { bio, username, phone } = req.body;
      
      // 사용자명 중복 검사 (현재 사용자 제외)
      if (username) {
        const existingUser = await database.query(
          'SELECT * FROM users WHERE username = ? AND id != ?',
          [username, userId]
        );
        
        if (existingUser && existingUser.length > 0) {
          return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
        }
      }
      
      // 프로필 업데이트
      const updateData = {};
      if (bio !== undefined) updateData.bio = bio;
      if (username !== undefined) updateData.username = username;
      if (phone !== undefined) updateData.phone = phone;
      
      if (Object.keys(updateData).length > 0) {
        await database.update('users', updateData, { id: userId });
      }
      
      res.json({ message: '프로필이 업데이트되었습니다.' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  // 비밀번호 변경 (안전한 버전)
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '현재 비밀번호와 새 비밀번호를 모두 입력하세요.'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '새 비밀번호는 최소 6자 이상이어야 합니다.'
        });
      }
      
      // 현재 사용자 조회
      const user = await database.query('SELECT password FROM users WHERE id = ?', [userId]);
      
      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.'
        });
      }
      
      // 현재 비밀번호 확인
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '현재 비밀번호가 올바르지 않습니다.'
        });
      }
      
      // 새 비밀번호 해시 생성
      const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      
      // 비밀번호 업데이트
      await database.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );
      
      res.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.'
      });
    }
  }

  // 프로필 이미지 URL로 업로드 (취약한 버전)
  async unsafeUpdateProfileImage(req, res) {
    try {
      const userId = req.user.id;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: '이미지 URL이 필요합니다.' });
      }
      
      // URL 검증 없이 직접 요청
      try {
        const response = await fetch(imageUrl);
        const responseText = await response.text();
        
        if (!response.ok) {
          return res.status(400).json({ 
            message: '이미지를 가져올 수 없습니다.',
            url: imageUrl,
            status: response.status
          });
        }
        
        // 이미지 URL 저장
        await database.update('users', 
          { profile_picture: imageUrl }, 
          { id: userId }
        );
        
        res.json({ 
          message: '프로필 이미지가 업데이트되었습니다.',
          imageUrl: imageUrl
        });
        
      } catch (fetchError) {
        res.status(500).json({ 
          message: '이미지 처리 중 오류가 발생했습니다.',
          url: imageUrl
        });
      }
      
    } catch (error) {
      res.status(500).json({ 
        message: '서버 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new UserController();
