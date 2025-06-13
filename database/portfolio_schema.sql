-- 포트폴리오 관련 테이블 생성

-- 사용자 지갑 (USD 잔고)
CREATE TABLE IF NOT EXISTS user_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 100000000.00, -- 기본 1억원 지급
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_wallet (user_id)
);

-- 포트폴리오 보유 코인
CREATE TABLE IF NOT EXISTS portfolio_holdings (
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
CREATE TABLE IF NOT EXISTS portfolio_transactions (
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