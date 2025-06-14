const express = require('express');
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const auth = require('../middlewares/auth');

const router = express.Router();

// 메인 엔드포인트들 (취약한 버전을 기본으로 사용)
// 주의: 특정 패턴 경로가 :id 경로보다 먼저 와야 함
router.get('/', postController.unsafeGetPosts);
router.get('/search', postController.unsafeSearchPosts);
router.get('/trending-tags', postController.getTrendingTags);
router.get('/active-users', postController.getActiveUsers);
router.get('/user/:username', postController.getPostsByUser);

// 좋아요 관련 라우트 - :id 경로보다 먼저 와야 함
router.post('/:postId/like', auth.authenticate, likeController.togglePostLike);
router.get('/:postId/like-status', auth.optionalAuth, likeController.getPostLikeStatus);

// 게시물 관련 라우트 (안전한 버전을 기본으로 변경)
router.get('/:id', auth.optionalAuth, postController.getPost);
router.post('/', auth.authenticate, postController.createPost);
router.put('/:id', auth.authenticate, postController.unsafeUpdatePost);
router.delete('/:id', auth.authenticate, postController.unsafeDeletePost);

// 취약한 버전은 /unsafe 경로로 이동 (학습용)
router.get('/unsafe/:id', postController.unsafeGetPost);

module.exports = router;
