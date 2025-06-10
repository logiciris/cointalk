-- test5 계정에 2차 인증 활성화
UPDATE users SET two_factor_enabled = TRUE WHERE email = 'test5@test.com';

-- test5 계정용 2차 인증 데이터 추가
INSERT INTO two_factor_auth (user_id, secret_key, backup_codes, enabled, enabled_at)
SELECT 
    id,
    '123456', -- 고정 인증 코드 (교육용)
    '["BACKUP1", "BACKUP2", "BACKUP3", "BACKUP4", "BACKUP5", "BACKUP6", "BACKUP7", "BACKUP8", "BACKUP9", "BACKUP10"]',
    TRUE,
    NOW()
FROM users 
WHERE email = 'test5@test.com'
ON DUPLICATE KEY UPDATE 
    secret_key = '123456',
    enabled = TRUE,
    enabled_at = NOW();
