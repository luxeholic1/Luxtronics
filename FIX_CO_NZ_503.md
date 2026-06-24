# Fix: luxtronics.co.nz - 503 Error

## Problem
`luxtronics.co.nz` returns **503 Service Unavailable** but was working before.
`luxtronics.com.au` works fine.

## Root Cause
Static site files were deployed to `.com.au` folder but NOT to `.co.nz` folder.
Each domain has its own `public_html` folder on Hostinger.

## Solution: Deploy Static Files to .co.nz

### Quick SSH Commands

```bash
# SSH into Hostinger
ssh u224046696@in-mum2-web2220.serversforseo.com

# Check if .co.nz folder exists
ls -la ~/domains/

# Create public_html if needed
mkdir -p ~/domains/luxtronics.co.nz/public_html

# Copy files from .com.au to .co.nz
cp -r ~/domains/luxtronics.com.au/public_html/* ~/domains/luxtronics.co.nz/public_html/

# Verify files copied
ls -la ~/domains/luxtronics.co.nz/public_html/

# Test
curl -I https://luxtronics.co.nz
```

### Option 2: Via Hostinger File Manager

1. Login to https://hpanel.hostinger.com
2. Go to **Files** → **File Manager**
3. Navigate to `domains/luxtronics.com.au/public_html`
4. Select all files
5. **Copy** them
6. Navigate to `domains/luxtronics.co.nz/public_html`
7. **Paste** files
8. Done!

### Option 3: Automated Script (Best Way)

```bash
# On your local machine
cd /Users/asmitsharma/Downloads/Luxtronics

# Make script executable
chmod +x deploy-to-all-domains.sh

# Build first
npm run build

# Deploy to all domains (IN, AU, NZ)
./deploy-to-all-domains.sh
```

## File Structure on Server

```
~/domains/
├── luxtronics.in/
│   └── public_html/
│       ├── index.html
│       ├── assets/
│       └── .htaccess
│
├── luxtronics.com.au/
│   └── public_html/
│       ├── index.html ✅ (working)
│       ├── assets/
│       └── .htaccess
│
└── luxtronics.co.nz/
    └── public_html/
        ├── index.html ❌ (missing - causing 503)
        ├── assets/
        └── .htaccess
```

## .htaccess File (Must be in each domain)

```apache
# React SPA with client-side routing
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
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

## Why This Happens

When you pushed to Git, it auto-deploys to `~/domains/luxtronics.in/nodejs/`

But the **public-facing domains** (`.com.au` and `.co.nz`) have their own folders:
- Git auto-deploy → `luxtronics.in/nodejs/` (backend code)
- Static site → `luxtronics.com.au/public_html/` (frontend files)
- Static site → `luxtronics.co.nz/public_html/` (frontend files)

You manually copied files to `.com.au` but forgot `.co.nz`!

## Quick Fix (SSH One-Liner)

```bash
ssh u224046696@in-mum2-web2220.serversforseo.com "mkdir -p ~/domains/luxtronics.co.nz/public_html && cp -r ~/domains/luxtronics.com.au/public_html/* ~/domains/luxtronics.co.nz/public_html/ && echo 'Done!'"
```

## Verify After Fix

```bash
# Check HTTP status
curl -I https://luxtronics.co.nz
# Should return: HTTP/2 200

# Check title
curl -s https://luxtronics.co.nz | grep -o "<title>.*</title>"
# Should return: <title>Luxtronics — Premium Electronics...</title>

# Test in browser
# Open: https://luxtronics.co.nz
# Should load homepage
# Products should load from storenz.luxtronics.luxtronics.in
```

## Future: Automate This

Add to your build process:
```bash
npm run build
# Then deploy to ALL domains automatically
./deploy-to-all-domains.sh
```

Or setup GitHub Actions to deploy to all 3 domains on push.

---

**Status**: Waiting for manual copy of files to `.co.nz` folder
**Next**: SSH in and copy files, or use deploy script
