const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 모든 관리자 라우트에 인증 및 관리자 권한 확인 미들웨어 적용
router.use(authenticate);
router.use(isAdmin);

// 대시보드
router.get('/dashboard', adminController.getDashboard);

// 사용자 관리
router.get('/users', adminController.getUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

// 게시물 관리
router.get('/posts', adminController.getPosts);
router.delete('/posts/:postId', adminController.deletePost);

// 댓글 관리
router.get('/comments', adminController.getComments);
router.delete('/comments/:commentId', adminController.deleteComment);

// 시스템 설정
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router;
