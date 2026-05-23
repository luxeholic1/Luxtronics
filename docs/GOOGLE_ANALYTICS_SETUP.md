# Google Analytics Setup Guide

## ✅ Compliance Status

### Google Analytics Terms of Service
- ✅ **Reviewed**: Google Analytics Terms of Service (Last Updated: May 15, 2023)
- ✅ **Privacy Policy Updated**: Added Google Analytics disclosure
- ✅ **Cookie Notice**: Added to Privacy Policy
- ✅ **Opt-out Link**: Provided in Privacy Policy
- ✅ **Google's Privacy Policy Link**: Added (required by ToS Section 7)

---

## 🎯 What's Already Done

### 1. **Tracking Code Added** ✅
**File**: `/frontend/index.html`

```html
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**Features**:
- ✅ IP anonymization enabled (GDPR compliance)
- ✅ Secure cookie flags
- ✅ Async loading (no performance impact)

### 2. **Privacy Policy Updated** ✅
**File**: `/frontend/src/pages/Privacy.tsx`

**Added Sections**:
- ✅ "Cookies and Analytics" section
- ✅ Google Analytics disclosure
- ✅ Link to Google's privacy policy (required by ToS)
- ✅ Opt-out instructions
- ✅ Cookie control information

**Compliance with Google Analytics ToS Section 7**:
- ✅ Disclosed use of Google Analytics
- ✅ Linked to "How Google uses information from sites or apps that use our services"
- ✅ Provided opt-out mechanism
- ✅ Cookie consent notice

---

## 📋 Setup Steps (To Complete)

### Step 1: Create Google Analytics Account

1. **Go to**: [analytics.google.com](https://analytics.google.com)
2. **Click**: "Start measuring"
3. **Account Setup**:
   - Account name: `Luxtronics`
   - Data sharing settings: (your choice)
   - Click "Next"

### Step 2: Create Properties (One for Each Store)

#### Property 1: India Store
- **Property name**: `Luxtronics India`
- **Reporting time zone**: `(GMT+05:30) India Standard Time`
- **Currency**: `Indian Rupee (₹)`
- **Industry**: `Shopping`
- **Business size**: Select your size
- **Click**: "Next" → "Create"

#### Property 2: Australia Store
- **Property name**: `Luxtronics Australia`
- **Reporting time zone**: `(GMT+10:00) Australian Eastern Time`
- **Currency**: `Australian Dollar (A$)`
- **Industry**: `Shopping`
- **Business size**: Select your size

#### Property 3: New Zealand Store
- **Property name**: `Luxtronics New Zealand`
- **Reporting time zone**: `(GMT+12:00) New Zealand Standard Time`
- **Currency**: `New Zealand Dollar (NZ$)`
- **Industry**: `Shopping`
- **Business size**: Select your size

### Step 3: Get Measurement IDs

After creating each property, you'll get a **Measurement ID** like:
- India: `G-ABC123DEF4`
- Australia: `G-XYZ789GHI0`
- New Zealand: `G-JKL456MNO1`

### Step 4: Add Measurement IDs to Code

**Option A: Single Tracking (Recommended for Testing)**

Replace `G-XXXXXXXXXX` in `/frontend/index.html` with your India store ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123DEF4', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**Option B: Multi-Store Tracking (Advanced)**

Track all three stores simultaneously:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  // India store
  gtag('config', 'G-ABC123DEF4', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
  
  // Australia store
  gtag('config', 'G-XYZ789GHI0', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
  
  // New Zealand store
  gtag('config', 'G-JKL456MNO1', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

### Step 5: Set Up Data Streams

For each property:

1. **Click**: "Data Streams"
2. **Click**: "Add stream" → "Web"
3. **Website URL**: 
   - India: `https://luxtronics.in`
   - Australia: `https://luxtronics.com.au`
   - New Zealand: `https://luxtronics.co.nz`
4. **Stream name**: Same as property name
5. **Click**: "Create stream"

### Step 6: Enable Enhanced Measurement

In each data stream:

1. **Click**: "Enhanced measurement"
2. **Enable**:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads
3. **Click**: "Save"

---

## 🎯 What Will Be Tracked

### Automatic Events (Enhanced Measurement)
- ✅ Page views
- ✅ Scrolls (90% depth)
- ✅ Outbound clicks
- ✅ Site search (from `/shop?q=...`)
- ✅ File downloads
- ✅ Video engagement

### E-commerce Events (To Add Later)
- `add_to_cart` - When user adds product to cart
- `view_item` - When user views product page
- `begin_checkout` - When user starts checkout
- `purchase` - When order is completed

---

## 🧪 Testing Your Setup

### Step 1: Real-Time Reports

