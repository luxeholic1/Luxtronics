#!/bin/bash
# Quick fix script - run this on server via SSH

echo "🔧 Fixing all Luxtronics domains..."

# Master source (NZ is working)
SOURCE="/home/u224046696/domains/luxtronics.co.nz/public_html"

# Target folders
IN_DIR="/home/u224046696/domains/luxtronics.in/public_html"
AU_DIR="/home/u224046696/domains/luxtronics.com.au/public_html"

echo "📁 Source: $SOURCE"

# Ensure directories exist
mkdir -p "$IN_DIR"
mkdir -p "$AU_DIR"

# Copy from working NZ to IN
echo "📤 Copying to luxtronics.in..."
cp -r $SOURCE/* $IN_DIR/
chmod 755 $IN_DIR
chmod 644 $IN_DIR/.htaccess
chmod 644 $IN_DIR/index.html

# Copy from working NZ to AU
echo "📤 Copying to luxtronics.com.au..."
cp -r $SOURCE/* $AU_DIR/
chmod 755 $AU_DIR
chmod 644 $AU_DIR/.htaccess
chmod 644 $AU_DIR/index.html

echo ""
echo "✅ Files copied to all domains!"
echo ""
echo "🧪 Testing domains..."
curl -I https://luxtronics.in 2>&1 | head -1
curl -I https://luxtronics.com.au 2>&1 | head -1
curl -I https://luxtronics.co.nz 2>&1 | head -1
echo ""
echo "✨ Done!"
