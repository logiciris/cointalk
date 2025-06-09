const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'cointalk_user',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'cointalk'
};

// 관리자 전용 - 모든 사용자 조회
app.get('/api/admin/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    await connection.end();
    
    res.json({
      status: 'success',
      message: '관리자 전용 - 모든 사용자 정보',
      data: rows,
      internal_note: '이 API는 내부 네트워크에서만 접근 가능해야 합니다!'
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 관리자 전용 - 사용자 통계
app.get('/api/admin/stats', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    const [adminCount] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE role = "admin"');
    const [postCount] = await connection.execute('SELECT COUNT(*) as total FROM posts');
    
    await connection.end();
    
    res.json({
      status: 'success',
      message: '관리자 전용 - 시스템 통계',
      data: {
        total_users: userCount[0].total,
        admin_users: adminCount[0].total,
        total_posts: postCount[0].total,
        system_info: {
          server: 'admin-api:3001',
          environment: process.env.NODE_ENV,
          warning: '민감한 내부 정보 - 외부 노출 금지!'
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 관리자 전용 - 사용자 권한 변경
app.post('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    await connection.end();
    
    res.json({
      status: 'success',
      message: `사용자 ${id}의 권한이 ${role}로 변경되었습니다`,
      warning: '이것은 매우 위험한 작업입니다!'
    });
  } catch (error) {
    console.error('Admin role change error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 시스템 정보
app.get('/api/admin/system', (req, res) => {
  res.json({
    status: 'success',
    message: '내부 시스템 정보',
    data: {
      service: 'admin-api',
      port: 3001,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      sensitive_config: {
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        internal_secrets: 'admin_key_12345',
        warning: '이 정보는 외부에 노출되면 안됩니다!'
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin API running on port ${PORT}`);
  console.log('WARNING: This service should only be accessible from internal network!');
});
