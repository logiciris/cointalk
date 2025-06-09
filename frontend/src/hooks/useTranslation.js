import { useSelector } from 'react-redux';

// 번역 훅
export const useTranslation = () => {
  const { currentLanguage, translations } = useSelector(state => state.i18n);
  
  const t = (key, defaultValue = '') => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue || key;
  };
  
  return { t, currentLanguage };
};

// 언어 표시명 가져오기
export const getLanguageDisplayName = (langCode) => {
  const displayNames = {
    ko: '한국어',
    en: 'English'
  };
  return displayNames[langCode] || langCode;
};

// 언어 플래그 가져오기
export const getLanguageFlag = (langCode) => {
  const flags = {
    ko: '🇰🇷',
    en: '🇺🇸'
  };
  return flags[langCode] || '🌐';
};