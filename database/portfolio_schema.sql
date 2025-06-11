-- 포트폴리오 관련 테이블 생성

-- 사용자 지갑 (USD 잔고)
CREATE TABLE user_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 10000.00, -- 기본 10,000 USD 지급
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_wallet (user_id)
);

-- 포트폴리오 보유 코인
CREATE TABLE portfolio_holdings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  total_amount DECIMAL(20, 8) DEFAULT 0, -- 총 보유량
  avg_price DECIMAL(15, 4) DEFAULT 0, -- 평균 매입가
  total_invested DECIMAL(15, 2) DEFAULT 0, -- 총 투자금액
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_coin (user_id, symbol)
);

-- 거래 내역
CREATE TABLE portfolio_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  transaction_type ENUM('buy', 'sell') NOT NULL,
  amount DECIMAL(20, 8) NOT NULL, -- 거래 수량
  price DECIMAL(15, 4) NOT NULL, -- 거래 당시 가격
  total_value DECIMAL(15, 2) NOT NULL, -- 총 거래금액
  fee DECIMAL(15, 2) DEFAULT 0, -- 수수료
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_transactions (user_id, created_at DESC),
  INDEX idx_symbol_transactions (symbol, created_at DESC)
);

-- 초기 데이터: 모든 기존 사용자에게 지갑 생성
INSERT IGNORE INTO user_wallets (user_id, balance)
SELECT id, 10000.00 FROM users;

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