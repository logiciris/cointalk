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
      // 로그인 페이지로 리다이렉트하지 않고 에러만 반환 (게시물 조회는 인증 선택사항)
    }
    return Promise.reject(error);
  }
);

class PostService {
  // 게시물 목록 조회
  async getPosts(page = 1, limit = 10) {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await api.get('/posts', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('게시물 조회 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '게시물 조회에 실패했습니다.',
        error: error.message
      };
    }
  }

  // 게시물 검색 (취약한 버전으로 변경)
  async searchPosts(keyword, page = 1, limit = 10) {
    try {
      const params = {
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await api.get('/posts/search', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('게시물 검색 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '검색에 실패했습니다.',
        error: error.message
      };
    }
  }

  // 게시물 상세 조회
  async getPost(id) {
    try {
      const response = await api.get(`/posts/${id}`);
      
      return {
        success: true,
        data: response.data.post || response.data.data || response.data
      };
    } catch (error) {
      console.error('게시물 상세 조회 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '게시물을 찾을 수 없습니다.',
        error: error.message
      };
    }
  }

  // 게시물 작성
  async createPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('게시물 작성 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '게시물 작성에 실패했습니다.',
        error: error.message
      };
    }
  }

  // 게시물 수정 (고급 모드)
  async updatePost(id, postData) {
    try {
      const response = await api.put(`/posts/unsafe/${id}`, postData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('게시물 수정 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '게시물 수정에 실패했습니다.',
        error: error.message
      };
    }
  }

  // 게시물 삭제 (고급 모드)
  async deletePost(id) {
    try {
      const response = await api.delete(`/posts/unsafe/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('게시물 삭제 에러:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || '게시물 삭제에 실패했습니다.',
        error: error.message
      };
    }
  }
}

export default new PostService();
