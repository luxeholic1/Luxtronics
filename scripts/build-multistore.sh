#!/bin/bash
# Multi-domain build script for Luxtronics
# This script builds the React app for each domain with its respective environment variables

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./scripts/build-multistore.sh [india|australia|newzealand]"
    exit 1
fi

echo "Building for domain: $DOMAIN"

case $DOMAIN in
    india)
        ENV_FILE=".env.india"
        SERVER_PATH="server:/var/www/luxtronics.in/"
        ;;
    australia)
        ENV_FILE=".env.australia"
        SERVER_PATH="server:/var/www/luxtronics.com.au/"
        ;;
    newzealand)
        ENV_FILE=".env.newzealand"
        SERVER_PATH="server:/var/www/luxtronics.co.nz/"
        ;;
    *)
        echo "Invalid domain. Use: india, australia, or newzealand"
        exit 1
        ;;
esac

# Copy the appropriate environment file
cp "$ENV_FILE" .env

# Build the React app
npm run build

# Deploy to server (uncomment when ready)
# rsync -avz --delete build/ "$SERVER_PATH"

echo "Build complete for $DOMAIN"
echo "Environment file used: $ENV_FILE"
echo "To deploy, uncomment the rsync command in this script"
