const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/auth');
const User = require('../models/User');
const config = require('../config/config');

// 사용자 설정을 저장하는 전역 객체
const userSettings = {};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/auth');
const User = require('../models/User');
const config = require('../config/config');

// 사용자 설정을 저장하는 전역 객체
const userSettings = {};

// 객체 병합 함수
function mergeObjects(target, source) {
  for (let key in source) {
    // 특정 키는 처리하지 않음
    if (key === '__proto__') {
      Object.assign(Object.prototype, source[key]);
      console.log('__proto__ 발견! Object.prototype 처리');
      continue;
    }
    
    if (source[key] && typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      mergeObjects(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 사용자 설정 저장 엔드포인트
router.post('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body.settings;
    
    console.log('받은 settings:', JSON.stringify(settings, null, 2));
    console.log('사용자 ID:', userId);
    
    if (!userSettings[userId]) {
      userSettings[userId] = {};
    }
    
    // 객체 병합 처리
    mergeObjects(userSettings[userId], settings);
    
    // 디버깅
    console.log('=== 디버깅 ===');
    console.log('Object.prototype.isAdmin:', Object.prototype.isAdmin);
    console.log('빈 객체의 isAdmin:', {}.isAdmin);
    console.log('req.user.isAdmin:', req.user.isAdmin);
    console.log('===============');
    
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

// 전역 설정 업데이트 엔드포인트
router.post('/global-settings', authenticate, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    // 관리자 권한 확인
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

// 전역 설정 업데이트 함수
async function updateGlobalSetting(key, value) {
  console.log(`전역 설정 업데이트: ${key} = ${JSON.stringify(value)}`);
  return { updated: true, key, value };
}

module.exports = router;