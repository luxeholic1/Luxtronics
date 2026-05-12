# Hostinger Environment Variables Setup

## Overview

Hostinger pe aapko sabhi environment variables ek saath set karne honge kyunki same server pe teeno domains host ho rahe hain. Isliye humne har store ke liye unique variable names use kiye hain.

## Environment Variables Structure

### India Store Variables
```bash
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_ed6c3544620b10f22f35f52d5cc35019ae0b3358
VITE_WOOCOMMERCE_SECRET_INDIA=cs_3304ef915585f9a2d29228af581647dc1a4a702c
```

### Australia Store Variables
```bash
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_AUSTRALIA=your_australia_consumer_key
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=your_australia_consumer_secret
```

### New Zealand Store Variables
```bash
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_NEWZEALAND=your_newzealand_consumer_key
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=your_newzealand_consumer_secret
```

### Firebase Variables (Common for all stores)
```bash
VITE_FIREBASE_API_KEY=AIzaSyDi14g9T1nZW3i-QiHlYbFG-xI7cWnic4A
VITE_FIREBASE_AUTH_DOMAIN=luxtronics-61482.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=luxtronics-61482
VITE_FIREBASE_STORAGE_BUCKET=luxtronics-61482.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=261498538242
VITE_FIREBASE_APP_ID=1:261498538242:web:2873817a30f25b86f99a1b
VITE_FIREBASE_MEASUREMENT_ID=G-PSWX1ND3EJ
```

### Backend Variables (Common)
```bash
MONGODB_URI=mongodb+srv://asmitsharma2904_db_user:Asmit12%40%23@cluster0.qetvs4f.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=Luxtronics
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://luxtronics.in,https://www.luxtronics.in,https://luxtronics.com.au,https://www.luxtronics.com.au,https://luxtronics.co.nz,https://www.luxtronics.co.nz
VITE_ADMIN_EMAILS=admin@luxtronics.in
SYNC_TOKEN=qwertyasdfghjklzxcvbnm1234567890
```

## Hostinger Setup Steps

### Method 1: Using Hostinger Control Panel

1. **Login to Hostinger**
   - Go to hPanel
   - Select your website

2. **Navigate to Environment Variables**
   - Advanced → Environment Variables
   - Or search for "Environment Variables" in hPanel

3. **Add All Variables**
   - Click "Add New Variable"
   - Copy-paste each variable name and value
   - Make sure to add ALL variables from above

### Method 2: Using .env File (If Supported)

1. **Upload .env file**
   - Use File Manager or FTP
   - Upload to your application root directory
   - Make sure file is named exactly `.env`

2. **Set Correct Permissions**
   ```bash
   chmod 600 .env
   ```

## Complete Environment Variables List for Hostinger

Copy this entire block and add to Hostinger (REMOVE VITE_BACKEND_URL for production):

```bash
# Firebase Auth
VITE_FIREBASE_API_KEY=AIzaSyDi14g9T1nZW3i-QiHlYbFG-xI7cWnic4A
VITE_FIREBASE_AUTH_DOMAIN=luxtronics-61482.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=luxtronics-61482
VITE_FIREBASE_STORAGE_BUCKET=luxtronics-61482.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=261498538242
VITE_FIREBASE_APP_ID=1:261498538242:web:2873817a30f25b86f99a1b
VITE_FIREBASE_MEASUREMENT_ID=G-PSWX1ND3EJ

# WooCommerce - India Store
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_ed6c3544620b10f22f35f52d5cc35019ae0b3358
VITE_WOOCOMMERCE_SECRET_INDIA=cs_3304ef915585f9a2d29228af581647dc1a4a702c

# WooCommerce - Australia Store
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_AUSTRALIA=your_australia_consumer_key
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=your_australia_consumer_secret

# WooCommerce - New Zealand Store
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_NEWZEALAND=your_newzealand_consumer_key
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=your_newzealand_consumer_secret

# MongoDB
MONGODB_URI=mongodb+srv://asmitsharma2904_db_user:Asmit12%40%23@cluster0.qetvs4f.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=Luxtronics

# Backend Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://luxtronics.in,https://www.luxtronics.in,https://luxtronics.com.au,https://www.luxtronics.com.au,https://luxtronics.co.nz,https://www.luxtronics.co.nz

# Admin
VITE_ADMIN_EMAILS=admin@luxtronics.in

# Sync Token
SYNC_TOKEN=qwertyasdfghjklzxcvbnm1234567890

# IMPORTANT: DO NOT ADD VITE_BACKEND_URL in production
# It will default to current domain automatically
```

