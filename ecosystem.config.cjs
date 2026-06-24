/**
 * PM2 Ecosystem File for Hostinger Deployment
 * DISABLED auto-restart to prevent process buildup
 */
module.exports = {
  apps: [{
    name: 'luxtronics-server',
    script: './server.js',
    instances: 1, // CRITICAL: Only 1 instance
    exec_mode: 'fork',
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: false, // DISABLED - prevents process buildup on crashes
    max_restarts: 0, // No restarts
    kill_timeout: 3000,
    wait_ready: false,
    node_args: '--max-old-space-size=256'
  }]
};
