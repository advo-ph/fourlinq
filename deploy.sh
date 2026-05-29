#!/bin/bash
# FourlinQ — single-process deploy to advo VPS (mirrors kent pattern).
# Usage: ./deploy.sh
#
# Builds frontend locally, rsyncs dist/ + server/ + packages/ + manifest files
# to /opt/fourlinq, runs `npm ci`, and restarts the pm2 process. The first
# run also expects you to scp a .env file (kept off-rsync via --exclude).

set -e

# Target: advo VPS (root@62.146.237.12, Contabo Singapore). Uses the `advo`
# SSH alias from ~/.ssh/config so it picks up the right identity file.
VPS_SSH="advo"
REMOTE_DIR="/opt/fourlinq"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# ─── Branch guard ─────────────────────────────────────────────────────────
# Refuse to deploy from anything other than the canonical deploy branches.
# Bypass with FORCE_DEPLOY=1 for one-off hotfix scenarios — logs a warning.
ALLOWED_BRANCHES="main supafinal cms-rag-multiuser"
CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo "(detached)")"
if [ "${FORCE_DEPLOY:-0}" = "1" ]; then
  log "FORCE_DEPLOY=1 — bypassing branch guard (you are on '${CURRENT_BRANCH}')."
elif ! echo " ${ALLOWED_BRANCHES} " | grep -q " ${CURRENT_BRANCH} "; then
  err "Refusing to deploy from '${CURRENT_BRANCH}'. Allowed: ${ALLOWED_BRANCHES}. Use FORCE_DEPLOY=1 to override (only for hotfixes — leaves an audit gap)."
fi

# Refuse to deploy with uncommitted changes (also bypassable via FORCE_DEPLOY).
if [ "${FORCE_DEPLOY:-0}" != "1" ] && [ -n "$(git status --porcelain)" ]; then
  err "Working tree dirty. Commit / stash first, or set FORCE_DEPLOY=1 to ship uncommitted changes."
fi

# Capture commit SHA + timestamp for the audit trail written below.
DEPLOY_SHA="$(git rev-parse HEAD)"
DEPLOY_SHA_SHORT="$(git rev-parse --short HEAD)"
DEPLOY_SUBJECT="$(git log -1 --pretty=%s)"
DEPLOY_AUTHOR="$(git log -1 --pretty='%an <%ae>')"
DEPLOY_TIMESTAMP="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

log "Deploying ${DEPLOY_SHA_SHORT} (${CURRENT_BRANCH}): ${DEPLOY_SUBJECT}"

log "Testing SSH connection..."
ssh -o ConnectTimeout=5 -q "${VPS_SSH}" "echo ok" >/dev/null 2>&1 || err "Cannot connect to VPS"

log "Building frontend (vite build)..."
npm run build || err "Build failed"

log "Setting up remote directory..."
ssh "${VPS_SSH}" "mkdir -p ${REMOTE_DIR}/logs"

log "Stopping fourlinq (if running)..."
ssh "${VPS_SSH}" "pm2 stop fourlinq 2>/dev/null" || true

log "Syncing files → ${REMOTE_DIR}"
# Excludes mirror kent's: never touch .env, node_modules, build caches, dev artifacts.
rsync -az --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.env.development.local' \
  --exclude='.env.local' \
  --exclude='.git' \
  --exclude='.tmp' \
  --exclude='docs' \
  --exclude='scripts' \
  --exclude='.eslintcache' \
  dist/ \
  "${VPS_SSH}:${REMOTE_DIR}/dist/"

rsync -az --delete \
  --exclude='node_modules' \
  server/ \
  "${VPS_SSH}:${REMOTE_DIR}/server/"

# Modular kit: drop-in @cms-rag package used by server/ and src/pages/Admin.tsx
rsync -az --delete \
  --exclude='node_modules' \
  packages/ \
  "${VPS_SSH}:${REMOTE_DIR}/packages/"

# src/data is imported by server scripts at runtime (tsx) for KB seeding.
rsync -az --delete src/data/ "${VPS_SSH}:${REMOTE_DIR}/src/data/"

rsync -az \
  package.json package-lock.json tsconfig.json ecosystem.config.cjs \
  "${VPS_SSH}:${REMOTE_DIR}/"

log "Writing deploy audit trail to ${REMOTE_DIR}/deployed-from.txt"
LOCAL_USER="$(whoami)@$(hostname -s)"
ssh "${VPS_SSH}" "cat > ${REMOTE_DIR}/deployed-from.txt" <<AUDIT
sha:        ${DEPLOY_SHA}
short:      ${DEPLOY_SHA_SHORT}
branch:     ${CURRENT_BRANCH}
subject:    ${DEPLOY_SUBJECT}
author:     ${DEPLOY_AUTHOR}
deployed:   ${DEPLOY_TIMESTAMP}
deployer:   ${LOCAL_USER}
forced:     ${FORCE_DEPLOY:-0}
AUDIT

log "Installing prod dependencies..."
ssh "${VPS_SSH}" "cd ${REMOTE_DIR} && npm ci --omit=dev --no-audit --no-fund" || err "npm ci failed"
# tsx is in devDependencies but the runtime needs it; install it explicitly.
ssh "${VPS_SSH}" "cd ${REMOTE_DIR} && npm install --no-save --no-audit --no-fund tsx@4 typescript@5" || err "tsx install failed"

log "Starting fourlinq via PM2..."
ssh "${VPS_SSH}" "cd ${REMOTE_DIR} && pm2 startOrRestart ecosystem.config.cjs && pm2 save" || err "pm2 start failed"

log "Health check..."
sleep 2
ssh "${VPS_SSH}" "curl -fsS http://localhost:3001/api/health" && echo

log "Done. Site live on port 3001 (proxied by nginx → https://fourlinq.ph)."
