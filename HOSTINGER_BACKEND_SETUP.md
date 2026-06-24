# Hostinger Backend Setup - luxtronics.com.au

## Problem
API endpoints returning 404 - Backend Node.js server not running on Hostinger.

## Solution - Start Backend Server on Hostinger

### Step 1: Check if Node.js App is Configured

1. **Login to Hostinger Control Panel**
2. Go to **Hosting → Advanced → Node.js**
3. Check if Node.js application is set up

If NOT configured, follow these steps:

### Step 2: Configure Node.js Application

1. **In Hostinger Panel → Node.js:**
   - **Application Mode:** Production
   - **Application Root:** `/public_html` or `/home/your-username/public_html`
   - **Application URL:** `https://luxtronics.com.au`
   - **Application Startup File:** `server.js`
   - **Node.js Version:** 18.x or 20.x (latest LTS)

2. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=Luxtronics
   
   # WooCommerce Australia
   VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
   VITE_WOOCOMMERCE_KEY_AUSTRALIA=ck_...
   VITE_WOOCOMMERCE_SECRET_AUSTRALIA=cs_...
   
   # WooCommerce India (fallback)
   VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
   VITE_WOOCOMMERCE_KEY_INDIA=ck_...
   VITE_WOOCOMMERCE_SECRET_INDIA=cs_...
   
   # WooCommerce New Zealand
   VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
   VITE_WOOCOMMERCE_KEY_NEWZEALAND=ck_...
   VITE_WOOCOMMERCE_SECRET_NEWZEALAND=cs_...
   ```

3. **Click "Create" or "Update"**

### Step 3: Alternative - Manual Start via SSH

If Hostinger Node.js panel doesn't work:

```bash
# SSH into server
ssh your-username@your-domain.com

# Navigate to project
cd ~/public_html

# Kill any old processes
pkill -9 node
pm2 delete all

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save
pm2 startup
# Copy and run the command it shows

# Check status
pm2 list
pm2 logs luxtronics-server
```

### Step 4: Configure Apache to Proxy API Requests

Update `.htaccess` in `/public_html/`:

```apache
# Luxtronics Hostinger / Apache config

Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy API requests to Node.js backend
  RewriteCond %{REQUEST_URI} ^/api/(.*)$ [NC]
  RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

  # Proxy health check
  RewriteCond %{REQUEST_URI} ^/health$ [NC]
  RewriteRule ^health$ http://localhost:3001/health [P,L]

  # Skip rewrite for existing files
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d [OR]
  RewriteCond %{REQUEST_FILENAME} -l
  RewriteRule ^ - [L]

  # Send everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"

  <FilesMatch "\.(html|htm|js|css)$">
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|mov|mp4)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>

  Header unset ETag
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 0 seconds"
  ExpiresByType text/javascript "access plus 0 seconds"
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 month"
  ExpiresByType font/woff "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 month"
</IfModule>

FileETag None
```

### Step 5: Enable Required Apache Modules

Contact Hostinger support to enable:
- `mod_proxy`
- `mod_proxy_http`
- `mod_rewrite` (usually already enabled)

Or add to `.htaccess`:
```apache
<IfModule !mod_proxy.c>
  LoadModule proxy_module modules/mod_proxy.so
</IfModule>
<IfModule !mod_proxy_http.c>
  LoadModule proxy_http_module modules/mod_proxy_http.so
</IfModule>
```

### Step 6: Verify Backend is Running

```bash
# Check if server is listening
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}

# Check API status
curl http://localhost:3001/api/status
# Should return: {"success":true,"status":"ready",...}

# Check from outside
curl https://luxtronics.com.au/api/status
# Should return: {"success":true,...}
```

### Step 7: Monitor Logs

```bash
# PM2 logs
pm2 logs luxtronics-server

# Real-time monitoring
pm2 monit

# Check for errors
pm2 logs luxtronics-server --err --lines 50
```

## Troubleshooting

### API still returns 404

1. **Check if Node server is running:**
   ```bash
   pm2 list
   # Should show "luxtronics-server" with status "online"
   ```

2. **Check if port 3001 is listening:**
   ```bash
   netstat -tuln | grep 3001
   # OR
   ss -tuln | grep 3001
   ```

3. **Test locally on server:**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Check Apache proxy:**
   - Ensure `mod_proxy` is enabled
   - Check `.htaccess` ProxyPass rules
   - Check Apache error logs

### Server keeps crashing

1. **Check logs:**
   ```bash
   pm2 logs luxtronics-server --lines 100
   ```

2. **Common issues:**
   - **MongoDB connection failed:** Check MONGODB_URI in env
   - **Port already in use:** Kill processes on port 3001
   - **Memory limit:** Increase max_memory_restart in ecosystem.config.cjs
   - **Too many restarts:** PM2 has given up, restart manually

3. **Restart server:**
   ```bash
   pm2 restart luxtronics-server
   # OR
   pm2 delete luxtronics-server
   pm2 start ecosystem.config.cjs
   ```

### MongoDB connection issues

1. **Test MongoDB URI:**
   ```bash
   # In Node.js
   node -e "require('mongodb').MongoClient.connect('YOUR_URI', (err,client) => { console.log(err || 'Connected!'); client?.close(); })"
   ```

2. **Common fixes:**
   - Check if IP whitelisted in MongoDB Atlas
   - Verify username/password (no special chars issue)
   - Check network connectivity
   - Try connecting from server IP

## Quick Commands Reference

```bash
# Start server
pm2 start ecosystem.config.cjs

# Stop server
pm2 stop luxtronics-server

# Restart server
pm2 restart luxtronics-server

# View logs
pm2 logs luxtronics-server

# Monitor resources
pm2 monit

# Check status
pm2 list

# Save configuration
pm2 save

# Delete process
pm2 delete luxtronics-server

# Kill all PM2 processes
pm2 kill
```

## Alternative: Using Hostinger Terminal

If SSH is not available, use Hostinger's web terminal:

1. Go to **Hosting → Advanced → Terminal**
2. Run the same commands as above
3. Terminal may timeout for long operations

## Need Help?

Contact Hostinger Support and ask them to:
1. Enable Node.js application support
2. Enable Apache `mod_proxy` and `mod_proxy_http`
3. Help configure Node.js app to start automatically
4. Check why API endpoints return 404

## Success Checklist

✅ Node.js server running (pm2 list shows online)  
✅ Port 3001 listening (netstat shows LISTEN)  
✅ Health check works: `curl http://localhost:3001/health`  
✅ API works locally: `curl http://localhost:3001/api/status`  
✅ API works externally: `curl https://luxtronics.com.au/api/status`  
✅ Website loads: https://luxtronics.com.au  
✅ No 503 errors  
✅ Products API works: https://luxtronics.com.au/api/products  

---

**Once backend is running, the website will work completely!**
