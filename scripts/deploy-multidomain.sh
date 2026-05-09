#!/bin/bash

# Multi-domain deployment script for Luxtronics
# Supports both Vercel and Hostinger deployments
# Usage: ./deploy-multidomain.sh [domain] [platform]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TARGET_DOMAIN=${1:-"luxtronics.com"}
PLATFORM=${2:-"vercel"}  # vercel or hostinger

echo -e "${BLUE}🚀 Deploying Luxtronics to ${TARGET_DOMAIN} on ${PLATFORM}${NC}"

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy based on platform and domain
if [ "$PLATFORM" = "hostinger" ]; then
    deploy_to_hostinger "$TARGET_DOMAIN"
else
    deploy_to_vercel "$TARGET_DOMAIN"
fi

deploy_to_vercel() {
    local domain=$1
    echo -e "${BLUE}☁️ Deploying to Vercel...${NC}"

    case $domain in
        "luxtronics.com")
            npx vercel --prod
            ;;
        "luxtronics.com.au")
            npx vercel --prod --name luxtronics-au
            ;;
        "luxtronics.co.nz")
            npx vercel --prod --name luxtronics-nz
            ;;
        "luxtronics.in")
            npx vercel --prod --name luxtronics-in
            ;;
        "luxtronics.in.au")
            npx vercel --prod --name luxtronics-in-au
            ;;
        "luxtronics.in.nz")
            npx vercel --prod --name luxtronics-in-nz
            ;;
        *)
            echo -e "${RED}❌ Unknown domain: ${domain}${NC}"
            exit 1
            ;;
    esac
}

deploy_to_hostinger() {
    local domain=$1
    echo -e "${BLUE}🟠 Deploying to Hostinger...${NC}"

    # Load environment variables
    if [[ -f ".env.local" ]]; then
        export $(grep -v '^#' .env.local | xargs)
    fi

    # Set FTP credentials based on domain
    case $domain in
        "luxtronics.com")
            FTP_HOST=${FTP_HOST_US:-$FTP_HOST}
            FTP_USER=${FTP_USER_US:-$FTP_USER}
            FTP_PASS=${FTP_PASS_US:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_US:-"/public_html"}
            ;;
        "luxtronics.com.au")
            FTP_HOST=${FTP_HOST_AU:-$FTP_HOST}
            FTP_USER=${FTP_USER_AU:-$FTP_USER}
            FTP_PASS=${FTP_PASS_AU:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_AU:-"/public_html"}
            ;;
        "luxtronics.co.nz")
            FTP_HOST=${FTP_HOST_NZ:-$FTP_HOST}
            FTP_USER=${FTP_USER_NZ:-$FTP_USER}
            FTP_PASS=${FTP_PASS_NZ:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_NZ:-"/public_html"}
            ;;
        "luxtronics.in")
            FTP_HOST=${FTP_HOST_IN:-$FTP_HOST}
            FTP_USER=${FTP_USER_IN:-$FTP_USER}
            FTP_PASS=${FTP_PASS_IN:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_IN:-"/public_html"}
            ;;
        "luxtronics.in.au")
            FTP_HOST=${FTP_HOST_IN_AU:-$FTP_HOST}
            FTP_USER=${FTP_USER_IN_AU:-$FTP_USER}
            FTP_PASS=${FTP_PASS_IN_AU:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_IN_AU:-"/public_html"}
            ;;
        "luxtronics.in.nz")
            FTP_HOST=${FTP_HOST_IN_NZ:-$FTP_HOST}
            FTP_USER=${FTP_USER_IN_NZ:-$FTP_USER}
            FTP_PASS=${FTP_PASS_IN_NZ:-$FTP_PASS}
            FTP_REMOTE_DIR=${FTP_REMOTE_DIR_IN_NZ:-"/public_html"}
            ;;
        *)
            echo -e "${RED}❌ Unknown domain: ${domain}${NC}"
            exit 1
            ;;
    esac

    # Validate FTP credentials
    : "${FTP_HOST:?FTP_HOST not set for $domain}"
    : "${FTP_USER:?FTP_USER not set for $domain}"
    : "${FTP_PASS:?FTP_PASS not set for $domain}"

    echo "  Host  : $FTP_HOST"
    echo "  User  : $FTP_USER"
    echo "  Remote: $FTP_REMOTE_DIR"

    # Deploy using lftp
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
             dist/ $FTP_REMOTE_DIR/;
      quit"
}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment to ${TARGET_DOMAIN} on ${PLATFORM} completed successfully!${NC}"
    if [ "$PLATFORM" = "vercel" ]; then
        echo -e "${BLUE}🌐 Your site is live at: https://${TARGET_DOMAIN}${NC}"
    else
        echo -e "${BLUE}🌐 Your site is live at: https://${TARGET_DOMAIN}${NC}"
    fi
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi