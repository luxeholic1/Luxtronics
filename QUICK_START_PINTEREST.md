# 🚀 Quick Start: Pinterest SEO (5 Minutes)

**Your website is claimed on Pinterest. Here's what to do next:**

---

## ✅ Step 1: Verify Your Domain (2 minutes)

1. Go to [Pinterest Business Hub](https://www.pinterest.com/business/hub/)
2. Click **"Claimed accounts"** → **"Claim your website"**
3. Copy the verification code (looks like: `p:domain_verify content="abc123..."`)
4. Open `frontend/index.html` and find line 67
5. Replace `YOUR_PINTEREST_VERIFICATION_CODE` with your code
6. Save and deploy your website
7. Go back to Pinterest and click **"Verify"**

---

## ✅ Step 2: Validate Rich Pins (1 minute)

1. Go to [Pinterest Rich Pins Validator](https://developers.pinterest.com/tools/url-debugger/)
2. Enter any product page URL (e.g., `https://luxtronics.com/product/your-product`)
3. Click **"Validate"**
4. If successful, click **"Apply Now"**
5. Done! All your product pages now have Rich Pins enabled

---

## ✅ Step 3: Upload Product Catalog (2 minutes)

1. Run this command in your terminal:
   ```bash
   npm run pinterest:export
   ```
2. This creates `pinterest-feed.csv` with all 1,658 products
3. Go to [Pinterest Catalogs](https://www.pinterest.com/business/catalogs/)
4. Click **"Create catalog"** → **"Upload a data source"**
5. Upload `pinterest-feed.csv`
6. Set update frequency: **Daily** (recommended)

---

## 🎯 Next: Create Your First Pins

### Quick Pin Creation Guide:

**1. Create 10-15 Boards:**
- Smartphones & Accessories
- Laptops & Computers
- Audio & Headphones
- Cameras & Photography
- Smartwatches & Wearables
- Gaming Accessories
- Smart Home Devices
- Charging & Power Banks

**2. Pin Your Products:**
- Use product images (1000x1500px recommended)
- Write keyword-rich titles (e.g., "Best Wireless Headphones 2026")
- Add descriptions (200-500 characters)
- Include 3-10 hashtags (#TechGadgets, #Electronics, etc.)
- Link to product pages

**3. Pin Schedule:**
- **New Pins:** 5-10 per day
- **Repins:** 10-20 per day
- **Best Times:** 8-11 PM

---

## 📊 Track Your Progress

Go to [Pinterest Analytics](https://analytics.pinterest.com/) to see:
- Impressions (how many times your Pins are seen)
- Engagements (saves, clicks, comments)
- Top Pins (which products perform best)
- Audience insights (demographics, interests)

---

## 📚 Need More Details?

Read the complete guide: `docs/PINTEREST_SEO_GUIDE.md`

---

## 🆘 Quick Commands

```bash
# Sync products to Firebase
npm run sync:firebase

# Export Pinterest product feed
npm run pinterest:export

# Sync products from WooCommerce to MongoDB
npm run sync:full
```

---

**Last Updated:** May 22, 2026
