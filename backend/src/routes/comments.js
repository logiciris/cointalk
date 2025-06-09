const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// 댓글 관련 라우트
router.get('/post/:postId', optionalAuth, commentController.getComments);
router.post('/post/:postId', authenticate, commentController.createComment);
router.put('/:commentId', authenticate, commentController.updateComment);
router.delete('/:commentId', authenticate, commentController.deleteComment);

// 좋아요 관련 라우트
router.post('/:commentId/like', authenticate, likeController.toggleCommentLike);

module.exports = router;
