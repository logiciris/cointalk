const database = require('../utils/database');

class LikeController {
  // 게시물 좋아요 토글
  async togglePostLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 게시물 ID입니다.' 
        });
      }
      
      // 게시물 존재 확인
      const post = await database.query(
        'SELECT id FROM posts WHERE id = ? AND is_deleted = 0',
        [postId]
      );
      
      if (!post || post.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '게시물을 찾을 수 없습니다.' 
        });
      }
      
      // 이미 좋아요 했는지 확인
      const existingLike = await database.query(
        'SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );
      
      let isLiked = false;
      
      if (existingLike && existingLike.length > 0) {
        // 좋아요 취소
        await database.query(
          'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
          [userId, postId]
        );
        isLiked = false;
      } else {
        // 좋아요 추가
        await database.query(
          'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
          [userId, postId]
        );
        isLiked = true;
      }
      
      // 총 좋아요 수 조회
      const likeCount = await database.query(
        'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
        [postId]
      );
      
      res.json({
        success: true,
        isLiked,
        likeCount: likeCount[0].count,
        message: isLiked ? '좋아요를 추가했습니다.' : '좋아요를 취소했습니다.'
      });
    } catch (error) {
      console.error('Toggle post like error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
  
  // 댓글 좋아요 토글
  async toggleCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 댓글 ID입니다.' 
        });
      }
      
      // 댓글 존재 확인
      const comment = await database.query(
        'SELECT id FROM comments WHERE id = ? AND is_deleted = 0',
        [commentId]
      );
      
      if (!comment || comment.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '댓글을 찾을 수 없습니다.' 
        });
      }
      
      // 이미 좋아요 했는지 확인
      const existingLike = await database.query(
        'SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?',
        [userId, commentId]
      );
      
      let isLiked = false;
      
      if (existingLike && existingLike.length > 0) {
        // 좋아요 취소
        await database.query(
          'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
          [userId, commentId]
        );
        isLiked = false;
      } else {
        // 좋아요 추가
        await database.query(
          'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
          [userId, commentId]
        );
        isLiked = true;
      }
      
      // 총 좋아요 수 조회
      const likeCount = await database.query(
        'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
        [commentId]
      );
      
      res.json({
        success: true,
        isLiked,
        likeCount: likeCount[0].count,
        message: isLiked ? '좋아요를 추가했습니다.' : '좋아요를 취소했습니다.'
      });
    } catch (error) {
      console.error('Toggle comment like error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
  
  // 게시물의 좋아요 상태 조회
  async getPostLikeStatus(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 게시물 ID입니다.' 
        });
      }
      
      // 총 좋아요 수 조회
      const likeCount = await database.query(
        'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
        [postId]
      );
      
      let isLiked = false;
      
      if (userId) {
        // 사용자의 좋아요 상태 확인
        const userLike = await database.query(
          'SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?',
          [userId, postId]
        );
        isLiked = userLike && userLike.length > 0;
      }
      
      res.json({
        success: true,
        isLiked,
        likeCount: likeCount[0].count
      });
    } catch (error) {
      console.error('Get post like status error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
}

module.exports = new LikeController();