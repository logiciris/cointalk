-- 사용자 테이블에 핸드폰 번호 컬럼 추가
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;
