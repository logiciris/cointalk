// Redux action types for i18n
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_TRANSLATIONS = 'SET_TRANSLATIONS';
export const LANGUAGE_LOADING = 'LANGUAGE_LOADING';

// Action creators
export const setLanguage = (language) => ({
  type: SET_LANGUAGE,
  payload: language
});

export const setTranslations = (translations) => ({
  type: SET_TRANSLATIONS,
  payload: translations
});

export const setLanguageLoading = (loading) => ({
  type: LANGUAGE_LOADING,
  payload: loading
});

// Async action for loading language
export const loadLanguage = (language) => {
  return async (dispatch) => {
    try {
      dispatch(setLanguageLoading(true));
      
      const response = await fetch(`http://localhost:5000/api/i18n/${language}`);
      const result = await response.json();
      
      if (result.success) {
        dispatch(setLanguage(language));
        dispatch(setTranslations(result.translations || {}));
        
        // Save to localStorage
        localStorage.setItem('currentLanguage', language);
        
        console.log(`Language switched to: ${language}`);
      } else {
        console.error('Language loading failed:', result.message);
      }
    } catch (error) {
      console.error('Language loading error:', error);
    } finally {
      dispatch(setLanguageLoading(false));
    }
  };
};