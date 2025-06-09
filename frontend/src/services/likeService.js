import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const likeService = {
  // 게시물 좋아요 토글
  togglePostLike: async (postId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/like`,
        {},
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Toggle post like error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '좋아요 처리 중 오류가 발생했습니다.'
      };
    }
  },

  // 댓글 좋아요 토글
  toggleCommentLike: async (commentId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/${commentId}/like`,
        {},
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Toggle comment like error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '좋아요 처리 중 오류가 발생했습니다.'
      };
    }
  },

  // 게시물 좋아요 상태 조회
  getPostLikeStatus: async (postId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts/${postId}/like-status`,
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get post like status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '좋아요 상태 조회 중 오류가 발생했습니다.'
      };
    }
  }
};

export default likeService;