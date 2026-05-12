# Three Store Architecture Setup Guide

## Overview

This document describes the updated multi-store architecture with three separate WooCommerce stores.

## Architecture

### Domain to Store Mapping

| Frontend Domain | WooCommerce Store | Currency | Region |
|----------------|-------------------|----------|---------|
| luxtronics.in | luxtronics.luxtronics.in | INR (₹) | India |
| luxtronics.com.au | storeau.luxtronics.luxtronics.in | AUD (A$) | Australia |
| luxtronics.co.nz | storenz.luxtronics.luxtronics.in | NZD (NZ$) | New Zealand |

### Key Changes

**Previous Setup:**
- All three frontend domains → Single WooCommerce store (luxtronics.luxtronics.in)

**New Setup:**
- Each frontend domain → Its own dedicated WooCommerce store
- Products, inventory, and orders are managed separately per region
- Each store can have region-specific pricing, products, and configurations

## Configuration Files Updated

### 1. Store Configuration (`frontend/src/config/storeConfig.ts`)

Added `apiUrl` field to `StoreConfig` interface:

```typescript
export interface StoreConfig {
  currency: string;
  symbol: string;
  country: string;
  label: string;
  apiUrl: string;  // NEW: Store-specific API URL
}
```

Each domain now maps to its own store:

```typescript
const STORE_CONFIG: Record<string, StoreConfig> = {
  'luxtronics.in': {
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
    // ... other config
  },
  'luxtronics.com.au': {
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
    // ... other config
  },
  'luxtronics.co.nz': {
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
    // ... other config
  },
};
```

### 2. Environment Files

Updated all environment files with correct store URLs:

- **`.env.india`** → `VITE_WOOCOMMERCE_URL=https://luxtronics.luxtronics.in`
- **`.env.australia`** → `VITE_WOOCOMMERCE_URL=https://storeau.luxtronics.luxtronics.in`
- **`.env.newzealand`** → `VITE_WOOCOMMERCE_URL=https://storenz.luxtronics.luxtronics.in`

### 3. CORS Configuration

Updated `.env` to allow all three frontend domains:

```bash
CORS_ORIGIN=https://luxtronics.in,https://www.luxtronics.in,https://luxtronics.com.au,https://www.luxtronics.com.au,https://luxtronics.co.nz,https://www.luxtronics.co.nz
```

## WooCommerce Store Setup

### For Each Store (storeau and storenz)

You need to configure CORS on the new WooCommerce stores to allow API access from the frontend domains.

#### 1. Add CORS Headers

Add this code to each store's `functions.php` file:

**Location:** `/wp-content/themes/your-active-theme/functions.php`

```php
<?php
// CORS Configuration for Luxtronics Multi-Store
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $allowed_origins = [
            'https://luxtronics.in',
            'https://www.luxtronics.in',
            'https://luxtronics.com.au',
            'https://www.luxtronics.com.au',
            'https://luxtronics.co.nz',
            'https://www.luxtronics.co.nz'
        ];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        }
        
        return $value;
    });
}, 15);
```

#### 2. Generate API Keys

For each store (storeau.luxtronics.luxtronics.in and storenz.luxtronics.luxtronics.in):

1. Login to WordPress admin
2. Go to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set:
   - Description: "Luxtronics Frontend"
   - User: Select an admin user
   - Permissions: **Read/Write**
5. Click **Generate API Key**
6. Copy the **Consumer Key** and **Consumer Secret**
7. Update the corresponding `.env` file:
   - For Australia: Update `.env.australia`
   - For New Zealand: Update `.env.newzealand`

**Note:** Currently, both `.env.australia` and `.env.newzealand` have placeholder keys. You MUST replace them with the actual keys generated from each store.

## Deployment Process

### Build for Each Domain

Use the build script to create domain-specific builds:

```bash
# Build for India
./scripts/build-multistore.sh india

# Build for Australia  
./scripts/build-multistore.sh australia

# Build for New Zealand
./scripts/build-multistore.sh newzealand
```

Each build:
1. Copies the appropriate `.env` file
2. Builds with store-specific environment variables
3. Deploys to the respective server directory

### Manual Build (if needed)

```bash
# For India
cp .env.india .env
npm run build
# Deploy dist/ to /var/www/luxtronics.in

# For Australia
cp .env.australia .env
npm run build
# Deploy dist/ to /var/www/luxtronics.com.au

# For New Zealand
cp .env.newzealand .env
npm run build
# Deploy dist/ to /var/www/luxtronics.co.nz
```

## Testing

### 1. Test Domain Detection

Visit each domain and check the browser console:

```javascript
// In browser console
console.log(window.location.hostname);
// Should show: luxtronics.in, luxtronics.com.au, or luxtronics.co.nz
```

### 2. Test API Connection

Check that products are loading from the correct store:

```javascript
// In browser console, check network tab
// API calls should go to:
// - luxtronics.in → luxtronics.luxtronics.in/wp-json/wc/v3
// - luxtronics.com.au → storeau.luxtronics.luxtronics.in/wp-json/wc/v3
// - luxtronics.co.nz → storenz.luxtronics.luxtronics.in/wp-json/wc/v3
```

### 3. Test Currency Display

Each domain should show its correct currency:
- India: ₹ (INR)
- Australia: A$ (AUD)
- New Zealand: NZ$ (NZD)

## Important Notes

### API Keys Security

⚠️ **CRITICAL:** The API keys in `.env.australia` and `.env.newzealand` are currently placeholders. You MUST:

1. Generate unique API keys for each store
2. Update the environment files with the correct keys
3. Never commit real API keys to version control (they're in `.gitignore`)

### Product Synchronization

With three separate stores, you need to decide:

1. **Independent Stores:** Each store has its own products, inventory, and pricing
   - Pros: Full regional control, different products per region
   - Cons: Manual management of each store

2. **Synchronized Stores:** Use a sync script to copy products between stores
   - Pros: Consistent product catalog
   - Cons: Need to handle currency conversion, regional variations

### Inventory Management

Each store maintains its own inventory. Consider:
- Setting up separate warehouses/fulfillment centers per region
- Using WooCommerce inventory management per store
- Implementing stock sync if needed

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Verify CORS code is added to `functions.php` in the correct theme
2. Check that the frontend domain is in the `$allowed_origins` array
3. Clear WordPress cache (if using a caching plugin)
4. Test with browser dev tools network tab

### Wrong Store Loading

If a domain loads products from the wrong store:

1. Check `storeConfig.ts` domain mapping
2. Verify the build used the correct `.env` file
3. Clear browser cache and hard refresh (Cmd+Shift+R)
4. Check network tab to see which API URL is being called

### API Authentication Errors

If you see 401 or 403 errors:

1. Verify API keys are correct in the `.env` file
2. Check that API keys have Read/Write permissions
3. Ensure the keys are from the correct WooCommerce store
4. Test API keys using Postman or curl

## Next Steps

1. ✅ Configuration files updated
2. ⏳ Generate API keys for storeau.luxtronics.luxtronics.in
3. ⏳ Generate API keys for storenz.luxtronics.luxtronics.in
4. ⏳ Update `.env.australia` with real API keys
5. ⏳ Update `.env.newzealand` with real API keys
6. ⏳ Add CORS configuration to both new stores
7. ⏳ Build and deploy for each domain
8. ⏳ Test each domain thoroughly

## Support

For issues or questions:
- Check the main documentation: `docs/MULTI-STORE-ARCHITECTURE.md`
- Review WooCommerce REST API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
- Check CORS setup: `docs/CORS-SETUP.md`
