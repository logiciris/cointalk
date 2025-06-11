const database = require('../utils/database');

class SearchController {
  async searchAll(req, res) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '검색어를 입력하세요.'
        });
      }

      const sql = `
        SELECT p.*, u.username, u.profile_picture 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.is_deleted = 0 AND (p.title LIKE '%${keyword}%' OR p.content LIKE '%${keyword}%') 
        ORDER BY p.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      try {
        const posts = await database.query(sql);
        
        const countSql = `
          SELECT COUNT(*) as count 
          FROM posts 
          WHERE is_deleted = 0 AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
        `;
        const countResult = await database.query(countSql);
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
        res.json({
          success: true,
          posts: [],
          keyword: keyword,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0
          }
        });
      }
    } catch (error) {
      res.json({
        success: true,
        posts: [],
        keyword: req.query.keyword || '',
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0
        }
      });
    }
  }

  async searchUsers(req, res) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '검색어를 입력하세요.'
        });
      }

      const sql = `
        SELECT id, username, profile_picture, bio, created_at
        FROM users 
        WHERE username LIKE '%${keyword}%' OR bio LIKE '%${keyword}%'
        ORDER BY username
        LIMIT ${limit} OFFSET ${offset}
      `;

      try {
        const users = await database.query(sql);
        
        const countSql = `
          SELECT COUNT(*) as count 
          FROM users 
          WHERE username LIKE '%${keyword}%' OR bio LIKE '%${keyword}%'
        `;
        const countResult = await database.query(countSql);
        const totalCount = countResult[0].count;

        res.json({
          success: true,
          users: users,
          keyword: keyword,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount: totalCount
          }
        });
      } catch (error) {
        res.json({
          success: true,
          users: [],
          keyword: keyword,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0
          }
        });
      }
    } catch (error) {
      res.json({
        success: true,
        users: [],
        keyword: req.query.keyword || '',
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0
        }
      });
    }
  }

  async searchCoins(req, res) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '검색어를 입력하세요.'
        });
      }

      const sql = `
        SELECT id, name, symbol, description, price, market_cap
        FROM coins 
        WHERE name LIKE '%${keyword}%' OR symbol LIKE '%${keyword}%' OR description LIKE '%${keyword}%'
        ORDER BY market_cap DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      try {
        const coins = await database.query(sql);
        
        const countSql = `
          SELECT COUNT(*) as count 
          FROM coins 
          WHERE name LIKE '%${keyword}%' OR symbol LIKE '%${keyword}%' OR description LIKE '%${keyword}%'
        `;
        const countResult = await database.query(countSql);
        const totalCount = countResult[0].count;

        res.json({
          success: true,
          coins: coins,
          keyword: keyword,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount: totalCount
          }
        });
      } catch (error) {
        res.json({
          success: true,
          coins: [],
          keyword: keyword,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0
          }
        });
      }
    } catch (error) {
      res.json({
        success: true,
        coins: [],
        keyword: req.query.keyword || '',
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0
        }
      });
    }
  }
}

module.exports = new SearchController();