## How It Works

### Domain Detection Logic

Frontend automatically detects the domain and uses the correct API keys:

```typescript
// In wooClient.ts
function getStoreCredentials() {
  const country = storeConfig.country; // IN, AU, or NZ
  
  switch (country) {
    case 'IN':
      return {
        key: VITE_WOOCOMMERCE_KEY_INDIA,
        secret: VITE_WOOCOMMERCE_SECRET_INDIA
      };
    case 'AU':
      return {
        key: VITE_WOOCOMMERCE_KEY_AUSTRALIA,
        secret: VITE_WOOCOMMERCE_SECRET_AUSTRALIA
      };
    case 'NZ':
      return {
        key: VITE_WOOCOMMERCE_KEY_NEWZEALAND,
        secret: VITE_WOOCOMMERCE_SECRET_NEWZEALAND
      };
  }
}
```

### Domain to Store Mapping

| Domain | Country Code | Uses Keys |
|--------|--------------|-----------|
| luxtronics.in | IN | VITE_WOOCOMMERCE_*_INDIA |
| luxtronics.com.au | AU | VITE_WOOCOMMERCE_*_AUSTRALIA |
| luxtronics.co.nz | NZ | VITE_WOOCOMMERCE_*_NEWZEALAND |

## Important Notes

### 1. API Keys Generation

⚠️ **Australia aur New Zealand ke API keys abhi placeholder hain!**

Generate karne ke liye:

**For storeau.luxtronics.luxtronics.in:**
1. Login to WordPress admin
2. WooCommerce → Settings → Advanced → REST API
3. Add Key → Read/Write permissions
4. Copy Consumer Key and Secret
5. Replace `your_australia_consumer_key` and `your_australia_consumer_secret`

**For storenz.luxtronics.luxtronics.in:**
1. Same steps as above
2. Replace `your_newzealand_consumer_key` and `your_newzealand_consumer_secret`

### 2. Security

- ✅ All VITE_ prefixed variables are safe (public)
- ⚠️ MONGODB_URI, SYNC_TOKEN are sensitive (backend only)
- ⚠️ WooCommerce keys are semi-sensitive (used in frontend)

### 3. Build Process

Jab aap build karenge, Vite automatically sahi environment variables use karega:

```bash
# Local build
npm run build

# Hostinger pe deploy karne se pehle
# Make sure all env variables are set in Hostinger
```

## Testing After Setup

### 1. Check Environment Variables

Hostinger terminal me:
```bash
echo $VITE_WOOCOMMERCE_KEY_INDIA
echo $VITE_WOOCOMMERCE_KEY_AUSTRALIA
echo $VITE_WOOCOMMERCE_KEY_NEWZEALAND
```

### 2. Test Each Domain

Visit each domain and check browser console:

```javascript
// Browser console me
console.log(import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA);
console.log(import.meta.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA);
console.log(import.meta.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND);
```

### 3. Check API Calls

Network tab me dekho:
- luxtronics.in → luxtronics.luxtronics.in API calls
- luxtronics.com.au → storeau.luxtronics.luxtronics.in API calls
- luxtronics.co.nz → storenz.luxtronics.luxtronics.in API calls

## Troubleshooting

### Problem: Environment variables not loading

**Solution:**
1. Restart Node.js application in Hostinger
2. Clear build cache: `rm -rf dist/ node_modules/.vite`
3. Rebuild: `npm run build`

### Problem: Wrong API keys being used

**Solution:**
1. Check domain detection: `console.log(storeConfig.country)`
2. Verify all three sets of keys are in Hostinger
3. Check for typos in variable names (case-sensitive!)

### Problem: CORS errors

**Solution:**
1. Add CORS headers to all three WooCommerce stores
2. Check CORS_ORIGIN includes all domains
3. Verify WordPress CORS plugin/code is active

## Deployment Checklist

- [ ] All environment variables added to Hostinger
- [ ] Australia store API keys generated and added
- [ ] New Zealand store API keys generated and added
- [ ] CORS configured on all three WooCommerce stores
- [ ] Build created with all env variables
- [ ] Deployed to Hostinger
- [ ] Tested luxtronics.in
- [ ] Tested luxtronics.com.au
- [ ] Tested luxtronics.co.nz
- [ ] Verified correct API calls in Network tab
- [ ] Checked currency symbols (₹, A$, NZ$)

## Support

For issues:
- Check Hostinger error logs
- Verify environment variables in hPanel
- Test API keys with Postman
- Check browser console for errors
