const multer = require('multer');
const path = require('path');
const fs = require('fs');

// uploads 디렉토리 생성
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 파일 저장 설정 (취약하게 설정)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // 원본 파일명 유지 (취약점: 파일명 검증 없음)
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, originalName);
    }
});

// 파일 필터 (취약하게 설정)
const fileFilter = (req, file, cb) => {
    // 매우 관대한 파일 검증 (거의 모든 파일 허용)
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'text/plain', 'application/zip',
        'application/javascript', 'text/javascript',
        'application/octet-stream' // 이진 파일 허용
    ];
    
    // MIME 타입 검증 우회 가능
    if (allowedTypes.includes(file.mimetype) || file.originalname.includes('.')) {
        cb(null, true);
    } else {
        cb(null, true); // 모든 파일 허용 (취약점)
    }
};

// Multer 설정 (취약한 설정)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB (큰 용량 허용)
        files: 10 // 최대 10개 파일
    }
});

module.exports = {
    uploadSingle: upload.single('file'),
    uploadMultiple: upload.array('files', 10),
    uploadsDir: uploadsDir
};