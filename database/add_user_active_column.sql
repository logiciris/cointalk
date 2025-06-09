-- 사용자 테이블에 is_active 컬럼 추가
-- 관리자 페이지에서 사용자 상태 관리를 위함

ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role;

-- 기존 사용자들을 모두 활성 상태로 설정
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- 컬럼 추가 확인
DESCRIBE users;
