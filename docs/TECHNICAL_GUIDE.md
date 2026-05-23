# Luxtronics - Complete Technical Guide

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Configuration Files](#configuration-files)
3. [Multi-Store Architecture](#multi-store-architecture)
4. [Component Guide](#component-guide)
5. [API & Services](#api--services)
6. [Styling & Theming](#styling--theming)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Project Structure

```
Luxtronics/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (routes)
│   │   ├── config/             # Configuration files
│   │   ├── context/            # React Context providers
│   │   ├── services/           # API services
│   │   ├── lib/                # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   └── assets/             # Images, fonts, etc.
│   ├── public/                 # Static files
│   └── index.html              # HTML entry point
├── backend/                     # Node.js backend (optional)
│   └── server/
│       ├── routes/             # API routes
│       ├── services/           # Business logic
│       └── models/             # Data models
├── docs/                        # Documentation
├── .env                         # Environment variables (all stores)
├── .env.india                   # India store specific
├── .env.australia               # Australia store specific
├── .env.newzealand              # New Zealand store specific
└── .env.local                   # Local development only
```

---

## ⚙️ Configuration Files

### 1. Environment Variables

#### `.env` (Production - All Stores)
**Location:** `/Luxtronics/.env`

**Purpose:** Contains all environment variables for production deployment

**Key Variables:**
```bash
# Firebase Authentication
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...

# WooCommerce - India Store
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_...
VITE_WOOCOMMERCE_SECRET_INDIA=cs_...

# WooCommerce - Australia Store
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://luxtronics.luxtronics.in/storeau
VITE_WOOCOMMERCE_KEY_AUSTRALIA=ck_...
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=cs_...

# WooCommerce - New Zealand Store
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://luxtronics.luxtronics.in/storenz
VITE_WOOCOMMERCE_KEY_NEWZEALAND=ck_...
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=cs_...

# MongoDB (Backend)
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=Luxtronics

# Backend Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://luxtronics.in,https://luxtronics.com.au,https://luxtronics.co.nz
```

**When to Edit:**
- Adding new WooCommerce stores
- Changing API keys
- Updating database connection
- Adding new domains

#### `.env.local` (Local Development Only)
**Location:** `/Luxtronics/.env.local`

**Purpose:** Local development overrides (not committed to git)

```bash
VITE_BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

**When to Edit:**
- Testing with local backend
- Development environment setup

---

### 2. Store Configuration

#### `storeConfig.ts`
**Location:** `/frontend/src/config/storeConfig.ts`

**Purpose:** Maps domains to store-specific settings

**Structure:**
```typescript
export interface StoreConfig {
  currency: string;      // Currency code (INR, AUD, NZD)
  symbol: string;        // Currency symbol (₹, A$, NZ$)
  country: string;       // Country code (IN, AU, NZ)
  label: string;         // Display name
  apiUrl: string;        // WooCommerce API endpoint
}

const STORE_CONFIG: Record<string, StoreConfig> = {
  'luxtronics.in': { ... },
  'luxtronics.com.au': { ... },
  'luxtronics.co.nz': { ... },
};
```

**When to Edit:**
- Adding new domains
- Changing currency symbols
- Updating WooCommerce URLs
- Adding new country stores

**Related Files:**
- `/frontend/src/services/store-api.ts` (uses storeConfig)
- `/frontend/src/lib/woo-checkout.ts` (uses storeConfig)
- `/frontend/src/context/StoreContext.tsx` (provides storeConfig)

---

## 🌐 Multi-Store Architecture

### Domain to Store Mapping

| Frontend Domain | WooCommerce Store | Currency | Country Code |
|----------------|-------------------|----------|--------------|
| luxtronics.in | luxtronics.luxtronics.in | INR (₹) | IN |
| luxtronics.com.au | luxtronics.luxtronics.in/storeau | AUD (A$) | AU |
| luxtronics.co.nz | luxtronics.luxtronics.in/storenz | NZD (NZ$) | NZ |

### How It Works

1. **Domain Detection:**
   - `storeConfig.ts` reads `window.location.hostname`
   - Returns appropriate store configuration

2. **API Calls:**
   - `store-api.ts` uses `storeConfig.apiUrl`
   - Credentials selected based on `storeConfig.country`

3. **Checkout Redirect:**
   - `woo-checkout.ts` uses `storeConfig.apiUrl`
   - Redirects to correct WooCommerce store

### Files Involved

```
Domain Detection Flow:
├── storeConfig.ts          (detects domain, returns config)
├── StoreContext.tsx        (provides config to app)
├── store-api.ts            (uses config for API calls)
├── woo-checkout.ts         (uses config for checkout)
└── CurrencyContext.tsx     (uses config for currency display)
```

---

## 🧩 Component Guide

### Layout Components

#### 1. **Navbar** (`/frontend/src/components/Navbar.tsx`)
**Purpose:** Main navigation header

**Features:**
- Responsive design (desktop/mobile)
- Search functionality
- Currency switcher
- Cart icon with item count
- User authentication menu
- Theme toggle

**Styling:**
- Light theme: `light:bg-white` (pure white)
- Dark theme: `dark:bg-black/60` (semi-transparent)
- Scrolled state: Rounded corners + shadow

**When to Edit:**
- Adding/removing navigation links
- Changing header background
- Modifying search behavior
- Updating currency options

**Related Files:**
- `/frontend/src/context/CurrencyContext.tsx` (currency data)
- `/frontend/src/context/AuthContext.tsx` (user auth)
- `/frontend/src/context/CartContext.tsx` (cart count)

#### 2. **Footer** (`/frontend/src/components/Footer.tsx`)
**Purpose:** Site footer with links and info

**When to Edit:**
- Adding footer links
- Changing social media links
- Updating company info

#### 3. **Layout** (`/frontend/src/components/Layout.tsx`)
**Purpose:** Wraps all pages with Navbar + Footer

**Structure:**
```tsx
<Layout>
  <Navbar />
  {children}  // Page content
  <Footer />
</Layout>
```

---

### Page Components

#### 1. **Home Page** (`/frontend/src/pages/Index.tsx`)
**Components Used:**
- `<Hero />` - Main banner
- `<BrandMarquee />` - Scrolling brands
- `<DealsBanner />` - Promotional banner
- `<CategoryStrip />` - Category cards
- `<FeaturedProducts />` - Product grid
- `<Newsletter />` - Email signup

**When to Edit:**
- Changing homepage layout
- Adding/removing sections
- Reordering components

#### 2. **Shop Page** (`/frontend/src/pages/Shop.tsx`)
**Purpose:** Product listing with filters

**Features:**
- Category filtering
- Search functionality
- Pagination
- Product grid

**When to Edit:**
- Changing product grid layout
- Adding new filters
- Modifying sort options

#### 3. **Product Detail** (`/frontend/src/pages/ProductDetail.tsx`)
**Purpose:** Single product page

**Features:**
- Image gallery
- Variant selection
- Add to cart
- Buy now (redirects to WooCommerce)
- Related products

**When to Edit:**
- Changing product layout
- Modifying buy button behavior
- Adding product features

**Related Files:**
- `/frontend/src/lib/woo-checkout.ts` (checkout redirect)
- `/frontend/src/services/store-api.ts` (product data)

---

### UI Components

#### 1. **ProductCard** (`/frontend/src/components/ProductCard.tsx`)
**Purpose:** Reusable product card

**Used In:**
- Shop page
- Home page (featured products)
- Category pages
- Search results

**When to Edit:**
- Changing card design
- Adding product badges
- Modifying hover effects

#### 2. **Hero** (`/frontend/src/components/Hero.tsx`)
**Purpose:** Homepage hero section

**When to Edit:**
- Changing hero image
- Updating hero text
- Modifying CTA buttons

#### 3. **Newsletter** (`/frontend/src/components/Newsletter.tsx`)
**Purpose:** Email subscription form

**When to Edit:**
- Changing form design
- Updating email service integration

---

## 🔌 API & Services

### 1. Store API (`/frontend/src/services/store-api.ts`)

**Purpose:** Fetches products from WooCommerce

**Key Functions:**

```typescript
// Fetch products
fetchStoreProducts(page, perPage, search)

// Fetch single product
fetchStoreProduct(slug)

// Fetch categories
fetchStoreCategories(page, perPage)

// Search suggestions
fetchSearchSuggestions(query)
```

**How It Works:**
1. Gets store config from `storeConfig.ts`
2. Gets API credentials based on country code
3. Makes direct WooCommerce API calls
4. Returns formatted product data

**When to Edit:**
- Adding new API endpoints
- Changing data format
- Adding caching logic
- Modifying error handling

**Related Files:**
- `/frontend/src/config/storeConfig.ts` (store URLs)
- `/frontend/src/hooks/use-woo-products.ts` (React hooks)

---

### 2. WooCommerce Service (`/frontend/src/services/woocommerce.ts`)

**Purpose:** Alternative WooCommerce API client (uses backend proxy)

**Note:** Currently not in use. Direct API calls preferred.

---

### 3. Checkout Service (`/frontend/src/lib/woo-checkout.ts`)

**Purpose:** Redirects to WooCommerce checkout

**Key Function:**
```typescript
redirectToWooCheckout(items, sourceDomain, currency)
```

**How It Works:**
1. Gets WooCommerce base URL from `storeConfig`
2. Builds checkout URL with cart items
3. Redirects browser to WooCommerce

**When to Edit:**
- Changing checkout flow
- Adding cart parameters
- Modifying redirect logic

**Related Files:**
- `/frontend/src/config/storeConfig.ts` (store URLs)
- `/frontend/src/pages/ProductDetail.tsx` (Buy Now button)

---

## 🎨 Styling & Theming

### Tailwind Configuration

**File:** `/tailwind.config.ts`

**Custom Classes:**
- `bg-gradient-brand` - Primary gradient
- `text-gradient` - Gradient text
- `shadow-glow` - Glow effect
- `light:` prefix - Light theme styles
- `dark:` prefix - Dark theme styles

### Theme Toggle

**File:** `/frontend/src/components/ThemeToggle.tsx`

**Context:** `/frontend/src/context/ThemeContext.tsx`

**How It Works:**
- Stores theme in localStorage
- Applies `dark` class to `<html>`
- Persists across page loads

### Color Scheme

**Light Theme:**
- Background: White (`bg-white`)
- Text: Black (`text-black`)
- Borders: `border-black/10`

**Dark Theme:**
- Background: Black (`bg-black`)
- Text: White (`text-white`)
- Borders: `border-white/10`

**When to Edit:**
- Changing brand colors
- Adding new gradients
- Modifying theme behavior

---

## 🛠️ Common Tasks

### 1. Add New Domain/Store

**Files to Edit:**

1. **`storeConfig.ts`**
```typescript
'newdomain.com': {
  currency: 'USD',
  symbol: '$',
  country: 'US',
  label: 'United States',
  apiUrl: 'https://store.woocommerce.com/wp-json/wc/v3',
}
```

2. **`.env`**
```bash
VITE_WOOCOMMERCE_URL_NEWSTORE=https://store.woocommerce.com
VITE_WOOCOMMERCE_KEY_NEWSTORE=ck_...
VITE_WOOCOMMERCE_SECRET_NEWSTORE=cs_...
```

3. **`store-api.ts`** (add to `getStoreCredentials()`)
```typescript
case 'US':
  key = import.meta.env.VITE_WOOCOMMERCE_KEY_NEWSTORE || '';
  secret = import.meta.env.VITE_WOOCOMMERCE_SECRET_NEWSTORE || '';
  break;
```

4. **Rebuild & Deploy**
```bash
npm run build
git add .
git commit -m "add new store"
git push origin main
```

---

### 2. Change Header Background

**File:** `/frontend/src/components/Navbar.tsx`

**Light Theme:**
```typescript
light:bg-white  // Pure white
light:bg-white/90  // 90% opacity
```

**Dark Theme:**
```typescript
dark:bg-black/60  // 60% opacity
dark:bg-black  // Pure black
```

**Location:** Line ~95 (scrolled state)

---

### 3. Update Product Display

**Files:**
- `/frontend/src/components/ProductCard.tsx` - Card design
- `/frontend/src/pages/Shop.tsx` - Grid layout
- `/frontend/src/pages/ProductDetail.tsx` - Detail page

**Common Changes:**
- Grid columns: `grid-cols-2 lg:grid-cols-4`
- Card spacing: `gap-4`
- Image aspect ratio: `aspect-square`

---

### 4. Modify Checkout Flow

**File:** `/frontend/src/lib/woo-checkout.ts`

**Change checkout URL:**
```typescript
export const WOO_BASE = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');
```

**Add custom parameters:**
```typescript
params.set('custom_param', 'value');
```

---

### 5. Add New Navigation Link

**File:** `/frontend/src/components/Navbar.tsx`

**Location:** Line ~20 (links array)

```typescript
const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/new-page", label: "New Page" },  // Add here
  // ...
];
```

**Also Create Page:**
`/frontend/src/pages/NewPage.tsx`

**Add Route:**
`/frontend/src/App.tsx`

---

### 6. Change Currency Display

**File:** `/frontend/src/context/CurrencyContext.tsx`

**Add New Currency:**
```typescript
export const countries = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
  },
  // ...
];
```

---

## 🐛 Troubleshooting

### Issue: Products Not Loading

**Symptoms:** Empty product grid, loading forever

**Check:**
1. **Environment Variables**
   ```bash
   # Verify keys are set
   echo $VITE_WOOCOMMERCE_KEY_INDIA
   ```

2. **Store Config**
   - File: `/frontend/src/config/storeConfig.ts`
   - Check `apiUrl` is correct

3. **API Credentials**
   - File: `/frontend/src/services/store-api.ts`
   - Check `getStoreCredentials()` returns correct keys

4. **Browser Console**
   - Check for 401 (wrong keys) or 404 (wrong URL) errors

**Fix:**
- Update API keys in `.env`
- Rebuild: `npm run build`
- Clear browser cache

---

### Issue: Wrong Store Loading

**Symptoms:** Australia domain shows India products

**Check:**
1. **Domain Detection**
   ```javascript
   // Browser console
   console.log(window.location.hostname);
   console.log(storeConfig);
   ```

2. **Store Config Mapping**
   - File: `/frontend/src/config/storeConfig.ts`
   - Check domain is in `STORE_CONFIG` object

3. **Build Environment**
   - Verify correct `.env` file used during build

**Fix:**
- Add domain to `storeConfig.ts`
- Rebuild with correct `.env` file
- Deploy to correct domain

---

### Issue: Checkout Redirects to Wrong Store

**Symptoms:** Buy Now goes to India store instead of Australia

**Check:**
1. **Checkout Service**
   - File: `/frontend/src/lib/woo-checkout.ts`
   - Check `WOO_BASE` uses `storeConfig.apiUrl`

2. **Store Config**
   - Verify `apiUrl` is correct for each domain

**Fix:**
```typescript
// Should be:
export const WOO_BASE = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');

// Not:
export const WOO_BASE = "https://luxtronics.luxtronics.in";
```

---

### Issue: CORS Errors

**Symptoms:** API calls blocked by browser

**Check:**
1. **WooCommerce CORS**
   - File: WordPress `functions.php`
   - Check CORS headers are added

2. **Allowed Origins**
   ```php
   $allowed_origins = [
       'https://luxtronics.in',
       'https://luxtronics.com.au',
       'https://luxtronics.co.nz'
   ];
   ```

**Fix:**
- Add CORS code to WooCommerce `functions.php`
- Include all frontend domains
- Restart WordPress/clear cache

---

### Issue: Mobile Menu Stuck Open

**Symptoms:** Hamburger menu loads in open state

**Check:**
1. **Initial State**
   - File: `/frontend/src/components/Navbar.tsx`
   - Line: `const [mobileOpen, setMobileOpen] = useState(false);`

2. **Route Change Handler**
   - Check `useEffect` closes menu on route change

**Fix:**
- Ensure `useState(false)` not `useState(true)`
- Add route change effect if missing

---

### Issue: Environment Variables Not Loading

**Symptoms:** `undefined` API keys, features not working

**Check:**
1. **Variable Names**
   - Must start with `VITE_` for frontend
   - Case-sensitive

2. **Build Process**
   - Environment variables baked into build
   - Must rebuild after changing `.env`

3. **Hostinger Setup**
   - Check all variables added to hPanel
   - Restart Node.js application

**Fix:**
```bash
# After changing .env
npm run build

# Verify in build
grep -r "VITE_WOOCOMMERCE" dist/assets/*.js
```

---

## 📚 File Reference Quick Guide

### Need to Change...

| What | File | Line/Section |
|------|------|--------------|
| **Store URLs** | `/frontend/src/config/storeConfig.ts` | STORE_CONFIG object |
| **API Keys** | `/.env` | VITE_WOOCOMMERCE_* |
| **Currency** | `/frontend/src/context/CurrencyContext.tsx` | countries array |
| **Navigation Links** | `/frontend/src/components/Navbar.tsx` | links array (~20) |
| **Header Background** | `/frontend/src/components/Navbar.tsx` | className (~95) |
| **Homepage Layout** | `/frontend/src/pages/Index.tsx` | Component order |
| **Product Card Design** | `/frontend/src/components/ProductCard.tsx` | Entire file |
| **Checkout URL** | `/frontend/src/lib/woo-checkout.ts` | WOO_BASE |
| **Theme Colors** | `/tailwind.config.ts` | theme.extend |
| **Product Grid** | `/frontend/src/pages/Shop.tsx` | grid-cols-* |

---

## 🚀 Deployment Checklist

### Before Deploy

- [ ] Update `.env` with production values
- [ ] Generate API keys for all stores
- [ ] Add CORS to all WooCommerce stores
- [ ] Test all domains locally
- [ ] Check environment variables in Hostinger
- [ ] Verify store URLs are correct

### Build & Deploy

```bash
# 1. Build
npm run build

# 2. Test build locally
npm run preview

# 3. Commit
git add .
git commit -m "deployment ready"
git push origin main

# 4. Upload to Hostinger
# - Upload dist/ folder to public_html/
# - Or use CI/CD pipeline
```

### After Deploy

- [ ] Test luxtronics.in
- [ ] Test luxtronics.com.au
- [ ] Test luxtronics.co.nz
- [ ] Check products load
- [ ] Test checkout redirect
- [ ] Verify currency display
- [ ] Check mobile responsiveness
- [ ] Test search functionality

---

## 📞 Support & Resources

### Documentation Files

- `THREE_STORE_MIGRATION.md` - Migration summary
- `HOSTINGER_ENV_SETUP.md` - Environment setup
- `HOSTINGER_DEPLOYMENT.md` - Deployment guide
- `QUICK_REFERENCE.md` - Quick reference
- `TECHNICAL_GUIDE.md` - This file

### Key Concepts

1. **Multi-Store:** One frontend, multiple WooCommerce stores
2. **Domain Detection:** Automatic based on hostname
3. **Direct API:** Frontend calls WooCommerce directly (no backend proxy)
4. **Environment Variables:** Store-specific credentials
5. **Checkout Redirect:** Redirects to appropriate WooCommerce store

### Common Patterns

**Get Store Config:**
```typescript
import { storeConfig } from '@/config/storeConfig';
const { apiUrl, currency, symbol } = storeConfig;
```

**Use Currency:**
```typescript
import { useCurrency } from '@/context/CurrencyContext';
const { formatPrice } = useCurrency();
```

**Fetch Products:**
```typescript
import { fetchStoreProducts } from '@/services/store-api';
const products = await fetchStoreProducts(1, 10);
```

---

**Last Updated:** May 2026  
**Version:** 1.0  
**Maintainer:** Luxtronics Team
