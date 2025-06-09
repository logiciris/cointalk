import React, { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { loadLanguage } from '../../redux/actions/i18nActions';
import { getLanguageDisplayName, getLanguageFlag } from '../../hooks/useTranslation';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const { currentLanguage, loading } = useSelector(state => state.i18n);

  useEffect(() => {
    // 초기 언어 로드
    dispatch(loadLanguage(currentLanguage));
  }, [dispatch, currentLanguage]);

  const changeLanguage = async (language) => {
    if (language === currentLanguage) return;
    
    await dispatch(loadLanguage(language));
  };

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="outline-light" 
        size="sm" 
        className="border-0"
        disabled={loading}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
        ) : (
          <span className="me-2">{getLanguageFlag(currentLanguage)}</span>
        )}
        {getLanguageDisplayName(currentLanguage)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item 
          active={currentLanguage === 'ko'}
          onClick={() => changeLanguage('ko')}
        >
          <span className="me-2">🇰🇷</span>
          한국어
        </Dropdown.Item>
        <Dropdown.Item 
          active={currentLanguage === 'en'}
          onClick={() => changeLanguage('en')}
        >
          <span className="me-2">🇺🇸</span>
          English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;