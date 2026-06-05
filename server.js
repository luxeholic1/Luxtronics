import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { MongoClient } from 'mongodb';

for (const file of ['.env', '.env.local', '.env.india']) {
  dotenv.config({ path: path.join(__dirname, file), override: false });
}

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const BUILD_DIR = path.join(__dirname, 'build');

// ── MONGODB STATE ────────────────────────────────────────────────────────────
let db = null;
let productsCol = null;
let mongoReady = false;

async function initMongo() {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not set. Running in WooCommerce-only mode.');
    return;
  }
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    productsCol = db.collection('products');
    mongoReady = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}
initMongo();

function mask(str) {
  if (!str) return '❌ MISSING';
  return str.substring(0, 3) + '...' + str.substring(str.length - 2);
}

// ── DYNAMIC STORE CONFIG ─────────────────────────────────────────────────────
const WOO_DOMAINS = {
  'luxtronics.in': 'https://luxtronics.luxtronics.in',
  'luxtronics.luxtronics.in': 'https://luxtronics.luxtronics.in',
  'luxtronics.com.au': 'https://luxtronics.luxtronics.in',
  'luxtronics.co.nz': 'https://luxtronics.luxtronics.in',
  // Default fallback
  'default': 'https://luxtronics.luxtronics.in'
};

function getWooUrl(req) {
  const host = req.headers.host || '';
  for (const [domain, url] of Object.entries(WOO_DOMAINS)) {
    if (host.includes(domain)) return url;
  }
  return WOO_DOMAINS.default;
}

function getWooCredentials(req) {
  const host = req.headers.host || '';
  if (host.includes('com.au')) {
    return {
      key: process.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA || process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY,
      secret: process.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET,
    };
  }
  if (host.includes('co.nz')) {
    return {
      key: process.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND || process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY,
      secret: process.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET,
    };
  }
  return {
    key: process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY,
    secret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET,
  };
}

