const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// MySQL 연결 설정
let connection;

const initConnection = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port
    });
  }
  return connection;
};

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.profile_picture = data.profile_picture || 'default-profile.png';
    this.bio = data.bio;
    this.join_date = data.join_date;
    this.last_login = data.last_login;
    this.role = data.role || 'user';
    this.notifications_enabled = data.notifications_enabled !== undefined ? data.notifications_enabled : true;
    this.private_profile = data.private_profile !== undefined ? data.private_profile : false;
    this.two_factor_enabled = data.two_factor_enabled !== undefined ? data.two_factor_enabled : false;
  }

  // 사용자 생성
  static async create(userData) {
    try {
      const connection = await initConnection();
      
      // 의도적인 취약점: 낮은 salt rounds (일반적으로 12+ 권장)
      const saltRounds = 8;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const query = `
        INSERT INTO users (username, email, phone, password, profile_picture, bio, role, 
                          notifications_enabled, private_profile, two_factor_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(query, [
        userData.username,
        userData.email,
        userData.phone || null,
        hashedPassword,
        userData.profile_picture || 'default-profile.png',
        userData.bio || null,
        userData.role || 'user',
        userData.notifications_enabled !== undefined ? userData.notifications_enabled : true,
        userData.private_profile !== undefined ? userData.private_profile : false,
        userData.two_factor_enabled !== undefined ? userData.two_factor_enabled : false
      ]);

      return await User.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // ID로 사용자 검색
  static async findById(id) {
    try {
      const connection = await initConnection();
      const query = 'SELECT * FROM users WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // 이메일로 사용자 검색
  static async findByEmail(email) {
    try {
      const connection = await initConnection();
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // 사용자명으로 사용자 검색
  static async findByUsername(username) {
    try {
      const connection = await initConnection();
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await connection.execute(query, [username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // 이메일 또는 사용자명으로 검색
  static async findByEmailOrUsername(email, username) {
    try {
      const connection = await initConnection();
      const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
      const [rows] = await connection.execute(query, [email, username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // 비밀번호 검증
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin() {
    try {
      const connection = await initConnection();
      const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      await connection.execute(query, [this.id]);
      this.last_login = new Date();
    } catch (error) {
      throw error;
    }
  }

  // 사용자 정보 업데이트
  async update(updateData) {
    try {
      const connection = await initConnection();
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return this;
      }

      values.push(this.id);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await connection.execute(query, values);

      // 업데이트된 사용자 정보 반환
      return await User.findById(this.id);
    } catch (error) {
      throw error;
    }
  }

  // JSON 직렬화 (비밀번호 제외)
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    return userObject;
  }

  // 의도적인 취약점: SQL 인젝션에 취약한 검색 함수
  static async unsafeFindByEmail(email) {
    try {
      const connection = await initConnection();
      // 주의: 이 함수는 의도적으로 SQL 인젝션에 취약합니다.
      // 교육 목적으로만 사용하세요.
      const query = `SELECT * FROM users WHERE email = '${email}'`;
      const [rows] = await connection.execute(query);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // 의도적인 취약점: 비밀번호가 포함된 모든 사용자 정보 반환
  static async getAllUsersUnsafe() {
    try {
      const connection = await initConnection();
      const query = 'SELECT * FROM users';
      const [rows] = await connection.execute(query);
      return rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
