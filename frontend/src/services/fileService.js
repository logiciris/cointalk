import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fileService = {
  // 파일 업로드
  uploadFiles: async (files, postId = null) => {
    try {
      const formData = new FormData();
      
      // 파일들을 FormData에 추가
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
      }
      
      if (postId) {
        formData.append('postId', postId);
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '파일 업로드 중 오류가 발생했습니다.'
      };
    }
  },

  // 게시물의 첨부파일 목록 조회
  getPostFiles: async (postId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/post/${postId}`);
      return { success: true, data: response.data.files };
    } catch (error) {
      console.error('Get post files error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '파일 목록 조회 중 오류가 발생했습니다.'
      };
    }
  },

  // 파일 다운로드 URL 생성
  getDownloadUrl: (filename) => {
    return `${API_BASE_URL}/files/download/${encodeURIComponent(filename)}`;
  },

  // 파일 삭제
  deleteFile: async (fileId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/files/${fileId}`,
        { headers: getAuthHeader() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '파일 삭제 중 오류가 발생했습니다.'
      };
    }
  },

  // 파일 크기 포맷팅
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 파일 타입 아이콘 가져오기
  getFileIcon: (filename, mimeType) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return '📦';
    if (extension === 'js') return '📜';
    if (extension === 'txt') return '📝';
    if (mimeType?.includes('video/')) return '🎥';
    if (mimeType?.includes('audio/')) return '🎵';
    
    return '📁';
  }
};

export default fileService;