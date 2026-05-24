module.exports = {
  apps: [{
    // Process name matches the pre-existing pm2 entry on the advo VPS — using
    // the same name means `pm2 startOrRestart` updates that process in-place
    // (rather than spawning a duplicate). Nginx site `fourlinq` already proxies
    // to 127.0.0.1:3001 with an SSL cert, so we keep that port.
    name: 'fourlinq',
    script: 'node_modules/tsx/dist/cli.mjs',
    args: 'server/index.ts',
    cwd: '/opt/fourlinq',
    exec_mode: 'fork',
    instances: 1,
    max_memory_restart: '768M',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3001,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    error_file: '/opt/fourlinq/logs/error.log',
    out_file: '/opt/fourlinq/logs/out.log',
  }]
};
