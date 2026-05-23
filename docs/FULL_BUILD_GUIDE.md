# Luxtronics — Complete Build Guide
### Build This Entire Architecture From Scratch, Step by Step

> **Who this is for:** A React developer who wants to build this exact multi-region e-commerce platform from zero — including WooCommerce, Firebase, MongoDB, Express backend, multi-domain routing, admin dashboard, CI/CD, and Hostinger deployment.

---

## Table of Contents

- [Phase 0 — Understand What You Are Building](#phase-0--understand-what-you-are-building)
- [Phase 1 — Accounts & Prerequisites](#phase-1--accounts--prerequisites)
- [Phase 2 — WooCommerce Setup (3 Stores)](#phase-2--woocommerce-setup-3-stores)
- [Phase 3 — Firebase Setup](#phase-3--firebase-setup)
- [Phase 4 — MongoDB Atlas Setup](#phase-4--mongodb-atlas-setup)
- [Phase 5 — Scaffold the Project](#phase-5--scaffold-the-project)
- [Phase 6 — Install All Dependencies](#phase-6--install-all-dependencies)
- [Phase 7 — Environment Variables](#phase-7--environment-variables)
- [Phase 8 — Multi-Store Config (storeConfig.ts)](#phase-8--multi-store-config-storeconfigts)
- [Phase 9 — React Contexts](#phase-9--react-contexts)
- [Phase 10 — Frontend Services Layer](#phase-10--frontend-services-layer)
- [Phase 11 — Frontend Components](#phase-11--frontend-components)
- [Phase 12 — Pages & Routing](#phase-12--pages--routing)
- [Phase 13 — Express Backend](#phase-13--express-backend)
- [Phase 14 — MongoDB Models & Services](#phase-14--mongodb-models--services)
- [Phase 15 — WooCommerce Sync Pipeline](#phase-15--woocommerce-sync-pipeline)
- [Phase 16 — Firebase Sync](#phase-16--firebase-sync)
- [Phase 17 — Admin Dashboard](#phase-17--admin-dashboard)
- [Phase 18 — SEO, Sitemap & Analytics](#phase-18--seo-sitemap--analytics)
- [Phase 19 — Testing](#phase-19--testing)
- [Phase 20 — Build & Deploy to Hostinger](#phase-20--build--deploy-to-hostinger)
- [Phase 21 — CI/CD with GitHub Actions](#phase-21--cicd-with-github-actions)
- [Phase 22 — Post-Deploy Checklist](#phase-22--post-deploy-checklist)

---

## Phase 0 — Understand What You Are Building

### The Big Picture

You are building a **multi-region electronics e-commerce storefront** called Luxtronics. It has:

- **3 regional storefronts** on 3 separate domains (India, Australia, New Zealand)
- **1 React codebase** that detects the domain at runtime and switches currency + WooCommerce store
- **3 WooCommerce installations** (one per region) as the source of truth for products and orders
- **Firebase** for user authentication (email/password + Google) and Firestore as a fast product cache
- **MongoDB Atlas** as a persistent product cache on the backend (10–50× faster than WooCommerce)
- **Express.js backend** that proxies/caches WooCommerce data and handles admin CRUD
- **GitHub Actions** for automated Firebase sync on every push
- **Hostinger** for hosting (FTP deploy)

### Data Flow (simplified)

```
User visits luxtronics.in
  → React detects hostname → loads India store config
  → Fetches products from Firebase (fast, ~200ms)
  → Falls back to WooCommerce REST API if Firebase unavailable
  → User adds to cart → clicks Buy Now
  → Redirected to WooCommerce checkout (India store)
  → Order created in WooCommerce
  → User can view orders in account dashboard (fetched from WooCommerce)
```

### Platform Accounts You Need

| Platform | Purpose | Cost |
|---|---|---|
| Hostinger | Web hosting (3 domains) | ~$3–10/mo |
| WordPress + WooCommerce | Product/order management (3 installs) | Included with Hostinger |
| Firebase | Auth + Firestore product cache | Free tier |
| MongoDB Atlas | Backend product cache | Free M0 tier |
| GitHub | Source control + CI/CD | Free |
| Google Analytics | Traffic analytics | Free |
| Google Search Console | SEO monitoring | Free |

---

## Phase 1 — Accounts & Prerequisites

### Step 1.1 — Install Local Tools

```bash
# Check Node.js (need 18+)
node --version   # should be v18.x or higher

# If not installed, download from https://nodejs.org
# Use the LTS version

# Check npm
npm --version    # should be 9+

# Install git if not present
git --version
```

### Step 1.2 — Create All Platform Accounts

**GitHub**
1. Go to https://github.com → Sign up
2. Create a new repository: `luxtronics` (private)
3. Note your GitHub username

**Firebase**
1. Go to https://console.firebase.google.com
2. Sign in with Google account
3. Click "Add project" → name it `luxtronics-prod`
4. Disable Google Analytics for now (add later)
5. Click "Create project"

**MongoDB Atlas**
1. Go to https://cloud.mongodb.com
2. Sign up for free
3. Create a free M0 cluster
4. Choose region closest to your server (e.g. `ap-south-1` for India)
5. Create a database user: username `luxtronics`, strong password
6. Under "Network Access" → Add IP Address → Allow access from anywhere (`0.0.0.0/0`) for now
7. Click "Connect" → "Connect your application" → copy the connection string

**Hostinger**
1. Go to https://hostinger.com
2. Purchase a hosting plan that supports Node.js (Business or Cloud)
3. Register or point your 3 domains:
   - `luxtronics.in`
   - `luxtronics.com.au`
   - `luxtronics.co.nz`
4. Note your FTP credentials from hPanel

### Step 1.3 — Set Up VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)
- GitLens

---

## Phase 2 — WooCommerce Setup (3 Stores)

You need 3 separate WordPress + WooCommerce installations. You can host all 3 on subdomains of one Hostinger account.

### Step 2.1 — Install WordPress on Hostinger

In Hostinger hPanel:
1. Go to "Websites" → "Add Website"
2. Install WordPress (use the auto-installer)
3. Do this 3 times for:
   - `luxtronics.luxtronics.in` (India store)
   - `storeau.luxtronics.luxtronics.in` (Australia store)
   - `storenz.luxtronics.luxtronics.in` (New Zealand store)

> **Tip:** These are subdomains of your main domain. The React frontend will be on the root domains (`luxtronics.in`, etc.) while WooCommerce runs on subdomains.

### Step 2.2 — Install WooCommerce Plugin

For each WordPress installation:
1. Log in to WordPress admin (`/wp-admin`)
2. Go to Plugins → Add New → search "WooCommerce"
3. Install and Activate
4. Complete the WooCommerce setup wizard
5. Set the correct currency:
   - India: INR (₹)
   - Australia: AUD (A$)
   - New Zealand: NZD (NZ$)

### Step 2.3 — Generate WooCommerce REST API Keys

For **each** WooCommerce store:
1. Go to WooCommerce → Settings → Advanced → REST API
2. Click "Add Key"
3. Description: `Luxtronics Frontend`
4. User: your admin user
5. Permissions: **Read/Write** (needed for order creation and admin CRUD)
6. Click "Generate API Key"
7. **Copy and save** the Consumer Key (`ck_...`) and Consumer Secret (`cs_...`) — you only see them once

### Step 2.4 — Add CORS Headers to WooCommerce

For each WordPress installation, add this to `functions.php` (Appearance → Theme Editor → functions.php):

```php
// Allow CORS from Luxtronics frontend domains
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed = [
            'https://luxtronics.in',
            'https://www.luxtronics.in',
            'https://luxtronics.com.au',
            'https://www.luxtronics.com.au',
            'https://luxtronics.co.nz',
            'https://www.luxtronics.co.nz',
            'http://localhost:5173',  // dev
            'http://localhost:3001',  // dev
        ];
        if (in_array($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        }
        return $value;
    });
}, 15);
```

### Step 2.5 — Add Cart Redirect Snippet

This PHP snippet lets the React frontend pass cart items to WooCommerce checkout via URL:

```php
// Cart redirect from React frontend
add_action('init', function() {
    if (!isset($_GET['lux_cart'])) return;
    $items = json_decode(stripslashes($_GET['lux_cart']), true);
    if (!is_array($items)) return;
    WC()->cart->empty_cart();
    foreach ($items as $item) {
        WC()->cart->add_to_cart(
            intval($item['product_id']),
            intval($item['quantity']),
            intval($item['variation_id'] ?? 0)
        );
    }
    wp_redirect(wc_get_checkout_url());
    exit;
});
```

### Step 2.6 — Add Products to WooCommerce

Add at least 10–20 test products to the India store. Include:
- Simple products
- Variable products (with size/color variations)
- Multiple categories

### Step 2.7 — Test the API

```bash
# Test India store API (replace with your actual values)
curl "https://luxtronics.luxtronics.in/wp-json/wc/v3/products?per_page=5" \
  -u "ck_your_key:cs_your_secret"

# Should return JSON array of products
```

---

## Phase 3 — Firebase Setup

### Step 3.1 — Enable Authentication

In Firebase Console → your project:
1. Click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - Add your project's support email
5. Under "Authorized domains", add:
   - `luxtronics.in`
   - `luxtronics.com.au`
   - `luxtronics.co.nz`
   - `localhost` (for dev)

### Step 3.2 — Create Firestore Database

1. Firebase Console → "Firestore Database" → "Create database"
2. Choose **Production mode**
3. Select region: `asia-south1` (Mumbai, good for India) or closest to your users
4. Click "Enable"

### Step 3.3 — Set Firestore Security Rules

In Firestore → Rules tab, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products and categories — public read
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;
    }
    match /sync_status/{docId} {
      allow read: if true;
      allow write: if false;
    }
    // Users — authenticated read/write own data only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publish".

### Step 3.4 — Get Web App Config

1. Firebase Console → Project Settings (gear icon) → "Your apps"
2. Click "Add app" → Web icon (`</>`)
3. Register app name: `luxtronics-web`
4. Copy the config object — you need all 6 values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "luxtronics-prod.firebaseapp.com",
  projectId: "luxtronics-prod",
  storageBucket: "luxtronics-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3.5 — Get Service Account Key (for backend sync)

1. Firebase Console → Project Settings → "Service accounts" tab
2. Click "Generate new private key"
3. Save the downloaded JSON file as `firebase-service-account.json`
4. **Never commit this file** — add it to `.gitignore`
5. You will add its contents as a GitHub secret later

---

## Phase 4 — MongoDB Atlas Setup

### Step 4.1 — Create the Database

1. In MongoDB Atlas, click your cluster → "Browse Collections"
2. Click "Add My Own Data"
3. Database name: `luxtronics`
4. Collection name: `products`
5. Click "Create"

The sync script will create all other collections automatically.

### Step 4.2 — Get Connection String

1. Atlas → Clusters → "Connect" → "Connect your application"
2. Driver: Node.js, Version: 5.5 or later
3. Copy the connection string:
   ```
   mongodb+srv://luxtronics:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database user password

### Step 4.3 — Whitelist Your IP

For production, add your server's IP address:
1. Atlas → Network Access → Add IP Address
2. Add your Hostinger server IP
3. For development, add your local IP or use `0.0.0.0/0` temporarily

---

## Phase 5 — Scaffold the Project

### Step 5.1 — Create the Vite + React + TypeScript Project

```bash
# Create project with Vite
npm create vite@latest luxtronics -- --template react-ts
cd luxtronics

# Initialize git
git init
git remote add origin https://github.com/yourusername/luxtronics.git
```

### Step 5.2 — Create the Folder Structure

```bash
# Frontend structure
mkdir -p frontend/src/{api,assets,components/ui,config,context,data,hooks,lib,pages,services,test}
mkdir -p frontend/public

# Backend structure
mkdir -p backend/server/{db,middleware,models,routes,services}
mkdir -p backend/scripts

# Scripts and docs
mkdir -p scripts docs .github/workflows
```

### Step 5.3 — Move Vite Files to frontend/

Vite creates files in the root. Move them:

```bash
# Move src/ and index.html into frontend/
mv src frontend/
mv index.html frontend/
mv public/* frontend/public/
```

### Step 5.4 — Update vite.config.ts

```typescript
// vite.config.ts (root)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
    },
  },
})
```

### Step 5.5 — Create tsconfig Files

```json
// tsconfig.json (root)
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["frontend/src/*"]
    }
  },
  "include": ["frontend/src"]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "backend/**/*.ts", "scripts/**/*.mjs"]
}
```

---

## Phase 6 — Install All Dependencies

### Step 6.1 — Root package.json

Create `package.json` at the root:

```json
{
  "name": "luxtronics",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node scripts/dev.mjs",
    "dev:client": "vite",
    "dev:server": "tsx watch backend/server/index.ts",
    "build": "vite build && rm -rf build && cp -R dist build",
    "start": "node server.js",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "sync:products": "tsx backend/scripts/sync-products.ts",
    "sync:full": "tsx backend/scripts/sync-full.ts",
    "deploy": "npm run build && bash backend/scripts/deploy.sh"
  }
}
```

### Step 6.2 — Install Frontend Dependencies

```bash
# Core React + routing + state
npm install react react-dom react-router-dom
npm install @tanstack/react-query

# UI framework
npm install tailwindcss postcss autoprefixer
npm install tailwind-merge tailwindcss-animate
npm install class-variance-authority clsx

# Radix UI primitives (shadcn/ui uses these)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar @radix-ui/react-checkbox
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-navigation-menu
npm install @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area
npm install @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slider @radix-ui/react-slot
npm install @radix-ui/react-switch @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-toggle
npm install @radix-ui/react-toggle-group @radix-ui/react-tooltip
npm install @radix-ui/react-collapsible @radix-ui/react-hover-card
npm install @radix-ui/react-menubar @radix-ui/react-context-menu
npm install @radix-ui/react-aspect-ratio

# Animations and UI extras
npm install framer-motion
npm install embla-carousel-react
npm install lucide-react
npm install sonner
npm install next-themes
npm install cmdk
npm install vaul
npm install input-otp
npm install react-resizable-panels
npm install react-day-picker date-fns
npm install recharts

# Forms
npm install react-hook-form @hookform/resolvers zod

# Firebase
npm install firebase

# Backend (also used in frontend for types)
npm install express cors helmet express-rate-limit
npm install mongodb
npm install dotenv
npm install axios
npm install dompurify
npm install tsx

# Dev dependencies
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D @vitejs/plugin-react-swc vite
npm install -D eslint @eslint/js typescript-eslint
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh globals
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @tailwindcss/typography
npm install -D @types/cors @types/express @types/dompurify
npm install -D nodemon ts-node
```

### Step 6.3 — Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './frontend/index.html',
    './frontend/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

### Step 6.4 — Set Up shadcn/ui

shadcn/ui is a collection of copy-paste components built on Radix UI. Initialize it:

```bash
npx shadcn-ui@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

This creates `components.json` and adds CSS variables to `frontend/src/index.css`.

Then add the components you need:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add toaster
npx shadcn-ui@latest add sonner
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add command
```

---

## Phase 7 — Environment Variables

### Step 7.1 — Create .env.example

```bash
# frontend/.env.example (commit this — no real values)

# ── Firebase Auth ────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ── Admin access ─────────────────────────────────────────────────
VITE_ADMIN_EMAILS=admin@luxtronics.in

# ── WooCommerce — India ──────────────────────────────────────────
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_your_key
VITE_WOOCOMMERCE_SECRET_INDIA=cs_your_secret

# ── WooCommerce — Australia ──────────────────────────────────────
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_AUSTRALIA=ck_your_key
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=cs_your_secret

# ── WooCommerce — New Zealand ────────────────────────────────────
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_NEWZEALAND=ck_your_key
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=cs_your_secret

# ── MongoDB ──────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DB_NAME=luxtronics

# ── Backend ──────────────────────────────────────────────────────
PORT=3001
CORS_ORIGIN=https://luxtronics.in,https://luxtronics.com.au,https://luxtronics.co.nz
SYNC_TOKEN=your_secret_sync_token

# ── Hostinger FTP ────────────────────────────────────────────────
FTP_HOST=ftp.luxtronics.in
FTP_USER=your_ftp_user
FTP_PASS=your_ftp_pass
FTP_REMOTE_DIR=/public_html
```

### Step 7.2 — Create .env (fill in real values)

Copy `.env.example` to `.env` and fill in all real values from the accounts you created.

```bash
cp .env.example .env
# Now edit .env with your real credentials
```

### Step 7.3 — Create per-region .env files

```bash
# .env.india — used when building/deploying India store
VITE_WOOCOMMERCE_URL_INDIA=https://luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_INDIA=ck_india_key
VITE_WOOCOMMERCE_SECRET_INDIA=cs_india_secret
```

```bash
# .env.australia
VITE_WOOCOMMERCE_URL_AUSTRALIA=https://storeau.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_AUSTRALIA=ck_au_key
VITE_WOOCOMMERCE_SECRET_AUSTRALIA=cs_au_secret
```

```bash
# .env.newzealand
VITE_WOOCOMMERCE_URL_NEWZEALAND=https://storenz.luxtronics.luxtronics.in
VITE_WOOCOMMERCE_KEY_NEWZEALAND=ck_nz_key
VITE_WOOCOMMERCE_SECRET_NEWZEALAND=cs_nz_secret
```

### Step 7.4 — Update .gitignore

```bash
# .gitignore
node_modules/
dist/
build/
.env
.env.local
.env.india
.env.australia
.env.newzealand
firebase-service-account.json
*.log
.DS_Store
```

---

## Phase 8 — Multi-Store Config (storeConfig.ts)

This is the heart of the multi-domain system. Create `frontend/src/config/storeConfig.ts`:

```typescript
// frontend/src/config/storeConfig.ts

export interface StoreConfig {
  currency: string;      // 'INR' | 'AUD' | 'NZD'
  symbol: string;        // '₹' | 'A$' | 'NZ$'
  country: string;       // 'IN' | 'AU' | 'NZ'
  label: string;         // 'India' | 'Australia' | 'New Zealand'
  apiUrl: string;        // WooCommerce REST API base URL
}

// Map each hostname to its store config
const STORE_CONFIG: Record<string, StoreConfig> = {
  // India
  'luxtronics.in': {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.in': {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  // Australia
  'luxtronics.com.au': {
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.com.au': {
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  // New Zealand
  'luxtronics.co.nz': {
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.co.nz': {
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
};

// Detect hostname — fallback to India store on localhost
const hostname = typeof window !== 'undefined'
  ? window.location.hostname
  : 'luxtronics.in';

export const storeConfig: StoreConfig =
  STORE_CONFIG[hostname] ?? STORE_CONFIG['luxtronics.in'];

// Convenience export for backward compatibility
export const API_URL = storeConfig.apiUrl;
```

**How to add a new store:**
1. Add a new entry to `STORE_CONFIG` with the domain as key
2. Add the WooCommerce credentials to `.env`
3. Add the credential case to `getStoreCredentials()` in `store-api.ts`

---

## Phase 9 — React Contexts

Create all 5 context providers. These wrap the entire app and provide global state.

### Step 9.1 — ThemeContext

```typescript
// frontend/src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage on init
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    // Apply theme class to <html>
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### Step 9.2 — StoreContext

```typescript
// frontend/src/context/StoreContext.tsx
import { createContext, useContext } from 'react';
import { storeConfig, StoreConfig } from '@/config/storeConfig';

const StoreContext = createContext<StoreConfig>(storeConfig);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // storeConfig is determined at module load time from window.location.hostname
  // No state needed — it never changes during a session
  return (
    <StoreContext.Provider value={storeConfig}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
```

### Step 9.3 — AuthContext

```typescript
// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### Step 9.4 — CartContext

```typescript
// frontend/src/context/CartContext.tsx
import { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: number;
  variationId?: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  selectedAttributes?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, (init) => {
    // Persist cart in localStorage
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      ...state,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
      updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

### Step 9.5 — CurrencyContext

```typescript
// frontend/src/context/CurrencyContext.tsx
import { createContext, useContext } from 'react';
import { useStore } from './StoreContext';

interface CurrencyContextType {
  currency: string;
  symbol: string;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { currency, symbol } = useStore();

  const formatPrice = (amount: number) => {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
```

---

## Phase 10 — Frontend Services Layer

### Step 10.1 — Firebase Initialization

```typescript
// frontend/src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate initialization
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export default app;
```

```typescript
// frontend/src/lib/firebase-config.ts  (Firestore instance)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().find(a => a.name === 'products')
  || initializeApp(firebaseConfig, 'products');

export const db = getFirestore(app);
export default db;
```

### Step 10.2 — Firebase Products Service

```typescript
// frontend/src/services/firebase-products.ts
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

// Cache availability check result for 5 minutes
let firebaseAvailable: boolean | null = null;
let lastCheck = 0;

export async function checkFirebaseAvailability(): Promise<boolean> {
  const now = Date.now();
  if (firebaseAvailable !== null && now - lastCheck < 5 * 60 * 1000) {
    return firebaseAvailable;
  }
  try {
    const syncRef = doc(db, 'sync_status', 'latest');
    await getDoc(syncRef);
    firebaseAvailable = true;
  } catch {
    firebaseAvailable = false;
  }
  lastCheck = now;
  return firebaseAvailable;
}

export async function fetchProductsFromFirebase(
  page = 1,
  perPage = 100,
  search?: string
): Promise<any[]> {
  const productsRef = collection(db, 'products');
  let q = query(productsRef, orderBy('syncedAt', 'desc'), limit(perPage));

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const lower = search.toLowerCase();
    return products.filter(p =>
      p.name?.toLowerCase().includes(lower) ||
      p.searchText?.includes(lower)
    );
  }

  return products;
}

export async function fetchProductFromFirebase(slug: string): Promise<any | null> {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
}

export async function fetchCategoriesFromFirebase(): Promise<any[]> {
  const categoriesRef = collection(db, 'categories');
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchProductsInFirebase(searchQuery: string): Promise<any[]> {
  const products = await fetchProductsFromFirebase(1, 200);
  const lower = searchQuery.toLowerCase();
  return products.filter(p =>
    p.name?.toLowerCase().includes(lower) ||
    p.searchText?.includes(lower)
  );
}
```

### Step 10.3 — Store API Service

This is the main data-fetching layer. It tries Firebase first, falls back to WooCommerce:

```typescript
// frontend/src/services/store-api.ts
import { storeConfig } from '@/config/storeConfig';
import {
  fetchProductsFromFirebase,
  fetchProductFromFirebase,
  fetchCategoriesFromFirebase,
  searchProductsInFirebase,
  checkFirebaseAvailability,
} from './firebase-products';

// Get WooCommerce credentials for the active store
function getStoreCredentials() {
  switch (storeConfig.country) {
    case 'IN':
      return {
        key: import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA || '',
        secret: import.meta.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
      };
    case 'AU':
      return {
        key: import.meta.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA || '',
        secret: import.meta.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || '',
      };
    case 'NZ':
      return {
        key: import.meta.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND || '',
        secret: import.meta.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || '',
      };
    default:
      return {
        key: import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA || '',
        secret: import.meta.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
      };
  }
}

function makeAuthHeader() {
  const { key, secret } = getStoreCredentials();
  return 'Basic ' + btoa(`${key}:${secret}`);
}

export async function fetchStoreProducts(
  page = 1,
  perPage = 100,
  search?: string
): Promise<any[]> {
  // 1. Try Firebase (fast)
  try {
    if (await checkFirebaseAvailability()) {
      const products = await fetchProductsFromFirebase(page, perPage, search);
      if (products.length > 0) return products;
    }
  } catch (e) {
    console.warn('Firebase failed, falling back to WooCommerce', e);
  }

  // 2. Fallback: WooCommerce REST API
  const { apiUrl } = storeConfig;
  const authHeader = makeAuthHeader();
  let url = `${apiUrl}/products?per_page=${Math.min(perPage, 100)}&page=${page}&status=publish`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetch(url, {
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`WooCommerce error: ${res.status}`);
  return res.json();
}

export async function fetchStoreProduct(slug: string): Promise<any | null> {
  // 1. Try Firebase
  try {
    if (await checkFirebaseAvailability()) {
      const product = await fetchProductFromFirebase(slug);
      if (product) return product;
    }
  } catch (e) {
    console.warn('Firebase failed', e);
  }

  // 2. Fallback: WooCommerce
  const { apiUrl } = storeConfig;
  const authHeader = makeAuthHeader();
  const url = `${apiUrl}/products?slug=${encodeURIComponent(slug)}&per_page=1&status=publish`;
  const res = await fetch(url, { headers: { Authorization: authHeader } });
  if (!res.ok) return null;
  const products = await res.json();
  return Array.isArray(products) && products.length > 0 ? products[0] : null;
}

export async function fetchStoreCategories(page = 1, perPage = 20) {
  // 1. Try Firebase
  try {
    if (await checkFirebaseAvailability()) {
      const categories = await fetchCategoriesFromFirebase();
      if (categories.length > 0) {
        return { data: categories, pagination: { page: 1, perPage: categories.length, total: categories.length, totalPages: 1 } };
      }
    }
  } catch (e) {
    console.warn('Firebase failed', e);
  }

  // 2. Fallback: WooCommerce
  const { apiUrl } = storeConfig;
  const authHeader = makeAuthHeader();
  const url = `${apiUrl}/products/categories?page=${page}&per_page=${perPage}&hide_empty=false`;
  const res = await fetch(url, { headers: { Authorization: authHeader } });
  if (!res.ok) throw new Error(`WooCommerce categories error: ${res.status}`);
  const data = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
  return { data, pagination: { page, perPage, total, totalPages } };
}

export async function fetchSearchSuggestions(query: string): Promise<any[]> {
  if (!query || query.length < 2) return [];
  try {
    if (await checkFirebaseAvailability()) {
      const results = await searchProductsInFirebase(query);
      if (results.length > 0) return results.slice(0, 5);
    }
  } catch (e) {
    console.warn('Firebase search failed', e);
  }
  const { apiUrl } = storeConfig;
  const authHeader = makeAuthHeader();
  const url = `${apiUrl}/products?search=${encodeURIComponent(query)}&per_page=5&status=publish`;
  const res = await fetch(url, { headers: { Authorization: authHeader } });
  if (!res.ok) return [];
  return res.json();
}
```

### Step 10.4 — Checkout Service

```typescript
// frontend/src/lib/woo-checkout.ts
import { storeConfig } from '@/config/storeConfig';

export interface CheckoutItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

export function redirectToWooCheckout(items: CheckoutItem[]) {
  // Build the WooCommerce base URL from the API URL
  const wooBase = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');

  // Encode cart items as JSON in URL parameter
  const cartParam = encodeURIComponent(JSON.stringify(items));
  const checkoutUrl = `${wooBase}/?lux_cart=${cartParam}`;

  window.location.href = checkoutUrl;
}
```

---

## Phase 11 — Frontend Components

### Step 11.1 — App Entry Point

```typescript
// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 11.2 — App.tsx (Root Component)

```typescript
// frontend/src/App.tsx
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

// Eager load critical pages (above the fold)
import Index from './pages/Index';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import GeoRedirectPopup from './components/GeoRedirectPopup';

// Lazy load everything else
const Categories = lazy(() => import('./pages/Categories'));
const Cart = lazy(() => import('./pages/Cart'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const AccountLogin = lazy(() => import('./pages/AccountLogin'));
const AccountRegister = lazy(() => import('./pages/AccountRegister'));
const AccountDashboard = lazy(() => import('./pages/AccountDashboard'));
const AccountOrders = lazy(() => import('./pages/AccountOrders'));
const AccountProfile = lazy(() => import('./pages/AccountProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminGuard = lazy(() => import('./components/AdminGuard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <GeoRedirectPopup />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/shipping-returns" element={<ShippingReturns />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/account" element={<AccountDashboard />} />
                        <Route path="/account/login" element={<AccountLogin />} />
                        <Route path="/account/register" element={<AccountRegister />} />
                        <Route path="/account/orders" element={<AccountOrders />} />
                        <Route path="/account/profile" element={<AccountProfile />} />
                        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                        <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
```

### Step 11.3 — Key Custom Hooks

```typescript
// frontend/src/hooks/use-woo-products.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchStoreProducts, fetchStoreProduct, fetchStoreCategories } from '@/services/store-api';

export function useProducts(page = 1, perPage = 50, search?: string) {
  return useQuery({
    queryKey: ['products', page, perPage, search],
    queryFn: () => fetchStoreProducts(page, perPage, search),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchStoreProduct(slug),
    enabled: !!slug,
  });
}

export function useCategories(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['categories', page, perPage],
    queryFn: () => fetchStoreCategories(page, perPage),
    staleTime: 10 * 60 * 1000,
  });
}

export function useInfiniteProducts(perPage = 50, search?: string) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', perPage, search],
    queryFn: ({ pageParam = 1 }) => fetchStoreProducts(pageParam, perPage, search),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < perPage) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}
```

```typescript
// frontend/src/hooks/use-lazy-products.ts
import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteProducts } from './use-woo-products';

export function useLazyProducts(perPage = 50, search?: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts(perPage, search);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const products = data?.pages.flat() ?? [];

  return { products, sentinelRef, isLoading, isFetchingNextPage, hasNextPage };
}
```

### Step 11.4 — AdminGuard Component

```typescript
// frontend/src/components/AdminGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase());

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return <Navigate to="/account/login" replace />;
  }

  return <>{children}</>;
}
```

### Step 11.5 — GeoRedirectPopup Component

```typescript
// frontend/src/components/GeoRedirectPopup.tsx
import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

const DOMAIN_MAP: Record<string, string> = {
  IN: 'https://luxtronics.in',
  AU: 'https://luxtronics.com.au',
  NZ: 'https://luxtronics.co.nz',
};

export default function GeoRedirectPopup() {
  const { country } = useStore();
  const [show, setShow] = useState(false);
  const [suggestedDomain, setSuggestedDomain] = useState('');

  useEffect(() => {
    // Only show if user is on wrong domain
    const dismissed = sessionStorage.getItem('geo-dismissed');
    if (dismissed) return;

    // Use Intl to detect timezone/locale
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let detectedCountry = 'IN';
    if (tz.includes('Australia')) detectedCountry = 'AU';
    if (tz.includes('Pacific/Auckland') || tz.includes('NZ')) detectedCountry = 'NZ';

    if (detectedCountry !== country && DOMAIN_MAP[detectedCountry]) {
      setSuggestedDomain(DOMAIN_MAP[detectedCountry]);
      setShow(true);
    }
  }, [country]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-lg p-4 shadow-lg max-w-sm">
      <p className="text-sm mb-3">
        It looks like you might be in a different region. Visit your local store for prices in your currency.
      </p>
      <div className="flex gap-2">
        <a
          href={suggestedDomain}
          className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm"
        >
          Go to {suggestedDomain.replace('https://', '')}
        </a>
        <button
          onClick={() => {
            setShow(false);
            sessionStorage.setItem('geo-dismissed', '1');
          }}
          className="px-3 py-1.5 rounded text-sm border"
        >
          Stay here
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 12 — Pages & Routing

### Step 12.1 — Homepage (Index.tsx)

The homepage assembles multiple section components:

```typescript
// frontend/src/pages/Index.tsx
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import CategoryStrip from '@/components/CategoryStrip';
import DealsBanner from '@/components/DealsBanner';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import TrustBadges from '@/components/TrustBadges';
import Newsletter from '@/components/Newsletter';
import SEO from '@/components/SEO';

export default function Index() {
  return (
    <Layout>
      <SEO
        title="Luxtronics — Premium Electronics"
        description="Shop the latest electronics at the best prices."
      />
      <Hero />
      <BrandMarquee />
      <CategoryStrip />
      <DealsBanner />
      <FeaturedProducts />
      <TrustBadges />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
}
```

### Step 12.2 — Shop Page (Shop.tsx)

```typescript
// frontend/src/pages/Shop.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import OptimizedShop from '@/components/OptimizedShop';
import SEO from '@/components/SEO';

export default function Shop() {
  return (
    <Layout>
      <SEO title="Shop — Luxtronics" description="Browse all electronics" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shop</h1>
        <OptimizedShop />
      </div>
    </Layout>
  );
}
```

### Step 12.3 — OptimizedShop Component (Infinite Scroll)

```typescript
// frontend/src/components/OptimizedShop.tsx
import { useState } from 'react';
import { useLazyProducts } from '@/hooks/use-lazy-products';
import ProductCard from './ProductCard';
import LoadingSkeleton from './LoadingSkeleton';

export default function OptimizedShop() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { products, sentinelRef, isLoading, isFetchingNextPage } =
    useLazyProducts(50, debouncedSearch || undefined);

  // Debounce search input
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        value={search}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-md border rounded-lg px-4 py-2 mb-6"
      />

      {/* Product grid */}
      {isLoading ? (
        <LoadingSkeleton count={12} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} product={product} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-8">
        {isFetchingNextPage && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        )}
      </div>
    </div>
  );
}
```

### Step 12.4 — ProductDetail Page

```typescript
// frontend/src/pages/ProductDetail.tsx
import { useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/use-woo-products';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { redirectToWooCheckout } from '@/lib/woo-checkout';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug!);
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!product) return <Layout><div className="p-8">Product not found</div></Layout>;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${product.slug}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.src || '',
      quantity: 1,
      slug: product.slug,
    });
  };

  const handleBuyNow = () => {
    redirectToWooCheckout([{ product_id: product.id, quantity: 1 }]);
  };

  return (
    <Layout>
      <SEO title={product.name} description={product.short_description || product.description} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <img
              src={product.images?.[0]?.src}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">
              {formatPrice(parseFloat(product.price))}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-primary text-primary px-6 py-3 rounded-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

### Step 12.5 — SEO Component

```typescript
// frontend/src/components/SEO.tsx
import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) {
      setMeta('description', description);
      setOG('og:description', description);
    }
    setOG('og:title', title);
    if (image) setOG('og:image', image);
    if (url) setOG('og:url', url);
  }, [title, description, image, url]);

  return null;
}
```

---

## Phase 13 — Express Backend

### Step 13.1 — MongoDB Connection Module

```typescript
// backend/server/db/mongodb.ts
import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function initializeMongoDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'luxtronics';

  if (!uri) throw new Error('MONGODB_URI not set in environment');

  client = new MongoClient(uri, {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });

  await client.connect();
  await client.db('admin').command({ ping: 1 }); // verify connection
  db = client.db(dbName);

  // Create indexes
  await createIndexes(db);

  console.log('✅ MongoDB connected');
  return db;
}

async function createIndexes(db: Db) {
  const products = db.collection('products');
  await Promise.all([
    products.createIndex({ id: 1 }, { unique: true }),
    products.createIndex({ slug: 1 }),
    products.createIndex({ 'categories.slug': 1 }),
    products.createIndex({ price: 1 }),
    products.createIndex({ rating: -1 }),
    products.createIndex({ name: 'text', description: 'text', searchText: 'text' }),
  ]);

  const categories = db.collection('categories');
  await categories.createIndex({ slug: 1 }, { unique: true });

  const cache = db.collection('cache_metadata');
  await cache.createIndex({ key: 1 }, { unique: true });
  await cache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

  console.log('✅ Indexes created');
}

export async function disconnectMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
```

### Step 13.2 — Security Middleware

```typescript
// backend/server/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false,
});

// Rate limiter: 100 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Sanitize request body — strip dangerous HTML
export function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Basic sanitization — remove script tags
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
}
```

### Step 13.3 — Express Server Entry Point

```typescript
// backend/server/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { initializeMongoDB } from './db/mongodb';
import { createProductDocument } from './models/mongo-models';
import { globalRateLimiter, sanitizeRequestBody, securityHeaders } from './middleware/security';

// Load .env from project root
const __selfDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__selfDir, '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

// WooCommerce credential helpers (read at call-time, never stale)
const wooUrl = () => process.env.VITE_WOOCOMMERCE_URL_INDIA || process.env.VITE_WOOCOMMERCE_URL || '';
const wooKey = () => process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY || '';
const wooSecret = () => process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET || '';
const wooAuth = () => 'Basic ' + Buffer.from(`${wooKey()}:${wooSecret()}`).toString('base64');

async function wooFetch(endpoint: string) {
  const res = await fetch(`${wooUrl()}/wp-json/wc/v3/${endpoint}`, {
    headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`WooCommerce ${res.status}: ${await res.text()}`);
  return res.json();
}

async function setupServer() {
  const port = parseInt(process.env.PORT || '3001');
  const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());

  const app = express();
  app.set('trust proxy', 1);

  // Middleware
  app.use(securityHeaders);
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(sanitizeRequestBody);
  app.use(cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  }));

  // State
  let mongoReady = false;
  let productService: any = null;

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  app.get('/api/status', (_req, res) => res.json({
    success: true,
    mongoReady,
    source: mongoReady ? 'mongodb' : 'woocommerce',
    wooConfigured: !!(wooUrl() && wooKey() && wooSecret()),
  }));

  // GET /api/products
  app.get('/api/products', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 50;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    // Try MongoDB first
    if (mongoReady && productService) {
      try {
        const result = search
          ? await productService.searchProducts(search, page, perPage)
          : category
          ? await productService.getProductsByCategory(category, page, perPage)
          : await productService.getProducts(page, perPage);

        res.set('Cache-Control', 'public, max-age=3600');
        return res.json({
          success: true,
          data: result.products,
          pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) },
          source: 'mongodb',
        });
      } catch (err) {
        console.error('MongoDB error, falling back:', err);
      }
    }

    // WooCommerce fallback
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage), status: 'publish' });
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products?${params}`, {
        headers: { Authorization: wooAuth() },
      });
      if (!response.ok) throw new Error(`WooCommerce ${response.status}`);

      const items = await response.json();
      const total = parseInt(response.headers.get('X-WP-Total') || '0');
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

      res.set('Cache-Control', 'public, max-age=300');
      return res.json({
        success: true,
        data: items,
        pagination: { page, perPage, total, totalPages },
        source: 'woocommerce',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(503).json({ success: false, error: 'Unable to load products', details: msg });
    }
  });

  // GET /api/products/slug/:slug
  app.get('/api/products/slug/:slug', async (req, res) => {
    const { slug } = req.params;
    if (mongoReady && productService) {
      try {
        const product = await productService.getProductBySlug(slug);
        if (product) return res.json({ success: true, data: product, source: 'mongodb' });
      } catch {}
    }
    try {
      const params = new URLSearchParams({ slug, per_page: '1', status: 'publish' });
      const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products?${params}`, {
        headers: { Authorization: wooAuth() },
      });
      const items = await response.json();
      if (!items[0]) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: items[0], source: 'woocommerce' });
    } catch (err) {
      return res.status(503).json({ success: false, error: 'Unable to load product' });
    }
  });

  // GET /api/categories
  app.get('/api/categories', async (_req, res) => {
    try {
      const response = await fetch(
        `${wooUrl()}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`,
        { headers: { Authorization: wooAuth() } }
      );
      if (!response.ok) throw new Error(`WooCommerce ${response.status}`);
      const data = await response.json();
      res.set('Cache-Control', 'public, max-age=1800');
      return res.json({ success: true, data, source: 'woocommerce' });
    } catch (err) {
      return res.status(503).json({ success: false, error: 'Unable to load categories' });
    }
  });

  // POST /api/sync (protected)
  app.post('/api/sync', async (req, res) => {
    if (req.headers['x-sync-token'] !== process.env.SYNC_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!mongoReady) return res.status(503).json({ success: false, error: 'MongoDB not ready' });

    const { initializeMongoDB } = await import('./db/mongodb');
    const WooCommerceSync = (await import('./services/woocommerce-sync')).default;
    const db = await initializeMongoDB();
    const syncService = new WooCommerceSync(db);
    syncService.fullSync().catch(console.error);

    return res.json({ success: true, message: 'Sync started in background' });
  });

  // Start server
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  // Initialize MongoDB asynchronously (non-blocking)
  (async () => {
    try {
      const db = await initializeMongoDB();
      const { ProductService } = await import('./services/product-service');
      productService = new ProductService(db);
      mongoReady = true;
      console.log('✅ MongoDB ready');
    } catch (err) {
      console.error('⚠️ MongoDB unavailable, using WooCommerce fallback:', err);
    }
  })();

  // Serve frontend in production
  const distPath = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'build'),
  ].find(p => existsSync(path.join(p, 'index.html')));

  if (distPath) {
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupServer().catch(console.error);
```

---

## Phase 14 — MongoDB Models & Services

### Step 14.1 — Product Service

```typescript
// backend/server/services/product-service.ts
import { Db, Collection } from 'mongodb';
import { MongoProduct, MongoCategory } from '../models/mongo-models';

export class ProductService {
  private products: Collection<MongoProduct>;
  private categories: Collection<MongoCategory>;

  constructor(db: Db) {
    this.products = db.collection<MongoProduct>('products');
    this.categories = db.collection<MongoCategory>('categories');
  }

  async getProducts(page = 1, perPage = 50) {
    const skip = (page - 1) * perPage;
    const [products, total] = await Promise.all([
      this.products.find({}).skip(skip).limit(perPage).toArray(),
      this.products.countDocuments(),
    ]);
    return { products, total };
  }

  async getProductById(id: number) {
    return this.products.findOne({ id });
  }

  async getProductBySlug(slug: string) {
    return this.products.findOne({ slug });
  }

  async searchProducts(query: string, page = 1, perPage = 50) {
    const skip = (page - 1) * perPage;
    const filter = { $text: { $search: query } };
    const [products, total] = await Promise.all([
      this.products.find(filter).skip(skip).limit(perPage).toArray(),
      this.products.countDocuments(filter),
    ]);
    return { products, total };
  }

  async getProductsByCategory(categorySlug: string, page = 1, perPage = 50) {
    const skip = (page - 1) * perPage;
    const filter = { 'categories.slug': categorySlug };
    const [products, total] = await Promise.all([
      this.products.find(filter).skip(skip).limit(perPage).toArray(),
      this.products.countDocuments(filter),
    ]);
    return { products, total };
  }

  async saveProducts(products: MongoProduct[]): Promise<number> {
    if (products.length === 0) return 0;
    const ops = products.map(p => ({
      updateOne: {
        filter: { id: p.id },
        update: { $set: p },
        upsert: true,
      },
    }));
    const result = await this.products.bulkWrite(ops, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }

  async saveCategories(categories: MongoCategory[]): Promise<number> {
    if (categories.length === 0) return 0;
    const ops = categories.map(c => ({
      updateOne: {
        filter: { id: c.id },
        update: { $set: c },
        upsert: true,
      },
    }));
    const result = await this.categories.bulkWrite(ops, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }

  async getAllCategoriesWithCount() {
    return this.categories.find({}).sort({ count: -1 }).toArray();
  }
}

export class CacheService {
  private cache: Collection;
  constructor(db: Db) {
    this.cache = db.collection('cache_metadata');
  }
  async set(key: string, ttlSeconds: number) {
    await this.cache.updateOne(
      { key },
      { $set: { key, lastUpdated: new Date(), expiresAt: new Date(Date.now() + ttlSeconds * 1000) } },
      { upsert: true }
    );
  }
  async isValid(key: string): Promise<boolean> {
    const doc = await this.cache.findOne({ key });
    return !!doc && doc.expiresAt > new Date();
  }
}
```

---

## Phase 15 — WooCommerce Sync Pipeline

### Step 15.1 — Sync Service

The sync service fetches all products from WooCommerce in batches of 100 and upserts them into MongoDB.

```typescript
// backend/server/services/woocommerce-sync.ts
import { Db } from 'mongodb';
import { ProductService } from './product-service';
import { createProductDocument, createCategoryDocument } from '../models/mongo-models';

export default class WooCommerceSync {
  private productService: ProductService;
  private db: Db;

  constructor(db: Db) {
    this.db = db;
    this.productService = new ProductService(db);
  }

  private get storeUrl() { return process.env.VITE_WOOCOMMERCE_URL_INDIA || ''; }
  private get key() { return process.env.VITE_WOOCOMMERCE_KEY_INDIA || ''; }
  private get secret() { return process.env.VITE_WOOCOMMERCE_SECRET_INDIA || ''; }
  private get auth() { return 'Basic ' + Buffer.from(`${this.key}:${this.secret}`).toString('base64'); }

  private async wooGet(endpoint: string) {
    const res = await fetch(`${this.storeUrl}/wp-json/wc/v3/${endpoint}`, {
      headers: { Authorization: this.auth },
    });
    if (!res.ok) throw new Error(`WooCommerce ${res.status}: ${await res.text()}`);
    return { data: await res.json(), headers: res.headers };
  }

  async syncProducts(options: { delay?: number; onProgress?: (n: number, total: number) => void } = {}) {
    const delay = options.delay ?? 500;
    let synced = 0;
    const errors: string[] = [];

    // Get total count
    const { headers } = await this.wooGet('products?per_page=1');
    const total = parseInt(headers.get('X-WP-Total') || '0');
    const totalPages = Math.ceil(total / 100);

    console.log(`Syncing ${total} products across ${totalPages} pages...`);

    for (let page = 1; page <= totalPages; page++) {
      try {
        const { data: products } = await this.wooGet(`products?per_page=100&page=${page}&orderby=date&order=asc`);

        const mongoDocs = await Promise.all(
          products.map(async (p: any) => {
            let variations: any[] = [];
            if (p.type === 'variable') {
              try {
                const { data } = await this.wooGet(`products/${p.id}/variations?per_page=100`);
                variations = data;
              } catch {}
            }
            return createProductDocument(p, variations);
          })
        );

        const saved = await this.productService.saveProducts(mongoDocs);
        synced += saved;
        options.onProgress?.(synced, total);
        console.log(`✅ Page ${page}/${totalPages}: ${saved} products (${synced}/${total})`);

        if (page < totalPages) await new Promise(r => setTimeout(r, delay));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Page ${page}: ${msg}`);
        console.error(`❌ Page ${page} failed:`, msg);
      }
    }

    return { synced, errors };
  }

  async syncCategories() {
    const { data: categories } = await this.wooGet('products/categories?per_page=100');
    const mongoDocs = categories.map(createCategoryDocument);
    const synced = await this.productService.saveCategories(mongoDocs);
    console.log(`✅ Synced ${synced} categories`);
    return { synced };
  }

  async fullSync(options = {}) {
    console.log('🔄 Starting full sync...');
    const products = await this.syncProducts(options);
    const categories = await this.syncCategories();
    console.log('✅ Full sync complete');
    return { products: products.synced, categories: categories.synced, errors: products.errors };
  }
}
```

### Step 15.2 — Sync CLI Script

```typescript
// backend/scripts/sync-full.ts
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  console.log('🔄 Full Sync: WooCommerce → MongoDB');
  const db = await initializeMongoDB();
  const sync = new WooCommerceSync(db);

  const result = await sync.fullSync({
    delay: 500,
    onProgress: (current, total) => {
      const pct = Math.round((current / total) * 100);
      process.stdout.write(`\r📊 ${pct}% (${current}/${total})`);
    },
  });

  console.log(`\n✅ Done: ${result.products} products, ${result.categories} categories`);
  if (result.errors.length > 0) {
    console.log('Errors:', result.errors);
  }

  await disconnectMongoDB();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
```

### Step 15.3 — Run the First Sync

```bash
# Make sure .env is filled in with real WooCommerce + MongoDB credentials
npm run sync:full

# You should see:
# 🔄 Full Sync: WooCommerce → MongoDB
# 📊 100% (500/500)
# ✅ Done: 500 products, 12 categories
```

---

## Phase 16 — Firebase Sync

### Step 16.1 — Firebase Admin SDK Setup

```bash
# Install firebase-admin in backend
cd backend
npm install firebase-admin
```

### Step 16.2 — Sync to Firebase Script

```typescript
// backend/scripts/sync-to-firebase.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  require('fs').readFileSync(path.resolve(__dirname, '../../firebase-service-account.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const firestoreDb = getFirestore();

async function syncToFirebase() {
  console.log('🔄 Syncing MongoDB → Firebase...');

  const db = await initializeMongoDB();
  const products = await db.collection('products').find({}).toArray();
  const categories = await db.collection('categories').find({}).toArray();

  // Batch write products (Firestore limit: 500 per batch)
  const BATCH_SIZE = 400;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = firestoreDb.batch();
    const chunk = products.slice(i, i + BATCH_SIZE);
    for (const product of chunk) {
      const { _id, ...data } = product;
      const ref = firestoreDb.collection('products').doc(String(product.id));
      batch.set(ref, data);
    }
    await batch.commit();
    console.log(`✅ Products batch ${Math.floor(i / BATCH_SIZE) + 1} committed`);
  }

  // Write categories
  const catBatch = firestoreDb.batch();
  for (const cat of categories) {
    const { _id, ...data } = cat;
    const ref = firestoreDb.collection('categories').doc(String(cat.id));
    catBatch.set(ref, data);
  }
  await catBatch.commit();

  // Update sync status
  await firestoreDb.collection('sync_status').doc('latest').set({
    lastSyncAt: new Date(),
    productCount: products.length,
    categoryCount: categories.length,
  });

  console.log(`✅ Firebase sync complete: ${products.length} products, ${categories.length} categories`);
  await disconnectMongoDB();
  process.exit(0);
}

syncToFirebase().catch(err => {
  console.error('❌ Firebase sync failed:', err);
  process.exit(1);
});
```

### Step 16.3 — Add Firebase Service Account to GitHub Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
4. Value: paste the entire contents of `firebase-service-account.json`
5. Add all other required secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_WOOCOMMERCE_URL_INDIA`
   - `VITE_WOOCOMMERCE_KEY_INDIA`
   - `VITE_WOOCOMMERCE_SECRET_INDIA`
   - `MONGODB_URI`

---

## Phase 17 — Admin Dashboard

### Step 17.1 — WooCommerce Proxy Routes

The admin dashboard needs to create/update/delete products. These operations go through the backend (so credentials are never in the browser):

```typescript
// backend/server/routes/woocommerce-proxy.ts
import { Router } from 'express';

export function createWooCommerceProxyRoutes() {
  const router = Router();

  const wooUrl = () => process.env.VITE_WOOCOMMERCE_URL_INDIA || '';
  const wooAuth = () => 'Basic ' + Buffer.from(
    `${process.env.VITE_WOOCOMMERCE_KEY_INDIA}:${process.env.VITE_WOOCOMMERCE_SECRET_INDIA}`
  ).toString('base64');

  // GET /api/woo/products
  router.get('/woo/products', async (req, res) => {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products?${params}`, {
      headers: { Authorization: wooAuth() },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  });

  // POST /api/woo/products
  router.post('/woo/products', async (req, res) => {
    const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products`, {
      method: 'POST',
      headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  });

  // PUT /api/woo/products/:id
  router.put('/woo/products/:id', async (req, res) => {
    const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products/${req.params.id}`, {
      method: 'PUT',
      headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  });

  // DELETE /api/woo/products/:id
  router.delete('/woo/products/:id', async (req, res) => {
    const response = await fetch(`${wooUrl()}/wp-json/wc/v3/products/${req.params.id}?force=true`, {
      method: 'DELETE',
      headers: { Authorization: wooAuth() },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  });

  return router;
}
```

### Step 17.2 — Admin Products Page

```typescript
// frontend/src/pages/AdminProducts.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function fetchAdminProducts() {
  const res = await fetch(`${BACKEND}/api/woo/products?per_page=50`);
  return res.json();
}

async function deleteProduct(id: number) {
  const res = await fetch(`${BACKEND}/api/woo/products/${id}`, { method: 'DELETE' });
  return res.json();
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchAdminProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.price}</td>
                  <td className="p-3">{p.stock_status}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
```

---

## Phase 18 — SEO, Sitemap & Analytics

### Step 18.1 — index.html Setup

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Default SEO (overridden per-page by SEO component) -->
    <title>Luxtronics — Premium Electronics</title>
    <meta name="description" content="Shop the latest electronics at the best prices." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Luxtronics" />

    <!-- Google Analytics (replace G-XXXXXXXX with your ID) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXX');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 18.2 — robots.txt

```
# frontend/public/robots.txt
User-agent: *
Allow: /

Sitemap: https://luxtronics.in/sitemap.xml
```

### Step 18.3 — sitemap.xml

```xml
<!-- frontend/public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://luxtronics.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://luxtronics.in/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://luxtronics.in/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://luxtronics.in/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://luxtronics.in/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Step 18.4 — site.webmanifest

```json
{
  "name": "Luxtronics",
  "short_name": "Luxtronics",
  "icons": [
    { "src": "/favicon.ico", "sizes": "64x64", "type": "image/x-icon" }
  ],
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/"
}
```

### Step 18.5 — .htaccess (SPA routing on Apache/Hostinger)

```apache
# frontend/public/.htaccess
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Step 18.6 — Google Analytics Setup

1. Go to https://analytics.google.com
2. Create a new property → Web
3. Enter your domain (`luxtronics.in`)
4. Copy the Measurement ID (`G-XXXXXXXXXX`)
5. Replace `G-XXXXXXXX` in `index.html` with your real ID
6. Verify by visiting your site and checking the GA Realtime report

---

## Phase 19 — Testing

### Step 19.1 — Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
    },
  },
});
```

```typescript
// frontend/src/test/setup.ts
import '@testing-library/jest-dom';
```

### Step 19.2 — Example Component Test

```typescript
// frontend/src/test/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from '@/components/ProductCard';

const mockProduct = {
  id: '1',
  slug: 'test-product',
  name: 'Test Headphones',
  price: 2999,
  image: 'https://example.com/image.jpg',
  images: ['https://example.com/image.jpg'],
  rating: 4.5,
  reviews: 120,
  category: 'Electronics',
  categories: [{ id: 1, name: 'Electronics', slug: 'electronics' }],
  description: 'Great headphones',
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Headphones')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/2999/)).toBeInTheDocument();
  });
});
```

### Step 19.3 — Test WooCommerce Connection

```typescript
// backend/scripts/test-woo-connection.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function test() {
  const url = process.env.VITE_WOOCOMMERCE_URL_INDIA;
  const key = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
  const secret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

  if (!url || !key || !secret) {
    console.error('❌ Missing WooCommerce credentials in .env');
    process.exit(1);
  }

  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await fetch(`${url}/wp-json/wc/v3/products?per_page=1`, {
    headers: { Authorization: auth },
  });

  if (!res.ok) {
    console.error(`❌ WooCommerce API error: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const products = await res.json();
  const total = res.headers.get('X-WP-Total');
  console.log(`✅ WooCommerce connected! Total products: ${total}`);
  console.log('First product:', products[0]?.name);
}

test().catch(console.error);
```

```bash
# Run the test
tsx backend/scripts/test-woo-connection.ts
```

### Step 19.4 — Run All Tests

```bash
npm run test
```

---

## Phase 20 — Build & Deploy to Hostinger

### Step 20.1 — Build the Frontend

```bash
# Build for production
npm run build

# This runs: vite build && cp -R dist build
# Output: dist/ and build/ folders
```

### Step 20.2 — Test the Build Locally

```bash
npm run preview
# Opens http://localhost:4173
# Test all pages, check products load, test checkout redirect
```

### Step 20.3 — Set Up Hostinger for Node.js

In Hostinger hPanel:
1. Go to "Websites" → your domain → "Manage"
2. Go to "Advanced" → "Node.js"
3. Enable Node.js
4. Set Node.js version: 18.x or higher
5. Set startup file: `server.js`
6. Set environment variables (all your `.env` values)

### Step 20.4 — Create Production server.js

```javascript
// server.js (root — plain JS for Hostinger compatibility)
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const BUILD_DIR = join(__dirname, 'build');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const server = createServer((req, res) => {
  let filePath = join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);

  // Remove query strings
  filePath = filePath.split('?')[0];

  if (!existsSync(filePath) || !extname(filePath)) {
    // SPA fallback — serve index.html for all routes
    filePath = join(BUILD_DIR, 'index.html');
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

> **Note:** For a full-stack deployment (frontend + Express backend), use the Express server from Phase 13 instead. It serves the static files AND handles API routes.

### Step 20.5 — Deploy via FTP

```bash
# Install lftp or use FileZilla
# Upload the build/ folder contents to /public_html on Hostinger

# Or use the deploy script:
bash backend/scripts/deploy.sh
```

Create `backend/scripts/deploy.sh`:

```bash
#!/bin/bash
# deploy.sh — Upload build to Hostinger via FTP

set -e

echo "🚀 Deploying to Hostinger..."

# Load FTP credentials from .env
source .env

# Upload using lftp
lftp -c "
  open -u $FTP_USER,$FTP_PASS $FTP_HOST
  mirror -R --delete --verbose build/ $FTP_REMOTE_DIR/
  quit
"

echo "✅ Deployment complete!"
```

### Step 20.6 — Multi-Domain Deployment

For each domain, you need to deploy the same build:

```bash
# Deploy to India
FTP_HOST=ftp.luxtronics.in FTP_REMOTE_DIR=/public_html bash backend/scripts/deploy.sh

# Deploy to Australia (different Hostinger account or addon domain)
FTP_HOST=ftp.luxtronics.com.au FTP_REMOTE_DIR=/public_html bash backend/scripts/deploy.sh

# Deploy to New Zealand
FTP_HOST=ftp.luxtronics.co.nz FTP_REMOTE_DIR=/public_html bash backend/scripts/deploy.sh
```

The same `build/` folder works for all 3 domains because `storeConfig.ts` detects the domain at runtime.

### Step 20.7 — Verify Deployment

After deploying, test each domain:

```bash
# Check India
curl https://luxtronics.in/

# Check Australia
curl https://luxtronics.com.au/

# Check New Zealand
curl https://luxtronics.co.nz/
```

Open each domain in a browser and verify:
- [ ] Homepage loads
- [ ] Products load (check network tab — should come from Firebase or WooCommerce)
- [ ] Currency shows correctly (₹ for India, A$ for Australia, NZ$ for NZ)
- [ ] Cart works
- [ ] Buy Now redirects to the correct WooCommerce store
- [ ] Login/register works
- [ ] Dark/light theme toggle works

---

## Phase 21 — CI/CD with GitHub Actions

### Step 21.1 — Firebase Sync Workflow

```yaml
# .github/workflows/sync-firebase.yml
name: Sync Products to Firebase

on:
  push:
    branches: [main]
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Create .env file
        run: |
          cat > .env << EOF
          VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID=${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_WOOCOMMERCE_URL_INDIA=${{ secrets.VITE_WOOCOMMERCE_URL_INDIA }}
          VITE_WOOCOMMERCE_KEY_INDIA=${{ secrets.VITE_WOOCOMMERCE_KEY_INDIA }}
          VITE_WOOCOMMERCE_SECRET_INDIA=${{ secrets.VITE_WOOCOMMERCE_SECRET_INDIA }}
          MONGODB_URI=${{ secrets.MONGODB_URI }}
          MONGODB_DB_NAME=luxtronics
          EOF

      - name: Create Firebase service account
        run: echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}' > firebase-service-account.json

      - name: Run MongoDB sync
        run: npm run sync:full

      - name: Sync to Firebase
        run: tsx backend/scripts/sync-to-firebase.ts

      - name: Cleanup
        if: always()
        run: rm -f .env firebase-service-account.json
```

### Step 21.2 — Build & Deploy Workflow (Optional)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - name: Create .env
        run: |
          echo "VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}" >> .env
          echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env
          # ... add all other env vars

      - name: Build
        run: npm run build

      - name: Deploy to Hostinger (India)
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_HOST_INDIA }}
          username: ${{ secrets.FTP_USER_INDIA }}
          password: ${{ secrets.FTP_PASS_INDIA }}
          local-dir: ./build/
          server-dir: /public_html/
```

---

## Phase 22 — Post-Deploy Checklist

### Step 22.1 — Functional Testing

Test every feature on every domain:

**Products**
- [ ] Homepage loads with products
- [ ] Shop page loads with infinite scroll
- [ ] Search works
- [ ] Category filter works
- [ ] Product detail page loads
- [ ] Product images load
- [ ] Variable product shows variant selector

**Cart & Checkout**
- [ ] Add to cart works
- [ ] Cart count updates in navbar
- [ ] Cart page shows items
- [ ] Buy Now redirects to correct WooCommerce store
- [ ] WooCommerce checkout loads with correct items

**Authentication**
- [ ] Register with email/password
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Logout works
- [ ] Account dashboard shows user info
- [ ] Order history loads from WooCommerce

**Multi-Domain**
- [ ] `luxtronics.in` shows ₹ prices
- [ ] `luxtronics.com.au` shows A$ prices
- [ ] `luxtronics.co.nz` shows NZ$ prices
- [ ] Geo-redirect popup appears on wrong domain

**Admin**
- [ ] `/admin` redirects non-admins to login
- [ ] Admin can view products
- [ ] Admin can delete a product

**SEO**
- [ ] Page titles are correct
- [ ] Meta descriptions are set
- [ ] sitemap.xml is accessible
- [ ] robots.txt is accessible

### Step 22.2 — Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test each domain
lighthouse https://luxtronics.in --output html --output-path ./lighthouse-india.html
lighthouse https://luxtronics.com.au --output html --output-path ./lighthouse-au.html
```

Target scores:
- Performance: 85+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Step 22.3 — Common Issues & Fixes

**Products not loading**
```
1. Check browser console for errors
2. Verify VITE_WOOCOMMERCE_KEY_INDIA is set in Hostinger env vars
3. Check WooCommerce CORS headers are added to functions.php
4. Test API directly: curl https://your-woo-store.com/wp-json/wc/v3/products -u "key:secret"
```

**Wrong currency on a domain**
```
1. Check storeConfig.ts has the correct domain entry
2. Rebuild: npm run build
3. Redeploy to that domain
```

**Checkout redirects to wrong store**
```
1. Check storeConfig.ts apiUrl for that domain
2. Verify woo-checkout.ts uses storeConfig.apiUrl
3. Rebuild and redeploy
```

**Firebase not loading products**
```
1. Check Firestore rules allow public reads on /products
2. Run npm run sync:full then tsx backend/scripts/sync-to-firebase.ts
3. Check Firebase console → Firestore → products collection has documents
```

**Admin dashboard not accessible**
```
1. Check VITE_ADMIN_EMAILS in .env includes your email
2. Rebuild after changing .env
3. Make sure you're logged in with that exact email
```

**CORS errors in browser**
```
1. Add your domain to the allowed origins in WooCommerce functions.php
2. Clear WordPress cache
3. Check the domain matches exactly (with/without www)
```

---

## Summary: The Complete Build Order

Here is the exact order to follow when building from scratch:

```
1.  Create all platform accounts (GitHub, Firebase, MongoDB, Hostinger)
2.  Install 3 WordPress + WooCommerce stores on subdomains
3.  Generate WooCommerce API keys for each store
4.  Add CORS headers and cart redirect snippet to each WordPress
5.  Set up Firebase project (Auth + Firestore)
6.  Set up MongoDB Atlas cluster
7.  Scaffold Vite + React + TypeScript project
8.  Install all npm dependencies
9.  Initialize Tailwind CSS and shadcn/ui
10. Create .env with all credentials
11. Build storeConfig.ts (domain → store mapping)
12. Build 5 React contexts (Theme, Store, Auth, Cart, Currency)
13. Build Firebase service files (firebase.ts, firebase-products.ts)
14. Build store-api.ts (Firebase-first, WooCommerce fallback)
15. Build woo-checkout.ts (cart redirect)
16. Build App.tsx with all providers and routes
17. Build all page components (Index, Shop, ProductDetail, etc.)
18. Build custom hooks (use-woo-products, use-lazy-products)
19. Build AdminGuard and GeoRedirectPopup
20. Build Express backend (index.ts, mongodb.ts, security.ts)
21. Build MongoDB models and ProductService
22. Build WooCommerceSync service
23. Run first sync: npm run sync:full
24. Build Firebase sync script and run it
25. Build admin proxy routes and AdminProducts page
26. Add SEO component, sitemap.xml, robots.txt, .htaccess
27. Write tests and run: npm run test
28. Build for production: npm run build
29. Test locally: npm run preview
30. Deploy to Hostinger via FTP
31. Set up GitHub Actions for automated sync
32. Run post-deploy checklist on all 3 domains
```

---

*This guide covers every platform, every file, and every step needed to build the Luxtronics architecture from scratch. Each phase builds on the previous one — follow them in order and you will have a fully working multi-region e-commerce platform.*
