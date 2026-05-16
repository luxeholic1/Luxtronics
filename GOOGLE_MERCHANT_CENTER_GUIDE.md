# 🛒 Google Merchant Center — Product Images in Google Search

## 🎯 Goal
Luxtronics products dikhein Google Search mein "Popular products" section mein jaise Cashify/Maple Store ke dikhte hain.

---

## ✅ What We've Already Done (Code)

### 1. Product Schema (JSON-LD) — DONE ✅
Every product page now has full `schema.org/Product` structured data:
- Product name, description, image
- Price in INR with currency
- Availability (InStock/OutOfStock)
- Seller info (Luxtronics)
- Shipping details (free shipping)
- Return policy (30 days)
- Aggregate rating

### 2. SEO on All Pages — DONE ✅
- Index, Shop, ProductDetail, About, Blog, BlogPost, Contact, FAQ, ShippingReturns
- Proper title, description, keywords, canonical URLs
- Open Graph + Twitter cards

### 3. Sitemap — DONE ✅
- `/public/sitemap.xml` with all pages + hreflang for IN/AU/NZ

### 4. Robots.txt — DONE ✅
- Allows crawling of shop and product pages

---

## 🚀 Steps to Get Products in Google Shopping

### Step 1: Google Search Console (CRITICAL — Do This First)

1. Go to: https://search.google.com/search-console
2. Add property: `https://luxtronics.in`
3. Verify ownership (HTML tag method):
   - Copy the verification meta tag
   - Add to `frontend/index.html` in `<head>`:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
4. Submit sitemap: `https://luxtronics.in/sitemap.xml`
5. Request indexing for homepage and shop page

---

### Step 2: Google Merchant Center (For Shopping Images)

1. Go to: https://merchants.google.com
2. Create account with your Google account
3. Add business info:
   - Business name: Luxtronics
   - Website: https://luxtronics.in
   - Country: India

4. **Verify website** (same as Search Console)

5. **Add products** — Two methods:

#### Method A: Automatic (Recommended) — Structured Data
Google will automatically crawl your product pages and extract data from the JSON-LD schema we've added.

- Go to: Merchant Center → Products → Feeds
- Click "+" → Add feed
- Select: "Website crawl" (automatic)
- Google will crawl your product pages and extract:
  - Product name
  - Price
  - Image
  - Availability
  - Description

#### Method B: Manual Feed (CSV/XML)
Upload a product feed CSV with all 1333 products.

**CSV Format:**
```csv
id,title,description,link,image_link,condition,availability,price,brand,gtin
123,Apple iPhone 7 Plus 32GB,Unlocked Mix Colors Used,https://luxtronics.in/product/apple-iphone-7-plus,https://luxtronics.luxtronics.in/wp-content/uploads/image.jpg,used,in_stock,5081 INR,Apple,
```

---

### Step 3: Enable Free Listings

1. In Merchant Center → Growth → Manage programs
2. Enable "Free listings"
3. This shows your products in Google Shopping tab for FREE

---

### Step 4: Google Shopping Ads (Optional — Paid)

For "Popular products" section in main search results:
1. Link Merchant Center to Google Ads
2. Create Shopping campaign
3. Set budget (even ₹100/day works)
4. Products will appear in search results with images

---

## 📊 Timeline

| Action | Time to See Results |
|--------|---------------------|
| Search Console verification | 1-3 days |
| Sitemap indexed | 3-7 days |
| Product schema recognized | 1-2 weeks |
| Merchant Center approved | 3-5 days |
| Free listings live | 1-2 weeks |
| Shopping ads live | 1-3 days after approval |

---

## 🔍 How Google Shows Product Images

### "Popular products" section appears when:
1. ✅ Product has valid `schema.org/Product` JSON-LD (DONE)
2. ✅ Product page has proper title + description (DONE)
3. ✅ Product image is high quality (from WooCommerce)
4. ⚠️ Google Merchant Center account linked
5. ⚠️ Free listings enabled
6. ⚠️ Products approved in Merchant Center

### Image Requirements for Google Shopping:
- Minimum: 100x100 pixels
- Recommended: 800x800 pixels
- Format: JPG, PNG, GIF, BMP, TIFF, WebP
- No watermarks, no promotional text on image
- White/light background preferred

---

## 🎯 Quick Action Plan

### Today (30 minutes):
1. ✅ Code changes deployed (done)
2. ⬜ Add Google Search Console verification tag to index.html
3. ⬜ Submit sitemap in Search Console
4. ⬜ Create Google Merchant Center account

### This Week:
5. ⬜ Verify website in Merchant Center
6. ⬜ Enable free listings
7. ⬜ Wait for Google to crawl and approve

### Next Week:
8. ⬜ Check if products appear in Google Shopping
9. ⬜ Fix any disapproved products
10. ⬜ Consider Shopping ads for faster visibility

---

## 📝 Important Notes

### Why Cashify/Maple Store appear and we don't (yet):
- They have Google Merchant Center accounts
- They've been verified for months/years
- They have Shopping ads running
- Their product data is clean and complete

### Our advantage after setup:
- 1333 products with proper schema
- Free shipping (Google loves this)
- 30-day returns (trust signal)
- 2-year warranty (trust signal)
- Multi-country (IN/AU/NZ)

---

## 🔗 Useful Links

- Google Search Console: https://search.google.com/search-console
- Google Merchant Center: https://merchants.google.com
- Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org

---

**Status**: Code complete ✅ | Merchant Center setup required ⚠️
**Estimated time to appear in Google Shopping**: 2-4 weeks after Merchant Center setup
