const express = require('express');
const app = express();

app.use(express.json());

// 모니터링 - 서버 상태
app.get('/api/monitoring/health', (req, res) => {
  res.json({
    status: 'success',
    service: 'monitoring',
    health: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    warning: '내부 모니터링 전용 - 외부 접근 금지'
  });
});

// 모니터링 - 실시간 메트릭스
app.get('/api/monitoring/metrics', (req, res) => {
  res.json({
    status: 'success',
    service: 'monitoring',
    metrics: {
      cpu_usage: Math.random() * 100,
      memory_usage: Math.random() * 100,
      disk_usage: Math.random() * 100,
      active_users: Math.floor(Math.random() * 1000),
      requests_per_second: Math.floor(Math.random() * 100),
      database_connections: Math.floor(Math.random() * 50)
    },
    internal_data: {
      secret_key: 'monitoring_secret_789',
      internal_endpoints: [
        'http://admin-api:3001/api/admin/users',
        'http://mysql:3306',
        'http://redis:6379'
      ],
      warning: '민감한 모니터링 데이터 - 외부 노출 금지!'
    }
  });
});

// 모니터링 - 로그 정보
app.get('/api/monitoring/logs', (req, res) => {
  const logs = [
    { level: 'info', message: 'User login successful', timestamp: new Date() },
    { level: 'warning', message: 'High memory usage detected', timestamp: new Date() },
    { level: 'error', message: 'Database connection timeout', timestamp: new Date() },
    { level: 'info', message: 'SSRF attempt detected from user input', timestamp: new Date() }
  ];

  res.json({
    status: 'success',
    service: 'monitoring',
    logs: logs,
    sensitive_info: {
      log_file_path: '/var/log/cointalk/',
      backup_server: 'internal-backup:9000',
      admin_access_key: 'log_admin_456'
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Monitoring service running on port ${PORT}`);
  console.log('WARNING: This service should only be accessible from internal network!');
});
