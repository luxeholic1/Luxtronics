/**
 * Express Server Setup with MongoDB + WooCommerce Fallback
 * Production-ready for Hostinger deployment
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { initializeMongoDB } from './db/mongodb';
import { createProductDocument, createCategoryDocument } from './models/mongo-models';
import { validateBlogPostInput } from './models/blog-models';
import { globalRateLimiter, requireSafeContentType, sanitizeRequestBody, securityHeaders } from './middleware/security';
import { createWooCommerceProxyRoutes } from './routes/woocommerce-proxy';
import WooCommerceSync from './services/woocommerce-sync';
import { BlogService } from './services/blog-service';

// ── Load env vars using absolute paths so tsx watch always finds them ─────────
const __selfDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__selfDir, '../..'); // backend/server/ → project root
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });
console.log('📂 Project root:', projectRoot);
console.log('🔑 WOO URL at load:', process.env.VITE_WOOCOMMERCE_URL || 'NOT SET');

interface ServerConfig {
  port?: number;
  corsOrigin?: string | string[];
}

// ── Read WooCommerce creds at call-time so they're never stale ───────────────
// For multi-store support, we use India store credentials by default
// Frontend will call WooCommerce directly for store-specific operations
function wooUrl(): string { 
  return process.env.VITE_WOOCOMMERCE_URL_INDIA || process.env.VITE_WOOCOMMERCE_URL || ''; 
}
function wooKey(): string { 
  return process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY || ''; 
}
function wooSecret(): string { 
  return process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET || ''; 
}

function wooAuthHeader(): string {
  const key = wooKey();
  const secret = wooSecret();
  if (!key || !secret) throw new Error('WooCommerce credentials not configured');
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

function wooFallbackEnabled(): boolean {
  return process.env.ENABLE_WOO_FALLBACK === 'true';
}

async function wooFetch(endpoint: string): Promise<any> {
  const base = wooUrl();
  if (!base) throw new Error('WooCommerce URL not configured in environment');
  const response = await fetch(`${base}/wp-json/wc/v3/${endpoint}`, {
    headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce error ${response.status}: ${body}`);
  }
  return response.json();
}

async function fetchWooProductsRaw(params: URLSearchParams): Promise<{ items: any[]; total: number; totalPages: number }> {
  const base = wooUrl();
  if (!base) throw new Error('WooCommerce URL not configured in environment');
  const url = `${base}/wp-json/wc/v3/products?${params}`;
  const response = await fetch(url, {
    headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce API ${response.status}: ${body}`);
  }
  return {
    items: await response.json(),
    total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
  };
}

async function fetchWooVariations(productId: number): Promise<any[]> {
  try {
    return await wooFetch(`products/${productId}/variations?per_page=100`);
  } catch {
    return [];
  }
}

async function normalizeWooProducts(items: any[]): Promise<any[]> {
  return Promise.all(
    items.map(async (item) => {
      const variations = item.type === 'variable' ? await fetchWooVariations(item.id) : [];
      return createProductDocument(item, variations);
    })
  );
}

export async function setupServer(config: ServerConfig = {}): Promise<Express> {
  const port = config.port || parseInt(process.env.PORT || '3001');
  const configuredOrigin = config.corsOrigin || process.env.CORS_ORIGIN || '*';
  const corsOrigins = Array.isArray(configuredOrigin)
    ? configuredOrigin
    : String(configuredOrigin).split(',').map((o) => o.trim()).filter(Boolean);

  const app = express();
  app.set('trust proxy', 1);

  // ── Middleware ─────────────────────────────────────────────────────────────
  app.use(securityHeaders);
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(requireSafeContentType);
  app.use(sanitizeRequestBody);
  app.use(cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  }));

  // ── Register WooCommerce Proxy Routes ─────────────────────────────────────
  app.use('/api', createWooCommerceProxyRoutes());

  // ── State ─────────────────────────────────────────────────────────────────
  let mongoReady = false;
  let mongoError: string | null = null;
  let productService: any = null;
  let categoryService: any = null;
  let blogService: BlogService | null = null;
  const analyticsEvents: any[] = [];
  const liveVisitors = new Map<string, any>();
  const liveRetentionMs = 10 * 60 * 1000;

  const pruneLiveVisitors = () => {
    const now = Date.now();
    for (const [sessionId, visitor] of liveVisitors.entries()) {
      if (now - Number(visitor.lastSeenAt || 0) > liveRetentionMs) {
        liveVisitors.delete(sessionId);
      }
    }
  };

  // ── Health / status ───────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      success: true,
      status: mongoReady ? 'ready' : 'degraded',
      mongoReady,
      source: mongoReady ? 'mongodb' : 'woocommerce',
      wooConfigured: !!(wooUrl() && wooKey() && wooSecret()),
      mongoError,
    });
  });

  // ── ADMIN LIVE ANALYTICS ─────────────────────────────────────────────────
  app.post('/api/analytics/events', (req, res) => {
    const event = req.body || {};
    if (!event.sessionId || !event.type) {
      return res.status(400).json({ success: false, error: 'Invalid analytics event' });
    }

    analyticsEvents.unshift({ ...event, timestamp: event.timestamp || Date.now() });
    analyticsEvents.splice(1000);
    res.json({ success: true });
  });

  app.get('/api/analytics/events', (_req, res) => {
    res.json({ success: true, events: analyticsEvents.slice(0, 500) });
  });

  app.post('/api/analytics/live', (req, res) => {
    const visitor = req.body || {};
    if (!visitor.sessionId) {
      return res.status(400).json({ success: false, error: 'Invalid live visitor heartbeat' });
    }

    liveVisitors.set(visitor.sessionId, {
      ...visitor,
      lastSeenAt: Date.now(),
      status: 'active',
    });
    pruneLiveVisitors();
    res.json({ success: true });
  });

  app.get('/api/analytics/live', (_req, res) => {
    pruneLiveVisitors();
    const now = Date.now();
    const visitors = [...liveVisitors.values()].map((visitor) => ({
      ...visitor,
      status: now - Number(visitor.lastSeenAt || 0) < 30 * 1000 ? 'active' : 'idle',
    }));
    res.json({ success: true, visitors });
  });

  // ── GET /api/products ──────────────────────────────────────────────────────
  app.get('/api/products', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = Math.min(Math.max(parseInt(req.query.per_page as string) || 50, 1), 500);
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    // MongoDB is the storefront read source. WooCommerce fallback is opt-in
    // for maintenance/dev via ENABLE_WOO_FALLBACK=true.
    if (mongoReady && productService) {
      try {
        let result;
        if (search) {
          result = await productService.searchProducts(search, page, perPage, category);
        } else if (category) {
          result = await productService.getProductsByCategory(category, page, perPage);
        } else {
          result = await productService.getProducts(page, perPage);
        }
        res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
        return res.json({
          success: true,
          data: result.products,
          pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) },
          source: 'mongodb',
        });
      } catch (err) {
        console.error('MongoDB products error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load products from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(503).json({
        success: false,
        error: mongoReady ? 'No MongoDB product cache available' : 'MongoDB is not ready',
        source: 'mongodb',
      });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage), status: 'publish' });
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const { items, total, totalPages } = await fetchWooProductsRaw(params);
      const data = await normalizeWooProducts(items);

      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data, pagination: { page, perPage, total, totalPages }, source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('WooCommerce products error:', msg);
      return res.status(503).json({ success: false, error: 'Unable to load products', details: msg });
    }
  });

  // ── GET /api/products/slug/:slug ────────────────────────────────────────────
  app.get('/api/products/slug/:slug', async (req, res) => {
    const { slug } = req.params;

    // Try MongoDB
    if (mongoReady && productService) {
      try {
        const product = await productService.getProductBySlug(slug);
        if (product) {
          res.set('Cache-Control', 'public, max-age=3600');
          return res.json({ success: true, data: product, source: 'mongodb' });
        }
      } catch (err) {
        console.error('MongoDB slug error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load product from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(404).json({ success: false, error: 'Product not found in MongoDB', source: 'mongodb' });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({ slug, per_page: '1', status: 'publish' });
      const { items } = await fetchWooProductsRaw(params);
      const raw = items[0];
      if (!raw) return res.status(404).json({ success: false, error: 'Product not found' });

      const variations = raw.type === 'variable' ? await fetchWooVariations(raw.id) : [];
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: createProductDocument(raw, variations), source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(503).json({ success: false, error: 'Unable to load product', details: msg });
    }
  });

  // ── GET /api/products/:id ───────────────────────────────────────────────────
  app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ success: false, error: 'Invalid product ID' });

    if (mongoReady && productService) {
      try {
        const product = await productService.getProductById(productId);
        if (product) {
          res.set('Cache-Control', 'public, max-age=3600');
          return res.json({ success: true, data: product, source: 'mongodb' });
        }
      } catch (err) {
        console.error('MongoDB product by ID error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load product from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(404).json({ success: false, error: 'Product not found in MongoDB', source: 'mongodb' });
    }

    // Optional WooCommerce fallback.
    try {
      const raw = await wooFetch(`products/${productId}`);
      const variations = raw.type === 'variable' ? await fetchWooVariations(productId) : [];
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: createProductDocument(raw, variations), source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(503).json({ success: false, error: 'Product not found', details: msg });
    }
  });

  // ── GET /api/categories ─────────────────────────────────────────────────────
  app.get('/api/categories', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 20;

    // MongoDB is the storefront category source.
    if (mongoReady && productService) {
      try {
        const categories = (await productService.getAllCategoriesWithCount())
          .filter((category: any) => Number(category.productCount ?? category.count ?? 0) > 0);
        const start = (page - 1) * perPage;
        const paginated = categories.slice(start, start + perPage);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.json({
          success: true,
          data: paginated,
          pagination: { page, perPage, total: categories.length, totalPages: Math.ceil(categories.length / perPage) },
          source: 'mongodb',
        });
      } catch (err) {
        console.error('MongoDB categories error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load categories from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(503).json({
        success: false,
        error: mongoReady ? 'No MongoDB category cache available' : 'MongoDB is not ready',
        source: 'mongodb',
      });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
        hide_empty: 'true',
        orderby: 'count',
        order: 'desc',
      });
      const base = wooUrl();
      if (!base) throw new Error('WooCommerce not configured');

      const response = await fetch(`${base}/wp-json/wc/v3/products/categories?${params}`, {
        headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`WooCommerce ${response.status}`);

      const raw = await response.json();
      const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

      const data = raw
        .filter((c: any) => Number(c.count || 0) > 0)
        .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        count: c.count || 0,
        productCount: c.count || 0,
        image: c.image ? { id: c.image.id, src: c.image.src, alt: c.image.alt || '' } : null,
        sampleImage: c.image?.src || null,
      }));

      res.set('Cache-Control', 'public, max-age=1800');
      return res.json({
        success: true,
        data,
        pagination: { page, perPage, total, totalPages },
        source: 'woocommerce',
      });
    } catch (wooErr) {
      console.error('WooCommerce categories error:', wooErr);
    }

    return res.status(503).json({ success: false, error: 'Unable to load categories' });
  });

  // ── GET /api/blogs ───────────────────────────────────────────────────────────
  app.get('/api/blogs', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready' });
    }
    try {
      const tag = req.query.tag as string | undefined;
      const posts = await blogService.listPosts(tag);
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json({ success: true, data: posts });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to load blog posts', details: msg });
    }
  });

  // ── GET /api/blogs/slug/:slug ────────────────────────────────────────────────
  app.get('/api/blogs/slug/:slug', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready' });
    }
    try {
      const post = await blogService.getPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to load blog post', details: msg });
    }
  });

  // ── POST /api/blogs ───────────────────────────────────────────────────────────
  app.post('/api/blogs', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready' });
    }
    const errors = validateBlogPostInput(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }
    try {
      const post = await blogService.createPost(req.body);
      return res.status(201).json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to create blog post', details: msg });
    }
  });

  // ── PUT /api/blogs/:id ─────────────────────────────────────────────────────────
  app.put('/api/blogs/:id', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready' });
    }
    try {
      const post = await blogService.updatePost(req.params.id, req.body || {});
      if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
      return res.json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to update blog post', details: msg });
    }
  });

  // ── DELETE /api/blogs/:id ──────────────────────────────────────────────────────
  app.delete('/api/blogs/:id', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready' });
    }
    try {
      const deleted = await blogService.deletePost(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Blog post not found' });
      return res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to delete blog post', details: msg });
    }
  });

  // ── POST /api/orders ────────────────────────────────────────────────────────
  app.post('/api/orders', async (req, res) => {
    const { line_items, billing, shipping } = req.body;
    if (!line_items || !Array.isArray(line_items)) {
      return res.status(400).json({ success: false, error: 'line_items is required and must be an array' });
    }
    try {
      const base = wooUrl();
      if (!base) throw new Error('WooCommerce not configured');

      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        billing: billing || {},
        shipping: shipping || {},
        line_items: line_items.map((item: any) => ({
          product_id: item.product_id,
          variation_id: item.variation_id || 0,
          quantity: item.quantity,
        })),
        shipping_lines: [{ method_id: 'flat_rate', method_title: 'Flat Rate', total: '0.00' }],
      };

      const orderRes = await fetch(`${base}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const text = await orderRes.text();
        throw new Error(`Order creation failed: ${orderRes.status} ${text}`);
      }

      const order = await orderRes.json();
      return res.json({ success: true, data: order });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Order error:', msg);
      return res.status(500).json({ success: false, error: 'Failed to create order', details: msg });
    }
  });

  // ── POST /api/sync (protected) ──────────────────────────────────────────────
  app.post('/api/sync', async (req, res) => {
    const token = req.headers['x-sync-token'];
    if (token !== process.env.SYNC_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    if (!mongoReady) {
      return res.status(503).json({ success: false, error: 'MongoDB not ready for sync' });
    }

    // Trigger sync in background
    const db = await initializeMongoDB();
    const syncService = new WooCommerceSync(db);
    
    syncService.fullSync()
      .then(result => {
        console.log(`✅ Manual sync completed: ${result.products} products, ${result.categories} categories`);
      })
      .catch(err => {
        console.error('❌ Manual sync failed:', err);
      });

    res.json({ success: true, message: 'Sync triggered successfully in background' });
    console.log('Manual sync triggered via API');
  });

  const siteBaseUrl = (hostHeader?: string) => {
    const host = String(hostHeader || 'luxtronics.in').replace(/^www\./, '').split(':')[0];
    if (host === 'luxtronics.com.au') return 'https://luxtronics.com.au';
    if (host === 'luxtronics.co.nz') return 'https://luxtronics.co.nz';
    return 'https://luxtronics.in';
  };

  const xmlEscape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const sitemapUrl = ({
    loc,
    lastmod,
    changefreq,
    priority,
  }: {
    loc: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  }) => [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');

  app.get('/robots.txt', (req, res) => {
    const baseUrl = siteBaseUrl(req.headers.host);
    res.type('text/plain').send([
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin/',
      'Disallow: /account',
      'Disallow: /account/',
      'Disallow: /cart',
      'Disallow: /checkout',
      '',
      'Allow: /shop',
      'Allow: /product/',
      'Allow: /categories',
      'Allow: /latest-arrivals',
      'Allow: /blog',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n'));
  });

  app.get('/.well-known/security.txt', (_req, res) => {
    res.type('text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send([
      'Contact: mailto:support@luxtronics.in',
      'Preferred-Languages: en, hi',
      'Canonical: https://luxtronics.in/.well-known/security.txt',
      'Policy: https://luxtronics.in/privacy',
      'Expires: 2027-06-15T00:00:00Z',
      '',
    ].join('\n'));
  });

  app.get('/sitemap.xml', async (req, res) => {
    const baseUrl = siteBaseUrl(req.headers.host);
    const now = new Date().toISOString();
    const staticPaths = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/shop', changefreq: 'daily', priority: '0.95' },
      { path: '/latest-arrivals', changefreq: 'daily', priority: '0.9' },
      { path: '/categories', changefreq: 'weekly', priority: '0.85' },
      { path: '/blog', changefreq: 'weekly', priority: '0.75' },
      { path: '/about', changefreq: 'monthly', priority: '0.55' },
      { path: '/contact', changefreq: 'monthly', priority: '0.55' },
      { path: '/faq', changefreq: 'monthly', priority: '0.5' },
      { path: '/shipping-returns', changefreq: 'monthly', priority: '0.45' },
      { path: '/payment-method', changefreq: 'monthly', priority: '0.45' },
      { path: '/return-exchange', changefreq: 'monthly', priority: '0.55' },
      { path: '/return-policy', changefreq: 'monthly', priority: '0.55' },
      { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { path: '/terms', changefreq: 'yearly', priority: '0.3' },
    ];

    const urls = staticPaths.map((entry) =>
      sitemapUrl({
        loc: `${baseUrl}${entry.path}`,
        lastmod: now,
        changefreq: entry.changefreq,
        priority: entry.priority,
      }),
    );

    if (mongoReady && productService) {
      try {
        const products = await productService.getSitemapProducts(50000);
        for (const product of products) {
          const date = product.updatedAt || product.syncedAt;
          urls.push(sitemapUrl({
            loc: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
            lastmod: date ? new Date(date).toISOString() : now,
            changefreq: 'weekly',
            priority: '0.8',
          }));
        }
      } catch (err) {
        console.error('Sitemap product URL generation failed:', err);
      }
    }

    if (mongoReady && blogService) {
      try {
        const posts = await blogService.listPosts();
        for (const post of posts) {
          urls.push(sitemapUrl({
            loc: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
            lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : now,
            changefreq: 'monthly',
            priority: '0.6',
          }));
        }
      } catch (err) {
        console.error('Sitemap blog URL generation failed:', err);
      }
    }

    res.type('application/xml').send([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n'));
  });

  // ── Start server ───────────────────────────────────────────────────────────
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`🌐 WooCommerce URL: ${wooUrl() || '⚠️ NOT SET'}`);
  });

  // ── MongoDB init (async, non-blocking) ────────────────────────────────────
  void (async () => {
    try {
      console.log('🔄 Initializing MongoDB...');
      const db = await initializeMongoDB();
      const { ProductService } = await import('./services/product-service');
      productService = new ProductService(db);
      categoryService = productService; // ProductService has getAllCategories
      blogService = new BlogService(db);
      await blogService.createIndexes();
      mongoReady = true;
      mongoError = null;
      console.log('✅ MongoDB ready — using cached data');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('⚠️ MongoDB unavailable:', msg);
      mongoError = msg;
      console.log('ℹ️ Falling back to live WooCommerce data');
    }
  })();

  // ── Serve frontend build (production / Hostinger) ─────────────────────────
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const buildCandidates = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'build'),
    path.resolve(process.cwd(), 'frontend-build'),
    path.resolve(__dirname, '../../dist'),
  ];
  const clientDistPath = buildCandidates.find((p) => existsSync(path.join(p, 'index.html')));

  if (clientDistPath) {
    console.log(`📁 Serving frontend from: ${clientDistPath}`);
    app.use(express.static(clientDistPath, { maxAge: '1d', etag: true }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') return next();
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.type('html').send(`
        <html><head><meta charset="utf-8"/><title>Luxtronics API</title></head>
        <body style="font-family:system-ui;padding:32px">
          <h1>Luxtronics backend is running</h1>
          <p>WooCommerce URL: <code>${wooUrl() || 'NOT SET'}</code></p>
          <p>MongoDB: <code>${mongoReady ? 'Connected' : mongoError || 'Connecting...'}</code></p>
          <p><a href="/health">/health</a> · <a href="/api/status">/api/status</a></p>
        </body></html>
      `);
    });
  }

  // ── Error handler ─────────────────────────────────────────────────────────
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  return app;
}

// ── Direct run ────────────────────────────────────────────────────────────────
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  console.log('🚀 Starting Luxtronics backend...');
  console.log('📋 Env:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    WOOCOMMERCE_URL: process.env.VITE_WOOCOMMERCE_URL || 'NOT SET',
  });

  setupServer().catch((err) => {
    console.error('Fatal startup error:', err);
  });
}

export default setupServer;
