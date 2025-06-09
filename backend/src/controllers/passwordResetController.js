const database = require('../utils/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/config');

class PasswordResetController {
  // 🚨 취약점: 비밀번호 재설정 요청 (사용자 존재 여부 노출)
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: '이메일을 입력해주세요.'
        });
      }
      
      // 🚨 취약점 1: 사용자 존재 여부를 응답에서 구분해서 알려줌
      const user = await database.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: '해당 이메일로 등록된 사용자가 없습니다.',
          hint: '다른 이메일을 시도해보세요.' // 취약점: 힌트 제공
        });
      }
      
      // 🚨 취약점 2: 예측 가능한 토큰 생성
      const resetToken = crypto.createHash('md5')
        .update(email + Date.now().toString())
        .digest('hex');
      
      // 토큰 저장 (만료시간: 1시간)
      await database.query(
        'INSERT INTO password_reset_tokens (user_id, email, token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
        [user[0].id, email, resetToken]
      );
      
      // 🚨 취약점 3: 토큰을 응답에 직접 포함 (실제로는 이메일로만 전송해야 함)
      res.json({
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
        // 개발 환경에서만 토큰 노출 (실제로는 제거해야 함)
        debug: {
          resetToken: resetToken,
          resetUrl: `http://localhost:3000/reset-password?token=${resetToken}`,
          userExists: true
        }
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message // 취약점: 에러 정보 노출
      });
    }
  }
  
  // 🚨 취약점: 토큰 검증 없이 비밀번호 재설정
  async resetPassword(req, res) {
    try {
      const { token, newPassword, email } = req.body;
      
      if (!token || !newPassword || !email) {
        return res.status(400).json({
          success: false,
          message: '토큰, 이메일, 새 비밀번호가 모두 필요합니다.'
        });
      }
      
      // 🚨 취약점 4: 토큰 검증 로직에 문제
      const resetData = await database.query(
        'SELECT * FROM password_reset_tokens WHERE email = ? AND expires_at > NOW()',
        [email]
      );
      
      if (!resetData || resetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않거나 만료된 토큰입니다.'
        });
      }
      
      // 🚨 취약점 5: 토큰을 실제로 검증하지 않음 (시간만 확인)
      // token 파라미터와 DB의 token을 비교하지 않음
      console.log('토큰 검증 우회:', { provided: token, stored: resetData[0].token });
      
      // 🚨 취약점 6: 약한 비밀번호 정책
      if (newPassword.length < 4) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 최소 4자 이상이어야 합니다.'
        });
      }
      
      // 비밀번호 해시 생성 (약한 해싱)
      const salt = await bcrypt.genSalt(4); // 취약점: 낮은 salt rounds
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // 비밀번호 업데이트
      await database.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      
      // 🚨 취약점 7: 사용된 토큰을 삭제하지 않음 (재사용 가능)
      // await database.query('DELETE FROM password_reset_tokens WHERE email = ?', [email]);
      
      res.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
        debug: {
          tokenWasValidated: false, // 실제로는 검증하지 않았음
          weakHashing: true,
          saltRounds: 4
        }
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message
      });
    }
  }
  
  // 🚨 취약점: 토큰 검증 API (브루트포스 공격에 취약)
  async validateToken(req, res) {
    try {
      const { token, email } = req.query;
      
      // 🚨 취약점 8: 브루트포스 제한 없음
      const resetData = await database.query(
        'SELECT * FROM password_reset_tokens WHERE email = ? AND expires_at > NOW()',
        [email]
      );
      
      if (!resetData || resetData.length === 0) {
        return res.json({
          success: false,
          valid: false,
          message: '토큰이 존재하지 않거나 만료되었습니다.'
        });
      }
      
      // 🚨 취약점 9: 타이밍 공격에 취약한 토큰 비교
      const isValid = (token === resetData[0].token);
      
      res.json({
        success: true,
        valid: isValid,
        message: isValid ? '유효한 토큰입니다.' : '잘못된 토큰입니다.',
        debug: {
          providedToken: token,
          expectedToken: resetData[0].token,
          comparison: token === resetData[0].token
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message
      });
    }
  }
  
  // 🚨 취약점: 관리자 전용 - 모든 토큰 조회 (권한 검증 부족)
  async getAllResetTokens(req, res) {
    try {
      // 🚨 취약점 10: 권한 검증 없음 (누구나 접근 가능)
      const tokens = await database.query(`
        SELECT 
          prt.id,
          prt.email,
          prt.token,
          prt.expires_at,
          prt.created_at,
          u.username,
          u.role
        FROM password_reset_tokens prt
        LEFT JOIN users u ON prt.user_id = u.id
        ORDER BY prt.created_at DESC
      `);
      
      res.json({
        success: true,
        count: tokens.length,
        tokens: tokens,
        message: '모든 비밀번호 재설정 토큰을 조회했습니다.'
      });
    } catch (error) {
      console.error('Get all tokens error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message
      });
    }
  }
}

module.exports = new PasswordResetController();
