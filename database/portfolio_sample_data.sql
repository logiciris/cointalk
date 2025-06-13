-- 포트폴리오 샘플 데이터 (사용자 데이터 로딩 후 실행)

-- 초기 데이터: 모든 기존 사용자에게 지갑 생성 (1억원)
INSERT IGNORE INTO user_wallets (user_id, balance)
SELECT id, 100000000.00 FROM users;

-- 샘플 포트폴리오 데이터 (test 사용자용)
INSERT IGNORE INTO portfolio_holdings (user_id, symbol, coin_name, total_amount, avg_price, total_invested)
SELECT 
  u.id,
  'BTC',
  'Bitcoin',
  0.1234,
  45000.00,
  5553.00
FROM users u WHERE u.email = 'test@example.com';

INSERT IGNORE INTO portfolio_holdings (user_id, symbol, coin_name, total_amount, avg_price, total_invested)
SELECT 
  u.id,
  'ETH', 
  'Ethereum',
  1.5678,
  2800.00,
  4389.84
FROM users u WHERE u.email = 'test@example.com';

-- 샘플 거래 내역
INSERT IGNORE INTO portfolio_transactions (user_id, symbol, coin_name, transaction_type, amount, price, total_value, fee)
SELECT 
  u.id,
  'BTC',
  'Bitcoin',
  'buy',
  0.1234,
  45000.00,
  5553.00,
  27.77
FROM users u WHERE u.email = 'test@example.com';

INSERT IGNORE INTO portfolio_transactions (user_id, symbol, coin_name, transaction_type, amount, price, total_value, fee)
SELECT 
  u.id,
  'ETH',
  'Ethereum', 
  'buy',
  1.5678,
  2800.00,
  4389.84,
  21.95
FROM users u WHERE u.email = 'test@example.com';
