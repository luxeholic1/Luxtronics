#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Manual FTP deploy script (use in CI or run locally)
#  Usage:  bash scripts/deploy.sh
#  Requires: lftp  →  brew install lftp (macOS) | apt install lftp (Linux)
# =============================================================================
set -euo pipefail

# ── Load .env.local if present (for local runs) ──────────────────────────────
if [[ -f ".env.local" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env.local | xargs)
fi

# ── Required env vars ─────────────────────────────────────────────────────────
: "${FTP_HOST:?Set FTP_HOST in .env.local or environment}"
: "${FTP_USER:?Set FTP_USER in .env.local or environment}"
: "${FTP_PASS:?Set FTP_PASS in .env.local or environment}"
: "${FTP_REMOTE_DIR:=/public_html}"

BUILD_DIR="${BUILD_DIR:-dist}"

# ── Sanity check ─────────────────────────────────────────────────────────────
if [[ ! -d "$BUILD_DIR" ]]; then
  echo "❌  Build directory '$BUILD_DIR' not found. Run 'npm run build' first."
  exit 1
fi

echo ""
echo "┌────────────────────────────────────────────┐"
echo "│  🚀  Luxtronics → Hostinger FTP Deploy     │"
echo "└────────────────────────────────────────────┘"
echo "  Host  : $FTP_HOST"
echo "  User  : $FTP_USER"
echo "  Remote: $FTP_REMOTE_DIR"
echo "  Local : ./$BUILD_DIR"
echo ""

lftp -c "
  set ftp:ssl-allow yes;
  set ssl:verify-certificate no;
  set ftp:passive-mode yes;
  set net:timeout 30;
  set net:max-retries 3;
  open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
  mirror --reverse --delete --verbose \
         --exclude-glob .DS_Store \
         --exclude-glob '*.map' \
         $BUILD_DIR/ $FTP_REMOTE_DIR/;
  quit
"

echo ""
echo "✅  Deploy complete! Your site is live on Hostinger."
