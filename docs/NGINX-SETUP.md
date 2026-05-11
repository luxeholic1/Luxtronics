# Nginx Configuration for Multi-Domain Setup

## Overview

Configure Nginx to serve the same React build across three domains (luxtronics.in, luxtronics.com.au, luxtronics.co.nz), each pointing to its own directory.

## Prerequisites

- SSH access to your server
- Root or sudo privileges
- Nginx installed on the server
- React builds deployed to `/var/www/luxtronics.in/`, `/var/www/luxtronics.com.au/`, `/var/www/luxtronics.co.nz/`

## Step-by-Step Setup

### 1. Create Build Directories

```bash
sudo mkdir -p /var/www/luxtronics.in
sudo mkdir -p /var/www/luxtronics.com.au
sudo mkdir -p /var/www/luxtronics.co.nz

# Set proper permissions
sudo chown -R www-data:www-data /var/www/luxtronics.in
sudo chown -R www-data:www-data /var/www/luxtronics.com.au
sudo chown -R www-data:www-data /var/www/luxtronics.co.nz

sudo chmod -R 755 /var/www/luxtronics.in
sudo chmod -R 755 /var/www/luxtronics.com.au
sudo chmod -R 755 /var/www/luxtronics.co.nz
```

### 2. Copy Nginx Configuration File

The configuration file is at: `nginx-multistore.conf` in your project root.

Upload it to the server:

```bash
# From your local machine
scp nginx-multistore.conf user@your-server:/tmp/
```

Or copy the content directly on the server:

```bash
sudo nano /etc/nginx/sites-available/luxtronics-multistore
```

Then paste the content from `nginx-multistore.conf`.

### 3. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/luxtronics-multistore /etc/nginx/sites-enabled/
```

### 4. Remove Default Configuration (Optional)

If you don't need the default Nginx site:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5. Test Nginx Configuration

```bash
sudo nginx -t
```

You should see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If there are errors, fix them before proceeding.

### 6. Reload Nginx

```bash
sudo systemctl reload nginx
# Or restart
sudo systemctl restart nginx
```

### 7. Verify Nginx is Running

```bash
sudo systemctl status nginx
```

## DNS Configuration

Ensure your domain DNS records point to your server IP:

```
A Record: luxtronics.in → YOUR_SERVER_IP
A Record: www.luxtronics.in → YOUR_SERVER_IP
A Record: luxtronics.com.au → YOUR_SERVER_IP
A Record: www.luxtronics.com.au → YOUR_SERVER_IP
A Record: luxtronics.co.nz → YOUR_SERVER_IP
A Record: www.luxtronics.co.nz → YOUR_SERVER_IP
```

## Deploy React Builds

After building the React app locally, deploy to each directory:

```bash
# From your local machine
rsync -avz --delete build/ user@your-server:/var/www/luxtronics.in/
rsync -avz --delete build/ user@your-server:/var/www/luxtronics.com.au/
rsync -avz --delete build/ user@your-server:/var/www/luxtronics.co.nz/
```

Or use the build script (uncomment the rsync command first):

```bash
./scripts/build-multistore.sh india
./scripts/build-multistore.sh australia
./scripts/build-multistore.sh newzealand
```

## SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificates for all domains
sudo certbot --nginx -d luxtronics.in -d www.luxtronics.in
sudo certbot --nginx -d luxtronics.com.au -d www.luxtronics.com.au
sudo certbot --nginx -d luxtronics.co.nz -d www.luxtronics.co.nz

# Auto-renewal is configured automatically
```

Certbot will automatically update your Nginx configuration to use HTTPS.

### Manual SSL Configuration

If you have SSL certificates from another provider, update the Nginx config:

```nginx
server {
    server_name luxtronics.in www.luxtronics.in;
    root /var/www/luxtronics.in;
    index index.html;

    # SSL configuration
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        try_files $uri /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    server_name luxtronics.in www.luxtronics.in;
    return 301 https://$host$request_uri;
}
```

## Troubleshooting

### 502 Bad Gateway

- Check if Nginx is running: `sudo systemctl status nginx`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`

### 404 Not Found

- Verify build files exist in the directory: `ls -la /var/www/luxtronics.in/`
- Check file permissions: `sudo chown -R www-data:www-data /var/www/luxtronics.in/`

### Permission Denied

```bash
sudo chmod -R 755 /var/www/luxtronics.in
sudo chown -R www-data:www-data /var/www/luxtronics.in
```

### Configuration Test Failed

```bash
# Check syntax
sudo nginx -t

# View detailed error
sudo journalctl -xe
```

### Sites Not Loading

1. Check DNS propagation: `dig luxtronics.in`
2. Verify firewall allows port 80/443: `sudo ufw status`
3. Check Nginx is listening: `sudo netstat -tlnp | grep nginx`

## Useful Commands

```bash
# View Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log

# Test configuration
sudo nginx -t

# View all enabled sites
ls -la /etc/nginx/sites-enabled/

# View all available sites
ls -la /etc/nginx/sites-available/
```

## Security Hardening (Optional)

Add these to your Nginx config for better security:

```nginx
# Hide Nginx version
server_tokens off;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Verification

After setup, test each domain:

```bash
curl -I https://luxtronics.in
curl -I https://luxtronics.com.au
curl -I https://luxtronics.co.nz
```

You should see HTTP 200 responses.
