const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

const router = express.Router();

// 안전한 엔드포인트
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:username', userController.getUserProfile);

// 인증이 필요한 안전한 엔드포인트
router.get('/profile', auth.authenticate, userController.getProfile);
router.put('/profile', auth.authenticate, userController.updateProfile);
router.put('/change-password', auth.authenticate, userController.changePassword);

// 취약한 엔드포인트 (SQL 인젝션 취약점)
router.post('/unsafe-login', userController.unsafeLogin);
router.get('/unsafe/:id', userController.unsafeGetUser);
router.get('/unsafe/search', userController.unsafeSearchUsers);
router.put('/unsafe/:id/profile', auth.authenticate, userController.unsafeUpdateProfile);

// SSRF 취약점이 있는 엔드포인트
router.put('/profile/image/unsafe', auth.authenticate, userController.unsafeUpdateProfileImage);

module.exports = router;
