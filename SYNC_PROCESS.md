# 🔄 WooCommerce Auto-Sync Process Guide

## Overview

Your Luxtronics store works with a **two-tier architecture**:
1. **WooCommerce** (source) - Where you add/edit products
2. **MongoDB** (cache) - Where products are stored for the frontend
3. **React Frontend** - Reads from MongoDB (not directly from WooCommerce)

---

## ❌ What's NOT Auto-Fetch (Current)

When you add a product in WooCommerce, it does **NOT** automatically appear on your shop.

**Why?** Because the frontend reads from MongoDB, not WooCommerce. WooCommerce is just a source.

---

## ✅ Current Sync Process (Manual)

### Step 1: Add/Edit Product in WooCommerce
```
https://yourstore.com/wp-admin/
→ Products → Add New
→ Fill details (name, price, description, images)
→ Publish
```

### Step 2: Trigger Sync (3 Methods)

#### Method 1: Full Sync (All Products)
```bash
cd /Users/ak/Downloads/Luxtronics
npm run sync:full
```
**What it does:**
- Fetches ALL products from WooCommerce REST API
- Stores in MongoDB `products` collection
- Checks for new, updated, and deleted products
- Takes ~3-5 seconds depending on product count

**Output:**
```
✅ Sync completed: 6 products synced, 1 categories synced
```

#### Method 2: Product Sync Only
```bash
npm run sync:products
```
**What it does:** Syncs only products (faster, skips categories)

#### Method 3: API Endpoint (Programmatic)
```bash
curl -X POST http://localhost:3001/api/sync
# Returns: { "success": true, "products": 6, "categories": 1 }
```

### Step 3: Frontend Fetches from MongoDB
Frontend automatically shows products because:
```
Browser → Vite (localhost:5175) 
  → Proxy /api to localhost:3001 (Express)
  → Express queries MongoDB
  → Returns product data as JSON
  → React renders Shop.tsx with products
```

---

## 🚀 How to Set Up True Auto-Fetch

If you want products to **automatically** appear when you add them to WooCommerce:

### Option A: Webhook (Recommended for Production)

1. **Enable WooCommerce Webhooks**
   ```
   WooCommerce → Settings → Advanced → Webhooks
   ```

2. **Create Webhook**
   - Event: `product.updated` or `product.created`
   - Delivery URL: `https://yourdomain.com/api/webhooks/woocommerce`
   - Topic: `Product creation`, `Product update`

3. **Update Backend** (Add webhook handler in `backend/server/routes/products.ts`)
   ```typescript
   app.post('/api/webhooks/woocommerce', (req, res) => {
     // Verify webhook signature
     // Trigger sync for that product
     // Return 200 OK
   });
   ```

### Option B: Scheduled Sync (Easiest)

Add a **cron job** to run sync every X minutes:

```bash
# On macOS (using launchd)
cat > ~/Library/LaunchAgents/com.luxtronics.sync.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.luxtronics.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/curl</string>
        <string>-X</string>
        <string>POST</string>
        <string>http://localhost:3001/api/sync</string>
    </array>
    <key>StartInterval</key>
    <integer>900</integer> <!-- Run every 15 minutes -->
</dict>
</plist>
EOF

# Activate
launchctl load ~/Library/LaunchAgents/com.luxtronics.sync.plist
```

### Option C: Background Job (Node.js)

