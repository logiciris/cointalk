-- 파일 업로드 기능을 위한 테이블 추가

-- 게시물 첨부파일 테이블
CREATE TABLE post_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    downloads INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 샘플 데이터
INSERT INTO post_files (post_id, original_name, stored_name, file_path, file_size, mime_type) VALUES
(1, 'trading-strategy.js', 'trading-strategy-1647123456.js', '/uploads/trading-strategy-1647123456.js', 2048, 'application/javascript'),
(2, 'market-analysis.pdf', 'market-analysis-1647123457.pdf', '/uploads/market-analysis-1647123457.pdf', 524288, 'application/pdf');