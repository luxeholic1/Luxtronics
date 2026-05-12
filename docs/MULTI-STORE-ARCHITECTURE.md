# Multi-Store WooCommerce Architecture

## Overview

This architecture allows a single React frontend to serve multiple domains (luxtronics.in, luxtronics.com.au, luxtronics.co.nz), each connecting to its own WooCommerce backend. Domain detection happens via hostname (not geolocation).

## Architecture Summary

| Domain | React Build | WooCommerce Backend | Currency |
|--------|-------------|-------------------|----------|
| luxtronics.in | /var/www/luxtronics.in | luxtronics.luxtronics.in | INR ₹ |
| luxtronics.com.au | /var/www/luxtronics.com.au | storeau.luxtronics.luxtronics.in | AUD A$ |
| luxtronics.co.nz | /var/www/luxtronics.co.nz | storenz.luxtronics.luxtronics.in | NZD NZ$ |

## File Structure

### Frontend Configuration

- **`frontend/src/config/storeConfig.ts`** - Core configuration with domain-based settings
- **`frontend/src/api/wooClient.ts`** - WooCommerce API client
- **`frontend/src/context/StoreContext.tsx`** - React context for store configuration
- **`frontend/src/App.tsx`** - Wrapped with StoreProvider

### Environment Files

- **`.env.india`** - WooCommerce API keys for India store
- **`.env.australia`** - WooCommerce API keys for Australia store
- **`.env.newzealand`** - WooCommerce API keys for New Zealand store

### Server Configuration

- **`nginx-multistore.conf`** - Nginx virtual host configuration for all three domains
- **`docs/woocommerce-cors.php`** - CORS configuration for WooCommerce backends

## How It Works

### 1. Domain Detection

The `storeConfig.ts` file detects the current domain from `window.location.hostname` and returns the appropriate configuration including the store-specific API URL:

```typescript
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'luxtronics.in';
export const storeConfig = STORE_CONFIG[hostname] ?? STORE_CONFIG['luxtronics.in'];
```

Each domain now connects to its own WooCommerce store:
- **luxtronics.in** → luxtronics.luxtronics.in
- **luxtronics.com.au** → storeau.luxtronics.luxtronics.in  
- **luxtronics.co.nz** → storenz.luxtronics.luxtronics.in

### 2. API Routing

The `wooClient.ts` uses the domain-specific API URL from the store config:

```typescript
import { API_URL } from '../config/storeConfig';
// All API calls go to the correct WooCommerce backend
```

### 3. Component Usage

Components can access store-specific data including the API URL using the `useStore` hook:

```typescript
import { useStore } from '../context/StoreContext';

const { symbol, currency, apiUrl } = useStore();
```

## Deployment Process

### Build for Each Domain

```bash
# India
./scripts/build-multistore.sh india

# Australia
./scripts/build-multistore.sh australia

# New Zealand
./scripts/build-multistore.sh newzealand
```

Each build:
1. Copies the appropriate `.env` file (india/australia/newzealand)
2. Builds the React app with those environment variables
3. Deploys to the respective server directory

### CI/CD Integration

For staging deployments (only), configure your CI/CD pipeline to:
1. Detect the target domain
2. Use the corresponding environment file
3. Build and deploy to staging environment
4. Never deploy to main branch directly

## WooCommerce Setup

### CORS Configuration

Add the CORS snippet to each WooCommerce store's `functions.php`:

```php
// Location: /wp-content/themes/your-active-theme/functions.php
// See docs/woocommerce-cors.php for the complete code
```

This allows the React frontend (on different domains) to make API calls to the WooCommerce backend.

### API Keys

Generate WooCommerce REST API keys for each store:
1. Go to WooCommerce > Settings > Advanced > REST API
2. Add new key with Read/Write permissions
3. Copy the Consumer Key (CK) and Consumer Secret (CS)
4. Add them to the corresponding `.env` file

## Nginx Configuration

1. Copy `nginx-multistore.conf` to `/etc/nginx/sites-available/luxtronics-multistore`
2. Create symbolic links:
   ```bash
   sudo ln -s /etc/nginx/sites-available/luxtronics-multistore /etc/nginx/sites-enabled/
   ```
3. Test configuration: `sudo nginx -t`
4. Reload Nginx: `sudo systemctl reload nginx`

Ensure the build directories exist:
```bash
sudo mkdir -p /var/www/luxtronics.in
sudo mkdir -p /var/www/luxtronics.com.au
sudo mkdir -p /var/www/luxtronics.co.nz
```

## Development

### Local Development

For local development, the app defaults to the India configuration. To test other domains:

1. Edit `/etc/hosts` to map domains to localhost:
   ```
   127.0.0.1 luxtronics.com.au
   127.0.0.1 luxtronics.co.nz
   ```
2. Access via the mapped domain in your browser

### Testing Store Context

```typescript
import { useStore } from '../context/StoreContext';

function TestComponent() {
  const store = useStore();
  console.log(store); // { apiUrl, currency, symbol, country, label }
}
```

## Notes

- The lint warning in `StoreContext.tsx` about fast refresh is not critical - it's a standard pattern for React contexts
- All three domains share the same React codebase, just with different build-time environment variables
- The domain detection happens at runtime in the browser
- No geolocation is needed - the domain itself determines the store configuration
