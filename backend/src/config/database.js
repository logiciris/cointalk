const mysql = require('mysql2/promise');
const config = require('./config');

// MySQL 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
