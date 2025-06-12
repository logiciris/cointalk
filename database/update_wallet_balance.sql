-- 기존 사용자 지갑 잔고를 1억원으로 업데이트
UPDATE user_wallets SET balance = 100000000.00;

-- 지갑이 없는 사용자들에게 1억원 지갑 생성
INSERT IGNORE INTO user_wallets (user_id, balance)
SELECT id, 100000000.00 FROM users 
WHERE id NOT IN (SELECT user_id FROM user_wallets);
