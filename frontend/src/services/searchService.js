import axios from 'axios';

// axios 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
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
    }
    return Promise.reject(error);
  }
);

class SearchService {
  // 통합 검색 (게시물, 사용자, 코인)
  async searchAll(keyword, page = 1, limit = 10) {
    try {
      const params = {
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await api.get('/search/all', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('통합 검색 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '검색에 실패했습니다.',
        error: error.message,
        errorDetails: error.response?.data?.errorDetails
      };
    }
  }

  // 사용자 검색
  async searchUsers(keyword, page = 1, limit = 10) {
    try {
      const params = {
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await api.get('/search/users', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('사용자 검색 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '사용자 검색에 실패했습니다.',
        error: error.message
      };
    }
  }

  // 코인 검색
  async searchCoins(keyword, page = 1, limit = 10) {
    try {
      const params = {
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await api.get('/search/coins', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('코인 검색 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '코인 검색에 실패했습니다.',
        error: error.message
      };
    }
  };

  // 인기 태그 조회
  async getTrendingTags(limit = 10) {
    try {
      const params = {
        limit: limit.toString()
      };
      
      const response = await api.get('/posts/trending-tags', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('인기 태그 조회 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '인기 태그 조회에 실패했습니다.',
        error: error.message,
        errorDetails: error.response?.data?.errorDetails
      };
    }
  }

  // 활발한 사용자 조회
  async getActiveUsers(limit = 10, days = 7) {
    try {
      const params = {
        limit: limit.toString(),
        days: days.toString()
      };
      
      const response = await api.get('/posts/active-users', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('활발한 사용자 조회 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '활발한 사용자 조회에 실패했습니다.',
        error: error.message,
        errorDetails: error.response?.data?.errorDetails
      };
    }
  }
}

export default new SearchService();
