import axios from 'axios';

// axios 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되거나 유효하지 않음
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // 회원가입
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // 토큰과 사용자 정보 저장
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || '회원가입에 실패했습니다.'
      };
    } catch (error) {
      console.error('회원가입 에러:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || '회원가입에 실패했습니다.',
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  // 로그인
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        // 2차 인증이 필요한 경우
        if (response.data.requiresTwoFactor) {
          return {
            success: true,
            requiresTwoFactor: true,
            sessionId: response.data.sessionId,
            user: response.data.user,
            message: response.data.message
          };
        }
        
        // 일반 로그인 성공
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          requiresTwoFactor: false,
          token: response.data.token,
          user: response.data.user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || '로그인에 실패했습니다.'
      };
    } catch (error) {
      console.error('로그인 에러:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || '로그인에 실패했습니다.',
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  // 로그아웃
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 API 에러:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 쿠키도 정리 (클라이언트 측에서)
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      return { success: true };
    }
  }

  // 토큰 검증
  async verifyToken(token = null) {
    try {
      const tokenToVerify = token || localStorage.getItem('token');
      
      if (!tokenToVerify) {
        return { valid: false, message: '토큰이 없습니다.' };
      }
      
      const response = await api.post('/auth/verify-token', { token: tokenToVerify });
      
      if (response.data.success && response.data.valid) {
        // 사용자 정보 업데이트
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          valid: true,
          user: response.data.user
        };
      }
      
      return {
        valid: false,
        message: response.data.message || '유효하지 않은 토큰입니다.'
      };
    } catch (error) {
      console.error('토큰 검증 에러:', error);
      return {
        valid: false,
        message: '토큰 검증 중 오류가 발생했습니다.'
      };
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          success: true,
          user: response.data.user
        };
      }
      
      return {
        success: false,
        message: response.data.message || '사용자 정보를 가져올 수 없습니다.'
      };
    } catch (error) {
      console.error('현재 사용자 조회 에러:', error);
      return {
        success: false,
        message: '사용자 정보 조회 중 오류가 발생했습니다.'
      };
    }
  }

  // 로컬 스토리지에서 사용자 정보 가져오기
  getCurrentUserFromStorage() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('로컬 스토리지 사용자 정보 파싱 에러:', error);
      return null;
    }
  }

  // 토큰 존재 여부 확인
  hasToken() {
    return !!localStorage.getItem('token');
  }

  // 고급 로그인 모드 (개발자 기능)
  async unsafeLogin(email, password) {
    try {
      const response = await api.post('/auth/unsafe-login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || '로그인에 실패했습니다.'
      };
    } catch (error) {
      console.error('고급 로그인 에러:', error);
      return {
        success: false,
        message: error.response?.data?.message || '로그인에 실패했습니다.',
        error: error.response?.data?.error
      };
    }
  }

  // 시스템 정보 조회 (개발자 모드)
  async getDebugInfo() {
    try {
      const response = await api.get('/auth/debug');
      return response.data;
    } catch (error) {
      console.error('시스템 정보 조회 에러:', error);
      throw error;
    }
  }

  // 🚨 2차 인증 관련 메서드들

  // 2차 인증 검증 (취약점 포함)
  async verifyTwoFactor(sessionId, code, trustDevice = false) {
    try {
      const response = await api.post('/auth/verify-2fa', {
        sessionId,
        code,
        trustDevice
      });
      
      // 🚨 취약점: 클라이언트에서 응답을 조작할 수 있음
      if (response.data.success && response.data.verification?.isValid) {
        // 토큰이 있으면 저장
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // 사용자 정보 업데이트
        const user = this.getCurrentUserFromStorage();
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('2FA verification error:', error);
      return {
        success: false,
        message: '2차 인증 검증 중 오류가 발생했습니다.',
        error: error.response?.data?.error
      };
    }
  }

  // 2차 인증 상태 조회
  async getTwoFactorStatus() {
    try {
      const response = await api.get('/auth/2fa/status');
      return response.data;
    } catch (error) {
      console.error('2FA status error:', error);
      return {
        success: false,
        message: '2차 인증 상태 조회 중 오류가 발생했습니다.'
      };
    }
  }

  // 2차 인증 설정 시작
  async setupTwoFactor() {
    try {
      const response = await api.post('/auth/2fa/setup');
      return response.data;
    } catch (error) {
      console.error('2FA setup error:', error);
      return {
        success: false,
        message: '2차 인증 설정 중 오류가 발생했습니다.'
      };
    }
  }

  // 2차 인증 설정 확인
  async confirmTwoFactor(code) {
    try {
      const response = await api.post('/auth/2fa/confirm', { code });
      return response.data;
    } catch (error) {
      console.error('2FA confirm error:', error);
      return {
        success: false,
        message: '2차 인증 확인 중 오류가 발생했습니다.'
      };
    }
  }

  // 2차 인증 비활성화
  async disableTwoFactor(password) {
    try {
      const response = await api.post('/auth/2fa/disable', { password });
      return response.data;
    } catch (error) {
      console.error('2FA disable error:', error);
      return {
        success: false,
        message: '2차 인증 비활성화 중 오류가 발생했습니다.'
      };
    }
  }

  // 신뢰할 수 있는 디바이스 확인
  async checkTrustedDevice(deviceId) {
    try {
      const response = await api.post('/auth/2fa/check-device', { deviceId });
      return response.data;
    } catch (error) {
      console.error('Trusted device check error:', error);
      return {
        success: false,
        trusted: false,
        message: '디바이스 확인 중 오류가 발생했습니다.'
      };
    }
  }
}

export default new AuthService();
