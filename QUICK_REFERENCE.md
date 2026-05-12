# Three Store Architecture - Quick Reference

## Environment Variables Mapping

### India Store (luxtronics.in)
```bash
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_ed6c3544620b10f22f35f52d5cc35019ae0b3358
VITE_WOOCOMMERCE_SECRET_INDIA=cs_3304ef915585f9a2d29228af581647dc1a4a702c
```

### Australia Store (luxtronics.com.au)
```bash
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_AUSTRALIA=your_australia_key
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=your_australia_secret
```

### New Zealand Store (luxtronics.co.nz)
```bash
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_NEWZEALAND=your_newzealand_key
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=your_newzealand_secret
```

## Store Mapping Table

| Frontend Domain | WooCommerce Store | Country Code | Currency |
|----------------|-------------------|--------------|----------|
| luxtronics.in | luxtronics.luxtronics.in | IN | ₹ INR |
| luxtronics.com.au | storeau.luxtronics.luxtronics.in | AU | A$ AUD |
| luxtronics.co.nz | storenz.luxtronics.luxtronics.in | NZ | NZ$ NZD |

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/config/storeConfig.ts` | Domain to store mapping |
| `frontend/src/api/wooClient.ts` | API client with store-specific keys |
| `.env` | All stores (for Hostinger) |
| `.env.india` | India only |
| `.env.australia` | Australia only |
| `.env.newzealand` | New Zealand only |

## Build Commands

```bash
# India
cp .env.india .env && npm run build

# Australia
cp .env.australia .env && npm run build

# New Zealand
cp .env.newzealand .env && npm run build
```

## Testing URLs

- India: https://luxtronics.in
- Australia: https://luxtronics.com.au
- New Zealand: https://luxtronics.co.nz

## API Endpoints

- India: `https://luxtronics.luxtronics.in/wp-json/wc/v3`
- Australia: `https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3`
- New Zealand: `https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3`

## Quick Checks

### Check Domain Detection
```javascript
// Browser console
console.log(window.location.hostname);
console.log(storeConfig.country); // IN, AU, or NZ
```

### Check API URL
```javascript
// Browser console
console.log(storeConfig.apiUrl);
```

### Check Network Calls
Open DevTools → Network tab → Filter by "products"
- Should see calls to correct store URL

## Common Issues

| Issue | Solution |
|-------|----------|
| Wrong store loading | Check domain in `storeConfig.ts` |
| CORS error | Add CORS to WooCommerce `functions.php` |
| 401 error | Check API keys are correct |
| Products not loading | Verify API endpoint is accessible |

## Documentation Links

- **Hostinger Setup:** `docs/HOSTINGER_ENV_SETUP.md`
- **Full Setup:** `docs/THREE_STORE_SETUP.md`
- **Architecture:** `docs/MULTI-STORE-ARCHITECTURE.md`
- **Migration Summary:** `THREE_STORE_MIGRATION.md`
