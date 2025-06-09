const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

// 임시 라우트 (나중에 구현 예정)
router.get('/', authenticate, (req, res) => {
  res.json({ 
    success: true,
    message: '알림 API - 구현 예정',
    notifications: [
      {
        id: 1,
        type: 'like',
        content: '회원님의 게시물에 좋아요가 눌렸습니다.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'comment',
        content: '회원님의 게시물에 댓글이 달렸습니다.',
        isRead: false,
        timestamp: new Date()
      }
    ]
  });
});

router.put('/:id/read', authenticate, (req, res) => {
  res.json({ 
    success: true,
    message: '알림 읽음 처리 - 구현 예정'
  });
});

module.exports = router;
