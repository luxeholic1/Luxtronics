# Quick Fix Guide - Common Issues

## 🔥 Emergency Fixes

### Products Not Loading
```bash
# 1. Check API keys
cat .env | grep WOOCOMMERCE_KEY

# 2. Test API directly
curl -u "KEY:SECRET" "https://luxtronics.luxtronics.in/wp-json/wc/v3/products?per_page=1"

# 3. Check browser console for errors
# 401 = Wrong API keys
# 404 = Wrong URL
# CORS = Missing CORS headers

# Fix: Update .env and rebuild
npm run build
```

### Wrong Store Loading
```javascript
// Browser console - check domain detection
console.log(window.location.hostname);
console.log(storeConfig);

// Fix: Edit /frontend/src/config/storeConfig.ts
// Add domain to STORE_CONFIG object
```

### Checkout Goes to Wrong Store
```typescript
// File: /frontend/src/lib/woo-checkout.ts
// Line: ~10

// Should be:
export const WOO_BASE = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');

// Rebuild after fix
```

### Mobile Menu Stuck Open
```typescript
// File: /frontend/src/components/Navbar.tsx
// Line: ~25

// Should be:
const [mobileOpen, setMobileOpen] = useState(false);  // false, not true
```

### Header Background Wrong
```typescript
// File: /frontend/src/components/Navbar.tsx
// Line: ~95

// Light theme:
light:bg-white  // Pure white

// Dark theme:
dark:bg-black/60  // Semi-transparent
```

---

## 📁 File Locations Cheat Sheet

```
Need to change...              Edit this file...
─────────────────────────────────────────────────────────────
Store URLs                     /frontend/src/config/storeConfig.ts
API Keys                       /.env
Currency                       /frontend/src/context/CurrencyContext.tsx
Navigation Links               /frontend/src/components/Navbar.tsx
Header Style                   /frontend/src/components/Navbar.tsx
Homepage Layout                /frontend/src/pages/Index.tsx
Product Card                   /frontend/src/components/ProductCard.tsx
Checkout Redirect              /frontend/src/lib/woo-checkout.ts
Theme Colors                   /tailwind.config.ts
Product API Calls              /frontend/src/services/store-api.ts
```

---

## 🔧 Quick Commands

```bash
# Build
npm run build

# Local dev
npm run dev

# Test build
npm run preview

# Deploy
git add .
git commit -m "fix: description"
git push origin main

# Check env vars
cat .env | grep VITE_

# Test API
curl "https://luxtronics.in/api/woo/status"
```

---

## 🎯 Common Edit Patterns

### Add New Store
1. Edit `storeConfig.ts` - add domain
2. Edit `.env` - add API keys
3. Edit `store-api.ts` - add credentials case
4. Rebuild & deploy

### Change Header Color
1. Edit `Navbar.tsx`
2. Find `light:bg-white` or `dark:bg-black`
3. Change color
4. Rebuild

### Add Navigation Link
1. Edit `Navbar.tsx`
2. Find `links` array (~line 20)
3. Add `{ to: "/path", label: "Label" }`
4. Create page component
5. Add route in `App.tsx`

### Update Product Grid
1. Edit `Shop.tsx` or `ProductCard.tsx`
2. Change `grid-cols-*` classes
3. Adjust spacing with `gap-*`
4. Rebuild

---

## 🚨 Error Code Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| 401 | Wrong API keys | Update `.env` with correct keys |
| 404 | Wrong URL | Check `storeConfig.ts` URLs |
| 500 | Server error | Check WooCommerce is running |
| CORS | Cross-origin blocked | Add CORS to WooCommerce |
| undefined | Env var not loaded | Rebuild after changing `.env` |

---

## 📞 When Stuck

1. Check `TECHNICAL_GUIDE.md` for detailed info
2. Check browser console for errors
3. Verify environment variables
4. Test API with curl
5. Check file locations above
6. Rebuild after any config change

---

**Remember:** Always rebuild (`npm run build`) after changing:
- `.env` files
- `storeConfig.ts`
- Any configuration files
