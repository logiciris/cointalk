-- 관리자 계정 추가 스크립트
-- 아이디: admin, 비밀번호: Ad12!@Min13!#

-- 먼저 기존 admin 계정 확인 및 새 관리자 계정 생성
-- 비밀번호는 bcrypt로 해싱됨 (Ad12!@Min13!#)

-- 기존 admin 계정의 비밀번호를 새로운 비밀번호로 업데이트
UPDATE users 
SET password = '$2b$10$7kJN9q8w3cBzP.HtYvxhJOGZ4tKL5mZ3NxqPr.QwE9fGhI2dL0pCK' 
WHERE username = 'admin';

-- 만약 admin 계정이 없다면 새로 생성
INSERT IGNORE INTO users (username, email, password, profile_picture, bio, role) VALUES
('admin', 'admin@cointalk.com', '$2b$10$7kJN9q8w3cBzP.HtYvxhJOGZ4tKL5mZ3NxqPr.QwE9fGhI2dL0pCK', 'admin.png', 'CoinTalk 시스템 관리자', 'admin');

-- 업데이트된 관리자 계정 정보 확인
SELECT id, username, email, role, created_at FROM users WHERE role = 'admin';
