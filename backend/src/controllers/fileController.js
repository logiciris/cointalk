const database = require('../utils/database');
const path = require('path');
const fs = require('fs');

class FileController {
    // 파일 업로드
    async uploadFiles(req, res) {
        try {
            const { postId } = req.body;
            const files = req.files || [req.file].filter(Boolean);
            
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '업로드할 파일이 없습니다.'
                });
            }

            // postId 유효성 검사
            let validPostId = null;
            if (postId && postId !== 'undefined' && !isNaN(parseInt(postId))) {
                validPostId = parseInt(postId);
            }
            
            const uploadedFiles = [];
            
            for (const file of files) {
                // 파일 정보를 데이터베이스에 저장
                const fileData = {
                    post_id: validPostId,
                    original_name: file.originalname,
                    stored_name: file.filename,
                    file_path: file.path,
                    file_size: file.size,
                    mime_type: file.mimetype
                };
                
                const result = await database.query(
                    'INSERT INTO post_files (post_id, original_name, stored_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
                    [fileData.post_id, fileData.original_name, fileData.stored_name, fileData.file_path, fileData.file_size, fileData.mime_type]
                );
                
                uploadedFiles.push({
                    id: result.insertId,
                    ...fileData
                });
            }
            
            res.json({
                success: true,
                message: '파일이 성공적으로 업로드되었습니다.',
                files: uploadedFiles
            });
            
        } catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({
                success: false,
                message: '파일 업로드 중 오류가 발생했습니다.'
            });
        }
    }
    
    // 파일 다운로드 (취약한 버전 - Path Traversal 공격 가능)
    async downloadFile(req, res) {
        try {
            const { filename } = req.params;
            
            // 의도적으로 취약한 구현 - 경로 순회 공격에 취약
            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: '파일명이 필요합니다.'
                });
            }
            
            // 취약한 파일 경로 처리 - URL 디코딩 후 경로 구성
            const decodedFilename = decodeURIComponent(filename);
            const uploadsDir = path.join(__dirname, '../../uploads');
            const filePath = path.join(uploadsDir, decodedFilename);
            
            console.log('🔓 Path Traversal 시도:', decodedFilename);
            console.log('🔓 요청된 파일 경로:', filePath);
            
            // 파일 존재 확인
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: '파일을 찾을 수 없습니다.'
                });
            }
            
            // 취약한 파일 전송 - 어떤 파일이든 다운로드 가능
            const originalFilename = path.basename(filePath);
            res.download(filePath, originalFilename, (err) => {
                if (err) {
                    console.error('File download error:', err);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            message: '파일 다운로드 중 오류가 발생했습니다.'
                        });
                    }
                }
            });
            
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                message: '파일 다운로드 중 오류가 발생했습니다.'
            });
        }
    }
    
    // 게시물의 첨부파일 목록 조회
    async getPostFiles(req, res) {
        try {
            const { postId } = req.params;
            
            const files = await database.query(
                'SELECT * FROM post_files WHERE post_id = ? ORDER BY upload_date DESC',
                [postId]
            );
            
            res.json({
                success: true,
                files: files
            });
            
        } catch (error) {
            console.error('Get post files error:', error);
            res.status(500).json({
                success: false,
                message: '파일 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }
    
    // 파일 삭제
    async deleteFile(req, res) {
        try {
            const { fileId } = req.params;
            const userId = req.user.id;
            
            // 파일 정보 조회 및 권한 확인
            const file = await database.query(
                'SELECT pf.*, p.user_id FROM post_files pf LEFT JOIN posts p ON pf.post_id = p.id WHERE pf.id = ?',
                [fileId]
            );
            
            if (!file || file.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '파일을 찾을 수 없습니다.'
                });
            }
            
            // 권한 확인 (게시물 작성자 또는 관리자만)
            if (file[0].user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: '파일 삭제 권한이 없습니다.'
                });
            }
            
            // 물리적 파일 삭제
            const filePath = file[0].file_path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // 데이터베이스에서 파일 정보 삭제
            await database.query('DELETE FROM post_files WHERE id = ?', [fileId]);
            
            res.json({
                success: true,
                message: '파일이 삭제되었습니다.'
            });
            
        } catch (error) {
            console.error('File delete error:', error);
            res.status(500).json({
                success: false,
                message: '파일 삭제 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = new FileController();