const database = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const crypto = require('crypto');

class TwoFactorController {
  // 2차 인증 설정 페이지 정보 조회
  async getTwoFactorStatus(req, res) {
    try {
      const userId = req.user.id;
      
      const twoFactorData = await database.query(
        'SELECT enabled, enabled_at FROM two_factor_auth WHERE user_id = ?',
        [userId]
      );
      
      const trustedDevices = await database.query(
        'SELECT device_name, ip_address, created_at, last_used FROM trusted_devices WHERE user_id = ? AND trusted_until > NOW()',
        [userId]
      );
      
      res.json({
        success: true,
        twoFactorEnabled: twoFactorData.length > 0 ? twoFactorData[0].enabled : false,
        enabledAt: twoFactorData.length > 0 ? twoFactorData[0].enabled_at : null,
        trustedDevices: trustedDevices || []
      });
    } catch (error) {
      console.error('2FA status error:', error);
      res.status(500).json({ 
        success: false,
        message: '2차 인증 상태 조회 중 오류가 발생했습니다.' 
      });
    }
  }
  
  // 2차 인증 설정 시작 (QR 코드 생성)
  async setupTwoFactor(req, res) {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      // 이미 설정되어 있는지 확인
      const existing = await database.query(
        'SELECT * FROM two_factor_auth WHERE user_id = ?',
        [userId]
      );
      
      if (existing.length > 0 && existing[0].enabled) {
        return res.status(400).json({
          success: false,
          message: '이미 2차 인증이 설정되어 있습니다.'
        });
      }
      
      // 32자리 랜덤 시크릿 키 생성 (실제로는 speakeasy.generateSecret() 사용)
      const secretKey = crypto.randomBytes(16).toString('hex');
      
      // 백업 코드 생성 (10개)
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }
      
      // 데이터베이스에 저장 (아직 enabled = false)
      if (existing.length > 0) {
        await database.query(
          'UPDATE two_factor_auth SET secret_key = ?, backup_codes = ?, enabled = FALSE WHERE user_id = ?',
          [secretKey, JSON.stringify(backupCodes), userId]
        );
      } else {
        await database.query(
          'INSERT INTO two_factor_auth (user_id, secret_key, backup_codes, enabled) VALUES (?, ?, ?, FALSE)',
          [userId, secretKey, JSON.stringify(backupCodes)]
        );
      }
      
      // QR 코드용 URL 생성 (Google Authenticator 포맷)
      const qrCodeUrl = `otpauth://totp/CoinTalk:${encodeURIComponent(userEmail)}?secret=${secretKey}&issuer=CoinTalk`;
      
