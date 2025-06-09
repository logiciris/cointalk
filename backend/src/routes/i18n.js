const express = require('express');
const router = express.Router();
const path = require('path');

// 다국어 지원 API
router.get('/:lang', (req, res) => {
    const language = req.params.lang;
    
    // 지원되는 언어 목록
    const supportedLanguages = ['ko', 'en'];
    
    try {
        // 언어팩 파일 로드
        const translationsPath = path.resolve(__dirname, '..', 'locales', `${language}.js`);
        
        // 캐시 삭제 (개발 편의를 위해)
        delete require.cache[require.resolve(translationsPath)];
        
        // 언어팩 로드 - 여기서 취약점 발생 가능
        const translations = require(translationsPath);
        
        res.json({
            success: true,
            language: language,
            supported: supportedLanguages,
            translations: translations
        });
        
    } catch (error) {
        console.error('Language loading error:', error.message);
        
        res.status(404).json({
            success: false,
            error: 'Language not supported',
            language: language,
            supported: supportedLanguages,
            message: `Available languages: ${supportedLanguages.join(', ')}`
        });
    }
});

// 지원되는 언어 목록 조회
router.get('/', (req, res) => {
    res.json({
        success: true,
        supported: ['ko', 'en'],
        default: 'ko'
    });
});

module.exports = router;