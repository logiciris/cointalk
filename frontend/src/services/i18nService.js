import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const i18nService = {
  // 언어팩 로드
  loadLanguage: async (language) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/i18n/${language}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Language loading error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '언어팩 로드 중 오류가 발생했습니다.',
        error: error.response?.data
      };
    }
  },

  // 지원되는 언어 목록 조회
  getSupportedLanguages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/i18n`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get supported languages error:', error);
      return {
        success: false,
        message: '지원 언어 목록 조회 중 오류가 발생했습니다.'
      };
    }
  },

  // 현재 언어 저장
  setCurrentLanguage: (language) => {
    localStorage.setItem('currentLanguage', language);
  },

  // 현재 언어 가져오기
  getCurrentLanguage: () => {
    return localStorage.getItem('currentLanguage') || 'ko';
  },

  // 언어별 표시명
  getLanguageDisplayName: (langCode) => {
    const displayNames = {
      ko: '한국어',
      en: 'English'
    };
    return displayNames[langCode] || langCode;
  },

  // 언어별 플래그 이모지
  getLanguageFlag: (langCode) => {
    const flags = {
      ko: '🇰🇷',
      en: '🇺🇸'
    };
    return flags[langCode] || '🌐';
  }
};

export default i18nService;