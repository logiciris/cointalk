-- 문자셋 설정 (Windows 호환성)
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- CoinTalk 샘플 데이터 (3C): 좋아요 및 팔로우 데이터

-- 좋아요 데이터 (게시물)
INSERT INTO post_likes (user_id, post_id) VALUES
(2, 2), (2, 3), (2, 4), -- bitcoinenthusiast의 좋아요
(3, 1), (3, 3), (3, 5), -- cryptotrader의 좋아요
(4, 1), (4, 2), (4, 5), -- defimaster의 좋아요
(5, 1), (5, 2), (5, 3), (5, 4); -- nftcollector의 좋아요

-- 좋아요 데이터 (댓글)
INSERT INTO comment_likes (user_id, comment_id) VALUES
(2, 4), (2, 5), (2, 7), -- bitcoinenthusiast의 좋아요
(3, 1), (3, 3), (3, 9), -- cryptotrader의 좋아요
(4, 2), (4, 6), (4, 8), -- defimaster의 좋아요
(5, 1), (5, 4), (5, 7); -- nftcollector의 좋아요

-- 팔로우 데이터
INSERT INTO follows (follower_id, following_id) VALUES
(2, 3), (2, 4), -- bitcoinenthusiast가 팔로우하는 사용자
(3, 2), (3, 4), (3, 5), -- cryptotrader가 팔로우하는 사용자
(4, 2), (4, 3), (4, 5), -- defimaster가 팔로우하는 사용자
(5, 2), (5, 3), (5, 4); -- nftcollector가 팔로우하는 사용자

-- 코인 팔로우 데이터
INSERT INTO coin_follows (user_id, coin_id) VALUES
(2, 1), (2, 2), (2, 3), -- bitcoinenthusiast가 팔로우하는 코인
(3, 1), (3, 2), (3, 4), (3, 7), -- cryptotrader가 팔로우하는 코인
(4, 2), (4, 9), (4, 10), -- defimaster가 팔로우하는 코인
(5, 2), (5, 4), (5, 6); -- nftcollector가 팔로우하는 코인