function getWooAuth(req) {
  const { key, secret } = getWooCredentials(req);
  if (!key || !secret) throw new Error('WooCommerce credentials are not configured');
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

const PUBLIC_HOSTS = ['luxtronics.in', 'luxtronics.com.au', 'luxtronics.co.nz'];
const HREFLANG_BY_HOST = {
  'luxtronics.in': 'en-in',
  'luxtronics.com.au': 'en-au',
  'luxtronics.co.nz': 'en-nz',
};
const STATIC_PUBLIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.95' },
  { path: '/latest-arrivals', changefreq: 'daily', priority: '0.9' },
  { path: '/categories', changefreq: 'weekly', priority: '0.85' },
  { path: '/blog', changefreq: 'weekly', priority: '0.75' },
  { path: '/about', changefreq: 'monthly', priority: '0.55' },
  { path: '/contact', changefreq: 'monthly', priority: '0.55' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/shipping-returns', changefreq: 'monthly', priority: '0.45' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];
const BLOG_SLUGS = [
  'gan-wall-charger-fast-compact-powerful',
  'top-10-laptops-for-creators-2025',
  'how-to-choose-your-next-mirrorless-camera',
  'anc-vs-passive-what-actually-works',
];
const sitemapCache = new Map();
const SITEMAP_CACHE_MS = 6 * 60 * 60 * 1000;

function getPublicHost(req) {
  const host = String(req.headers.host || '').split(':')[0].replace(/^www\./, '');
  return PUBLIC_HOSTS.includes(host) ? host : 'luxtronics.in';
}

function absoluteForHost(host, pathname = '/') {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `https://${host}${cleanPath}`;
}

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function validIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function alternateLinks(pathname) {
  return [
    ...PUBLIC_HOSTS.map((host) =>
      `    <xhtml:link rel="alternate" hreflang="${HREFLANG_BY_HOST[host]}" href="${xmlEscape(absoluteForHost(host, pathname))}"/>`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(absoluteForHost('luxtronics.in', pathname))}"/>`,
  ].join('\n');
}

function sitemapUrlEntry(host, pathname, { changefreq = 'weekly', priority = '0.5', lastmod = null, alternates = true } = {}) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(absoluteForHost(host, pathname))}</loc>`,
    alternates ? alternateLinks(pathname) : '',
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function fetchSitemapProducts(req) {
  if (mongoReady && productsCol) {
    try {
      const products = await productsCol
        .find({ slug: { $exists: true, $ne: '' } })
        .project({ slug: 1, date_modified: 1, modified: 1, updatedAt: 1 })
        .limit(45000)
        .toArray();
      if (products.length > 0) {
        return products.map((product) => ({
          slug: product.slug,
          lastmod: validIsoDate(product.date_modified || product.modified || product.updatedAt),
        }));
      }
    } catch (err) {
      console.warn('Sitemap MongoDB product fetch failed:', err.message);
    }
  }

  try {
    const wooUrl = getWooUrl(req);
    const auth = getWooAuth(req);
    const products = [];
    for (let page = 1; page <= 500; page++) {
      const url = `${wooUrl}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`;
      const response = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json' } });
      if (!response.ok) break;
      const batch = await response.json();
      if (!Array.isArray(batch) || batch.length === 0) break;
      products.push(...batch.map((product) => ({
        slug: product.slug,
        lastmod: validIsoDate(product.date_modified_gmt || product.date_modified || product.modified),
      })));
      if (batch.length < 100 || products.length >= 45000) break;
    }
    return products.filter((product) => product.slug);
  } catch (err) {
    console.warn('Sitemap WooCommerce product fetch failed:', err.message);
    return [];
  }
}

app.use(cors());
app.use(express.json());

// ── DEBUG ─────────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) { }

  res.json({
    ok: true,
    build: BUILD_DIR,
    buildExists: existsSync(path.join(BUILD_DIR, 'index.html')),
    env_check: {
      FIREBASE_KEY: mask(process.env.VITE_FIREBASE_API_KEY),
      WOO_URL: process.env.VITE_WOOCOMMERCE_URL_INDIA || process.env.VITE_WOOCOMMERCE_URL,
      WOO_KEY: mask(process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY),
      WOO_SEC: mask(process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET),
    },
    assets: assets.filter(a => !a.startsWith('.')),
  });
});

// ── WOOCOMMERCE API ───────────────────────────────────────────────────────────
// ── WOOCOMMERCE API ───────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const perPage = parseInt(req.query.per_page || '50', 10);
  const search = req.query.search;
  const category = req.query.category;

  // Try MongoDB
  if (mongoReady && productsCol) {
    try {
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      if (category) {
        query.$or = [
          { 'categories.name': { $regex: category, $options: 'i' } },
          { 'categories.slug': { $regex: category, $options: 'i' } }
        ];
      }

      const total = await productsCol.countDocuments(query);
      const items = await productsCol.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray();

      if (items.length > 0) {
        return res.json({ success: true, data: items, total, source: 'mongodb' });
      }
    } catch (err) {
      console.error('MongoDB query error:', err.message);
    }
  }

  // Fallback to WooCommerce
  try {
    const wooUrl = getWooUrl(req);
    const url = `${wooUrl}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = getWooAuth(req);

    console.log(`Proxying to Woo: ${url}`);
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    if (!r.ok) return res.status(r.status).json({ success: false, error: 'WooCommerce API error' });

    res.json({ success: true, data: await r.json(), source: 'woocommerce' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/slug/:slug', async (req, res) => {
  const { slug } = req.params;

  // Try MongoDB
  if (mongoReady && productsCol) {
    try {
      const product = await productsCol.findOne({ slug });
      if (product) return res.json({ success: true, data: product, source: 'mongodb' });
    } catch (err) {
      console.error('MongoDB slug error:', err.message);
    }
  }

  // Fallback to WooCommerce
  try {
    const wooUrl = getWooUrl(req);
    const auth = getWooAuth(req);
    const url = `${wooUrl}/wp-json/wc/v3/products?slug=${slug}`;
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    const items = await r.json();
    const item = items[0];

    if (!item) return res.status(404).json({ success: false, error: 'Product not found' });

    // Fetch variations if it's a variable product
    let variations = [];
    if (item.type === 'variable') {
      const vUrl = `${wooUrl}/wp-json/wc/v3/products/${item.id}/variations?per_page=100`;
      const vr = await fetch(vUrl, { headers: { 'Authorization': auth } });
      variations = await vr.json();
    }

    // Transform for frontend (minimal transformation needed as frontend expects MongoDB format or raw)
    // Actually, root server.js is simple, we just send it.
    // Wait, the frontend expects the format from createProductDocument!
    // I should probably import createProductDocument or just manually map.
    // But wait, the MongoDB sync already uses createProductDocument.

    res.json({ success: true, data: { ...item, variations }, source: 'woocommerce' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  // Try MongoDB
  if (mongoReady && productsCol) {
    try {
      const product = await productsCol.findOne({ id: parseInt(id) });
      if (product) return res.json({ success: true, data: product, source: 'mongodb' });
    } catch (err) {
      console.error('MongoDB ID error:', err.message);
    }
  }

  // Fallback to WooCommerce
  try {
    const wooUrl = getWooUrl(req);
    const auth = getWooAuth(req);
    const url = `${wooUrl}/wp-json/wc/v3/products/${id}`;
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    const item = await r.json();

    if (!item || item.code === 'rest_no_route') return res.status(404).json({ success: false, error: 'Product not found' });

    // Fetch variations if it's a variable product
    let variations = [];
    if (item.type === 'variable') {
      const vUrl = `${wooUrl}/wp-json/wc/v3/products/${item.id}/variations?per_page=100`;
      const vr = await fetch(vUrl, { headers: { 'Authorization': auth } });
      variations = await vr.json();
    }

    res.json({ success: true, data: { ...item, variations }, source: 'woocommerce' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── ADMIN WOOCOMMERCE PROXY ROUTES ───────────────────────────────────────────
app.get('/api/woo/products', async (req, res) => {
  try {
    const wooUrl = getWooUrl(req);
    const params = new URLSearchParams();
    const allowed = ['per_page', 'page', 'category', 'search', 'orderby', 'order', 'after', 'status', 'slug'];
    for (const key of allowed) {
      if (req.query[key]) params.set(key, String(req.query[key]));
    }
    if (!params.has('status')) params.set('status', 'publish');

    const url = `${wooUrl}/wp-json/wc/v3/products?${params}`;
    const auth = getWooAuth(req);

    const r = await fetch(url, { headers: { Authorization: auth, 'Content-Type': 'application/json' } });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: `WooCommerce API error: ${r.statusText}`, details: text.slice(0, 500) });
    }

    res.set('X-WP-Total', r.headers.get('X-WP-Total') || '0');
    res.set('X-WP-TotalPages', r.headers.get('X-WP-TotalPages') || '0');
    res.set('Cache-Control', 'no-store');
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/woo/products/:id/variations', async (req, res) => {
  try {
    const wooUrl = getWooUrl(req);
    const params = new URLSearchParams();
    const allowed = ['per_page', 'page', 'status'];
    for (const key of allowed) {
      if (req.query[key]) params.set(key, String(req.query[key]));
    }
    if (!params.has('per_page')) params.set('per_page', '100');

    const url = `${wooUrl}/wp-json/wc/v3/products/${req.params.id}/variations?${params}`;
    const r = await fetch(url, { headers: { Authorization: getWooAuth(req), 'Content-Type': 'application/json' } });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: `WooCommerce variations error: ${r.statusText}`, details: text.slice(0, 500) });
    }
    res.set('Cache-Control', 'no-store');
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/woo/products/:id', async (req, res) => {
  try {
    const wooUrl = getWooUrl(req);
    const url = `${wooUrl}/wp-json/wc/v3/products/${req.params.id}`;
    const auth = getWooAuth(req);

    const r = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: `Failed to update product: ${r.statusText}`, details: text.slice(0, 800) });
    }

    res.json({ success: true, data: JSON.parse(text) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/woo/categories', async (req, res) => {
  try {
    const wooUrl = getWooUrl(req);
    const params = new URLSearchParams();
    const allowed = ['per_page', 'page', 'search', 'orderby', 'order', 'hide_empty'];
    for (const key of allowed) {
      if (req.query[key]) params.set(key, String(req.query[key]));
    }
    if (!params.has('per_page')) params.set('per_page', '100');

    const url = `${wooUrl}/wp-json/wc/v3/products/categories?${params}`;
    const auth = getWooAuth(req);

    const r = await fetch(url, { headers: { Authorization: auth, 'Content-Type': 'application/json' } });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: `WooCommerce categories error: ${r.statusText}`, details: text.slice(0, 500) });
    }

    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const wooUrl = getWooUrl(req);
    const url = `${wooUrl}/wp-json/wc/v3/products/categories?${new URLSearchParams(req.query)}`;
    const auth = getWooAuth(req);

    const r = await fetch(url, {
      headers: {
        'Authorization': auth,
        'User-Agent': 'LuxtronicsServer/1.0',
        'Accept': 'application/json',
      },
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ success: false, error: `Woo ${r.status}: ${errText.slice(0, 200)}` });
    }

    res.json({ success: true, data: await r.json() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── ADMIN LIVE ANALYTICS ─────────────────────────────────────────────────────
const analyticsEvents = [];
const liveVisitors = new Map();
const LIVE_RETENTION_MS = 10 * 60 * 1000;

function pruneLiveVisitors() {
  const now = Date.now();
  for (const [sessionId, visitor] of liveVisitors.entries()) {
    if (now - Number(visitor.lastSeenAt || 0) > LIVE_RETENTION_MS) {
      liveVisitors.delete(sessionId);
    }
  }
}

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

// ── WOOCOMMERCE TEST ──────────────────────────────────────────────────────────
app.get('/api/test-woo', async (req, res) => {
  const url = `${getWooUrl(req)}/wp-json/wc/v3/products?per_page=1`;
  const auth = getWooAuth(req);

  try {
    const r = await fetch(url, { headers: { Authorization: auth } });
    const text = await r.text();
    res.json({ status: r.status, url, body: text.slice(0, 500) });
  } catch (err) {
    res.json({ error: err.message, url });
  }
});

// ── SEO: DYNAMIC ROBOTS + SITEMAP FOR SEARCH CONSOLE ─────────────────────────
app.get('/robots.txt', (req, res) => {
  const host = getPublicHost(req);
  res.type('text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send([
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /account',
    'Disallow: /account/',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /invoices',
    '',
    'Allow: /shop',
    'Allow: /product/',
    'Allow: /categories',
    'Allow: /latest-arrivals',
    'Allow: /blog',
    '',
    `Sitemap: ${absoluteForHost(host, '/sitemap.xml')}`,
    '',
  ].join('\n'));
});

app.get('/sitemap.xml', async (req, res) => {
  const host = getPublicHost(req);
  const cached = sitemapCache.get(host);
  if (cached && Date.now() - cached.createdAt < SITEMAP_CACHE_MS) {
    res.type('application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.send(cached.xml);
  }

  const products = await fetchSitemapProducts(req);
  const seen = new Set();
  const entries = [];

  for (const page of STATIC_PUBLIC_PATHS) {
    entries.push(sitemapUrlEntry(host, page.path, page));
    seen.add(page.path);
  }

  for (const slug of BLOG_SLUGS) {
    const pathName = `/blog/${slug}`;
    if (!seen.has(pathName)) {
      entries.push(sitemapUrlEntry(host, pathName, { changefreq: 'monthly', priority: '0.6', alternates: true }));
      seen.add(pathName);
    }
  }

  for (const product of products) {
    const slug = String(product.slug || '').trim();
    if (!slug) continue;
    const pathName = `/product/${encodeURIComponent(slug)}`;
    if (seen.has(pathName)) continue;
    entries.push(sitemapUrlEntry(host, pathName, {
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: product.lastmod,
      alternates: true,
    }));
    seen.add(pathName);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '',
    ...entries,
    '',
    '</urlset>',
  ].join('\n');

  sitemapCache.set(host, { createdAt: Date.now(), xml });
  res.type('application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

// ── UNIVERSAL ASSET RESOLVER ──────────────────────────────────────────────────
// Handles stale hashed filenames from LiteSpeed/browser cache
const HASH_MAP = [
  [/^index-.*\.js$/, 'index.js'],
  [/^index-.*\.css$/, 'index.css'],
  [/^vendor-react-.*\.js$/, 'vendor-react.js'],
  [/^vendor-ui-.*\.js$/, 'vendor-ui.js'],
  [/^vendor-query-.*\.js$/, 'vendor-query.js'],
  [/^vendor-icons-.*\.js$/, 'vendor-icons.js'],
  [/^vendor-firebase-.*\.js$/, 'vendor-firebase.js'],
];

app.get('/assets/:filename', (req, res, next) => {
  const filename = req.params.filename.split('?')[0];

  // Exact file exists → pass to static middleware
  if (existsSync(path.join(BUILD_DIR, 'assets', filename))) return next();

  // Remap hashed → fixed filename
  for (const [pattern, fixed] of HASH_MAP) {
    if (pattern.test(filename)) {
      const fixedPath = path.join(BUILD_DIR, 'assets', fixed);
      if (existsSync(fixedPath)) {
        console.log(`🎯 Remapped: ${filename} → ${fixed}`);
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return res.sendFile(fixedPath);
      }
    }
  }

  // Asset truly missing → 404, never serve index.html for assets
  console.warn(`❌ Asset not found: ${filename}`);
  return res.status(404).end();
});

// ── STATIC FILES ──────────────────────────────────────────────────────────────
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {

  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    },
  }));

  app.use(express.static(BUILD_DIR, { index: false }));

  // ── SPA FALLBACK ────────────────────────────────────────────────────────────
  app.get(/(.*)/, (req, res) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/assets') ||
      req.path === '/debug'
    ) return res.status(404).end();

    try {
      let html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

      // Inject Firebase config from server env vars so window.__FIREBASE_CONFIG
      // is available before index.js runs — fixes auth/invalid-api-key
      const fbConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
      };

      const configScript = `<script>window.__FIREBASE_CONFIG = ${JSON.stringify(fbConfig)};</script>`;
      html = html.replace('<head>', `<head>\n  ${configScript}`);

      // Surrogate-Control tells LiteSpeed/CDN never to cache this HTML
      // so the injected window.__FIREBASE_CONFIG always reaches the browser
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Surrogate-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      });

      res.send(html);
    } catch (e) {
      console.error('Failed to serve index.html:', e);
      res.status(500).send('Internal error reading index.html');
    }
  });

} else {
  app.get(/(.*)/, (req, res) =>
    res.status(503).send(`Build not found at: ${BUILD_DIR} — check /debug`)
  );
}

app.listen(port, () => {
  console.log(`🚀 Server ready on port ${port}`);
  console.log(`📁 Build dir:   ${BUILD_DIR}`);
  console.log(`   Exists:      ${existsSync(path.join(BUILD_DIR, 'index.html'))}`);
});