      res.json({
        success: true,
        secretKey: secretKey,
        qrCodeUrl: qrCodeUrl,
        backupCodes: backupCodes,
        message: 'QR 코드를 스캔하고 인증 코드로 설정을 완료하세요.'
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ 
        success: false,
        message: '2차 인증 설정 중 오류가 발생했습니다.' 
      });
    }
  }
  
  // 2차 인증 설정 확인 및 활성화
  async confirmTwoFactor(req, res) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      
      if (!code || code.length !== 6) {
        return res.status(400).json({
          success: false,
          message: '6자리 인증 코드를 입력하세요.'
        });
      }
      
      const twoFactorData = await database.query(
        'SELECT secret_key FROM two_factor_auth WHERE user_id = ? AND enabled = FALSE',
        [userId]
      );
      
      if (twoFactorData.length === 0) {
        return res.status(400).json({
          success: false,
          message: '2차 인증 설정이 시작되지 않았습니다.'
        });
      }
      
      // 실제로는 speakeasy.totp.verify() 사용
      // 여기서는 시뮬레이션: 간단한 시간 기반 검증
      const secretKey = twoFactorData[0].secret_key;
      const currentTime = Math.floor(Date.now() / 1000 / 30); // 30초 윈도우
      const expectedCode = this.generateTOTP(secretKey, currentTime);
      
      if (code !== expectedCode) {
        return res.status(400).json({
          success: false,
          message: '잘못된 인증 코드입니다.'
        });
      }
      
      // 2차 인증 활성화
      await database.query(
        'UPDATE two_factor_auth SET enabled = TRUE, enabled_at = NOW() WHERE user_id = ?',
        [userId]
      );
      
      await database.query(
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = ?',
        [userId]
      );
      
      res.json({
        success: true,
        message: '2차 인증이 성공적으로 설정되었습니다.'
      });
    } catch (error) {
      console.error('2FA confirm error:', error);
      res.status(500).json({ 
        success: false,
        message: '2차 인증 확인 중 오류가 발생했습니다.' 
      });
    }
  }
  
  // 2차 인증 비활성화
  async disableTwoFactor(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;
      
      // 비밀번호 확인
      const user = await database.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '비밀번호가 올바르지 않습니다.'
        });
      }
      
      // 2차 인증 비활성화
      await database.query('UPDATE two_factor_auth SET enabled = FALSE WHERE user_id = ?', [userId]);
      await database.query('UPDATE users SET two_factor_enabled = FALSE WHERE id = ?', [userId]);
      
      // 신뢰할 수 있는 디바이스 모두 제거
      await database.query('DELETE FROM trusted_devices WHERE user_id = ?', [userId]);
      
      res.json({
        success: true,
        message: '2차 인증이 비활성화되었습니다.'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ 
        success: false,
        message: '2차 인증 비활성화 중 오러가 발생했습니다.' 
      });
    }
  }
  
  // 🚨 취약점: 2차 인증 검증 (클라이언트에서 조작 가능)
  async verifyTwoFactor(req, res) {
    try {
      const { sessionId, code, trustDevice } = req.body;
      
      if (!sessionId || !code) {
        return res.status(400).json({
          success: false,
          message: '세션 ID와 인증 코드가 필요합니다.'
        });
      }
      
      // 2차 인증 세션 조회
      const session = await database.query(
        'SELECT * FROM two_factor_sessions WHERE id = ? AND expires_at > NOW()',
        [sessionId]
      );
      
      if (session.length === 0) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않거나 만료된 세션입니다.'
        });
      }
      
      const sessionData = session[0];
      const userId = sessionData.user_id;
      const existingToken = sessionData.token; // 🚨 1차 로그인에서 발급된 토큰
      
      // 2차 인증 정보 조회
      const twoFactorData = await database.query(
        'SELECT secret_key, backup_codes FROM two_factor_auth WHERE user_id = ? AND enabled = TRUE',
        [userId]
      );
      
      if (twoFactorData.length === 0) {
        return res.status(400).json({
          success: false,
          message: '2차 인증이 설정되지 않았습니다.'
        });
      }
      
      let isValidCode = false;
      const secretKey = twoFactorData[0].secret_key;
      let backupCodes = [];
      
      try {
        backupCodes = JSON.parse(twoFactorData[0].backup_codes || '[]');
      } catch (e) {
        console.log('Backup codes parsing error:', e.message);
        backupCodes = [];
      }
      
      // 실제 TOTP 코드 검증 
      const expectedCode = secretKey.slice(-6); // 마지막 6자리 사용
      
      if (code === expectedCode) {
        isValidCode = true;
      } else if (backupCodes.includes(code.toUpperCase())) {
        // 백업 코드 사용 시 제거
        const updatedBackupCodes = backupCodes.filter(bc => bc !== code.toUpperCase());
        await database.query(
          'UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?',
          [JSON.stringify(updatedBackupCodes), userId]
        );
        isValidCode = true;
      }
      
      // 시도 기록
      await database.query(
        'INSERT INTO two_factor_attempts (session_id, user_id, code_entered, success, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [sessionId, userId, code, isValidCode, req.ip, req.get('User-Agent')]
      );
      
      // 🚨 취약점: 성공/실패 관계없이 항상 기존 토큰 반환
      // 클라이언트에서 isValid를 true로 바꾸면 이 토큰으로 로그인 가능
      if (isValidCode) {
        // 성공 시에만 세션 업데이트와 쿠키 설정
        await database.query(
          'UPDATE two_factor_sessions SET two_factor_verified = TRUE WHERE id = ?',
          [sessionId]
        );
        
        // 신뢰할 수 있는 디바이스 등록
        if (trustDevice) {
          const deviceId = crypto.randomBytes(32).toString('hex');
          await database.query(
            'INSERT INTO trusted_devices (user_id, device_id, device_name, ip_address, user_agent, trusted_until) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
            [userId, deviceId, req.get('User-Agent'), req.ip, req.get('User-Agent')]
          );
        }
        
        // 성공 시에만 쿠키 설정
        res.cookie('token', existingToken, {
          httpOnly: false,
          secure: false,
          sameSite: 'none'
        });
      }
      
      // 🚨 취약점: 항상 토큰 반환 (실패 시에도!)
      res.json({
        success: true,
        verification: {
          isValid: isValidCode, // 실제 검증 결과
          userId: userId
        },
        token: existingToken, // 🚨 항상 1차 로그인 토큰 반환
        message: isValidCode ? '인증이 완료되었습니다.' : '잘못된 인증 코드입니다.'
      });
      
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ 
        success: false,
        message: '2차 인증 검증 중 오류가 발생했습니다.'
      });
    }
  }
  
  // 단순한 TOTP 구현 - 6자리 숫자 코드 생성 (교육용)
  generateTOTP(secret, timeStep) {
    // 🚨 교육용 고정 코드 - secret_key를 6자리 숫자로 변환
    return secret.slice(-6); // 마지막 6자리 사용
  }
  
  // 신뢰할 수 있는 디바이스 확인
  async checkTrustedDevice(req, res) {
    try {
      const { deviceId } = req.body;
      const userId = req.user.id;
      
      const device = await database.query(
        'SELECT * FROM trusted_devices WHERE user_id = ? AND device_id = ? AND trusted_until > NOW()',
        [userId, deviceId]
      );
      
      if (device.length > 0) {
        // 마지막 사용 시간 업데이트
        await database.query(
          'UPDATE trusted_devices SET last_used = NOW() WHERE id = ?',
          [device[0].id]
        );
        
        res.json({
          success: true,
          trusted: true,
          message: '신뢰할 수 있는 디바이스입니다.'
        });
      } else {
        res.json({
          success: true,
          trusted: false,
          message: '신뢰할 수 없는 디바이스입니다.'
        });
      }
    } catch (error) {
      console.error('Trusted device check error:', error);
      res.status(500).json({ 
        success: false,
        message: '디바이스 확인 중 오류가 발생했습니다.' 
      });
    }
  }
}

module.exports = new TwoFactorController();
