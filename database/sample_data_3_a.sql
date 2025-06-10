-- 문자셋 설정 (Windows 호환성)
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- CoinTalk 샘플 데이터 (3): 관계 데이터(게시물-태그, 게시물-코인, 댓글, 좋아요 등)

-- 게시물-태그 연결 데이터
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 9), -- 비트코인 상승세: 시세분석, 비트코인, 전망
(2, 3), (2, 7), (2, 4), -- 이더리움 2.0: 이더리움, 스마트계약, DeFi
(3, 4), (3, 6), (3, 14), -- 탈중앙화 금융: DeFi, 블록체인, 규제
(4, 5), (4, 17), (4, 18), -- NFT 시장: NFT, Web3, 메타버스
(5, 2), (5, 8), (5, 9); -- 비트코인 반감기: 비트코인, 채굴, 전망

-- 게시물-코인 연결 데이터
INSERT INTO post_coins (post_id, coin_id) VALUES
(1, 1), -- 비트코인 상승세: BTC
(2, 2), -- 이더리움 2.0: ETH
(3, 2), (3, 9), (3, 10), -- 탈중앙화 금융: ETH, AAVE, UNI
(4, 2), -- NFT 시장: ETH (대부분의 NFT가 이더리움 기반)
(5, 1); -- 비트코인 반감기: BTC
