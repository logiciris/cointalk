const database = require('../utils/database');

class PostController {
  // 인기 태그 조회 (간단한 모의 데이터 버전)
  async getTrendingTags(req, res) {
    try {
      const { limit = '6' } = req.query;
      
      console.log('Getting trending tags with limit:', limit);
      
      // 간단한 모의 데이터
      const mockTags = [
        { tag: '비트코인', post_count: 15, latest_post: new Date() },
        { tag: '이더리움', post_count: 12, latest_post: new Date() },
        { tag: 'DeFi', post_count: 8, latest_post: new Date() },
        { tag: '알트코인', post_count: 6, latest_post: new Date() },
        { tag: '투자', post_count: 5, latest_post: new Date() },
        { tag: '분석', post_count: 4, latest_post: new Date() }
      ].slice(0, parseInt(limit));
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      res.json({
        success: true,
        tags: mockTags.map((tag, index) => ({
          rank: index + 1,
          tag: tag.tag,
          post_count: tag.post_count,
          latest_post: tag.latest_post
        })),
        stats: {
          total_posts_with_tags: 50
        }
      });
    } catch (error) {
      console.error('Get trending tags error:', error);
      res.status(500).json({ 
        message: '서버 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  // 활발한 사용자 조회 (간단한 버전)
  async getActiveUsers(req, res) {
    try {
      const { limit = '3', days = '7' } = req.query;
      
      console.log('Getting active users with limit:', limit);
      
      // 실제 사용자 조회 (단순화)
      const sql = `
        SELECT 
          u.id,
          u.username,
          u.profile_picture,
          u.created_at,
          COUNT(DISTINCT p.id) as post_count,
          COUNT(DISTINCT c.id) as comment_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_deleted = 0
        LEFT JOIN comments c ON u.id = c.user_id AND c.is_deleted = 0
        GROUP BY u.id, u.username, u.profile_picture, u.created_at
        HAVING (post_count + comment_count) > 0
        ORDER BY (post_count * 2 + comment_count) DESC
        LIMIT ?
      `;
      
      const users = await database.query(sql, [parseInt(limit)]);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      res.json({
        success: true,
        users: users.map((user, index) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          profile_picture: user.profile_picture,
          joined_date: user.created_at,
          stats: {
            posts: parseInt(user.post_count || 0),
            comments: parseInt(user.comment_count || 0),
            likes_given: 0,
            likes_received: 0,
            activity_score: parseInt((user.post_count || 0) * 2 + (user.comment_count || 0))
          }
        })),
        meta: {
          period_days: parseInt(days),
          total_active_users: users.length
        }
      });
    } catch (error) {
      console.error('Get active users error:', error);
      res.status(500).json({ 
        message: '서버 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  // 🚨 취약한 게시물 목록 조회 (SQL 인젝션 취약점)
  async unsafeGetPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit || 10;
      const sort = req.query.sort || 'created_at';
      const offset = (page - 1) * parseInt(limit);

      // 🚨 취약점: limit, sort에 직접 사용자 입력 삽입
      const sql = `
        SELECT p.*, u.username, u.profile_picture 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.is_deleted = 0 
        ORDER BY p.${sort} DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log('Executing SQL with injectable limit:', sql);
      const posts = await database.unsafeQuery(sql);

      // 총 개수 조회
      const countSql = 'SELECT COUNT(*) as count FROM posts WHERE is_deleted = 0';
      const countResult = await database.unsafeQuery(countSql);
      const totalCount = countResult[0].count;

      res.json({
        success: true,
        posts: posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount: totalCount,
          hasNext: page * parseInt(limit) < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Unsafe get posts error with full details:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 조회 중 오류가 발생했습니다.',
        error: error.message,
        sqlError: error.sqlMessage
      });
    }
  }

  // 🚨 취약한 게시물 검색 (SQL 인젝션 취약점)
  async unsafeSearchPosts(req, res) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      console.log('Search request with injectable params:', { keyword, page, limit, offset });

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '검색어를 입력하세요.'
        });
      }

      // 🚨 취약점: 검색어에 직접 사용자 입력 삽입
      const sql = `
        SELECT p.*, u.username, u.profile_picture 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.is_deleted = 0 AND (p.title LIKE '%${keyword}%' OR p.content LIKE '%${keyword}%') 
        ORDER BY p.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log('Executing injectable search SQL:', sql);
      const posts = await database.unsafeQuery(sql);

      // 총 개수 조회
      const countSql = `
        SELECT COUNT(*) as count 
        FROM posts 
        WHERE is_deleted = 0 AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
      `;
      const countResult = await database.unsafeQuery(countSql);
      const totalCount = countResult[0].count;

      res.json({
        success: true,
        posts: posts,
        keyword: keyword,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount: totalCount
        }
      });
    } catch (error) {
      console.error('Unsafe search posts error with detailed info:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 검색 중 오류가 발생했습니다.',
        error: error.message,
        query: req.query
      });
    }
  }

  // 🚨 취약한 게시물 상세 조회 (SQL 인젝션 취약점)
  async unsafeGetPost(req, res) {
    try {
      const { id } = req.params;

      // 🚨 취약점: id에 직접 사용자 입력 삽입
      const sql = `
        SELECT p.*, u.username, u.profile_picture 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ${id} AND p.is_deleted = 0
      `;

      const posts = await database.unsafeQuery(sql);

      if (!posts || posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      // 조회수 증가
      await database.unsafeQuery(`UPDATE posts SET views = views + 1 WHERE id = ${id}`);

      res.json({
        success: true,
        post: posts[0]
      });
    } catch (error) {
      console.error('Unsafe get post error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  // 게시물 생성 (안전한 버전)
  async createPost(req, res) {
    try {
      const { title, content, tags, coinId } = req.body;
      const userId = req.user.id;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: '제목과 내용을 입력하세요.'
        });
      }

      // 게시물 생성
      const result = await database.query(
        'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );

      const postId = result.insertId;

      // 태그 처리
      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          // 태그 존재 확인 또는 생성
          let tagResult = await database.query('SELECT id FROM tags WHERE name = ?', [tagName]);
          let tagId;
          
          if (tagResult.length === 0) {
            const newTag = await database.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
            tagId = newTag.insertId;
          } else {
            tagId = tagResult[0].id;
          }

          // 게시물-태그 연결
          await database.query('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
        }
      }

      // 코인 연결
      if (coinId) {
        await database.query('INSERT INTO post_coins (post_id, coin_id) VALUES (?, ?)', [postId, coinId]);
      }

      res.status(201).json({
        success: true,
        message: '게시물이 생성되었습니다.',
        postId: postId
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 생성 중 오류가 발생했습니다.'
      });
    }
  }

  // 🚨 취약한 게시물 수정
  async unsafeUpdatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.id;

      // 권한 확인 (취약점: SQL 인젝션 가능)
      const checkSql = `SELECT user_id FROM posts WHERE id = ${id}`;
      const posts = await database.unsafeQuery(checkSql);

      if (!posts || posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      if (posts[0].user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '수정 권한이 없습니다.'
        });
      }

      // 게시물 수정 (취약점: SQL 인젝션 가능)
      const updateSql = `UPDATE posts SET title = '${title}', content = '${content}', updated_at = NOW() WHERE id = ${id}`;
      await database.unsafeQuery(updateSql);

      res.json({
        success: true,
        message: '게시물이 수정되었습니다.'
      });
    } catch (error) {
      console.error('Unsafe update post error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 수정 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  // 🚨 취약한 게시물 삭제
  async unsafeDeletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 권한 확인 (취약점: SQL 인젝션 가능)
      const checkSql = `SELECT user_id FROM posts WHERE id = ${id}`;
      const posts = await database.unsafeQuery(checkSql);

      if (!posts || posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      if (posts[0].user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '삭제 권한이 없습니다.'
        });
      }

      // 게시물 소프트 삭제 (취약점: SQL 인젝션 가능)
      const deleteSql = `UPDATE posts SET is_deleted = 1 WHERE id = ${id}`;
      await database.unsafeQuery(deleteSql);

      res.json({
        success: true,
        message: '게시물이 삭제되었습니다.'
      });
    } catch (error) {
      console.error('Unsafe delete post error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 삭제 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  // 안전한 게시물 목록 조회
  async getPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const posts = await database.query(`
        SELECT p.*, u.username, u.profile_picture,
               (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
               (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = 0) as comment_count
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.is_deleted = 0 
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const countResult = await database.query('SELECT COUNT(*) as count FROM posts WHERE is_deleted = 0');
      const totalCount = countResult[0].count;

      res.json({
        success: true,
        posts: posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 안전한 게시물 상세 조회
  async getPost(req, res) {
    try {
      const { id } = req.params;

      const posts = await database.query(`
        SELECT p.*, u.username, u.profile_picture,
               (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
               (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = 0) as comment_count
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ? AND p.is_deleted = 0
      `, [id]);

      if (!posts || posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      // 조회수 증가
      await database.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);

      res.json({
        success: true,
        post: posts[0]
      });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ 
        success: false,
        message: '게시물 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 사용자별 게시물 조회
  async getPostsByUser(req, res) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      console.log('Getting posts for user:', username);

      const posts = await database.query(`
        SELECT p.*, u.username, u.profile_picture,
               (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
               (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = 0) as comment_count
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE u.username = ? AND p.is_deleted = 0 
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
      `, [username, limit, offset]);

      const countResult = await database.query(`
        SELECT COUNT(*) as count 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE u.username = ? AND p.is_deleted = 0
      `, [username]);
      
      const totalCount = countResult[0].count;

      res.json({
        success: true,
        posts: posts,
        username: username,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get posts by user error:', error);
      res.status(500).json({ 
        success: false,
        message: '사용자 게시물 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }
}

module.exports = new PostController();
