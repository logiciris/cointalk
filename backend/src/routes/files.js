const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

// 파일 업로드 (인증 필요)
router.post('/upload', authenticate, upload.uploadMultiple, fileController.uploadFiles);

// 파일 다운로드 (인증 불필요 - 취약점)
router.get('/download/:filename', fileController.downloadFile);

// 게시물의 첨부파일 목록 조회
router.get('/post/:postId', fileController.getPostFiles);

// 파일 삭제 (인증 필요)
router.delete('/:fileId', authenticate, fileController.deleteFile);

module.exports = router;