Add to `backend/server/index.ts`:
```typescript
// Every 15 minutes, sync products
setInterval(async () => {
  try {
    await new WooCommerceSync(db).syncProducts();
    console.log('✅ Auto-sync completed');
  } catch (error) {
    console.error('❌ Auto-sync failed:', error);
  }
}, 15 * 60 * 1000); // 15 minutes
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           WOOCOMMERCE STORE                    │
│    (Product Master Data Source)                │
│                                                 │
│  - 6+ Products with HTML descriptions         │
│  - Images, prices, categories                 │
│  - REST API: /wp-json/wc/v3/products          │
└──────────────────┬──────────────────────────────┘
                   │
                   │ npm run sync:full
                   │ (Triggered manually or via cron/webhook)
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              BACKEND (Express)                  │
│    WooCommerceSync Service                      │
│                                                 │
│  - Fetches from WooCommerce API                │
│  - Converts format to MongoDB schema           │
│  - Sanitizes HTML descriptions                │
│  - Stores in MongoDB                           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            MONGODB (Cache)                      │
│    Database: Luxtronics                         │
│    Collections:                                 │
│      - products (6 documents)                  │
│      - categories (1 document)                 │
│      - sync_status (tracking)                  │
└──────────────────┬──────────────────────────────┘
                   │
                   │ GET /api/products
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           FRONTEND (React)                      │
│    Vite Dev Server (localhost:5175)             │
│                                                 │
│  - Shop.tsx: Calls fetchStoreProducts()        │
│  - Maps MongoDB data to Product type           │
│  - Renders ProductCard components              │
│  - Sanitized HTML descriptions display         │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Current Sync Details

### Files Involved:

1. **[backend/server/services/woocommerce-sync.ts](backend/server/services/woocommerce-sync.ts)**
   - Fetches from WooCommerce REST API (Basic Auth)
   - Batches products by 100 per page
   - Converts format: WooCommerce → MongoDB schema
   - Stores via bulk upsert

2. **[backend/server/models/mongo-models.ts](backend/server/models/mongo-models.ts)**
   - Defines MongoProduct schema
   - createProductDocument() converts WooCommerce format
   - Validates data before storage

3. **[backend/server/routes/products.ts](backend/server/routes/products.ts)**
   - GET `/api/products` - Returns all products from MongoDB
   - GET `/api/products/slug/:slug` - Returns single product
   - POST `/api/sync` - Triggers manual sync
   - GET `/api/categories` - Returns categories

4. **[frontend/src/services/store-api.ts](frontend/src/services/store-api.ts)**
   - Frontend API client
   - `fetchStoreProducts()` - Calls `/api/products`
   - `mapStoreProductToLocalProduct()` - Converts to React type

5. **[scripts/sync-full.ts](scripts/sync-full.ts)**
   - CLI script for manual sync
   - Shows progress bar
   - Handles errors gracefully

---

## 📝 What Gets Synced?

### From WooCommerce Product:
```
✅ ID, Slug, Name
✅ Description (with HTML formatting)
✅ Short Description
✅ Price, Sale Price, Regular Price
✅ Images (multiple, with alt text)
✅ Category (first category)
✅ Rating & Review Count
✅ Stock Status
✅ SKU, Weight, Dimensions
✅ Attributes
```

### Stored in MongoDB As:
```javascript
{
  id: 123,
  slug: "loop-fastener-metal-interface-watch-band",
  name: "Loop Fastener Metal Interface Watch Band...",
  description: "<p>Material: Nylon<br />The wristband design...", // HTML preserved
  price: 299,
  salePrice: 239,
  regularPrice: 299,
  images: [
    { id: 456, src: "https://...", alt: "" }
  ],
  category: "Electronics",
  rating: 4.5,
  reviewCount: 0,
  stockStatus: "instock",
  syncedAt: 2024-04-29T13:34:14Z,
  updatedAt: 2024-04-29T13:34:14Z
}
```

---

## 🐛 Troubleshooting

### Products not showing after sync?
```bash
# 1. Check if sync actually ran
npm run sync:full

# 2. Verify data in MongoDB
mongodb atlas console → Query products collection

# 3. Check API response
curl http://localhost:3001/api/products | jq '.'

# 4. Check frontend console for errors
Browser DevTools → Console tab
```

### Description showing raw HTML?
**Fixed!** We added HTML sanitization in `frontend/src/lib/sanitize.ts`
- Now safely renders HTML from WooCommerce
- Strips malicious tags
- Preserves formatting (bold, links, tables)

### Sync taking too long?
- Reduce `batchSize` in sync options
- Increase batch `delay` if hitting WooCommerce rate limits
- Run during off-peak hours

---

## 📅 Recommended Workflow

```
1️⃣  Add product in WooCommerce (takes 5 min)
    ↓
2️⃣  Run npm run sync:full in terminal (takes 3 sec)
    ↓
3️⃣  Refresh browser on localhost:5175
    ↓
4️⃣  Product appears in Shop! 🎉
```

Or set up cron job for true auto-fetch (see Option B above).

---

## 📚 Related Files

- [MONGODB_SETUP.md](MONGODB_SETUP.md) - MongoDB configuration
- [backend/server/services/woocommerce-sync.ts](backend/server/services/woocommerce-sync.ts) - Sync engine
- [frontend/src/services/store-api.ts](frontend/src/services/store-api.ts) - Frontend API client
- [package.json](package.json) - npm scripts

---

**Last Updated:** April 29, 2024
