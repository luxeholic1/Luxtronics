# Pinterest SEO & Ranking Guide

Complete guide to optimize your Luxtronics website for Pinterest and rank higher in Pinterest search results.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Rich Pins Setup](#rich-pins-setup)
3. [Pinterest Meta Tags](#pinterest-meta-tags)
4. [Product Feed/Catalog Upload](#product-feedcatalog-upload)
5. [Board Optimization Strategy](#board-optimization-strategy)
6. [Pin Creation Best Practices](#pin-creation-best-practices)
7. [Pinterest Analytics Setup](#pinterest-analytics-setup)
8. [Domain Verification](#domain-verification)
9. [Pinterest SEO Checklist](#pinterest-seo-checklist)
10. [Automation & Scheduling](#automation--scheduling)

---

## Prerequisites

✅ **Already Completed:**
- Website claimed on Pinterest
- Products synced to Firebase (1,658 products)
- High-quality product images available

🔲 **Next Steps:**
- Set up Rich Pins
- Add Pinterest meta tags
- Create product catalog
- Optimize boards and pins

---

## Rich Pins Setup

Rich Pins automatically sync information from your website to your Pins. There are 4 types:
- **Product Pins** (recommended for e-commerce)
- Article Pins
- Recipe Pins
- App Pins

### Step 1: Add Open Graph Meta Tags

Add these meta tags to your `frontend/index.html` file (inside `<head>`):

```html
<!-- Open Graph Meta Tags for Pinterest Rich Pins -->
<meta property="og:type" content="product" />
<meta property="og:title" content="Luxtronics - Premium Electronics & Gadgets" />
<meta property="og:description" content="Shop the latest electronics, gadgets, and tech accessories at Luxtronics. Fast shipping to India, Australia, and New Zealand." />
<meta property="og:url" content="https://luxtronics.com" />
<meta property="og:image" content="https://luxtronics.com/og-image.jpg" />
<meta property="og:site_name" content="Luxtronics" />

<!-- Product-specific meta tags (for product pages) -->
<meta property="product:price:amount" content="0.00" />
<meta property="product:price:currency" content="INR" />
<meta property="product:availability" content="in stock" />
<meta property="product:condition" content="new" />
<meta property="product:retailer_item_id" content="" />
```

### Step 2: Validate Rich Pins

1. Go to [Pinterest Rich Pins Validator](https://developers.pinterest.com/tools/url-debugger/)
2. Enter your product page URL (e.g., `https://luxtronics.com/product/your-product-slug`)
3. Click "Validate"
4. If successful, click "Apply Now" to enable Rich Pins for your domain

### Step 3: Dynamic Meta Tags for Product Pages

Update your product page component to dynamically set meta tags:

```typescript
// In your ProductDetail component
useEffect(() => {
  if (product) {
    // Update Open Graph meta tags
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', product.name);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', product.short_description || product.description);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', product.images[0]?.src || '');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
    document.querySelector('meta[property="product:price:amount"]')?.setAttribute('content', product.price);
    document.querySelector('meta[property="product:price:currency"]')?.setAttribute('content', 'INR');
  }
}, [product]);
```

---

## Pinterest Meta Tags

Add Pinterest-specific meta tags to improve discoverability:

```html
<!-- Pinterest-specific meta tags -->
<meta name="pinterest" content="nopin" description="This prevents pinning on specific pages" />
<meta name="pinterest" content="nohover" description="Hides the Pinterest hover button" />
<meta name="pinterest-rich-pin" content="true" />

<!-- Pinterest verification tag (get from Pinterest Business Hub) -->
<meta name="p:domain_verify" content="YOUR_VERIFICATION_CODE" />
```

**To get your verification code:**
1. Go to [Pinterest Business Hub](https://www.pinterest.com/business/hub/)
2. Click "Claim" → "Claim your website"
3. Choose "Add HTML tag" method
4. Copy the verification code
5. Add it to your `index.html`

---

## Product Feed/Catalog Upload

Pinterest allows you to upload a product catalog for automatic Pin creation.

### Option 1: Manual CSV Upload

1. **Generate Product Feed CSV:**

Create a script to export products from Firebase to CSV:

```typescript
// backend/scripts/export-pinterest-feed.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
const fbApp = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(fbApp);

async function exportPinterestFeed() {
  const productsSnapshot = await db.collection('products').get();
  const products = productsSnapshot.docs.map(doc => doc.data());

  const csvHeader = 'id,title,description,link,image_link,price,availability,brand,condition,product_type\n';
  const csvRows = products.map(p => {
    const title = (p.name || '').replace(/"/g, '""');
    const description = (p.short_description || p.description || '').replace(/"/g, '""').substring(0, 500);
    const link = `https://luxtronics.com/product/${p.slug}`;
    const imageLink = p.images?.[0]?.src || '';
    const price = `${p.price} INR`;
    const availability = p.stock_status === 'instock' ? 'in stock' : 'out of stock';
    const brand = 'Luxtronics';
    const condition = 'new';
    const productType = p.categories?.[0]?.name || 'Electronics';

    return `"${p.id}","${title}","${description}","${link}","${imageLink}","${price}","${availability}","${brand}","${condition}","${productType}"`;
  }).join('\n');

  fs.writeFileSync('pinterest-feed.csv', csvHeader + csvRows);
  console.log('✅ Pinterest feed exported to pinterest-feed.csv');
  process.exit(0);
}

exportPinterestFeed();
```

2. **Run the script:**
```bash
npx tsx backend/scripts/export-pinterest-feed.ts
```

3. **Upload to Pinterest:**
   - Go to [Pinterest Catalogs](https://www.pinterest.com/business/catalogs/)
   - Click "Create catalog"
   - Choose "Upload a data source"
   - Upload `pinterest-feed.csv`
   - Set update frequency (daily/weekly)

### Option 2: Automated RSS Feed

Create an RSS feed endpoint that Pinterest can automatically fetch:

```typescript
// backend/server/routes/pinterest-feed.ts
import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();

router.get('/pinterest-feed.xml', async (req, res) => {
  const db = getFirestore();
  const productsSnapshot = await db.collection('products').limit(1000).get();
  const products = productsSnapshot.docs.map(doc => doc.data());

  const rssItems = products.map(p => `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.short_description || p.description}]]></g:description>
      <g:link>https://luxtronics.com/product/${p.slug}</g:link>
      <g:image_link>${p.images?.[0]?.src || ''}</g:image_link>
      <g:price>${p.price} INR</g:price>
      <g:availability>${p.stock_status === 'instock' ? 'in stock' : 'out of stock'}</g:availability>
      <g:brand>Luxtronics</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${p.categories?.[0]?.name || 'Electronics'}</g:product_type>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Luxtronics Product Feed</title>
    <link>https://luxtronics.com</link>
    <description>Luxtronics Product Catalog</description>
    ${rssItems}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/xml');
  res.send(rss);
});

export default router;
```

Then add this URL to Pinterest Catalogs: `https://luxtronics.com/api/pinterest-feed.xml`

---

## Board Optimization Strategy

### 1. Create Niche-Specific Boards

**Recommended Board Structure:**

```
📌 Electronics & Gadgets (Main)
   ├── 📱 Smartphones & Accessories
   ├── 💻 Laptops & Computers
   ├── 🎧 Audio & Headphones
   ├── 📷 Cameras & Photography
   ├── ⌚ Smartwatches & Wearables
   ├── 🎮 Gaming Accessories
   ├── 🏠 Smart Home Devices
   └── 🔌 Charging & Power Banks
```

### 2. Board Optimization Checklist

For each board:

✅ **Board Name:**
- Use keyword-rich names (e.g., "Best Wireless Headphones 2026")
- Keep it under 50 characters
- Include target keywords

✅ **Board Description:**
- 150-500 characters
- Include 3-5 relevant keywords naturally
- Add a call-to-action
- Example: "Discover the best wireless headphones for music lovers. Shop premium audio gear, noise-cancelling headphones, and Bluetooth earbuds at Luxtronics. Free shipping on orders over ₹500!"

✅ **Board Cover:**
- High-quality vertical image (1000x1500px)
- Consistent branding
- Eye-catching design

✅ **Board Category:**
- Select the most relevant category (e.g., "Technology", "Shopping")

### 3. Board SEO Keywords

**Top Pinterest Keywords for Electronics:**
- "best [product] 2026"
- "affordable [product]"
- "premium [product]"
- "tech gadgets"
- "smart home devices"
- "wireless accessories"
- "gaming setup"
- "photography gear"

---

## Pin Creation Best Practices

### 1. Pin Image Specifications

**Optimal Dimensions:**
- **Standard Pin:** 1000 x 1500px (2:3 aspect ratio)
- **Square Pin:** 1000 x 1000px (1:1 aspect ratio)
- **Infographic Pin:** 1000 x 2100px (long vertical)

**Image Requirements:**
- High resolution (at least 600px wide)
- File size: under 20MB
- Format: PNG or JPEG
- Avoid text-heavy images (Pinterest penalizes them)

### 2. Pin Title Optimization

**Formula:** [Keyword] + [Benefit] + [Call-to-Action]

**Examples:**
- ✅ "Wireless Noise-Cancelling Headphones - Premium Sound Quality | Shop Now"
- ✅ "Best Gaming Mouse 2026 - RGB Lighting & Ergonomic Design"
- ❌ "Product #12345" (too generic)

### 3. Pin Description Optimization

**Structure:**
1. **Hook (first 50 characters):** Grab attention
2. **Details (50-200 characters):** Product features, benefits
3. **Keywords (200-500 characters):** Naturally include 3-5 keywords
4. **Call-to-Action:** "Shop now", "Learn more", "Get yours today"

**Example:**
```
🎧 Premium Wireless Headphones with Active Noise Cancellation

Experience studio-quality sound with our best-selling wireless headphones. Features:
✓ 30-hour battery life
✓ Active noise cancellation
✓ Bluetooth 5.0 connectivity
✓ Comfortable over-ear design

Perfect for music lovers, travelers, and remote workers. Shop now at Luxtronics and get free shipping on orders over ₹500!

#WirelessHeadphones #NoiseCancelling #AudioGear #TechGadgets #Luxtronics
```

### 4. Hashtag Strategy

**Use 3-10 relevant hashtags:**
- 2-3 broad hashtags (#Electronics, #TechGadgets)
- 3-5 niche hashtags (#WirelessHeadphones, #GamingMouse)
- 1-2 branded hashtags (#Luxtronics, #LuxtronicsDeals)

**Top Hashtags for Electronics:**
- #TechGadgets
- #Electronics
- #SmartHome
- #GamingSetup
- #Photography
- #WirelessAccessories
- #TechDeals
- #GadgetLovers

### 5. Pin Frequency

**Recommended Schedule:**
- **New Pins:** 5-10 per day
- **Repins:** 10-20 per day
- **Best Times:** 8-11 PM (when users are most active)

---

## Pinterest Analytics Setup

### 1. Enable Pinterest Analytics

1. Go to [Pinterest Analytics](https://analytics.pinterest.com/)
2. Click "Overview" to see:
   - Impressions
   - Engagements
   - Clicks
   - Saves
   - Top Pins

### 2. Track Key Metrics

**Focus on:**
- **Impressions:** How many times your Pins are seen
- **Engagement Rate:** (Saves + Clicks) / Impressions
- **Click-Through Rate (CTR):** Clicks / Impressions
- **Top Performing Pins:** Which products get the most engagement

### 3. Pinterest Tag (Conversion Tracking)

Add Pinterest Tag to track conversions:

```html
<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', 'YOUR_TAG_ID', {em: '<user_email_address>'});
pintrk('page');
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt=""
  src="https://ct.pinterest.com/v3/?event=init&tid=YOUR_TAG_ID&pd[em]=<hashed_email_address>&noscript=1" />
</noscript>
```

**Track Events:**
```javascript
// Add to cart
pintrk('track', 'addtocart', {
  value: product.price,
  currency: 'INR',
  product_id: product.id
});

// Checkout
pintrk('track', 'checkout', {
  value: cartTotal,
  currency: 'INR',
  order_quantity: cartItems.length
});
```

---

## Domain Verification

Since you've already claimed your website, verify it's properly set up:

### 1. Check Verification Status

1. Go to [Pinterest Business Hub](https://www.pinterest.com/business/hub/)
2. Click "Claimed accounts"
3. Verify your domain shows as "Verified"

### 2. Add Verification Meta Tag (if not done)

```html
<meta name="p:domain_verify" content="YOUR_VERIFICATION_CODE" />
```

### 3. Verify in Pinterest

1. Go to Settings → Claimed accounts
2. Click "Claim" → "Claim your website"
3. Enter your domain: `luxtronics.com`
4. Choose verification method (HTML tag or file upload)
5. Click "Verify"

---

## Pinterest SEO Checklist

### ✅ Technical Setup
- [ ] Domain verified on Pinterest
- [ ] Rich Pins enabled and validated
- [ ] Pinterest meta tags added to website
- [ ] Pinterest Tag installed for conversion tracking
- [ ] Product catalog uploaded (CSV or RSS feed)

### ✅ Profile Optimization
- [ ] Business account created
- [ ] Profile picture (logo) uploaded
- [ ] Bio optimized with keywords (150 characters)
- [ ] Website link added to profile
- [ ] Contact information added

### ✅ Board Optimization
- [ ] 10-15 niche-specific boards created
- [ ] Board names include target keywords
- [ ] Board descriptions optimized (150-500 characters)
- [ ] Board covers designed and uploaded
- [ ] Boards organized by category

### ✅ Pin Optimization
- [ ] 50+ high-quality Pins created
- [ ] Pin images optimized (1000x1500px)
- [ ] Pin titles include keywords + benefits
- [ ] Pin descriptions optimized (200-500 characters)
- [ ] 3-10 relevant hashtags per Pin
- [ ] Call-to-action added to each Pin

### ✅ Content Strategy
- [ ] Pinning schedule established (5-10 new Pins/day)
- [ ] Repinning strategy (10-20 repins/day)
- [ ] Seasonal content planned (holidays, sales)
- [ ] User-generated content strategy
- [ ] Collaboration with influencers

### ✅ Analytics & Tracking
- [ ] Pinterest Analytics enabled
- [ ] Conversion tracking set up
- [ ] Monthly performance reports
- [ ] A/B testing different Pin designs
- [ ] Top-performing Pins identified

---

## Automation & Scheduling

### 1. Use Pinterest Scheduling Tools

**Recommended Tools:**
- **Tailwind:** Pinterest-approved scheduler
- **Later:** Visual content calendar
- **Buffer:** Multi-platform scheduling
- **Hootsuite:** Enterprise solution

### 2. Automate Product Pins

Create a GitHub Action to auto-generate Pins from new products:

```yaml
# .github/workflows/pinterest-auto-pin.yml
name: Auto-Pin New Products

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
  workflow_dispatch:

jobs:
  create-pins:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Generate Pinterest Pins
        run: npx tsx backend/scripts/auto-pin-products.ts
        env:
          PINTEREST_ACCESS_TOKEN: ${{ secrets.PINTEREST_ACCESS_TOKEN }}
          FIREBASE_SERVICE_ACCOUNT_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
```

### 3. Pinterest API Integration

Use Pinterest API to programmatically create Pins:

```typescript
// backend/scripts/auto-pin-products.ts
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';

const PINTEREST_API = 'https://api.pinterest.com/v5';
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

async function createPin(product: any, boardId: string) {
  const response = await axios.post(
    `${PINTEREST_API}/pins`,
    {
      board_id: boardId,
      title: product.name,
      description: product.short_description || product.description,
      link: `https://luxtronics.com/product/${product.slug}`,
      media_source: {
        source_type: 'image_url',
        url: product.images[0]?.src
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

async function autoPinNewProducts() {
  const db = getFirestore();
  const productsSnapshot = await db.collection('products')
    .where('pinned_to_pinterest', '==', false)
    .limit(10)
    .get();

  for (const doc of productsSnapshot.docs) {
    const product = doc.data();
    try {
      await createPin(product, 'YOUR_BOARD_ID');
      await doc.ref.update({ pinned_to_pinterest: true });
      console.log(`✅ Pinned: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to pin: ${product.name}`, error);
    }
  }
}

autoPinNewProducts();
```

---

## Next Steps

### Immediate Actions (Week 1)
1. ✅ Add Pinterest meta tags to `frontend/index.html`
2. ✅ Validate Rich Pins on Pinterest
3. ✅ Create 10-15 optimized boards
4. ✅ Upload first 50 Pins (5 per board)
5. ✅ Set up Pinterest Analytics

### Short-term Goals (Month 1)
1. ✅ Upload product catalog (CSV or RSS)
2. ✅ Create 200+ Pins (10 per day)
3. ✅ Implement Pinterest Tag for conversion tracking
4. ✅ Start A/B testing Pin designs
5. ✅ Analyze top-performing Pins and optimize

### Long-term Strategy (3-6 Months)
1. ✅ Automate Pin creation with GitHub Actions
2. ✅ Collaborate with Pinterest influencers
3. ✅ Run Pinterest Ads for top products
4. ✅ Create seasonal campaigns (holidays, sales)
5. ✅ Scale to 500+ Pins and 20+ boards

---

## Resources

- [Pinterest Business Hub](https://www.pinterest.com/business/hub/)
- [Pinterest Rich Pins Validator](https://developers.pinterest.com/tools/url-debugger/)
- [Pinterest Analytics](https://analytics.pinterest.com/)
- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/v5/)
- [Pinterest Best Practices](https://business.pinterest.com/en/blog/)
- [Tailwind for Pinterest](https://www.tailwindapp.com/)

---

## Support

For questions or issues:
- **Pinterest Help Center:** https://help.pinterest.com/
- **Pinterest Business Support:** https://business.pinterest.com/support/
- **Luxtronics Team:** support@luxtronics.com

---

**Last Updated:** May 22, 2026
**Version:** 1.0.0
