-- 관리자 계정 추가 스크립트
-- 아이디: admin, 비밀번호: Ad12!@Min13!#

-- 비밀번호 해시 생성 (Ad12!@Min13!#)
-- 참고: bcrypt 해시는 매번 다르게 생성되므로 실제 값을 사용해야 함

-- 기존 admin 계정의 비밀번호를 새로운 비밀번호로 업데이트
UPDATE users 
SET password = '$2b$10$Sv8mQH5L1fX9p2YzR3q.WeXGY8K9FjNqZ4Lv2oT6mR8P3Cx7dE1sG' 
WHERE username = 'admin';

-- 만약 admin 계정이 없다면 새로 생성
INSERT IGNORE INTO users (username, email, password, profile_picture, bio, role) VALUES
('admin', 'admin@cointalk.com', '$2b$10$Sv8mQH5L1fX9p2YzR3q.WeXGY8K9FjNqZ4Lv2oT6mR8P3Cx7dE1sG', 'admin.png', 'CoinTalk 시스템 관리자', 'admin');

-- 업데이트된 관리자 계정 정보 확인
SELECT id, username, email, role, created_at FROM users WHERE role = 'admin';
