# CORS Setup for WooCommerce

## Overview

Since the React frontend (luxtronics.in, luxtronics.com.au, luxtronics.co.nz) will make API calls to WooCommerce backends on different domains, you need to configure CORS (Cross-Origin Resource Sharing) on each WooCommerce store.

## Steps to Add CORS

### For Each WooCommerce Store (India, Australia, New Zealand)

#### 1. Access Your WordPress Admin

Go to your WordPress admin panel:
- India: `https://luxtronics.luxtronics.in/wp-admin`
- Australia: `https://luxtronics.com.au/wp-admin`
- New Zealand: `https://luxtronics.co.nz/wp-admin`

#### 2. Edit functions.php

There are two ways to add the CORS configuration:

**Option A: Via WordPress Admin (Recommended)**

1. Go to **Appearance > Theme File Editor**
2. Select your active theme from the dropdown (right side)
3. Find and click `functions.php` in the right sidebar
4. Scroll to the bottom of the file
5. Paste the CORS code (see below) at the very end
6. Click **Update File**

**Option B: Via FTP/SFTP**

1. Connect to your server via FTP/SFTP
2. Navigate to: `/wp-content/themes/your-active-theme/`
3. Download `functions.php`
4. Add the CORS code at the end
5. Upload the modified file

#### 3. CORS Code to Add

Copy and paste this at the end of your `functions.php`:

```php
<?php
/**
 * WooCommerce CORS Configuration
 * Allows React frontend domains to make API calls
 */

add_action('init', function () {
    $allowed = [
        'https://luxtronics.in',
        'https://www.luxtronics.in',
        'https://luxtronics.com.au',
        'https://www.luxtronics.com.au',
        'https://luxtronics.co.nz',
        'https://www.luxtronics.co.nz',
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Allow-Credentials: true');
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```

#### 4. Verify CORS is Working

Test the API endpoint from your browser's console:

```javascript
fetch('https://your-store.com/wp-json/wc/v3/products')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If CORS is configured correctly, you should see the products data. If you see CORS errors, double-check the code was added correctly.

## Alternative: Using a CORS Plugin

If you prefer not to edit files directly, you can use a WordPress plugin:

1. Install **"CORS"** plugin from WordPress repository
2. Go to **Settings > CORS**
3. Add the allowed origins:
   - `https://luxtronics.in`
   - `https://www.luxtronics.in`
   - `https://luxtronics.com.au`
   - `https://www.luxtronics.com.au`
   - `https://luxtronics.co.nz`
   - `https://www.luxtronics.co.nz`
4. Save settings

## Important Notes

- **Add CORS to ALL THREE WooCommerce stores** (India, Australia, New Zealand)
- The code allows all three frontend domains to call any of the three backends
- Make sure WooCommerce REST API is enabled: **WooCommerce > Settings > Advanced > REST API**
- Ensure your API keys have Read/Write permissions

## Troubleshooting

### Error: "No 'Access-Control-Allow-Origin' header is present"

- Check that the CORS code was added to the correct `functions.php`
- Clear WordPress cache (if using caching plugins)
- Check server-level CORS rules (might conflict)

### Error: "Request header field authorization is not allowed"

- Verify the `Access-Control-Allow-Headers` includes `Authorization`
- Some security plugins might block this header

### Still Having Issues?

1. Check browser console for specific error messages
2. Verify WooCommerce REST API is accessible: `https://your-store.com/wp-json/wc/v3/`
3. Check server error logs: `/var/log/nginx/error.log` or WordPress error logs
