-- CoinTalk 샘플 데이터 (1): 사용자, 코인, 태그 데이터

-- 사용자 데이터 (비밀번호: 'password123' 해시)
INSERT INTO users (username, email, password, profile_picture, bio, role) VALUES
('admin', 'admin@cointalk.com', '$2b$10$6j7NCIvLjJ1Ps7wZ9/E5UeQlG6Y/uVn4Z5Ej.tKZCwpPazRfC.FJK', 'admin.png', '관리자 계정입니다.', 'admin'),
('bitcoinenthusiast', 'bitcoin@example.com', '$2b$10$6j7NCIvLjJ1Ps7wZ9/E5UeQlG6Y/uVn4Z5Ej.tKZCwpPazRfC.FJK', 'user1.png', '비트코인 애호가입니다. 암호화폐 시장 분석과 트렌드에 관심이 많습니다.', 'user'),
('cryptotrader', 'trader@example.com', '$2b$10$6j7NCIvLjJ1Ps7wZ9/E5UeQlG6Y/uVn4Z5Ej.tKZCwpPazRfC.FJK', 'user2.png', '풀타임 암호화폐 트레이더. 기술적 분석 전문가.', 'user'),
('defimaster', 'defi@example.com', '$2b$10$6j7NCIvLjJ1Ps7wZ9/E5UeQlG6Y/uVn4Z5Ej.tKZCwpPazRfC.FJK', 'user3.png', 'DeFi 플랫폼 개발자. 탈중앙화 금융의 미래를 만들어갑니다.', 'user'),
('nftcollector', 'nft@example.com', '$2b$10$6j7NCIvLjJ1Ps7wZ9/E5UeQlG6Y/uVn4Z5Ej.tKZCwpPazRfC.FJK', 'user4.png', 'NFT 수집가이자 디지털 아트 애호가.', 'user');

-- 코인 데이터
INSERT INTO coins (name, symbol, description, logo_url, website, price, market_cap, volume_24h, change_24h) VALUES
('Bitcoin', 'BTC', '비트코인은 2009년 사토시 나카모토에 의해 만들어진 최초의 암호화폐로, 분산형 디지털 화폐를 목표로 합니다.', 'btc.png', 'https://bitcoin.org', 58432.21, 1120000000000, 45300000000, 2.4),
('Ethereum', 'ETH', '이더리움은 스마트 계약 기능을 갖춘 분산형 오픈소스 블록체인 기반의 컴퓨팅 플랫폼입니다.', 'eth.png', 'https://ethereum.org', 3521.08, 420000000000, 21600000000, -1.2),
('Cardano', 'ADA', '카르다노는 지속가능성과 확장성을 중시하는 블록체인 플랫폼입니다.', 'ada.png', 'https://cardano.org', 2.85, 92000000000, 6700000000, 5.7),
('Solana', 'SOL', '솔라나는 고성능 블록체인으로, 빠른 트랜잭션 속도와 낮은 수수료를 제공합니다.', 'sol.png', 'https://solana.com', 158.64, 48000000000, 5200000000, 8.3),
('Ripple', 'XRP', '리플은 금융 기관을 위한 디지털 결제 프로토콜이자 암호화폐입니다.', 'xrp.png', 'https://ripple.com', 1.12, 52000000000, 3900000000, -0.8),
('Avalanche', 'AVAX', '애벌랜치는 스마트 계약 기능을 갖춘 고확장성 블록체인 플랫폼입니다.', 'avax.png', 'https://avax.network', 86.42, 23500000000, 1800000000, 3.6),
('Polkadot', 'DOT', '폴카닷은 다양한 블록체인 간의 상호 운용성을 제공하는 프로젝트입니다.', 'dot.png', 'https://polkadot.network', 42.18, 41500000000, 2700000000, -2.1),
('Chainlink', 'LINK', '체인링크는 블록체인과 실제 세계 데이터를 연결하는 탈중앙화 오라클 네트워크입니다.', 'link.png', 'https://chain.link', 29.73, 14800000000, 1200000000, 1.9),
('Aave', 'AAVE', '에이브는 사용자가 자산을 예치하고 대출할 수 있는 탈중앙화 금융 프로토콜입니다.', 'aave.png', 'https://aave.com', 376.25, 4900000000, 580000000, 4.3),
('Uniswap', 'UNI', '유니스왑은 이더리움 블록체인 상의 탈중앙화 거래소(DEX)입니다.', 'uni.png', 'https://uniswap.org', 24.86, 7800000000, 920000000, -0.5);

-- 태그 데이터
INSERT INTO tags (name) VALUES
('시세분석'), ('비트코인'), ('이더리움'), ('DeFi'), ('NFT'), ('블록체인'), ('스마트계약'), ('채굴'), ('전망'), ('뉴스'),
('기술분석'), ('경제'), ('거래소'), ('규제'), ('투자전략'), ('DAO'), ('Web3'), ('메타버스'), ('프라이버시코인'), ('스테이킹');
