const mysql = require('mysql2');
const config = require('../config/config');

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  charset: 'utf8mb4',
  multipleStatements: false,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  supportBigNumbers: true,
  bigNumberStrings: false,  // DECIMAL을 숫자로 반환하도록 변경
  dateStrings: false,
  debug: false,
  sql_mode: 'TRADITIONAL',
  flags: ['-FOUND_ROWS'],
  ssl: false
});

// 프로미스 래퍼 생성
const promisePool = pool.promise();

// 기본 데이터베이스 클래스
class Database {
  constructor() {
    this.pool = promisePool;
    this.init();
  }

  // 초기화 및 연결 테스트
  async init() {
    try {
      const connection = await this.pool.getConnection();
      
      // UTF-8 설정 강제 적용
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      await connection.query('SET CHARACTER SET utf8mb4');
      await connection.query('SET character_set_connection=utf8mb4');
      await connection.query('SET character_set_results=utf8mb4');
      await connection.query('SET character_set_client=utf8mb4');
      
      // 연결 해제
      connection.release();
      
      console.log('✅ Database connection and charset initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  // 연결 테스트
  async testConnection() {
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // 안전한 쿼리 실행 (파라미터화된 쿼리)
  async query(sql, params) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      
      // 각 연결마다 UTF-8 설정 재적용
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [rows, fields] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 의도적으로 취약한 쿼리 실행 (SQL 인젝션 취약점)
  async unsafeQuery(sql) {
    let connection;
    try {
      console.log('Executing unsafe query:', sql);
      connection = await this.pool.getConnection();
      
      // 각 연결마다 UTF-8 설정 재적용
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [rows, fields] = await connection.query(sql);
      return rows;
    } catch (error) {
      console.error('Database unsafe query error:', error);
      // Error-based SQL Injection을 위해 원본 오류를 그대로 전달
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 단일 레코드 조회
  async findOne(table, conditions) {
    let connection;
    try {
      let sql = `SELECT * FROM ${table} WHERE `;
      const conditionsArray = [];
      const values = [];

      for (const key in conditions) {
        conditionsArray.push(`${key} = ?`);
        values.push(conditions[key]);
      }

      sql += conditionsArray.join(' AND ') + ' LIMIT 1';
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [rows] = await connection.query(sql, values);
      return rows[0];
    } catch (error) {
      console.error('Database findOne error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 의도적으로 취약한 단일 레코드 조회 (SQL 인젝션 취약점)
  async unsafeFindOne(table, condition, value) {
    let connection;
    try {
      // 의도적으로 안전하지 않은 SQL 쿼리 생성 (SQL 인젝션 가능)
      const sql = `SELECT * FROM ${table} WHERE ${condition} = '${value}' LIMIT 1`;
      console.log('Executing unsafe findOne:', sql);
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [rows] = await connection.query(sql);
      return rows[0];
    } catch (error) {
      console.error('Database unsafe findOne error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 레코드 삽입
  async insert(table, data) {
    let connection;
    try {
      const keys = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [result] = await connection.query(sql, values);
      return result;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 레코드 업데이트
  async update(table, data, conditions) {
    let connection;
    try {
      const updateParts = [];
      const values = [];

      for (const key in data) {
        updateParts.push(`${key} = ?`);
        values.push(data[key]);
      }

      const conditionParts = [];
      for (const key in conditions) {
        conditionParts.push(`${key} = ?`);
        values.push(conditions[key]);
      }

      const sql = `UPDATE ${table} SET ${updateParts.join(', ')} WHERE ${conditionParts.join(' AND ')}`;
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [result] = await connection.query(sql, values);
      return result;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 의도적으로 취약한 레코드 업데이트 (SQL 인젝션 취약점)
  async unsafeUpdate(table, field, value, condition, conditionValue) {
    let connection;
    try {
      // 의도적으로 안전하지 않은 SQL 쿼리 생성 (SQL 인젝션 가능)
      const sql = `UPDATE ${table} SET ${field} = '${value}' WHERE ${condition} = '${conditionValue}'`;
      console.log('Executing unsafe update:', sql);
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.error('Database unsafe update error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 레코드 삭제
  async delete(table, conditions) {
    let connection;
    try {
      const conditionParts = [];
      const values = [];

      for (const key in conditions) {
        conditionParts.push(`${key} = ?`);
        values.push(conditions[key]);
      }

      const sql = `DELETE FROM ${table} WHERE ${conditionParts.join(' AND ')}`;
      
      connection = await this.pool.getConnection();
      await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
      
      const [result] = await connection.query(sql, values);
      return result;
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = new Database();
