-- 관리자 계정 비밀번호 업데이트
-- 비밀번호: Ad12!@Min13!#

UPDATE users 
SET password = '$2b$10$7kJN9q8w3cBzP.HtYvxhJOGZ4tKL5mZ3NxqPr.QwE9fGhI2dL0pCK' 
WHERE email = 'admin@cointalk.com';

-- 다른 관리자 계정 삭제 (admin@cointalk.com만 유지)
DELETE FROM users WHERE role = 'admin' AND email != 'admin@cointalk.com';

-- 결과 확인
SELECT id, username, email, role FROM users WHERE role = 'admin';
