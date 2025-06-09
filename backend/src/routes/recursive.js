const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const objectUtils = require('../utils/objectUtils');

// 전역 설정 객체 (의도적으로 Prototype Pollution 영향을 받도록 함)
const globalConfig = {
  features: {
    darkMode: false,
    notifications: true,
    analytics: true
  },
  security: {
    requireAuth: true,
    csrfProtection: true,
    rateLimit: {
      enabled: true,
      maxRequests: 100
    }
  }
};

// 객체 재귀 처리 엔드포인트 (Prototype Pollution 취약점)
router.post('/process', async (req, res) => {
  try {
    const inputData = req.body.data || {};
    
    // 의도적으로 취약한 객체 병합 사용
    const processedData = objectUtils.deepMerge({}, inputData);
    
    // 응답 전송
    res.json({
      success: true,
      message: '데이터 처리 완료',
      result: processedData
    });
  } catch (error) {
    console.error('데이터 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 글로벌 설정 조회 엔드포인트
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: globalConfig
  });
});

// 취약한 설정 업데이트 엔드포인트
router.post('/config', authenticate, (req, res) => {
  try {
    const { path, value } = req.body;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        message: '설정 경로가 필요합니다.'
      });
    }
    
    // 의도적으로 취약한 경로 기반 값 설정 함수 사용
    // 예시: path로 "__proto__.isAdmin" 전달 시 Object.prototype.isAdmin = true 설정
    objectUtils.setValueByPath(globalConfig, path, value);
    
    res.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      config: globalConfig
    });
  } catch (error) {
    console.error('설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 취약한 객체 병합 엔드포인트
router.post('/merge', (req, res) => {
  try {
    const { target, source } = req.body;
    
    if (!target || !source) {
      return res.status(400).json({
        success: false,
        message: 'target과 source 객체가 모두 필요합니다.'
      });
    }
    
    // 의도적으로 취약한 객체 병합 함수 사용
    const result = objectUtils.deepMerge(target, source);
    
    res.json({
      success: true,
      message: '객체 병합 완료',
      result
    });
  } catch (error) {
    console.error('객체 병합 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Prototype Pollution 취약점 테스트 엔드포인트
router.get('/check', (req, res) => {
  // 빈 객체 생성
  const testObj = {};
  
  // 객체가 오염되었는지 확인
  // Prototype Pollution이 발생했다면 testObj.isAdmin이 true가 됨
  const result = {
    isVulnerable: (({}).isAdmin === true || testObj.isAdmin === true),
    objectPrototype: Object.keys(Object.prototype),
    testObj: {
      hasOwnProperty: testObj.hasOwnProperty('isAdmin'),
      isAdmin: testObj.isAdmin,
      toString: (typeof testObj.toString === 'function') ? '[Function]' : testObj.toString
    }
  };
  
  res.json({
    success: true,
    message: 'Prototype Pollution 취약점 검사 결과',
    result
  });
});

module.exports = router;