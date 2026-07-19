#!/usr/bin/env bash
# Post-deploy health verification. Runs ON the VPS (piped in over ssh).
#
# Why this is more than one curl: a single point-in-time request cannot tell
# "running" from "crash-looping". pm2 restarts a failing app fast enough to
# answer one request before it gives up, which is exactly how a dead site
# passed the old `sleep 2 && curl` check on 2026-07-18 while fourlinq.ph was
# serving 502 to everyone.
#
# So this requires BOTH:
#   1. three CONSECUTIVE successful /api/health responses, and
#   2. a pm2 restart counter that stops climbing over a stability window.
#
# Exit non-zero fails the deploy, which is the point — a broken deploy must
# never report success.
set -uo pipefail

APP_NAME="${APP_NAME:-fourlinq}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/api/health}"
ERROR_LOG="${ERROR_LOG:-/opt/fourlinq/logs/error.log}"
NEED_OK="${NEED_OK:-3}"
MAX_TRY="${MAX_TRY:-20}"
STABILITY_SECONDS="${STABILITY_SECONDS:-8}"

pm2_field() {
  # $1 = "restart_time" | "status"
  pm2 jlist 2>/dev/null | APP="$APP_NAME" FIELD="$1" node -e '
    let s = "";
    process.stdin.on("data", (d) => (s += d)).on("end", () => {
      let list = [];
      try { list = JSON.parse(s || "[]"); } catch { /* pm2 printed noise */ }
      const app = list.find((p) => p.name === process.env.APP);
      if (!app) return console.log(process.env.FIELD === "status" ? "missing" : "-1");
      console.log(String(app.pm2_env[process.env.FIELD]));
    });
  '
}

dump_failure() {
  echo "--- pm2 ---"
  pm2 list 2>/dev/null | grep -E "${APP_NAME}|name" || true
  echo "--- last 30 error lines ---"
  tail -30 "$ERROR_LOG" 2>/dev/null || echo "(no error log at $ERROR_LOG)"
}

ok=0
for _ in $(seq 1 "$MAX_TRY"); do
  if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
    ok=$((ok + 1))
  else
    ok=0
  fi
  [ "$ok" -ge "$NEED_OK" ] && break
  sleep 3
done

if [ "$ok" -lt "$NEED_OK" ]; then
  echo "FATAL: $HEALTH_URL never returned $NEED_OK consecutive successes."
  dump_failure
  exit 1
fi

before=$(pm2_field restart_time)
sleep "$STABILITY_SECONDS"
after=$(pm2_field restart_time)
state=$(pm2_field status)
echo "pm2 status=$state  restarts ${before} -> ${after}"

if [ "$state" != "online" ]; then
  echo "FATAL: pm2 reports '$state', not online."
  dump_failure
  exit 1
fi

if [ "$before" != "$after" ]; then
  echo "FATAL: pm2 restart count climbed during the stability window — the app is crash-looping."
  echo "The successful health responses came from between crashes, not a healthy process."
  dump_failure
  exit 1
fi

curl -fsS --max-time 5 "$HEALTH_URL" && echo
echo "Health check passed: serving, and stable for ${STABILITY_SECONDS}s with no restart."
