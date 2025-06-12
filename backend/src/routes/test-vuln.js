// unsafeIsAdmin 미들웨어를 사용하는 테스트 엔드포인트 생성
const express = require('express');
const router = express.Router();
const { authenticate, unsafeIsAdmin } = require('../middlewares/auth');

// 의도적으로 취약한 관리자 테스트 엔드포인트
router.get('/unsafe-admin-test', authenticate, unsafeIsAdmin, (req, res) => {
  res.json({
    success: true,
    message: '취약한 관리자 권한으로 접근 성공!',
    user: req.user,
    warning: '이것은 권한 우회 취약점입니다!'
  });
});

module.exports = router;
