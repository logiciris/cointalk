const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

// 임시 라우트 (나중에 구현 예정)
router.get('/', authenticate, (req, res) => {
  res.json({ 
    success: true,
    message: '메시지 API - 구현 예정',
    messages: [
      {
        id: 1,
        from: 'user1',
        content: '안녕하세요!',
        timestamp: new Date()
      }
    ]
  });
});

router.post('/', authenticate, (req, res) => {
  res.json({ 
    success: true,
    message: '메시지 전송 - 구현 예정'
  });
});

module.exports = router;
