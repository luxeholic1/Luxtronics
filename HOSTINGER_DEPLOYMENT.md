# Hostinger Deployment Guide - Three Store Architecture

## Current Issue

Live domain pe `/api/woo/*` routes 404 de rahe hain kyunki backend server running nahi hai.

## Solution: Deploy Backend + Frontend

### Architecture on Hostinger

```
Hostinger Server
├── Frontend (Static Files) → /public_html/
└── Backend (Node.js App) → Running on Port 3001
```

## Step-by-Step Deployment

### 1. Backend Deployment

#### Option A: Using Node.js App in hPanel (Recommended)

1. **Login to Hostinger hPanel**
2. **Go to:** Advanced → Node.js
3. **Create New Application:**
   - Application root: `/domains/luxtronics.in/`
   - Application URL: `https://luxtronics.in`
   - Application startup file: `backend/server/index.ts` (or compiled `backend/server/index.js`)
   - Node.js version: 18.x or higher

4. **Set Environment Variables** (in Node.js app settings):
   ```bash
   # All the variables from HOSTINGER_ENV_SETUP.md
   VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
   VITE_WOOCOMMERCE_KEY_INDIA=ck_ed6c3544620b10f22f35f52d5cc35019ae0b3358
   # ... etc (all variables)
   ```

5. **Install Dependencies:**
   ```bash
   cd /domains/luxtronics.in/backend
   npm install
   npm run build  # If using TypeScript
   ```

6. **Start Application** from hPanel Node.js section

#### Option B: Using PM2 (Alternative)

```bash
# SSH into Hostinger
ssh username@your-server

# Navigate to project
cd /domains/luxtronics.in/

# Install dependencies
cd backend
npm install

# Start with PM2
pm2 start server/index.ts --name luxtronics-backend
pm2 save
pm2 startup
```

### 2. Frontend Deployment

#### Upload Build Files

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload to Hostinger:**
   - Upload `dist/` folder contents to `/public_html/`
   - Or use FTP/File Manager

3. **File Structure on Hostinger:**
   ```
   /public_html/
   ├── index.html
   ├── assets/
   │   ├── index.js
   │   ├── index.css
   │   └── ...
   ├── robots.txt
   └── sitemap.xml
   ```

### 3. Configure .htaccess for API Proxy

Create/update `/public_html/.htaccess`:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Proxy health check
RewriteCond %{REQUEST_URI} ^/health [NC]
RewriteRule ^health$ http://localhost:3001/health [P,L]

# SPA Routing - Send all other requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]

# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 4. Verify Deployment

#### Test Backend

```bash
# Check health
curl https://luxtronics.in/health

# Check WooCommerce proxy
curl https://luxtronics.in/api/woo/status

# Test products
curl "https://luxtronics.in/api/woo/products?per_page=1"
```

#### Test Frontend

Visit:
- https://luxtronics.in
- https://luxtronics.com.au
- https://luxtronics.co.nz

Check browser console for errors.

### 5. Troubleshooting

#### Backend Not Running

```bash
# SSH into server
ssh username@your-server

# Check if Node.js process is running
ps aux | grep node

# Check logs
pm2 logs luxtronics-backend
# OR
tail -f /var/log/nodejs/luxtronics.log
```

#### API Routes 404

1. Check `.htaccess` proxy rules
2. Verify backend is running on port 3001
3. Check Apache mod_proxy is enabled:
   ```bash
   a2enmod proxy
   a2enmod proxy_http
   service apache2 restart
   ```

#### CORS Errors

1. Check `CORS_ORIGIN` in environment variables
2. Verify `.htaccess` CORS headers
3. Check WooCommerce CORS setup

### 6. Alternative: Backend on Subdomain

If proxy doesn't work, deploy backend on subdomain:

1. **Create subdomain:** `api.luxtronics.in`
2. **Point to backend directory**
3. **Update frontend:**
   ```bash
   # In Hostinger environment variables
   VITE_BACKEND_URL=https://api.luxtronics.in
   ```
4. **Rebuild and redeploy frontend**

## Quick Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Luxtronics..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Upload to Hostinger (using FTP or rsync)
echo "📤 Uploading frontend..."
rsync -avz --delete dist/ username@your-server:/public_html/

# Deploy backend
echo "🔧 Deploying backend..."
ssh username@your-server << 'EOF'
  cd /domains/luxtronics.in/backend
  git pull origin main
  npm install
  pm2 restart luxtronics-backend
EOF

echo "✅ Deployment complete!"
echo "🌐 Visit: https://luxtronics.in"
```

## Environment Variables Checklist

Make sure these are set in Hostinger Node.js app:

- [ ] All `VITE_FIREBASE_*` variables
- [ ] All `VITE_WOOCOMMERCE_*_INDIA` variables
- [ ] All `VITE_WOOCOMMERCE_*_AUSTRALIA` variables
- [ ] All `VITE_WOOCOMMERCE_*_NEWZEALAND` variables
- [ ] `MONGODB_URI`
- [ ] `MONGODB_DB_NAME`
- [ ] `PORT=3001`
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` (all domains)
- [ ] `SYNC_TOKEN`
- [ ] **DO NOT SET** `VITE_BACKEND_URL` (let it default to current domain)

## Post-Deployment Testing

1. **Backend Health:**
   ```bash
   curl https://luxtronics.in/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **WooCommerce Proxy:**
   ```bash
   curl https://luxtronics.in/api/woo/status
   # Should return: {"connected":true,"status":200,...}
   ```

3. **Products API:**
   ```bash
   curl "https://luxtronics.in/api/woo/products?per_page=1"
   # Should return: [{"id":...,"name":"..."}]
   ```

4. **Frontend:**
   - Visit https://luxtronics.in
   - Check browser console (no errors)
   - Products should load
   - Check Network tab (API calls to `/api/woo/*`)

## Support

If issues persist:
1. Check Hostinger error logs
2. Check Node.js application logs
3. Verify all environment variables
4. Test backend endpoints directly
5. Check `.htaccess` configuration

---

**Status:** Ready for deployment 🚀
