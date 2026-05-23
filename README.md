# Luxtronics — Quadra Platform Architecture

> **A complete technical guide for developers** to build a multi-region, multi-domain electronics e-commerce platform using WooCommerce, Firebase, MongoDB, React, and Express — deployed on Hostinger.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Design — Quadra Platform](#3-system-design--quadra-platform)
4. [Prerequisites](#4-prerequisites)
5. [Project Structure](#5-project-structure)
6. [Step 1 — WooCommerce Setup](#6-step-1--woocommerce-setup)
7. [Step 2 — Firebase Setup](#7-step-2--firebase-setup)
8. [Step 3 — MongoDB Setup](#8-step-3--mongodb-setup)
9. [Step 4 — Environment Variables](#9-step-4--environment-variables)
10. [Step 5 — Frontend (React + Vite)](#10-step-5--frontend-react--vite)
11. [Step 6 — Backend (Express)](#11-step-6--backend-express)
12. [Step 7 — Data Sync Pipeline](#12-step-7--data-sync-pipeline)
13. [Step 8 — Multi-Store Domain Routing](#13-step-8--multi-store-domain-routing)
14. [Step 9 — Checkout Flow](#14-step-9--checkout-flow)
15. [Step 10 — Authentication](#15-step-10--authentication)
16. [Step 11 — CI/CD with GitHub Actions](#16-step-11--cicd-with-github-actions)
17. [Step 12 — Hostinger Deployment](#17-step-12--hostinger-deployment)
18. [Step 13 — Nginx (Static Deployment)](#18-step-13--nginx-static-deployment)
19. [Key Frontend Systems](#19-key-frontend-systems)
20. [Performance Architecture](#20-performance-architecture)
21. [SEO Architecture](#21-seo-architecture)
22. [Security](#22-security)
23. [Troubleshooting](#23-troubleshooting)
24. [Environment Variable Reference](#24-environment-variable-reference)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        QUADRA PLATFORM                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ luxtronics.in│  │luxtronics    │  │  luxtronics.co.nz        │  │
│  │   (India)    │  │  .com.au     │  │  (New Zealand)           │  │
│  │    INR ₹     │  │  (Australia) │  │    NZD NZ$               │  │
│  │              │  │   AUD A$     │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
│         └─────────────────┴────────────────────────┘                │
│                           │                                         │
│              ┌────────────▼────────────┐                            │
│              │   React SPA (same build)│                            │
│              │   storeConfig.ts reads  │                            │
│              │   window.location.host  │                            │
│              └────────────┬────────────┘                            │
│                           │                                         │
│         ┌─────────────────┼──────────────────┐                      │
│         ▼                 ▼                  ▼                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Firebase   │  │  Express.js  │  │  WooCommerce │               │
│  │  Firestore  │  │  Backend     │  │  REST API v3 │               │
│  │  (fast read)│  │  (MongoDB)   │  │  (source of  │               │
│  │             │  │              │  │   truth)     │               │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                │                 │                        │
│         └────────────────┴─────────────────┘                        │
│                    GitHub Actions                                    │
│              (sync WooCommerce → Firebase                           │
│               every 15 minutes)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Priority

```
Browser Request
      │
      ▼
checkFirebaseAvailability()  ──── cached 5 min ────►  Firestore
      │ (stale / unavailable)                         (10-30x faster)
      ▼
WooCommerce REST API  ◄──── Basic Auth (key:secret) ────
      │
      ▼
mapStoreProductToLocalProduct()
      │
      ▼
getMarketRating()  ──── if woo rating === 0 ────► brand/model lookup
      │
      ▼
React UI
```


---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 18.3 | UI framework |
| **Frontend** | TypeScript | 5.8 | Type safety |
| **Frontend** | Vite + SWC | 5.4 | Build tool (fast HMR) |
| **Frontend** | Tailwind CSS | 3.4 | Utility-first styling |
| **Frontend** | Framer Motion | 12 | Animations |
| **Frontend** | Radix UI | latest | Accessible primitives |
| **Frontend** | TanStack Query | 5 | Server state / caching |
| **Frontend** | React Router | 6 | Client-side routing |
| **Frontend** | Lucide React | 0.462 | Icons |
| **Frontend** | Sonner | 1.7 | Toast notifications |
| **Frontend** | DOMPurify | 3.4 | HTML sanitisation |
| **Backend** | Node.js | 18+ | Runtime |
| **Backend** | Express | 4.21 | HTTP server |
| **Backend** | TypeScript + tsx | 5.8 / 4.19 | Backend language |
| **Database** | MongoDB Atlas | 7 | Product cache / sync |
| **Database** | Firebase Firestore | 12 | Fast frontend reads |
| **Auth** | Firebase Auth | 12 | Email + Google OAuth |
| **Commerce** | WooCommerce | 8+ | Product/order management |
| **Commerce** | WordPress | 6+ | CMS backing WooCommerce |
| **CI/CD** | GitHub Actions | — | Automated sync pipeline |
| **Hosting** | Hostinger | — | Node.js + domain hosting |
| **Proxy** | Nginx | — | Static multi-domain serving |

---

## 3. System Design — Quadra Platform

The "Quadra" architecture means **one codebase, four layers, three storefronts**:

### Layer 1 — Storefront (React SPA)
A single compiled React application served on three domains. The app detects its domain at runtime via `window.location.hostname` and loads the correct store config (currency, WooCommerce API URL, credentials).

### Layer 2 — Fast Cache (Firebase Firestore)
Products are synced from WooCommerce into Firestore every 15 minutes via GitHub Actions. The frontend reads Firestore first — a full product catalogue loads in 200–500ms vs 3–8 seconds from WooCommerce directly. In-memory cache (30 min TTL) means subsequent page navigations are <1ms.

### Layer 3 — Persistent Cache (MongoDB)
The Express backend syncs WooCommerce products into MongoDB Atlas. This serves as a persistent cache for the API layer, enabling server-side filtering, search, and pagination without hitting WooCommerce on every request.

### Layer 4 — Source of Truth (WooCommerce)
Three separate WooCommerce installations (India, Australia, New Zealand) handle product management, inventory, orders, and payments. The React frontend redirects to WooCommerce for checkout — no custom payment processing needed.


---

## 4. Prerequisites

Before starting, you need accounts and installations for:

```bash
# Required software
node --version    # 18.x or higher
npm --version     # 9.x or higher
git --version     # any recent version

# Required accounts
# 1. Firebase (console.firebase.google.com)
# 2. MongoDB Atlas (cloud.mongodb.com)
# 3. Hostinger (hostinger.com) — for deployment
# 4. GitHub — for CI/CD
# 5. WordPress + WooCommerce hosting (can be Hostinger too)
```

### WooCommerce Requirements
- WordPress 6.0+ with WooCommerce 8.0+ installed
- WooCommerce REST API enabled (WooCommerce → Settings → Advanced → REST API)
- Consumer Key + Consumer Secret with **Read** permissions
- For checkout redirect: the custom PHP snippet from `WORDPRESS_CART_SNIPPET.php`

---

## 5. Project Structure

```
luxtronics/
├── frontend/                    # React application
│   ├── index.html               # Entry HTML (Vite root)
│   ├── public/                  # Static assets
│   │   ├── sitemap.xml
│   │   ├── robots.txt
│   │   └── site.webmanifest
│   └── src/
│       ├── assets/              # Images, fonts
│       ├── components/          # Reusable UI components
│       │   ├── Navbar.tsx       # Megamenu + domain switcher
│       │   ├── Hero.tsx         # Slider banner
│       │   ├── ProductCard.tsx  # Product grid card
│       │   ├── ImageCursorCard.tsx  # Custom cursor
│       │   ├── CategoryShowcase.tsx
│       │   ├── Layout.tsx
│       │   ├── SEO.tsx          # Meta + structured data
│       │   └── ThemeToggle.tsx
│       ├── context/
│       │   ├── AuthContext.tsx  # Firebase Auth
│       │   ├── CartContext.tsx  # localStorage cart
│       │   └── CurrencyContext.tsx  # Currency + geolocation
│       ├── config/
│       │   └── storeConfig.ts   # Domain → store mapping
│       ├── lib/
│       │   ├── firebase.ts      # Auth Firebase instance
│       │   ├── firebase-config.ts  # Products Firestore instance
│       │   ├── market-ratings.ts   # Brand/model rating lookup
│       │   ├── woo-checkout.ts  # Checkout redirect logic
│       │   ├── domain-config.ts # Domain → country mapping
│       │   └── sanitize.ts      # DOMPurify wrapper
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Shop.tsx         # Product listing + search
│       │   ├── ProductDetail.tsx
│       │   ├── Categories.tsx
│       │   ├── Cart.tsx
│       │   ├── Contact.tsx
│       │   ├── About.tsx
│       │   ├── Blog.tsx
│       │   └── account/         # Auth pages
│       ├── services/
│       │   ├── store-api.ts     # Firebase-first API layer
│       │   └── firebase-products.ts  # Firestore service
│       └── data/
│           └── products.ts      # Static fallback products + types
├── backend/
│   ├── server/
│   │   ├── index.ts             # Express app (TypeScript)
│   │   ├── db/
│   │   │   └── mongodb.ts       # MongoDB connection
│   │   ├── models/
│   │   │   └── mongo-models.ts  # TypeScript interfaces + document creators
│   │   ├── services/
│   │   │   ├── product-service.ts    # MongoDB CRUD
│   │   │   └── woocommerce-sync.ts   # WooCommerce → MongoDB sync
│   │   ├── routes/
│   │   │   └── woocommerce-proxy.ts
│   │   └── middleware/
│   │       └── security.ts      # Rate limiting, headers, sanitisation
│   └── scripts/
│       ├── sync-full.ts         # Products + categories sync
│       ├── sync-products.ts     # Products only
│       └── sync-to-firebase.ts  # WooCommerce → Firebase sync
├── scripts/
│   ├── dev.mjs                  # Concurrent dev server starter
│   └── build-multistore.sh      # Multi-domain build script
├── .github/
│   └── workflows/
│       └── sync-firebase.yml    # GitHub Actions sync (every 15 min)
├── server.js                    # Production server (plain JS, Hostinger)
├── vite.config.ts               # Vite build config
├── tailwind.config.ts           # Tailwind theme
├── firestore.rules              # Firestore security rules
├── nginx-multistore.conf        # Nginx config (static deployment)
├── package.json                 # Root package (monorepo-style)
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Template
├── .env.india                   # India-specific overrides
├── .env.australia               # Australia-specific overrides
└── .env.newzealand              # New Zealand-specific overrides
```


---

## 6. Step 1 — WooCommerce Setup

### 1.1 Install WordPress + WooCommerce

For each store region (India, Australia, New Zealand), you need a separate WordPress installation. On Hostinger you can use the auto-installer.

```
India store:      https://luxtronics.luxtronics.in
Australia store:  https://storeau.luxtronics.luxtronics.in
New Zealand store: https://storenz.luxtronics.luxtronics.in
```

> **Tip:** You can host all three on subdomains of one Hostinger account.

### 1.2 Generate API Keys

For each WooCommerce store:

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add Key**
3. Description: `Luxtronics Frontend`
4. User: your admin user
5. Permissions: **Read** (for product fetching) or **Read/Write** (for order creation)
6. Click **Generate API Key**
7. Copy the **Consumer Key** (`ck_...`) and **Consumer Secret** (`cs_...`)

### 1.3 Install the Cart Redirect Snippet

For the multi-item cart checkout to work, add this to your WordPress theme's `functions.php` or as a plugin. The file is at `WORDPRESS_CART_SNIPPET.php` in this repo.

```php
// This snippet reads ?lux_cart=[...] from the URL,
// empties the WooCommerce cart, adds all items,
// then redirects to /checkout/
add_action('init', function() {
    if (!isset($_GET['lux_cart'])) return;
    $items = json_decode(stripslashes($_GET['lux_cart']), true);
    if (!is_array($items)) return;
    WC()->cart->empty_cart();
    foreach ($items as $item) {
        WC()->cart->add_to_cart(
            $item['product_id'],
            $item['quantity'],
            $item['variation_id'] ?? 0
        );
    }
    wp_redirect(wc_get_checkout_url());
    exit;
});
```

### 1.4 Enable CORS on WooCommerce

Add to `functions.php` or use the `docs/woocommerce-cors.php` snippet:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed = ['https://luxtronics.in', 'https://luxtronics.com.au', 'https://luxtronics.co.nz'];
        if (in_array($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
        }
        return $value;
    });
}, 15);
```


---

## 7. Step 2 — Firebase Setup

Firebase serves two purposes: **Authentication** (email/password + Google) and **Firestore** (fast product catalogue reads).

### 2.1 Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `luxtronics-prod`)
3. Disable Google Analytics (optional)
4. Click **Create project**

### 2.2 Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Enable **Email/Password** provider
3. Enable **Google** provider (add your domain to authorised domains)
4. Add your production domains to **Authorised domains**:
   - `luxtronics.in`
   - `luxtronics.com.au`
   - `luxtronics.co.nz`

### 2.3 Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Select a region close to your users (e.g. `asia-south1` for India)
4. Deploy the security rules from `firestore.rules`:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

The rules allow public reads on `products`, `categories`, `sync_status` and auth-gated reads/writes on `users`.

### 2.4 Get Web App Config

1. Firebase Console → **Project Settings** → **Your apps** → **Add app** → Web
2. Register app name (e.g. `luxtronics-web`)
3. Copy the config object — you'll need all 6 values for `.env`

### 2.5 Get Service Account Key (for sync script)

1. Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save as `firebase-service-account.json` (never commit this)
4. Add the entire JSON as a GitHub secret: `FIREBASE_SERVICE_ACCOUNT_KEY`

### 2.6 Firestore Collections

The sync script creates these collections automatically:

| Collection | Document ID | Contents |
|---|---|---|
| `products` | WooCommerce product ID | Full product data |
| `categories` | WooCommerce category ID | Category data |
| `sync_status` | `latest` | `{ lastSyncAt: Timestamp }` |


---

## 8. Step 3 — MongoDB Setup

MongoDB is used by the Express backend as a persistent product cache with full query capabilities.

### 8.1 Create MongoDB Atlas Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster (or paid for production)
3. Choose a region close to your server
4. Create a database user with **Read and Write** permissions
5. Add your server IP to the IP Access List (or `0.0.0.0/0` for development)
6. Get the connection string: `mongodb+srv://user:pass@cluster.mongodb.net`

### 8.2 Collections Created by Sync

```
luxtronics (database)
├── products          # Product documents
├── categories        # Category documents
├── cache_metadata    # Cache tracking (24h TTL)
└── sync_status       # Sync history
```

### 8.3 MongoDB Product Document Schema

```typescript
interface MongoProduct {
  id: number;              // WooCommerce product ID
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  price: number;
  salePrice?: number;
  regularPrice: number;
  images: Array<{ id: number; src: string; alt: string }>;
  rating: number;          // WooCommerce average_rating
  reviewCount: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  variations?: Array<{...}>;
  syncedAt: Date;
  searchText: string;      // Pre-built search index field
}
```

### 8.4 Run Initial Sync

```bash
# Copy .env.example to .env and fill in values
cp .env.example .env

# Run full sync (products + categories)
npm run sync:full

# Or products only
npm run sync:products
```

