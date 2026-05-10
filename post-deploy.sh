#!/bin/bash
# =============================================================================
# post-deploy.sh — Runs automatically after Hostinger Git auto-deploy
# Place this in the root of your repo.
# In Hostinger hPanel > Git > Deployment Script, set: bash post-deploy.sh
#
# ⚠️  DO NOT run "npm run build" here.
#     The frontend build/ folder is pre-built locally and committed to git.
#     Running a server-side build without VITE_ env vars produces wrong
#     hashed asset filenames that won't match index.html → white page.
# =============================================================================

set -e

echo "🔄 Post-deploy: Installing production dependencies..."

# Install only production deps (skip devDependencies)
npm ci --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev

echo ""
echo "✅ Dependencies ready"
echo "📁 Frontend build: $(ls build/index.html 2>/dev/null && echo 'OK' || echo 'MISSING!')"
echo "🚀 App will restart automatically via Hostinger PM2"
echo ""
