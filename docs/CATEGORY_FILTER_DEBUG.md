# Category Filter Debug Guide

## 🐛 Issue: Products Not Filtering by Category

**Status**: Debug logs added, waiting for user to test

---

## 📍 Location
**File**: `/frontend/src/pages/Shop.tsx` (lines 93-110)

---

## 🔍 Debug Logs Added

When you select a category on the Shop page, the browser console will show:

```javascript
[Shop] Filtering by category: {
  activeCat: "smartphones",           // Selected category slug
  selectedCategory: { id: 123, name: "Smartphones", slug: "smartphones" },
  totalProducts: 1332,                // Total products before filter
  sampleProductCategories: [...]      // Categories of first product
}

[Shop] After filter: 45 products     // Products after filter
```

---

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Open your site in browser
2. Press **F12** to open DevTools
3. Click **Console** tab

### Step 2: Test Category Filter
1. Go to `/shop` page
2. Click on any category (e.g., "Smartphones")
3. **Watch the console** for debug logs

### Step 3: Analyze Output

#### Scenario A: Filter Works ✅
```
[Shop] Filtering by category: { activeCat: "smartphones", ... }
[Shop] After filter: 45 products
```
**Result**: 45 products displayed on page
**Action**: Remove debug logs, issue is fixed!

#### Scenario B: Filter Returns 0 Products ❌
```
[Shop] Filtering by category: { activeCat: "smartphones", ... }
[Shop] After filter: 0 products
```
**Result**: "No products found" message
**Action**: Check `sampleProductCategories` structure

#### Scenario C: No Logs Appear ❌
**Result**: Filter not triggering
**Action**: Check if category click is working

---

## 🔧 Common Issues & Fixes

### Issue 1: Category Structure Mismatch

**Problem**: WooCommerce product categories don't match expected format

**Check**: Look at `sampleProductCategories` in console:
```javascript
// Expected format:
[
  { id: 123, name: "Smartphones", slug: "smartphones" }
]

// If you see this instead:
[
  { term_id: 123, name: "Smartphones", slug: "smartphones" }
]
```

**Fix**: Update `mapStoreProductToLocalProduct` in `/frontend/src/services/store-api.ts`:
```typescript
categories: product.categories?.map(cat => ({
  id: cat.id || cat.term_id,  // Handle both formats
  name: cat.name,
  slug: cat.slug
})) || []
```

---

### Issue 2: Category ID vs Slug Mismatch

**Problem**: Filter checks `cat.id`, `cat.slug`, `cat.name` but none match

**Check**: Compare in console:
```javascript
selectedCategory: { id: 123, slug: "smartphones" }
sampleProductCategories: [{ id: 456, slug: "mobile-phones" }]
```

**Fix**: Categories have different IDs/slugs in WooCommerce vs frontend

**Solution**: 
1. Check WooCommerce category IDs: `yoursite.com/wp-admin/edit-tags.php?taxonomy=product_cat`
2. Update category IDs in frontend to match WooCommerce

---

### Issue 3: Categories Not Synced

**Problem**: Products don't have category data

**Check**: If `sampleProductCategories` is empty or undefined:
```javascript
sampleProductCategories: undefined
```

**Fix**: Run MongoDB sync to update product categories:
```bash
cd backend
npm run sync:full
```

---

## 📋 Debug Checklist

- [ ] Open browser console (F12)
- [ ] Go to `/shop` page
- [ ] Click a category
- [ ] Check console for `[Shop] Filtering by category:` log
- [ ] Note the `activeCat` value
- [ ] Note the `selectedCategory` object
- [ ] Note the `sampleProductCategories` array
- [ ] Check if `After filter:` shows correct count
- [ ] Compare category IDs/slugs between selected and product categories

---

## 🎯 What to Send Me

Copy the console output and send:

```
[Shop] Filtering by category: {
  activeCat: "...",
  selectedCategory: { ... },
  totalProducts: ...,
  sampleProductCategories: [...]
}
[Shop] After filter: ... products
```

This will help me identify the exact issue!

---

## 🔨 Temporary Workaround

If filter doesn't work, you can:
1. Use **search** instead (works perfectly)
2. Browse all products and scroll
3. Wait for fix based on debug output

---

## 📞 Next Steps

1. **Test** the category filter
2. **Copy** the console output
3. **Send** me the output
4. **I'll fix** the exact issue based on the data

---

**Status**: Waiting for debug output from user 🕐
