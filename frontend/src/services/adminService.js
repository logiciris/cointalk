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

const adminService = {
  // 대시보드 데이터 조회
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw error;
    }
  },

  // 사용자 목록 조회
  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // 사용자 역할 변경
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  // 사용자 상태 변경
  toggleUserStatus: async (userId, active) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { active });
      return response.data;
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  },

  // 사용자 삭제
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // 비밀번호 초기화
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // 게시물 목록 조회 (관리자용)
  getPosts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/admin/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  },

  // 게시물 삭제
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },

  // 댓글 목록 조회 (관리자용)
  getComments: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/admin/comments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  // 시스템 설정 조회
  getSystemSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  },

  // 시스템 설정 업데이트
  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  },

  // 통계 정보 조회
  getStatistics: async () => {
    try {
      const response = await api.get('/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  },

  // 시스템 로그 조회
  getSystemLogs: async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/admin/logs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get system logs error:', error);
      throw error;
    }
  },

  // 백업 생성
  createBackup: async () => {
    try {
      const response = await api.post('/admin/backup');
      return response.data;
    } catch (error) {
      console.error('Create backup error:', error);
      throw error;
    }
  },

  // 사용자 검색
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },

  // 게시물 검색
  searchPosts: async (query) => {
    try {
      const response = await api.get(`/admin/posts/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  },

  // 댓글 검색
  searchComments: async (query) => {
    try {
      const response = await api.get(`/admin/comments/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search comments error:', error);
      throw error;
    }
  },

  // 사용자 일괄 작업
  bulkUserAction: async (userIds, action) => {
    try {
      const response = await api.post('/admin/users/bulk', { userIds, action });
      return response.data;
    } catch (error) {
      console.error('Bulk user action error:', error);
      throw error;
    }
  },

  // 게시물 일괄 삭제
  bulkDeletePosts: async (postIds) => {
    try {
      const response = await api.post('/admin/posts/bulk-delete', { postIds });
      return response.data;
    } catch (error) {
      console.error('Bulk delete posts error:', error);
      throw error;
    }
  },

  // 댓글 일괄 삭제
  bulkDeleteComments: async (commentIds) => {
    try {
      const response = await api.post('/admin/comments/bulk-delete', { commentIds });
      return response.data;
    } catch (error) {
      console.error('Bulk delete comments error:', error);
      throw error;
    }
  },

  // 취약점 설정 토글
  toggleVulnerability: async (vulnerabilityType, enabled) => {
    try {
      const response = await api.put('/admin/vulnerabilities', {
        type: vulnerabilityType,
        enabled
      });
      return response.data;
    } catch (error) {
      console.error('Toggle vulnerability error:', error);
      throw error;
    }
  },

  // 시스템 캐시 클리어
  clearCache: async () => {
    try {
      const response = await api.post('/admin/cache/clear');
      return response.data;
    } catch (error) {
      console.error('Clear cache error:', error);
      throw error;
    }
  },

  // 데이터베이스 최적화
  optimizeDatabase: async () => {
    try {
      const response = await api.post('/admin/database/optimize');
      return response.data;
    } catch (error) {
      console.error('Optimize database error:', error);
      throw error;
    }
  }
};

export { adminService };
