const database = require('../utils/database');

class CommentController {
  // 댓글 목록 조회
  async getComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
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
      
      // 댓글 조회 (좋아요 수 포함)
      const comments = await database.query(`
        SELECT 
          c.*,
          u.username,
          u.profile_picture,
          COUNT(cl.comment_id) as like_count
        FROM comments c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN comment_likes cl ON c.id = cl.comment_id
        WHERE c.post_id = ? AND c.is_deleted = 0
        GROUP BY c.id, u.id
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `, [postId, parseInt(limit), parseInt(offset)]);
      
      // 사용자가 좋아요한 댓글 확인 (로그인한 경우)
      if (req.user && comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        if (commentIds.length > 0) {
          const userLikes = await database.query(`
            SELECT comment_id 
            FROM comment_likes 
            WHERE user_id = ? AND comment_id IN (${commentIds.map(() => '?').join(',')})
          `, [req.user.id, ...commentIds]);
          
          const likedCommentIds = new Set(userLikes.map(like => like.comment_id));
          
          comments.forEach(comment => {
            comment.isLiked = likedCommentIds.has(comment.id);
          });
        } else {
          comments.forEach(comment => {
            comment.isLiked = false;
          });
        }
      } else {
        comments.forEach(comment => {
          comment.isLiked = false;
        });
      }
      
      // 총 댓글 수 조회
      const totalComments = await database.query(
        'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND is_deleted = 0',
        [postId]
      );
      
      res.json({
        success: true,
        data: {
          comments,
          pagination: {
            total: totalComments[0].count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalComments[0].count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
  
  // 댓글 작성
  async createComment(req, res) {
    try {
      const { postId } = req.params;
      const { content, parentId = null } = req.body;
      const userId = req.user.id;
      
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 게시물 ID입니다.' 
        });
      }
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: '댓글 내용을 입력해주세요.' 
        });
      }
      
      if (content.length > 1000) {
        return res.status(400).json({ 
          success: false, 
          message: '댓글은 1000자 이하로 입력해주세요.' 
        });
      }
      
      // 게시물 존재 확인
      const post = await database.query(
        'SELECT id, user_id FROM posts WHERE id = ? AND is_deleted = 0',
        [postId]
      );
      
      if (!post || post.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '게시물을 찾을 수 없습니다.' 
        });
      }
      
      // 부모 댓글 확인 (대댓글인 경우)
      if (parentId) {
        const parentComment = await database.query(
          'SELECT id FROM comments WHERE id = ? AND post_id = ? AND is_deleted = 0',
          [parentId, postId]
        );
        
        if (!parentComment || parentComment.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: '부모 댓글을 찾을 수 없습니다.' 
          });
        }
      }
      
      // 댓글 생성
      const result = await database.query(
        'INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
        [postId, userId, parentId, content.trim()]
      );
      
      // 생성된 댓글 정보 조회
      const newComment = await database.query(`
        SELECT 
          c.*,
          u.username,
          u.profile_picture,
          0 as like_count
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [result.insertId]);
      
      const comment = newComment[0];
      comment.isLiked = false;
      
      // 알림 생성 (게시물 작성자에게)
      if (post[0].user_id !== userId) {
        await database.query(`
          INSERT INTO notifications (user_id, type, content, source_user_id, source_post_id, source_comment_id)
          VALUES (?, 'comment', ?, ?, ?, ?)
        `, [post[0].user_id, `${req.user.username}님이 댓글을 작성했습니다.`, userId, postId, result.insertId]);
      }
      
      res.status(201).json({
        success: true,
        data: comment,
        message: '댓글이 작성되었습니다.'
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
  
  // 댓글 수정
  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 댓글 ID입니다.' 
        });
      }
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: '댓글 내용을 입력해주세요.' 
        });
      }
      
      if (content.length > 1000) {
        return res.status(400).json({ 
          success: false, 
          message: '댓글은 1000자 이하로 입력해주세요.' 
        });
      }
      
      // 댓글 존재 및 소유권 확인
      const comment = await database.query(
        'SELECT * FROM comments WHERE id = ? AND user_id = ? AND is_deleted = 0',
        [commentId, userId]
      );
      
      if (!comment || comment.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '댓글을 찾을 수 없거나 수정 권한이 없습니다.' 
        });
      }
      
      // 댓글 수정
      await database.query(
        'UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?',
        [content.trim(), commentId]
      );
      
      // 수정된 댓글 정보 조회
      const updatedComment = await database.query(`
        SELECT 
          c.*,
          u.username,
          u.profile_picture,
          COUNT(cl.comment_id) as like_count
        FROM comments c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN comment_likes cl ON c.id = cl.comment_id
        WHERE c.id = ?
        GROUP BY c.id, u.id
      `, [commentId]);
      
      res.json({
        success: true,
        data: updatedComment[0],
        message: '댓글이 수정되었습니다.'
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
  
  // 댓글 삭제
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ 
          success: false, 
          message: '유효하지 않은 댓글 ID입니다.' 
        });
      }
      
      // 댓글 존재 및 소유권 확인 (관리자는 모든 댓글 삭제 가능)
      const user = await database.query('SELECT role FROM users WHERE id = ?', [userId]);
      
      let comment;
      if (user[0].role === 'admin') {
        comment = await database.query(
          'SELECT * FROM comments WHERE id = ? AND is_deleted = 0',
          [commentId]
        );
      } else {
        comment = await database.query(
          'SELECT * FROM comments WHERE id = ? AND user_id = ? AND is_deleted = 0',
          [commentId, userId]
        );
      }
      
      if (!comment || comment.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.' 
        });
      }
      
      // 소프트 삭제
      await database.query(
        'UPDATE comments SET is_deleted = 1 WHERE id = ?',
        [commentId]
      );
      
      res.json({
        success: true,
        message: '댓글이 삭제되었습니다.'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  }
}

module.exports = new CommentController();