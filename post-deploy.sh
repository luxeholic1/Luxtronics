#!/bin/bash
# =============================================================================
# post-deploy.sh — Runs automatically after Hostinger Git auto-deploy
# Place this in the root of your repo.
# In Hostinger hPanel > Git > Deployment Script, set: bash post-deploy.sh
# =============================================================================

echo "🔄 Post-deploy: Installing dependencies..."
npm ci --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev

echo "✅ Dependencies ready"
echo "🚀 App will restart automatically via Hostinger PM2"
