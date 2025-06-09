-- 2차 인증 테스트용 샘플 데이터

-- 2차 인증이 활성화된 테스트 사용자
INSERT INTO users (username, email, password, role, two_factor_enabled) VALUES 
('testuser2fa', 'test2fa@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE);

-- 2차 인증 설정 추가 (시크릿 키는 예시용)
INSERT INTO two_factor_auth (user_id, secret_key, backup_codes, enabled, enabled_at) VALUES 
(
  (SELECT id FROM users WHERE email = 'test2fa@example.com'),
  'JBSWY3DPEHPK3PXP', -- 예시 시크릿 키
  '["ABCD1234", "EFGH5678", "IJKL9012", "MNOP3456", "QRST7890", "UVWX1234", "YZAB5678", "CDEF9012", "GHIJ3456", "KLMN7890"]',
  TRUE,
  NOW()
);

-- 관리자 계정에도 2차 인증 설정
UPDATE users SET two_factor_enabled = TRUE WHERE email = 'admin@cointalk.com';

INSERT INTO two_factor_auth (user_id, secret_key, backup_codes, enabled, enabled_at) VALUES 
(
  (SELECT id FROM users WHERE email = 'admin@cointalk.com'),
  'LFLFMU2SGVCUIUCG', -- 예시 시크릿 키
  '["ADMIN123", "SECURE45", "BACKUP67", "SAFETY89", "PROTECT0", "SHIELD12", "GUARD345", "DEFEND67", "SECURE89", "SAFETY01"]',
  TRUE,
  NOW()
);
