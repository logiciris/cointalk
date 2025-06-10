-- 문자셋 설정 (Windows 호환성)
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- CoinTalk 샘플 데이터 (3D): 북마크 및 알림 데이터

-- 북마크 데이터
INSERT INTO bookmarks (user_id, post_id) VALUES
(2, 2), (2, 3), -- bitcoinenthusiast의 북마크
(3, 1), (3, 5), -- cryptotrader의 북마크
(4, 1), (4, 2), (4, 5), -- defimaster의 북마크
(5, 3), (5, 4); -- nftcollector의 북마크

-- 알림 데이터
INSERT INTO notifications (user_id, type, content, source_user_id, source_post_id, source_comment_id) VALUES
(2, 'like', 'cryptotrader님이 회원님의 게시물을 좋아합니다.', 3, 1, NULL),
(2, 'comment', 'cryptotrader님이 회원님의 게시물에 댓글을 남겼습니다.', 3, 1, 1),
(3, 'like', 'bitcoinenthusiast님이 회원님의 게시물을 좋아합니다.', 2, 2, NULL),
(3, 'follow', 'bitcoinenthusiast님이 회원님을 팔로우합니다.', 2, NULL, NULL),
(4, 'comment', 'bitcoinenthusiast님이 회원님의 게시물에 댓글을 남겼습니다.', 2, 3, 7),
(4, 'like', 'nftcollector님이 회원님의 게시물을 좋아합니다.', 5, 3, NULL),
(5, 'follow', 'defimaster님이 회원님을 팔로우합니다.', 4, NULL, NULL),
(5, 'like', 'defimaster님이 회원님의 댓글을 좋아합니다.', 4, NULL, 6);
