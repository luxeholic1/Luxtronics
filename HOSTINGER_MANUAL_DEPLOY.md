# Hostinger Manual Deployment Guide

## Current Setup
- **Frontend**: React SPA calling WooCommerce directly (no backend needed)
- **Backend**: Optional - only needed for admin features
- **Deployment**: Git auto-deploys to `~/domains/luxtronics.in/nodejs/`

## Problem: Process Limit Hit (503 Errors)

When Git pushes:
1. Hostinger tries to auto-start backend
2. Old processes don't die
3. Processes accumulate → Hit limit (50-100)
4. Result: "fork: retry: Resource temporarily unavailable"
5. Website returns 503

## Solution: Static Site Deployment (No Backend)

### ✅ Frontend Works Without Backend
Your frontend is already configured to call WooCommerce REST API directly:
- India: `luxtronics.luxtronics.in/wp-json/wc/v3`
- Australia: `storeau.luxtronics.luxtronics.in/wp-json/wc/v3`
- New Zealand: `storenz.luxtronics.luxtronics.in/wp-json/wc/v3`

**Backend is NOT needed for:**
- Product listing ✅
- Product details ✅
- Categories ✅
- Search ✅
- Cart (client-side) ✅

**Backend only needed for:**
- Admin dashboard
- Invoice generation
- Contact form submission

## Manual Deploy Steps

### Step 1: Build Locally
```bash
cd /Users/asmitsharma/Downloads/Luxtronics
npm run build
```

### Step 2: Wait for Server Recovery
If server is hitting process limit:
1. Wait 10-15 minutes (Hostinger auto-cleanup)
2. OR contact Hostinger support to kill processes
3. OR restart from hPanel

### Step 3: Deploy Static Files

**Option A: Using Script (Recommended)**
```bash
chmod +x deploy-to-all-domains.sh
./deploy-to-all-domains.sh
```

**Option B: Manual SSH Copy**
```bash
# SSH into server
ssh u224046696@in-mum2-web2220.serversforseo.com

# Navigate to domain
cd ~/domains/luxtronics.com.au/public_html

# Clean old files
rm -rf *

# Copy from .in (master copy)
cp -r ~/domains/luxtronics.in/public_html/* .

# Repeat for .co.nz
cd ~/domains/luxtronics.co.nz/public_html
rm -rf *
cp -r ~/domains/luxtronics.in/public_html/* .
```

**Option C: Hostinger File Manager**
1. Login: https://hpanel.hostinger.com
2. Files → File Manager
3. Copy files from `luxtronics.in/public_html`
4. Paste to `luxtronics.com.au/public_html`
5. Paste to `luxtronics.co.nz/public_html`

## Preventing Process Buildup

### Disable Backend Auto-Start

Add `.hostinger-skip` file to prevent auto-start:
```bash
# On server
cd ~/domains/luxtronics.in/nodejs
touch .hostinger-skip
```

Or rename `server.js` temporarily:
```bash
mv server.js server.js.backup
```

### Kill Processes Before Each Deploy

Create `pre-deploy.sh`:
```bash
#!/bin/bash
pkill -9 lsnode
pkill -9 node
pm2 delete all
pm2 kill
sleep 2
echo "✅ Processes cleaned"
```

## Checking Process Count

```bash
# SSH into server
ssh u224046696@in-mum2-web2220.serversforseo.com

# Check process count
ps aux | wc -l
# Should be < 50. If > 100 = problem

# Find node processes
ps aux | grep -E "node|lsnode" | grep -v grep

# Kill if needed
pkill -9 lsnode
pkill -9 node
```

## Domain Structure on Server

```
/home/u224046696/domains/
├── luxtronics.in/
│   ├── nodejs/           ← Git auto-deploys here
│   │   ├── server.js
│   │   ├── build/
│   │   └── .env
│   └── public_html/      ← Static site served from here
│       ├── index.html
│       └── assets/
│
├── luxtronics.com.au/
│   └── public_html/      ← Copy static files here
│       ├── index.html
│       └── assets/
│
└── luxtronics.co.nz/
    └── public_html/      ← Copy static files here
        ├── index.html
        └── assets/
```

## .htaccess Required

Each `public_html` needs this `.htaccess`:

```apache
# React SPA routing
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  RewriteRule ^ /index.html [L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

## Testing After Deploy

```bash
# Check HTTP status (should be 200)
curl -I https://luxtronics.in
curl -I https://luxtronics.com.au
curl -I https://luxtronics.co.nz

# Check title
curl -s https://luxtronics.com.au | grep -o "<title>.*</title>"

# Test in browser
# Open each domain and verify:
# - Homepage loads
# - Products load
# - Search works
# - Navigation works
```

## Emergency: Server Completely Locked

If you get "fork: retry: Resource temporarily unavailable":

1. **Don't try more commands** - they'll fail and make it worse
2. **Wait 10 minutes** - Hostinger auto-cleanup will kick in
3. **Contact Hostinger Support** (fastest):
   - Login: https://hpanel.hostinger.com
   - Help → Live Chat
   - Say: "Server hitting max process limit, please kill all processes for user u224046696"
4. **Restart from hPanel**:
   - Websites → Your site → Advanced → Restart

## Long-term Solution

**Option 1: Static Only (Recommended)**
- Keep backend disabled
- All domains serve static React SPA
- WooCommerce called directly from browser
- No process limit issues

**Option 2: Backend on Separate Service**
- Move backend to Railway.app / Render.com / Vercel
- Free tier available
- Better process management
- Keep Hostinger for static files only

**Option 3: Better PM2 Management**
- Use PM2 with `autorestart: false`
- Manual start only when needed
- Monitor with `pm2 monit`

## Current Status

✅ **Frontend Code**: Ready - calls WooCommerce directly  
✅ **Build System**: Working  
⚠️ **Server**: Process limit hit - needs cleanup  
❌ **Backend**: Causing process buildup - disabled for now  

---

**Next Action**: Wait for server recovery, then deploy static files only.
