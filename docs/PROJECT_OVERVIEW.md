# Luxtronics — Full Project Overview

> A production-ready, multi-region e-commerce platform built with React, TypeScript, WooCommerce, Firebase, and MongoDB.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Frontend](#5-frontend)
6. [Backend](#6-backend)
7. [Multi-Store / Multi-Domain Setup](#7-multi-store--multi-domain-setup)
8. [Authentication & Admin](#8-authentication--admin)
9. [Data Sync Pipeline](#9-data-sync-pipeline)
10. [API Reference](#10-api-reference)
11. [Environment Variables](#11-environment-variables)
12. [Scripts & Commands](#12-scripts--commands)
13. [Deployment](#13-deployment)
14. [CI/CD](#14-cicd)
15. [SEO & Analytics](#15-seo--analytics)
16. [Performance](#16-performance)
17. [Testing](#17-testing)
18. [Documentation Index](#18-documentation-index)

---

## 1. Project Summary

**Luxtronics** is a scalable, multi-region e-commerce storefront that sells consumer electronics. It is deployed across three regional domains:

| Domain | Region | Currency |
|---|---|---|
| `luxtronics.in` | India | INR (₹) |
| `luxtronics.com.au` | Australia | AUD (A$) |
| `luxtronics.co.nz` | New Zealand | NZD (NZ$) |

The platform uses a single React/TypeScript frontend codebase that detects the active domain at runtime and switches currency, WooCommerce API endpoint, and locale accordingly. Products are sourced from WooCommerce REST APIs and optionally cached in MongoDB for high-speed reads. Firebase handles user authentication and Firestore is used for product/category caching.

Key capabilities:
- Infinite-scroll product listing with lazy-loaded images
- Full-text search and category/price/stock filtering
- Cart, checkout, and order creation via WooCommerce
- Firebase-authenticated user accounts with order history
- Admin dashboard for product management (CRUD via WooCommerce API)
- Geo-redirect popup to guide users to their regional store
- Dark/light theme toggle
- SEO meta tags, sitemap, robots.txt, and Google Analytics integration
- CI/CD via GitHub Actions with Firebase sync workflow

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| UI Library | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Routing | React Router DOM 6 |
| State / Data Fetching | TanStack React Query 5 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Carousel | Embla Carousel |
| Notifications | Sonner |
| Icons | Lucide React |
| Theme | next-themes |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Primary DB | MongoDB (Atlas) |
| Auth / Secondary DB | Firebase / Firestore |
| WooCommerce | REST API v3 |
| Security | Helmet, express-rate-limit, CORS |
| Process Runner | tsx (ts-node alternative) |
| Dev Watcher | Nodemon |

### DevOps / Tooling
| Tool | Purpose |
|---|---|
| Vite | Frontend bundler |
| Vitest | Unit testing |
| ESLint + TypeScript-ESLint | Linting |
| GitHub Actions | CI/CD |
| Hostinger | Hosting (FTP deploy) |
| Firebase Hosting (optional) | Alternative hosting |

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                  Browser (React SPA)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Shop    │  │ Product  │  │  Cart /  │  │  Account / │  │
│  │  Page    │  │  Detail  │  │ Checkout │  │   Admin    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └─────────────┴─────────────┴───────────────┘         │
│                         React Query                          │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP / REST
          ┌────────────────┴────────────────┐
          │                                 │
   ┌──────▼──────┐                  ┌───────▼──────┐
   │  Express    │                  │  WooCommerce │
   │  Backend    │◄────────────────►│  REST API    │
   │  :3001      │  sync / proxy    │  (per domain)│
   └──────┬──────┘                  └──────────────┘
          │
   ┌──────▼──────┐     ┌──────────────┐
   │  MongoDB    │     │  Firebase /  │
   │  Atlas      │     │  Firestore   │
   │  (cache)    │     │  (auth + db) │
   └─────────────┘     └──────────────┘
```

### Request Flow

1. User opens a page → React Query checks its in-memory cache.
2. On cache miss, the frontend calls the Express backend (`/api/products`, `/api/categories`, etc.).
3. The backend tries MongoDB first (fast, cached). On miss or error it falls back to the live WooCommerce REST API.
4. Responses are HTTP-cached (`Cache-Control: public, max-age=3600`).
5. A background sync job (manual or cron) keeps MongoDB up to date from WooCommerce.

---

## 4. Project Structure

```
Luxtronics/
├── frontend/                    # React SPA
│   ├── index.html
│   ├── public/                  # Static assets (favicon, sitemap, robots.txt)
│   └── src/
│       ├── App.tsx              # Root component, providers, routes
│       ├── main.tsx             # Entry point
│       ├── index.css            # Global styles
│       ├── api/                 # Low-level API fetch helpers
│       ├── assets/              # Images, fonts
│       ├── components/          # Reusable UI components (see §5.2)
│       │   └── ui/              # shadcn/ui primitives
│       ├── config/
│       │   └── storeConfig.ts   # Per-domain currency / API URL map
│       ├── context/             # React contexts (see §5.3)
│       ├── data/                # Static seed data (blog posts, etc.)
│       ├── hooks/               # Custom React hooks (see §5.4)
│       ├── lib/
│       │   └── utils.ts         # cn() and shared utilities
│       ├── pages/               # Route-level page components (see §5.5)
│       ├── services/            # API service modules (see §5.6)
│       └── test/                # Vitest test files
│
├── backend/
│   ├── package.json             # Backend-only dependencies
│   └── server/
│       ├── index.ts             # Express app entry point
│       ├── db/
│       │   └── mongodb.ts       # MongoDB connection + init
│       ├── middleware/
│       │   └── security.ts      # Rate limiter, helmet, sanitizer
│       ├── models/
│       │   └── mongo-models.ts  # Product / category document schemas
│       ├── routes/
│       │   ├── products.ts      # /api/products routes
│       │   └── woocommerce-proxy.ts  # WooCommerce proxy routes
│       └── services/
│           ├── product-service.ts    # MongoDB CRUD
│           ├── user-service.ts       # User management
│           └── woocommerce-sync.ts   # Full / incremental sync engine
│
├── backend/scripts/             # CLI sync scripts
│   ├── sync-products.ts
│   ├── sync-full.ts
│   ├── sync-to-firebase.ts
│   ├── sync-to-target.ts
│   ├── fix-slug-index.ts
│   └── test-woo-connection.ts
│
├── scripts/                     # Shell / Node deployment scripts
│   ├── dev.mjs                  # Concurrent dev server launcher
│   ├── build-multistore.sh
│   ├── deploy-multidomain.sh
│   ├── setup-hostinger-ftp.sh
│   ├── setup-geo-redirects.sh
│   ├── geo-redirect.js
│   └── tests/
│
├── docs/                        # Extended documentation
├── dist/                        # Production frontend build (Vite output)
├── build/                       # Copy of dist (for server.js static serving)
├── server.js                    # Minimal static file server (production)
├── .env                         # Active environment variables (gitignored)
├── .env.example                 # Template
├── .env.india / .env.australia / .env.newzealand  # Per-region overrides
├── firestore.rules              # Firestore security rules
├── nginx-multistore.conf        # Nginx config for multi-domain
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json                 # Root workspace scripts
```

---

## 5. Frontend

### 5.1 Entry Point & Providers

`frontend/src/App.tsx` wraps the entire app in a provider stack (outermost → innermost):

```
StoreProvider → ThemeProvider → QueryClientProvider → AuthProvider
  → CurrencyProvider → CartProvider → TooltipProvider → BrowserRouter
```

Critical pages (`Index`, `Shop`, `ProductDetail`) are eagerly loaded. All other pages are lazy-loaded via `React.lazy` + `Suspense` with a spinner fallback.

React Query is configured with:
- `staleTime`: 5 minutes
- `gcTime`: 10 minutes
- `refetchOnWindowFocus`: false
- `retry`: 1

### 5.2 Components

| Component | Description |
|---|---|
| `Navbar.tsx` | Top navigation with cart icon, theme toggle, search |
| `Hero.tsx` | Full-width hero banner with CTA |
| `CategoryShowcase.tsx` | Grid of product categories |
| `CategoryStrip.tsx` | Horizontal scrollable category pills |
| `FeaturedProducts.tsx` | Featured/top-rated product grid |
| `OptimizedShop.tsx` | Main shop page with infinite scroll |
| `OptimizedProductList.tsx` | Reusable paginated product list |
| `ProductCard.tsx` | Individual product card (image, price, add-to-cart) |
| `DealsBanner.tsx` | Promotional deals section |
| `LimitedEdition.tsx` / `LimitedEditionSection.tsx` | Limited-stock highlight |
| `PromoBanner.tsx` | Promotional banner strip |
| `BrandMarquee.tsx` | Scrolling brand logos |
| `Testimonials.tsx` | Customer review carousel |
| `TrustBadges.tsx` | Shipping / security trust icons |
| `Newsletter.tsx` | Email subscription form |
| `Footer.tsx` | Site footer with links |
| `GeoRedirectPopup.tsx` | Detects user region and suggests regional domain |
| `SEO.tsx` | Dynamic `<head>` meta tags (title, description, OG) |
| `ThemeToggle.tsx` | Dark/light mode switch |
| `ChatBot.tsx` | Customer support chat widget |
| `SplashScreen.tsx` | Initial loading screen |
| `ErrorBoundary.tsx` | React error boundary wrapper |
| `LoadingSkeleton.tsx` | Skeleton placeholder cards |
| `AdminGuard.tsx` | Route guard — redirects non-admins |
| `ImageCursorCard.tsx` | Interactive card with custom cursor effect |
| `AnnouncementBar.tsx` | Top-of-page announcement strip |
| `Breadcrumb.tsx` | Page breadcrumb navigation |
| `Layout.tsx` | Shared page layout (Navbar + Footer) |
| `NavLink.tsx` | Styled router link |
| `StylishCategoryDisplay.tsx` | Alternative category display layout |

### 5.3 Contexts

| Context | Purpose |
|---|---|
| `StoreContext` | Active store config (domain, currency, API URL) |
| `ThemeContext` | Dark / light theme state |
| `AuthContext` | Firebase auth state (user, login, logout) |
| `CurrencyContext` | Currency symbol and conversion helpers |
| `CartContext` | Cart items, add/remove/clear, total calculation |

### 5.4 Hooks

| Hook | Purpose |
|---|---|
| `use-lazy-products.ts` | Infinite scroll with Intersection Observer |
| `use-woo-products.ts` | React Query wrapper for product fetching |
| `use-mobile.tsx` | Responsive breakpoint detection |
| `use-toast.ts` | Toast notification helper |
| `useImageCursor.ts` | Custom cursor tracking for image cards |

### 5.5 Pages

| Route | Page | Description |
|---|---|---|
| `/` | `Index.tsx` | Homepage (Hero, Categories, Featured, Deals, Newsletter) |
| `/shop` | `Shop.tsx` | Full product listing with filters |
| `/product/:slug` | `ProductDetail.tsx` | Single product page |
| `/categories` | `Categories.tsx` | All categories grid |
| `/cart` | `Cart.tsx` | Shopping cart |
| `/checkout` | `Checkout.tsx` | Checkout form + order submission |
| `/blog` | `Blog.tsx` | Blog post listing |
| `/blog/:slug` | `BlogPost.tsx` | Single blog post |
| `/contact` | `Contact.tsx` | Contact form |
| `/about` | `About.tsx` | About page |
| `/faq` | `FAQ.tsx` | FAQ accordion |
| `/shipping-returns` | `ShippingReturns.tsx` | Shipping policy |
| `/privacy` | `Privacy.tsx` | Privacy policy |
| `/terms` | `Terms.tsx` | Terms of service |
| `/account` | `AccountDashboard.tsx` | User dashboard |
| `/account/login` | `AccountLogin.tsx` | Login form |
| `/account/register` | `AccountRegister.tsx` | Registration form |
| `/account/orders` | `AccountOrders.tsx` | Order history |
| `/account/profile` | `AccountProfile.tsx` | Profile settings |
| `/admin` | `AdminDashboard.tsx` | Admin overview (guarded) |
| `/admin/products` | `AdminProducts.tsx` | Product CRUD (guarded) |
| `*` | `NotFound.tsx` | 404 page |

### 5.6 Services

| Service | Purpose |
|---|---|
| `woocommerce.ts` | WooCommerce REST API client (products, categories, orders) |
| `store-api.ts` | Backend Express API client |
| `firebase-products.ts` | Firestore product/category read/write |
| `auth.ts` | Firebase Auth helpers (sign in, sign out, register) |
| `product-converter.ts` | Transform WooCommerce product shape → app model |
| `bulk-import.ts` | Batch product import utilities |

### 5.7 Store Config

`frontend/src/config/storeConfig.ts` maps each hostname to its store settings:

```ts
{
  'luxtronics.in':      { currency: 'INR', symbol: '₹',   apiUrl: '...' },
  'luxtronics.com.au':  { currency: 'AUD', symbol: 'A$',  apiUrl: '...' },
  'luxtronics.co.nz':   { currency: 'NZD', symbol: 'NZ$', apiUrl: '...' },
}
```

Falls back to the India store on `localhost` during development.

---

## 6. Backend

### 6.1 Entry Point — `backend/server/index.ts`

The Express server:
1. Loads `.env` and `.env.local` using absolute paths (so `tsx watch` always finds them).
2. Registers security middleware: `securityHeaders` (Helmet), `globalRateLimiter`, `sanitizeRequestBody`, CORS.
3. Registers WooCommerce proxy routes (`/api/woo/*`).
4. Defines REST endpoints (see §10).
5. Starts listening on `PORT` (default `3001`).
6. Asynchronously initialises MongoDB — if it fails, all endpoints fall back to live WooCommerce calls.
7. In production, serves the compiled frontend `dist/` as static files and falls back to `index.html` for SPA routing.

### 6.2 Database — `backend/server/db/mongodb.ts`

- Connects to MongoDB Atlas using `MONGODB_URI`.
- Creates indexes on the `products` collection: text search, price, category, rating, slug (unique), featured, stock status.
- Exports `initializeMongoDB()` which returns the `Db` instance.

### 6.3 Models — `backend/server/models/mongo-models.ts`

`createProductDocument(wooProduct, variations)` maps a raw WooCommerce product object to the internal MongoDB schema:

```ts
{
  id, name, slug, sku, type,
  price, regularPrice, salePrice,
  stockStatus, stockQuantity, manageStock,
  categories[], tags[], images[],
  attributes[], variations[],
  description, shortDescription,
  rating: { average, count },
  featured, status,
  createdAt, updatedAt, syncedAt
}
```

`createCategoryDocument(wooCategory)` maps a WooCommerce category to:

```ts
{ id, name, slug, description, count, image, syncedAt }
```

### 6.4 Services

**`product-service.ts`** — MongoDB CRUD:
- `getProducts(page, perPage)` — paginated list
- `getProductById(id)` — by WooCommerce ID
- `getProductBySlug(slug)` — by URL slug
- `searchProducts(query, page, perPage)` — full-text search
- `getProductsByCategory(category, page, perPage)`
- `getAllCategoriesWithCount()` — aggregated category list
- `upsertProducts(products[])` — bulk upsert from sync

**`woocommerce-sync.ts`** — Sync engine:
- `fullSync()` — fetches all products and categories from WooCommerce in batches of 100, upserts into MongoDB.
- `incrementalSync()` — fetches only products modified since last sync.
- Tracks sync status in a `sync_status` collection.

**`user-service.ts`** — User management helpers (Firebase UID ↔ MongoDB user records).

### 6.5 Middleware — `backend/server/middleware/security.ts`

- `securityHeaders` — Helmet with CSP, HSTS, etc.
- `globalRateLimiter` — 100 requests / 15 min per IP.
- `sanitizeRequestBody` — strips dangerous HTML from request bodies.

### 6.6 Routes

**`routes/products.ts`** — Standard product CRUD endpoints.

**`routes/woocommerce-proxy.ts`** — Proxies admin CRUD operations (create/update/delete product) directly to WooCommerce, authenticated with server-side credentials. Used by the Admin Dashboard.

---

## 7. Multi-Store / Multi-Domain Setup

### How It Works

The same codebase is deployed to all three regional domains. At runtime:

1. `storeConfig.ts` reads `window.location.hostname`.
2. It selects the matching `StoreConfig` entry (currency, symbol, WooCommerce API URL).
3. `StoreContext` and `CurrencyContext` consume this config and make it available app-wide.
4. All API calls use the domain-specific WooCommerce endpoint.

### WooCommerce Stores

Each region has its own WooCommerce installation:

| Region | WooCommerce Base URL |
|---|---|
| India | `https://luxtronics.luxtronics.in/wp-json/wc/v3` |
| Australia | `https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3` |
| New Zealand | `https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3` |

### Environment Files

Per-region `.env` overrides are provided:
- `.env.india` — India store credentials
- `.env.australia` — Australia store credentials
- `.env.newzealand` — New Zealand store credentials

The backend reads `VITE_WOOCOMMERCE_URL_INDIA` (or the generic `VITE_WOOCOMMERCE_URL`) as its default sync target.

### Geo-Redirect

`GeoRedirectPopup.tsx` detects the user's locale/timezone and shows a banner suggesting they switch to their regional domain. This is a soft redirect (user choice), not a hard server-side redirect.

For hard server-side geo-redirects, `scripts/setup-geo-redirects.sh` generates middleware and `.htaccess` rules.

### Nginx Config

`nginx-multistore.conf` provides a reference Nginx virtual host configuration for serving all three domains from a single server, with SSL termination and proxy to the Node.js backend.

---

## 8. Authentication & Admin

### Firebase Auth

- `frontend/src/services/auth.ts` wraps Firebase Auth (email/password, Google OAuth).
- `AuthContext` exposes `user`, `loading`, `signIn`, `signOut`, `register`.
- Protected routes (account pages, admin) check `AuthContext.user`.

### Admin Guard

`AdminGuard.tsx` reads `VITE_ADMIN_EMAILS` (comma-separated list from `.env`) and only renders children if the logged-in user's email is in that list. Otherwise redirects to `/account/login`.

### Admin Dashboard

`/admin` — Overview with quick links.
`/admin/products` — Full product management:
- List all products (paginated, searchable)
- Create new product (form → WooCommerce proxy POST)
- Edit product (form → WooCommerce proxy PUT)
- Delete product (WooCommerce proxy DELETE)

All admin write operations go through `routes/woocommerce-proxy.ts` on the backend, which authenticates with server-side WooCommerce credentials (never exposed to the browser).

---

## 9. Data Sync Pipeline

```
WooCommerce REST API
        │
        │  batch fetch (100 products / request, 1-2s delay)
        ▼
woocommerce-sync.ts
        │
        │  createProductDocument() — normalize shape
        ▼
MongoDB Atlas (products collection)
        │
        │  ProductService.getProducts() — fast reads
        ▼
Express /api/products
        │
        │  React Query cache (5 min stale)
        ▼
Browser
```

### Sync Scripts

| Script | Command | Description |
|---|---|---|
| `sync-products.ts` | `npm run sync:products` | Sync products only |
| `sync-full.ts` | `npm run sync:full` | Sync products + categories |
| `sync-to-firebase.ts` | `tsx backend/scripts/sync-to-firebase.ts` | Push products to Firestore |
| `sync-to-target.ts` | `npm run sync:to-target` | Sync to a specific target store |
| `fix-slug-index.ts` | `npm run fix:slug-index` | Rebuild slug unique index |
| `test-woo-connection.ts` | `tsx backend/scripts/test-woo-connection.ts` | Verify WooCommerce credentials |

### Manual Sync via API

```bash
curl -X POST http://localhost:3001/api/sync \
  -H "X-Sync-Token: your_sync_token" \
  -H "Content-Type: application/json"
```

### Automated Sync (Cron)

```bash
# Every 6 hours
0 */6 * * * curl -X POST https://api.luxtronics.in/api/sync \
  -H "X-Sync-Token: $SYNC_TOKEN"
```

### Firebase Sync (GitHub Actions)

`.github/workflows/sync-firebase.yml` — Runs on push to `main` and on a schedule. Syncs product data to Firestore so the frontend can optionally read from Firebase instead of the Express backend.

---

## 10. API Reference

Base URL: `http://localhost:3001` (dev) / `https://api.luxtronics.in` (prod)

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check — returns `{ status: "ok" }` |
| GET | `/api/status` | MongoDB + WooCommerce readiness status |
| GET | `/api/products` | Paginated product list |
| GET | `/api/products/:id` | Product by WooCommerce ID |
| GET | `/api/products/slug/:slug` | Product by URL slug |
| GET | `/api/categories` | Paginated category list |
| POST | `/api/orders` | Create a WooCommerce order |

#### `GET /api/products` Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `per_page` | number | 50 | Items per page |
| `category` | string | — | Filter by category slug |
| `search` | string | — | Full-text search query |

#### `POST /api/orders` Body

```json
{
  "line_items": [{ "product_id": 123, "variation_id": 0, "quantity": 1 }],
  "billing": { "first_name": "...", "email": "..." },
  "shipping": { "address_1": "..." }
}
```

### Protected Endpoints (require `X-Sync-Token` header)

| Method | Path | Description |
|---|---|---|
| POST | `/api/sync` | Trigger full MongoDB sync from WooCommerce |

### WooCommerce Proxy Endpoints (Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/api/woo/products` | List products (admin view) |
| POST | `/api/woo/products` | Create product |
| PUT | `/api/woo/products/:id` | Update product |
| DELETE | `/api/woo/products/:id` | Delete product |

### Response Format

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "perPage": 50,
    "total": 5000,
    "totalPages": 100
  },
  "source": "mongodb"
}
```

`source` is either `"mongodb"` or `"woocommerce"` — indicates which data source served the response.

---

## 11. Environment Variables

Copy `.env.example` to `.env` and fill in the values.

### Firebase

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Admin

| Variable | Description |
|---|---|
| `VITE_ADMIN_EMAILS` | Comma-separated list of admin email addresses |

### WooCommerce

| Variable | Description |
|---|---|
| `VITE_WOOCOMMERCE_URL` | Default WooCommerce store URL |
| `VITE_WOOCOMMERCE_KEY` | WooCommerce Consumer Key |
| `VITE_WOOCOMMERCE_SECRET` | WooCommerce Consumer Secret |
| `VITE_WOOCOMMERCE_URL_INDIA` | India store URL (overrides default) |
| `VITE_WOOCOMMERCE_KEY_INDIA` | India store Consumer Key |
| `VITE_WOOCOMMERCE_SECRET_INDIA` | India store Consumer Secret |

### MongoDB

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `luxtronics`) |

### Backend / Server

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: `3001`) |
| `NODE_ENV` | `development` or `production` |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `SYNC_TOKEN` | Secret token for `/api/sync` endpoint |

### Deployment (Hostinger FTP)

| Variable | Description |
|---|---|
| `FTP_HOST` | FTP hostname |
| `FTP_USER` | FTP username |
| `FTP_PASS` | FTP password |
| `FTP_REMOTE_DIR` | Remote directory (e.g. `/public_html`) |

---

## 12. Scripts & Commands

### Development

```bash
npm run dev              # Start Vite (frontend) + Express (backend) concurrently
npm run dev:client       # Vite only — http://localhost:5173
npm run dev:server       # Express only — http://localhost:3001
```

`scripts/dev.mjs` launches both processes concurrently with colour-coded output.

### Build

```bash
npm run build            # Vite production build → dist/ + copy to build/
npm run build:dev        # Vite build in development mode
npm run preview          # Preview production build locally
```

### Sync

```bash
npm run sync:products    # Sync products from WooCommerce → MongoDB
npm run sync:full        # Sync products + categories
npm run sync:to-target   # Sync to a specific target store
npm run fix:slug-index   # Rebuild MongoDB slug unique index
```

### Testing

```bash
npm run test             # Run Vitest (single pass)
npm run test:watch       # Run Vitest in watch mode
```

### Linting

```bash
npm run lint             # ESLint across all source files
```

### Deployment

```bash
npm run deploy           # Build + deploy via deploy.sh
npm run deploy:staging   # Build + deploy to staging
npm run deploy:dry       # Build only (dry run)
npm run ci               # npm ci + lint + build (CI pipeline)
```

### Backend-only Scripts

```bash
tsx backend/scripts/test-woo-connection.ts   # Test WooCommerce API credentials
tsx backend/scripts/sync-to-firebase.ts      # Push products to Firestore
```

---

## 13. Deployment

### Hostinger (Primary)

1. Run `npm run build` to produce `dist/`.
2. Run `./scripts/deploy-multidomain.sh luxtronics.in hostinger` (or `.com.au` / `.co.nz`).
3. The script FTPs the `dist/` contents to `FTP_REMOTE_DIR` on the configured Hostinger account.
4. `.htaccess` in `frontend/public/` handles SPA routing (all paths → `index.html`).

For interactive FTP credential setup: `./scripts/setup-hostinger-ftp.sh`

### Multi-Domain on Hostinger

Two options:
- **Separate accounts** — one Hostinger account per domain, each with its own `/public_html`.
- **Addon domains** — one account, different subdirectories (`/public_html/au`, `/public_html/nz`).

See `docs/HOSTINGER_MULTIDOMAIN.md` for full details.

### Backend on Hostinger / VPS

The Express backend (`backend/server/index.ts`) is compiled and run with `node server.js` (or `tsx`). In production it also serves the frontend static files from `dist/`.

### Alternative: Vercel + Render

- Frontend → Vercel (`npm run build`, deploy `dist/`)
- Backend → Render.com (connect GitHub, set env vars, auto-deploy)

### CI/CD

`.github/workflows/sync-firebase.yml` — on push to `main`:
1. Installs dependencies.
2. Runs the Firebase sync script to push product data to Firestore.

---

## 14. CI/CD

### GitHub Actions

**`.github/workflows/sync-firebase.yml`**

Triggers: push to `main`, manual dispatch, and optionally on a schedule.

Steps:
1. Checkout code.
2. Install Node dependencies.
3. Run `tsx backend/scripts/sync-to-firebase.ts` to push the latest product catalog to Firestore.

Required GitHub Secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_WOOCOMMERCE_URL`
- `VITE_WOOCOMMERCE_KEY`
- `VITE_WOOCOMMERCE_SECRET`
- `MONGODB_URI`

### Jenkinsfile

A `Jenkinsfile` is present in the root for teams using Jenkins. It defines a pipeline with stages: Install → Lint → Build → Deploy.

---

## 15. SEO & Analytics

### SEO Component

`frontend/src/components/SEO.tsx` renders dynamic `<head>` tags per page:
- `<title>`, `<meta name="description">`, canonical URL
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- Twitter Card tags

### Sitemap

`frontend/public/sitemap.xml` — static sitemap for the India store.
`frontend/public/sitemap-au.xml` — static sitemap for the Australia store.

Both are copied to `dist/` on build and served as static files.

### Robots.txt

`frontend/public/robots.txt` — allows all crawlers, references the sitemap.

### Google Analytics

`GOOGLE_ANALYTICS_SETUP.md` documents the GA4 integration. The tracking script is injected in `frontend/index.html`.

### Google Merchant Center

`GOOGLE_MERCHANT_CENTER_GUIDE.md` documents product feed setup for Google Shopping.

---

## 16. Performance

| Metric | Value |
|---|---|
| First page load | ~1–2 s (MongoDB cached) |
| API response time | 50–200 ms |
| MongoDB query time | 10–50 ms |
| WooCommerce fallback | 2–6 s |
| Lighthouse score | 90+ |
| Cache hit rate | ~90% |

### Techniques Used

- **MongoDB caching** — 10–50× faster than direct WooCommerce API calls.
- **HTTP caching** — `Cache-Control: public, max-age=3600` on product responses.
- **React Query** — in-memory cache with 5-minute stale time.
- **Infinite scroll** — loads 50 products at a time via Intersection Observer.
- **Prefetching** — next page is fetched in the background while the user scrolls.
- **Lazy loading** — non-critical pages and images are loaded on demand.
- **Code splitting** — Vite splits vendor chunks (React, Firebase, icons, UI, query).
- **Image optimisation** — WooCommerce serves resized images; `loading="lazy"` on all product images.

---

## 17. Testing

### Framework

Vitest + Testing Library (React).

### Test Location

`frontend/src/test/` — unit and component tests.

### Running Tests

```bash
npm run test          # Single run
npm run test:watch    # Watch mode
```

### WooCommerce Connection Test

```bash
tsx backend/scripts/test-woo-connection.ts
```

Verifies that the configured WooCommerce credentials can successfully fetch products.

---

## 18. Documentation Index

The repository contains a large number of focused documentation files. Here is a complete index:

### Architecture & Setup
| File | Description |
|---|---|
| `README.md` | Main project README (SunSky Finds branding) |
| `docs/ARCHITECTURE.md` | System design and component diagram |
| `docs/FINAL_ARCHITECTURE.md` | Final architecture decisions |
| `TECHNICAL_GUIDE.md` | Developer technical reference |
| `IMPLEMENTATION_SUMMARY.md` | Summary of implemented features |
| `BUILD_SUMMARY.md` | Build output summary |
| `EXECUTIVE_REPORT.md` | High-level project report |
| `PROGRESS_REPORT.md` | Development progress log |
| `PROJECT_REPORT.md` | Full project report |
| `SYSTEM_UNIQUENESS.md` | Unique platform differentiators |

### Database
| File | Description |
|---|---|
| `docs/DATABASE_CONFIG.md` | MySQL indexing for WooCommerce |
| `docs/MONGODB_SETUP.md` | MongoDB Atlas production setup |
| `docs/MONGODB_QUICK_START.md` | 30-minute MongoDB setup guide |
| `docs/MONGODB_INTEGRATION.md` | MongoDB integration summary |
| `MONGODB_VS_FIREBASE.md` | Comparison and decision rationale |

### WooCommerce
| File | Description |
|---|---|
| `docs/WOOCOMMERCE_SETUP.md` | WooCommerce REST API setup |
| `docs/CORS-SETUP.md` | CORS configuration for WooCommerce |
| `docs/woocommerce-cors.php` | PHP snippet for WooCommerce CORS headers |
| `WORDPRESS_CART_SNIPPET.php` | WordPress cart integration snippet |
| `WORDPRESS_CHECKOUT_SYNC.md` | Checkout sync with WordPress |
| `AI_LISTING_GUIDE.md` | Guide for AI-assisted product listing |

### Firebase
| File | Description |
|---|---|
| `FIREBASE_SETUP_GUIDE.md` | Firebase project setup |
| `FIREBASE_QUICK_START.md` | Quick Firebase setup reference |
| `firestore.rules` | Firestore security rules |

### Deployment
| File | Description |
|---|---|
| `HOSTINGER_DEPLOYMENT.md` | Hostinger deployment guide |
| `docs/HOSTINGER-DEPLOYMENT.md` | Detailed Hostinger steps |
| `docs/HOSTINGER_ENV_SETUP.md` | Environment setup on Hostinger |
| `docs/HOSTINGER_MULTIDOMAIN.md` | Multi-domain Hostinger setup |
| `docs/DEPLOYMENT_SUMMARY.md` | Deployment summary |
| `docs/CICD_SETUP.md` | CI/CD pipeline setup |
| `docs/NGINX-SETUP.md` | Nginx configuration guide |
| `nginx-multistore.conf` | Nginx multi-store virtual host config |
| `THREE_STORE_MIGRATION.md` | Migration guide for three-store setup |
| `docs/THREE_STORE_SETUP.md` | Three-store setup reference |
| `docs/MULTI-STORE-ARCHITECTURE.md` | Multi-store architecture overview |

### Performance & SEO
| File | Description |
|---|---|
| `docs/PERFORMANCE_GUIDE.md` | Performance optimisation strategies |
| `PERFORMANCE_OPTIMIZATIONS.md` | Implemented optimisations |
| `SEO_CHECKLIST.md` | SEO implementation checklist |
| `UI_SEO_IMPROVEMENTS.md` | UI/SEO improvement log |
| `GOOGLE_ANALYTICS_SETUP.md` | GA4 integration guide |
| `GA_TESTING_GUIDE.md` | Google Analytics testing guide |
| `GOOGLE_MERCHANT_CENTER_GUIDE.md` | Google Merchant Center setup |

### Bug Fixes & UI
| File | Description |
|---|---|
| `CART_ICON_FIX.md` | Cart icon bug fix notes |
| `CATEGORY_FILTER_DEBUG.md` | Category filter debugging |
| `CHECKOUT_FIX.md` | Checkout flow fix |
| `SEARCH_FIX.md` / `SEARCH_FIX_COMPLETE.md` / `SEARCH_FIX_SUMMARY.md` | Search bug fixes |
| `SMART_SEARCH_UPDATE.md` | Smart search feature update |
| `PURCHASE_FLOW_DIAGRAM.md` | Purchase flow diagram |
| `PURCHASE_LIFECYCLE_COMPLETE.md` / `PURCHASE_LIFECYCLE_FIX.md` | Purchase lifecycle docs |
| `COMPLETE_PURCHASE_FLOW.md` / `FINAL_PURCHASE_FLOW.md` | Full purchase flow docs |
| `QUICK_PURCHASE_GUIDE.md` | Quick purchase guide |
| `UI_ANALYSIS_COMPLETE.md` | UI analysis results |
| `UI_LAYOUT_FIXES.md` | Layout fix log |
| `TEXT_COLOR_FIXES.md` | Text colour fix log |
| `THEME_IMPROVEMENTS.md` | Theme improvement notes |
| `RESPONSIVE_BACKGROUNDS.md` | Responsive background implementation |
| `IMAGE_MAPPING.md` | Product image mapping reference |

### Quick References
| File | Description |
|---|---|
| `docs/QUICK_START.md` | 5-minute quick start |
| `docs/MANUAL_SETUP.md` | Manual WordPress setup steps |
| `docs/SYNC_PROCESS.md` | Sync process documentation |
| `QUICK_FIX_GUIDE.md` | Common quick fixes |
| `QUICK_REFERENCE.md` | Developer quick reference |
| `QUICK_TEST_GUIDE.md` | Quick testing guide |

---

*Generated: May 2026 — Luxtronics Platform*
