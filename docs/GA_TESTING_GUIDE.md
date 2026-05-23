# Google Analytics Testing Guide

## ⚠️ "No data received" - Normal Hai!

Google Analytics ko data receive hone mein **24-48 hours** lag sakte hain. Lekin hum abhi test kar sakte hain.

---

## ✅ Quick Test Methods

### Method 1: Real-Time Report (Best Method)

1. **Open your website**: `https://luxtronics.in` (ya jo bhi deployed URL hai)
2. **Open Google Analytics**: [analytics.google.com](https://analytics.google.com)
3. **Go to**: Reports → Realtime → Overview
4. **Check**: 
   - Active users count should show "1" (you)
   - Event count should increase
   - Page views should show your current page

**Expected Result**: You should see yourself as an active user within 30 seconds!

---

### Method 2: Browser Console Test

1. **Open your website**: `https://luxtronics.in`
2. **Press F12** (open DevTools)
3. **Go to Console tab**
4. **Type this command**:
   ```javascript
   gtag('event', 'test_event', {
     'event_category': 'testing',
     'event_label': 'manual_test'
   });
   ```
5. **Press Enter**
6. **Check Network tab**: Look for requests to `google-analytics.com` or `analytics.google.com`

**Expected Result**: You should see network requests being sent!

---

### Method 3: Google Analytics Debugger Extension

1. **Install Extension**: 
   - Chrome: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - Firefox: [GA Debug](https://addons.mozilla.org/en-US/firefox/addon/ga-debug/)

2. **Enable the extension** (click icon in toolbar)

3. **Open your website**: `https://luxtronics.in`

4. **Open Console** (F12)

5. **Check for logs**: You should see detailed GA logs like:
   ```
   Running command: ga("create", "G-7QBFV2XTRQ", "auto")
   Running command: ga("send", "pageview")
   ```

**Expected Result**: Detailed GA logs in console!

---

### Method 4: Network Tab Inspection

1. **Open your website**: `https://luxtronics.in`
2. **Press F12** (DevTools)
3. **Go to Network tab**
4. **Filter**: Type `google-analytics` or `gtag` in filter box
5. **Refresh page** (Ctrl+R or Cmd+R)
6. **Check**: Look for requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-7QBFV2XTRQ`
   - `https://www.google-analytics.com/g/collect?...`

**Expected Result**: You should see these requests with status 200!

---

## 🐛 Troubleshooting

### Issue 1: "No data received" in GA Dashboard

**Possible Causes**:
1. Website not deployed yet (localhost won't send data)
2. Ad blocker enabled
3. Browser privacy settings blocking tracking
4. Need to wait 24-48 hours

**Solutions**:
- ✅ Deploy to production (Hostinger)
- ✅ Disable ad blockers
- ✅ Try incognito mode
- ✅ Wait 24-48 hours

---

### Issue 2: No requests in Network tab

**Check**:
1. Is the website deployed? (localhost won't work properly)
2. Is the script loading? Check Console for errors
3. Is ad blocker enabled?

**Fix**:
```bash
# Rebuild and deploy
cd frontend
npm run build
# Deploy to Hostinger
```

---

### Issue 3: Script not loading

**Check in Console**:
```
Failed to load resource: https://www.googletagmanager.com/gtag/js
```

**Possible Causes**:
- Firewall blocking Google domains
- DNS issues
- Ad blocker

**Fix**:
- Disable ad blocker
- Try different network
- Check browser console for specific error

---

## 📊 What to Check in Real-Time Report

### When you visit your site, you should see:

1. **Active Users**: 1 (or more if others are visiting)
2. **Views by Page**: Your current page path
3. **Event Count**: Increasing as you navigate
4. **User by Country**: Your country (India/Australia/NZ)
5. **User by Device**: Desktop/Mobile
6. **User by Browser**: Chrome/Safari/Firefox

---

## 🎯 Test Scenarios

### Scenario 1: Homepage Visit
1. Visit `https://luxtronics.in`
2. **Expected in GA**: 
   - Event: `page_view`
   - Page: `/`
   - Title: "Luxtronics — Premium Electronics..."

### Scenario 2: Product Page Visit
1. Visit `https://luxtronics.in/shop`
2. Click on any product
3. **Expected in GA**:
   - Event: `page_view`
   - Page: `/product/[slug]`
   - Multiple page views

### Scenario 3: Search
1. Search for "glasses" in navbar
2. **Expected in GA**:
   - Event: `view_search_results`
   - Search term: "glasses"
   - Page: `/shop?q=glasses`

### Scenario 4: Scroll
1. Scroll to bottom of homepage
2. **Expected in GA**:
   - Event: `scroll`
   - Scroll depth: 90%

---

## ✅ Verification Checklist

### Before Testing:
- [ ] Website is deployed to production (not localhost)
- [ ] Ad blocker is disabled
- [ ] Using Chrome/Firefox (not Brave or privacy browsers)
- [ ] Google Analytics property is created
- [ ] Measurement ID is correct: `G-7QBFV2XTRQ`

### During Testing:
- [ ] Open Real-Time report in GA
- [ ] Visit your website in another tab
- [ ] See yourself as active user (within 30 seconds)
- [ ] Navigate to different pages
- [ ] See page views updating in real-time

### After Testing:
- [ ] Real-time report shows data ✅
- [ ] Network tab shows GA requests ✅
- [ ] No console errors ✅
- [ ] Wait 24-48 hours for full reports ✅

---

## 📱 Mobile Testing

### Test on Mobile Device:

1. **Open your site** on mobile: `https://luxtronics.in`
2. **Check GA Real-Time**: Should show mobile device
3. **Navigate** through pages
4. **Check**: Device category shows "mobile"

---

## 🔍 Advanced Testing

### Test Enhanced Measurement Events:

#### 1. Scroll Event
- Scroll to 90% of page
- **Check GA**: Event `scroll` with `percent_scrolled: 90`

#### 2. Outbound Click
- Click on external link (e.g., social media)
- **Check GA**: Event `click` with `link_url`

#### 3. Site Search
- Search for "glasses"
- **Check GA**: Event `view_search_results` with `search_term: glasses`

#### 4. File Download (if applicable)
- Click download link
- **Check GA**: Event `file_download`

---

## 📊 Expected Timeline

### Immediate (0-5 minutes):
- ✅ Real-Time reports show data
- ✅ Network requests visible in DevTools
- ✅ Console shows no errors

### 24 Hours:
- ✅ Standard reports start showing data
- ✅ User demographics available
- ✅ Traffic sources visible

### 48 Hours:
- ✅ All reports fully populated
- ✅ Historical data available
- ✅ Comparisons possible

---

## 🎓 What Each Report Shows

### Real-Time (Immediate):
- Active users right now
- Current page views
- Live events
- Geographic location
- Device types

### Engagement (24-48 hours):
- Page views over time
- Average engagement time
- Bounce rate
- Most viewed pages

### Acquisition (24-48 hours):
- Traffic sources (Google, direct, social)
- Campaigns
- Referrals

### Monetization (After e-commerce setup):
- Revenue
- Transactions
- Products sold

---

## 🚀 Quick Commands for Testing

### Test Event from Console:
```javascript
// Send custom test event
gtag('event', 'test_button_click', {
  'event_category': 'engagement',
  'event_label': 'test_button',
  'value': 1
});
```

### Check if gtag is loaded:
```javascript
// Should return function
typeof gtag
```

### Check dataLayer:
```javascript
// Should show array with events
console.log(window.dataLayer);
```

---

## ✅ Success Indicators

### Your GA is working if:
1. ✅ Real-Time report shows active users
2. ✅ Network tab shows requests to `google-analytics.com`
3. ✅ No errors in browser console
4. ✅ Page views increment as you navigate
5. ✅ Events are tracked (scroll, click, etc.)

### Your GA needs fixing if:
1. ❌ No active users in Real-Time (after 5 minutes)
2. ❌ No network requests to GA
3. ❌ Console shows "gtag is not defined"
4. ❌ Script fails to load (404 error)

---

## 📞 Need Help?

### If Real-Time still shows "No data":

1. **Check deployment**: Is site live on `luxtronics.in`?
2. **Check console**: Any JavaScript errors?
3. **Check Network**: Are GA requests being sent?
4. **Try incognito**: Disable all extensions
5. **Wait**: Sometimes takes 5-10 minutes for first data

### If still not working after 48 hours:

1. Verify Measurement ID: `G-7QBFV2XTRQ`
2. Check if script is in `<head>` section
3. Verify website is publicly accessible
4. Check Google Analytics property settings
5. Contact Google Analytics support

---

## 🎯 Final Checklist

- [ ] Website deployed to production
- [ ] Visited site in browser
- [ ] Checked Real-Time report (within 5 minutes)
- [ ] Saw active user (yourself)
- [ ] Navigated to multiple pages
- [ ] Saw page views updating
- [ ] No console errors
- [ ] Network requests successful

**If all checked ✅ = Your GA is working perfectly!**

Just wait 24-48 hours for full reports to populate.

---

**Status**: ✅ Tracking code is correctly installed
**Next Step**: Visit your live site and check Real-Time reports
**Expected**: Data within 30 seconds in Real-Time, full reports in 24-48 hours

---

**Last Updated**: May 15, 2026
