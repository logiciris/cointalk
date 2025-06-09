import { SET_LANGUAGE, SET_TRANSLATIONS, LANGUAGE_LOADING } from '../actions/i18nActions';

const initialState = {
  currentLanguage: localStorage.getItem('currentLanguage') || 'ko',
  translations: {},
  loading: false,
  supportedLanguages: ['ko', 'en']
};

const i18nReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        currentLanguage: action.payload
      };
      
    case SET_TRANSLATIONS:
      return {
        ...state,
        translations: action.payload
      };
      
    case LANGUAGE_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    default:
      return state;
  }
};

export default i18nReducer;