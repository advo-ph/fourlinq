#!/bin/bash
# Pull-based auto-deploy for fourlinq, intended to run on the advo VPS
# (NOT from a developer laptop). Runs on a cron, pulls origin/main, and
# if HEAD moved, rebuilds + restarts pm2.
#
# WHY: belt-and-suspenders for the push-based deploy.sh. Catches the case
# where someone pushed to main but nobody ran the local deploy script,
# or where the deployed artifact drifted from what's in main.
#
# SETUP (one-time, on the VPS):
#   sudo mkdir -p /opt/fourlinq-repo
#   sudo chown root:root /opt/fourlinq-repo
#   cd /opt/fourlinq-repo
#   # Generate a deploy key:
#   sudo ssh-keygen -t ed25519 -f /root/.ssh/fourlinq-deploy -N ""
#   # Add the .pub key as a "Deploy key" (read-only) on the GitHub repo
#   # (Settings → Deploy keys → Add). Configure SSH to use it:
#   #   sudo tee -a /root/.ssh/config <<EOF
#   #   Host github-fourlinq
#   #     Hostname github.com
#   #     User git
#   #     IdentityFile /root/.ssh/fourlinq-deploy
#   #     IdentitiesOnly yes
#   #   EOF
#   sudo git clone git@github-fourlinq:advo-ph/fourlinq.git /opt/fourlinq-repo
#   sudo cp /opt/fourlinq/.env /opt/fourlinq-repo/.env  # share the same env
#
# ENABLE (add to root's crontab, runs every 5 minutes):
#   */5 * * * * /opt/fourlinq-repo/scripts/vps-auto-deploy.sh >> /var/log/fourlinq-auto-deploy.log 2>&1
#
# DISABLE:
#   crontab -e  # remove the line above
#
# AUDIT:
#   tail /var/log/fourlinq-auto-deploy.log
#   cat /opt/fourlinq/deployed-from.txt
#
# Safe to leave disabled — push-based deploy.sh stays the primary path.

set -e

REPO_DIR="/opt/fourlinq-repo"
LIVE_DIR="/opt/fourlinq"
BRANCH="main"
LOG_PREFIX="[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] auto-deploy:"

cd "${REPO_DIR}" || { echo "${LOG_PREFIX} no repo at ${REPO_DIR} — see SETUP in this script"; exit 1; }

# Fetch latest. --no-write-fetch-head keeps things tidy.
git fetch --quiet origin "${BRANCH}"
CURRENT_SHA="$(git rev-parse HEAD)"
LATEST_SHA="$(git rev-parse "origin/${BRANCH}")"

if [ "${CURRENT_SHA}" = "${LATEST_SHA}" ]; then
  # No change — silent return so cron logs stay scannable.
  exit 0
fi

echo "${LOG_PREFIX} HEAD moved ${CURRENT_SHA:0:7} → ${LATEST_SHA:0:7}, deploying"

# Fast-forward to latest. Refuses if local has diverged (shouldn't happen,
# but the protection is free).
git merge --ff-only "origin/${BRANCH}" || { echo "${LOG_PREFIX} ff-only merge failed — repo state diverged; manual intervention required"; exit 1; }

# Build + sync — same shape as deploy.sh but local on the VPS.
echo "${LOG_PREFIX} npm ci"
npm ci --no-audit --no-fund --silent

echo "${LOG_PREFIX} vite build"
npm run build --silent

# Sync built artifacts + runtime sources into the live directory. We mirror
# deploy.sh's exclude list so we don't trash the .env or uploads.
echo "${LOG_PREFIX} rsync → ${LIVE_DIR}"
rsync -az --delete \
  --exclude='node_modules' \
  dist/ "${LIVE_DIR}/dist/"
rsync -az --delete \
  --exclude='node_modules' \
  server/ "${LIVE_DIR}/server/"
rsync -az --delete \
  --exclude='node_modules' \
  packages/ "${LIVE_DIR}/packages/"
rsync -az --delete src/data/ "${LIVE_DIR}/src/data/"
rsync -az --delete \
  --exclude='node_modules' \
  api/ "${LIVE_DIR}/api/" 2>/dev/null || true   # api/ may not exist
rsync -az package.json package-lock.json tsconfig.json ecosystem.config.cjs "${LIVE_DIR}/"

# Live-side npm install (runtime deps only).
echo "${LOG_PREFIX} live-side npm ci"
cd "${LIVE_DIR}"
npm ci --omit=dev --no-audit --no-fund --silent
npm install --no-save --no-audit --no-fund --silent tsx@4 typescript@5

# Audit trail.
cat > "${LIVE_DIR}/deployed-from.txt" <<AUDIT
sha:        ${LATEST_SHA}
short:      ${LATEST_SHA:0:7}
branch:     ${BRANCH}
subject:    $(cd "${REPO_DIR}" && git log -1 --pretty=%s)
author:     $(cd "${REPO_DIR}" && git log -1 --pretty='%an <%ae>')
deployed:   $(date -u +'%Y-%m-%dT%H:%M:%SZ')
deployer:   auto-deploy@$(hostname -s)
forced:     0
AUDIT

# Restart pm2.
echo "${LOG_PREFIX} pm2 restart"
pm2 startOrRestart "${LIVE_DIR}/ecosystem.config.cjs"
pm2 save

# Health check.
sleep 2
HEALTH="$(curl -fsS http://localhost:3001/api/health || echo 'FAILED')"
echo "${LOG_PREFIX} done — health: ${HEALTH}"
