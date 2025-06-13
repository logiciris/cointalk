const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/auth');
const User = require('../models/User');
const config = require('../config/config');

// 사용자 설정을 저장하는 전역 객체
const userSettings = {};

// 취약한 객체 병합 함수 (Prototype Pollution 취약점)
function mergeObjects(target, source) {
  for (let key in source) {
    // 매우 취약한 구현: __proto__ 등 위험한 키도 그대로 처리
    if (key === '__proto__') {
      // 직접 Object.prototype 조작
      Object.assign(Object.prototype, source[key]);
      console.log('🚨 __proto__ 발견! Object.prototype 오염 시도');
      continue;
    }
    
    if (source[key] && typeof source[key] === 'object') {
      // target[key]가 없으면 빈 객체 생성
      if (!target[key]) target[key] = {};
      
      // 재귀적으로 객체 병합
      mergeObjects(target[key], source[key]);
    } else {
      // 기본값 복사
      target[key] = source[key];
    }
  }
  return target;
}

// 사용자 설정 저장 엔드포인트 (Prototype Pollution 취약점을 포함)
router.post('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // userId → id로 수정
    const settings = req.body.settings;
    
    console.log('받은 settings:', JSON.stringify(settings, null, 2));
    console.log('사용자 ID:', userId);
    
    // 사용자 설정이 없으면 초기화
    if (!userSettings[userId]) {
      userSettings[userId] = {};
    }
    
    // 취약한 객체 병합 (Prototype Pollution 발생 가능)
    // 예시: 클라이언트가 {"settings": {"__proto__": {"isAdmin": true}}} 전송 시
    // Object.prototype.isAdmin = true 설정됨
    mergeObjects(userSettings[userId], settings);
    
    // 디버깅: Prototype 오염 확인
    console.log('=== Prototype Pollution 디버깅 ===');
    console.log('Object.prototype.isAdmin:', Object.prototype.isAdmin);
    console.log('빈 객체의 isAdmin:', {}.isAdmin);
    console.log('req.user.isAdmin:', req.user.isAdmin);
    console.log('================================');
    
    res.json({
      success: true,
      message: '사용자 설정이 저장되었습니다.',
      settings: userSettings[userId]
    });
  } catch (error) {
    console.error('사용자 설정 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 설정 조회 엔드포인트
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // userId → id로 수정
    
    // 저장된 설정이 없으면 빈 객체 반환
    const settings = userSettings[userId] || {};
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('사용자 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 의도적으로 취약한 전역 설정 업데이트 엔드포인트
router.post('/global-settings', authenticate, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    // 관리자 권한 확인
    // 취약점: 프로토타입 오염으로 isAdmin이 true로 설정되어 있으면
    // 권한 검사를 우회할 수 있음
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      });
    }
    
    // 전역 설정 저장
    const result = await updateGlobalSetting(key, value);
    
    res.json({
      success: true,
      message: '전역 설정이 업데이트되었습니다.',
      result
    });
  } catch (error) {
    console.error('전역 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 전역 설정 업데이트 함수 (모의 구현)
async function updateGlobalSetting(key, value) {
  // 실제로는 데이터베이스 업데이트 로직
  console.log(`전역 설정 업데이트: ${key} = ${JSON.stringify(value)}`);
  return { updated: true, key, value };
}

module.exports = router;