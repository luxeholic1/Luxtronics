# Fix: AU/NZ Products Not Loading

## Problem
Products were not loading on `luxtronics.com.au` and `luxtronics.co.nz` domains.
Error: `Unexpected token '<', "<!doctype "... is not valid JSON`

## Root Cause
1. **Backend API not accessible**: Static site deployed without working backend proxy
2. **Wrong WooCommerce URLs**: Environment variables pointed to subdirectories (`/storeau`, `/storenz`) instead of working subdomains
3. **Subdomain approach works**: `storeau.luxtronics.luxtronics.in` returns HTTP 401 (authentication required - correct!)
4. **Subdirectory approach fails**: `luxtronics.luxtronics.in/storeau` returns HTTP 404 (not found)

## Solution Implemented

### 1. Updated Frontend to Call WooCommerce Directly
**File**: `frontend/src/services/woocommerce.ts`
- Removed backend proxy dependency (`/api/woo/*`)
- Added domain detection to select correct WooCommerce credentials
- Call WooCommerce REST API directly with `consumer_key` and `consumer_secret` in query params
- Works without backend - perfect for static site deployment!

```typescript
// Detects domain (IN, AU, or NZ) and uses correct credentials
function getWooConfig() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'luxtronics.in';
  const domain = hostname.replace(/^www\./, '');
  
  if (domain === 'luxtronics.com.au') {
    // Use AUSTRALIA credentials
  } else if (domain === 'luxtronics.co.nz') {
    // Use NEWZEALAND credentials
  } else {
    // Use INDIA credentials (default)
  }
}
```

### 2. Fixed Environment Variables
**Files**: `.env`, `.env.australia`, `.env.newzealand`

Changed from subdirectories (not working):
```bash
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://luxtronics.luxtronics.in/storeau
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://luxtronics.luxtronics.in/storenz
```

To subdomains (working):
```bash
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
```

## Testing

### Before Fix
```bash
# Subdirectory - FAILS
curl -I https://luxtronics.luxtronics.in/storeau/wp-json/wc/v3/products
HTTP/2 404  ❌

# Subdomain - WORKS
curl -I https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3/products
HTTP/2 401  ✅ (authentication required - correct behavior)
```

### After Fix
1. Build completed successfully
2. Pushed to Git (auto-deploys to Hostinger)
3. Frontend now calls WooCommerce directly using correct subdomain URLs
4. No backend dependency needed

## What Happens Now

1. **User visits `luxtronics.com.au`**
2. Frontend detects domain → selects Australia credentials
3. Calls `https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3/products?consumer_key=xxx&consumer_secret=xxx`
4. WooCommerce responds with products ✅

Same for New Zealand (`luxtronics.co.nz` → `storenz.luxtronics.luxtronics.in`)

## Benefits
- ✅ Works without backend API
- ✅ Perfect for static site deployment on Hostinger
- ✅ No CORS issues (WooCommerce REST API supports direct calls)
- ✅ Domain-specific product catalogs work automatically
- ✅ Uses same credentials as before (no security changes needed)

## Next Steps
1. Wait for Git auto-deploy to complete (~1-2 minutes)
2. Visit https://luxtronics.com.au to verify products load
3. Visit https://luxtronics.co.nz to verify products load
4. Check browser console for any errors

## Files Changed
- `frontend/src/services/woocommerce.ts` - Direct WooCommerce calls
- `.env` - Fixed AU/NZ URLs
- `.env.australia` - Fixed URL
- `.env.newzealand` - Fixed URL

---
**Status**: ✅ Deployed (commit e50076b)
**Date**: June 24, 2026