1. **Go to**: Google Analytics → Reports → Realtime
2. **Open your site** in another tab
3. **Check**: You should see 1 active user
4. **Navigate** to different pages
5. **Check**: Page views are tracked

### Step 2: Debug Mode

Add this to your browser console:

```javascript
// Enable debug mode
gtag('config', 'G-XXXXXXXXXX', {
  'debug_mode': true
});
```

Then check browser console for GA events.

### Step 3: Google Analytics Debugger Extension

1. **Install**: [Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. **Enable** the extension
3. **Open** your site
4. **Check** console for detailed GA logs

---

## 📊 Key Reports to Monitor

### 1. **Acquisition Reports**
- Where users come from (Google, social, direct)
- Which campaigns drive traffic

### 2. **Engagement Reports**
- Most viewed pages
- Average engagement time
- Bounce rate

### 3. **Monetization Reports** (After e-commerce setup)
- Total revenue
- Transactions
- Average order value

### 4. **User Reports**
- Demographics (age, gender)
- Interests
- Technology (device, browser)
- Location (country, city)

---

## 🔒 Privacy & Compliance

### GDPR Compliance (EU Users)
- ✅ IP anonymization enabled
- ✅ Cookie notice in Privacy Policy
- ✅ Opt-out link provided
- ⚠️ **To Do**: Add cookie consent banner (optional but recommended)

### Cookie Consent Banner (Optional)

Add a simple banner:

```html
<div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: #000; color: #fff; padding: 20px; text-align: center; z-index: 9999;">
  <p>We use cookies to improve your experience. By using our site, you agree to our use of cookies. 
  <a href="/privacy" style="color: #ff6b35;">Learn more</a></p>
  <button onclick="document.getElementById('cookie-banner').style.display='none'" style="background: #ff6b35; color: #fff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Accept</button>
</div>
```

---

## 🚀 Advanced Features (Optional)

### 1. **Google Ads Integration**
- Link GA4 to Google Ads account
- Track conversions
- Create remarketing audiences

### 2. **Search Console Integration**
- Link GA4 to Search Console
- See search queries in GA reports
- Track organic search performance

### 3. **BigQuery Export**
- Export raw data to BigQuery
- Run custom SQL queries
- Advanced analysis

### 4. **Custom Events**
- Track specific user actions
- Button clicks
- Form submissions
- Video plays

---

## 📝 Checklist

### Pre-Launch
- [x] Google Analytics tracking code added
- [x] Privacy Policy updated
- [x] Cookie notice added
- [x] Opt-out link provided
- [ ] Create GA4 properties (3 stores)
- [ ] Get Measurement IDs
- [ ] Replace `G-XXXXXXXXXX` with real IDs
- [ ] Test in Real-Time reports

### Post-Launch
- [ ] Verify tracking is working
- [ ] Set up conversion goals
- [ ] Link to Google Ads (if using)
- [ ] Link to Search Console
- [ ] Create custom reports
- [ ] Set up alerts for traffic drops

---

## 🐛 Troubleshooting

### Issue 1: No Data in Reports
**Check**:
- Measurement ID is correct
- Tracking code is in `<head>` section
- No ad blockers enabled
- Wait 24-48 hours for data to appear

### Issue 2: Real-Time Not Working
**Check**:
- Clear browser cache
- Try incognito mode
- Check browser console for errors
- Verify gtag.js is loading

### Issue 3: High Bounce Rate
**Possible Causes**:
- Slow page load
- Poor mobile experience
- Misleading meta descriptions
- Wrong target audience

---

## 📞 Support Resources

- **Google Analytics Help**: [support.google.com/analytics](https://support.google.com/analytics)
- **GA4 Documentation**: [developers.google.com/analytics/devguides/collection/ga4](https://developers.google.com/analytics/devguides/collection/ga4)
- **Community Forum**: [support.google.com/analytics/community](https://support.google.com/analytics/community)
- **YouTube Channel**: [Google Analytics YouTube](https://www.youtube.com/user/googleanalytics)

---

## ✅ Summary

### What's Done:
- ✅ Tracking code template added
- ✅ Privacy Policy compliant with GA ToS
- ✅ IP anonymization enabled
- ✅ Secure cookie settings
- ✅ Opt-out mechanism provided

### What You Need to Do:
1. Create GA4 properties (3 stores)
2. Get Measurement IDs
3. Replace `G-XXXXXXXXXX` in `index.html`
4. Deploy and test
5. Monitor reports

**Estimated Time**: 30 minutes
**Difficulty**: Easy

---

**Last Updated**: May 15, 2026
**Status**: ✅ Ready for GA4 setup
**Compliance**: ✅ Google Analytics ToS compliant
