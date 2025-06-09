import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const commentService = {
  // 댓글 목록 조회
  getComments: async (postId, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/comments/post/${postId}?page=${page}&limit=${limit}`,
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get comments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '댓글 조회 중 오류가 발생했습니다.'
      };
    }
  },

  // 댓글 작성
  createComment: async (postId, content, parentId = null) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/post/${postId}`,
        { content, parentId },
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Create comment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.'
      };
    }
  },

  // 댓글 수정
  updateComment: async (commentId, content) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/comments/${commentId}`,
        { content },
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Update comment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '댓글 수정 중 오류가 발생했습니다.'
      };
    }
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/comments/${commentId}`,
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Delete comment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '댓글 삭제 중 오류가 발생했습니다.'
      };
    }
  }
};

export default commentService;