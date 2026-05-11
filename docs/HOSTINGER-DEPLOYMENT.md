# Hostinger Shared Hosting Deployment Guide

## Important: This is Shared Hosting (Not VPS)

Hostinger shared hosting pe:
- **Apache** server hai (Nginx nahi)
- `sudo`, `systemctl`, `nginx` commands nahi chalengi
- **hPanel** use karna hoga domains manage karne ke liye
- **FTP/File Manager** se files upload karna hoga

## Architecture on Hostinger

| Domain | Hostinger Directory | Build Source |
|--------|---------------------|--------------|
| luxtronics.in | `~/public_html/` or domain root | Build from `.env.india` |
| luxtronics.com.au | `~/domains/luxtronics.com.au/public_html/` | Build from `.env.australia` |
| luxtronics.co.nz | `~/domains/luxtronics.co.nz/public_html/` | Build from `.env.newzealand` |

## Step 1: Configure Domains in hPanel

1. Login to [hPanel](https://hpanel.hostinger.com/)
2. Go to **Domains > Add New Domain**
3. Add `luxtronics.com.au` and `luxtronics.co.nz` as addon domains
4. Make sure they point to separate directories

## Step 2: Build for Each Domain

Local machine pe:

```bash
# India build
cp .env.india .env
npm run build

# Australia build  
cp .env.australia .env
npm run build

# New Zealand build
cp .env.newzealand .env
npm run build
```

Har build ke baad `dist/` folder mein ready files hongi.

## Step 3: Upload via FTP

### Method A: File Manager (Easy)

1. hPanel mein **File Manager** open karo
2. Respective domain ke folder mein jao:
   - `luxtronics.in` → `public_html/`
   - `luxtronics.com.au` → `domains/luxtronics.com.au/public_html/`
   - `luxtronics.co.nz` → `domains/luxtronics.co.nz/public_html/`
3. Existing files delete karo (except .htaccess)
4. Build files upload karo

### Method B: FTP Client (FileZilla)

1. FileZilla open karo
2. Connect to Hostinger FTP:
   - Host: `145.79.58.114`
   - Username: `u224046696`
   - Password: Your Hostinger password
   - Port: `21`
3. Upload `dist/` folder contents to respective `public_html` directories

## Step 4: Add .htaccess for React Routing

Har domain ke `public_html` folder mein ye `.htaccess` file upload karo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

Ye file already banayi hai: `.htaccess` (project root mein)

## Step 5: Verify

Browser mein check karo:
- `https://luxtronics.in` - India store
- `https://luxtronics.com.au` - Australia store
- `https://luxtronics.co.nz` - New Zealand store

## Troubleshooting

### 404 on page refresh
- `.htaccess` file missing hai ya galat location pe hai
- Apache mod_rewrite enabled nahi hai (hPanel se enable karo)

### Blank page
- Build files sahi location pe upload nahi hue
- Check browser console for errors

### CORS errors
- WooCommerce store pe CORS code add karo (see CORS-SETUP.md)

## Automated Deployment Script

Hostinger pe direct deployment ke liye ye script use karo:

```bash
#!/bin/bash
# deploy-hostinger.sh

DOMAIN=$1

case $DOMAIN in
    india)
        LOCAL_DIR="dist/"
        REMOTE_DIR="/public_html/"
        ;;
    australia)
        LOCAL_DIR="dist/"
        REMOTE_DIR="/domains/luxtronics.com.au/public_html/"
        ;;
    newzealand)
        LOCAL_DIR="dist/"
        REMOTE_DIR="/domains/luxtronics.co.nz/public_html/"
        ;;
    *)
        echo "Invalid domain"
        exit 1
        ;;
esac

# FTP upload using lftp
lftp -u u224046696,YOUR_PASSWORD 145.79.58.114 <<EOF
set ssl:verify-certificate no
set sftp:auto-confirm yes
mirror -R --delete $LOCAL_DIR $REMOTE_DIR
bye
EOF

echo "Deployed $DOMAIN"
```

**Note:** Password ko environment variable mein store karo security ke liye.

## Next Steps

1. Domain DNS check karo (Hostinger pe nameservers)
2. SSL certificates enable karo (hPanel > SSL)
3. CDN configure karo agar chahiye (Cloudflare)
