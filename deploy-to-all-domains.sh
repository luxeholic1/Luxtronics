#!/bin/bash
# Deploy static site to all Luxtronics domains on Hostinger

echo "🚀 Deploying Luxtronics to all domains..."
echo ""

# Check if build/ exists
if [ ! -d "build" ]; then
  echo "❌ build/ folder not found. Run 'npm run build' first!"
  exit 1
fi

echo "📁 Build folder ready: $(du -sh build | cut -f1)"
echo ""

# SSH connection details (use actual server hostname from SSH session)
SSH_USER="u224046696"
SSH_HOST="in-mum2-web2220.serversforseo.com"

# Domain paths on server (absolute paths)
DOMAIN_IN="/home/u224046696/domains/luxtronics.in/public_html"
DOMAIN_AU="/home/u224046696/domains/luxtronics.com.au/public_html"
DOMAIN_NZ="/home/u224046696/domains/luxtronics.co.nz/public_html"

echo "🌍 Deploying to domains:"
echo "  1. luxtronics.in"
echo "  2. luxtronics.com.au"
echo "  3. luxtronics.co.nz"
echo ""

# .htaccess for React SPA routing
HTACCESS='# React SPA with client-side routing
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Skip rewrite for files and directories that exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  # Send all other requests to index.html
  RewriteRule ^ /index.html [L]
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/json "access plus 1 week"
  ExpiresDefault "access plus 1 day"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json
</IfModule>'

# Create .htaccess in build folder
echo "$HTACCESS" > build/.htaccess
echo "✅ Created .htaccess in build/"

# Deploy function
deploy_to_domain() {
  local domain_name=$1
  local domain_path=$2
  
  echo ""
  echo "📤 Deploying to $domain_name..."
  
  # Use SCP instead of rsync (more reliable for Hostinger)
  scp -r build/* ${SSH_USER}@${SSH_HOST}:${domain_path}/
  
  if [ $? -eq 0 ]; then
    echo "✅ $domain_name deployed successfully!"
  else
    echo "❌ Failed to deploy to $domain_name"
    return 1
  fi
}

# Deploy to all domains
deploy_to_domain "luxtronics.in" "$DOMAIN_IN"
deploy_to_domain "luxtronics.com.au" "$DOMAIN_AU"
deploy_to_domain "luxtronics.co.nz" "$DOMAIN_NZ"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🔍 Test the sites:"
echo "  https://luxtronics.in"
echo "  https://luxtronics.com.au"
echo "  https://luxtronics.co.nz"
echo ""
