module.exports = {
  apps: [{
    // Process name matches the pre-existing pm2 entry on the advo VPS, so the
    // deploy updates that process in-place rather than spawning a duplicate.
    // Nginx site `fourlinq` already proxies to 127.0.0.1:3001 with an SSL
    // cert, so we keep that port.
    name: 'fourlinq',

    // CLUSTER, not fork — this is what makes `pm2 reload` zero-downtime. pm2
    // spawns the replacement worker, waits for it to signal `ready`, and only
    // then stops the old one, so the port is never unserved. Fork mode can
    // only stop-then-start; measured on this VPS, a fork restart dropped 6
    // requests under a 10/s poll while a cluster reload dropped 0.
    exec_mode: 'cluster',

    // ONE instance on purpose. Two would double the pg pool (10 -> 20
    // connections) and split express-rate-limit's in-memory store, so the
    // contact/quote limits would effectively double per IP. One worker keeps
    // both intact, and reload still overlaps briefly — which is all
    // zero-downtime actually requires.
    instances: 1,

    // A BUILT CJS BUNDLE, not the TypeScript entry. pm2's cluster mode forks
    // through its own CommonJS container, which cannot load an ESM/TS file:
    // it dies before any of our code runs and writes zero bytes to the logs.
    // (pm2 6.x also maps a bare `.ts` script to a `bun` interpreter, which is
    // not installed here.) `npm run build:server` produces this file; the
    // deploy builds it on the runner. It must live in server/ so its
    // `../uploads` and `../dist` paths resolve exactly as they did under tsx.
    script: 'server/index.bundle.cjs',

    cwd: '/opt/fourlinq',

    // Pairs with process.send('ready') in server/index.ts. Without it pm2
    // assumes readiness the moment the process spawns — before the port is
    // bound — and the old worker would die too early, reintroducing the gap.
    wait_ready: true,
    listen_timeout: 15000,
    kill_timeout: 5000,     // lets in-flight requests/SSE drain (see index.ts)

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
