import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// ── Load env — absolute paths so it always works regardless of CWD ────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });
dotenv.config({ path: path.join(__dirname, '.env.production'), override: true });

// ── Read creds at CALL TIME so they're never stale ───────────────────────────
const wooUrl    = () => process.env.VITE_WOOCOMMERCE_URL    || '';
const wooKey    = () => process.env.VITE_WOOCOMMERCE_KEY    || '';
const wooSecret = () => process.env.VITE_WOOCOMMERCE_SECRET || '';

function wooAuth() {
  const k = wooKey(), s = wooSecret();
  if (!k || !s) throw new Error('WooCommerce credentials not configured');
  return 'Basic ' + Buffer.from(`${k}:${s}`).toString('base64');
}

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim()).filter(Boolean);

// ── Frontend build resolver ──────────────────────────────────────────────────
let frontendPathResolved = null;
let frontendBuildError   = null;

function resolveClientDistPath() {
  const candidates = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'dist'),
    path.join(process.cwd(), 'build'),
    path.join(__dirname, 'frontend-build'),
    path.join(process.cwd(), 'frontend-build'),
  ];
  return candidates.find(c => existsSync(path.join(c, 'index.html'))) || null;
}

function ensureFrontendBuild() {
  let clientPath = resolveClientDistPath();
  if (clientPath) {
    frontendPathResolved = clientPath;
    console.log('✅ Serving frontend from:', clientPath);
    return clientPath;
  }

  console.log('⚠️  No dist/ found — running npm run build...');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    frontendBuildError = 'npm run build failed on server';
    console.error('❌ Build failed');
    return null;
  }

  clientPath = resolveClientDistPath();
  if (!clientPath) {
    frontendBuildError = 'Build ran but dist/index.html still not found';
    console.error('❌', frontendBuildError);
    return null;
  }

  frontendPathResolved = clientPath;
  console.log('✅ Built & serving from:', clientPath);
  return clientPath;
}

// ── WooCommerce helpers ───────────────────────────────────────────────────────
function normalizeWooProduct(product, variations) {
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  const salePrice    = product.sale_price ? parseFloat(product.sale_price) : undefined;
  const price        = salePrice ?? parseFloat(product.price || '0');

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description || '',
    shortDescription: product.short_description || '',
    category: product.categories?.[0]?.name || 'Uncategorized',
    categoryId: product.categories?.[0]?.id,
    categorySlug: product.categories?.[0]?.slug,
    price,
    salePrice,
    regularPrice,
    images: (product.images || []).map(img => ({ id: img.id, src: img.src, alt: img.alt || '' })),
    rating: parseFloat(product.average_rating || 0),
    reviewCount: product.rating_count || 0,
    stockStatus: product.stock_status || 'instock',
    attributes: product.attributes?.map(attr => ({
      name: attr.name,
      value: Array.isArray(attr.options) ? attr.options.join(' | ') : (attr.options || ''),
      options: Array.isArray(attr.options) ? attr.options : [],
    })),
    variations: variations?.map(v => ({
      id: v.id,
      sku: v.sku,
      price: parseFloat(v.price || 0),
      salePrice: v.sale_price ? parseFloat(v.sale_price) : undefined,
      regularPrice: parseFloat(v.regular_price || v.price || 0),
      stockStatus: v.stock_status || 'instock',
      stock: v.stock_quantity,
      attributes: v.attributes?.map(a => ({ name: a.name, option: a.option })) || [],
      image: v.image ? { id: v.image.id, src: v.image.src, alt: v.image.alt || '' } : undefined,
    })),
  };
}

async function fetchWooVariations(productId) {
  const base = wooUrl();
  if (!base) return [];
  try {
    const r = await fetch(`${base}/wp-json/wc/v3/products/${productId}/variations?per_page=100`, {
      headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
    });
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}

async function fetchWooRaw(endpoint) {
  const base = wooUrl();
  if (!base) throw new Error('WooCommerce URL not configured');
  const r = await fetch(`${base}/wp-json/wc/v3/${endpoint}`, {
    headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
  });
  if (!r.ok) throw new Error(`WooCommerce ${r.status}: ${await r.text()}`);
  return { json: await r.json(), headers: r.headers };
}

// ── Express setup ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins, credentials: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    wooConfigured: !!(wooUrl() && wooKey() && wooSecret()),
    frontendPath: frontendPathResolved,
  });
});

app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ready',
    source: 'woocommerce',
    wooConfigured: !!(wooUrl() && wooKey() && wooSecret()),
    wooUrl: wooUrl() || 'NOT SET',
    frontendBuildPath: frontendPathResolved,
    frontendBuildError,
  });
});

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const page    = parseInt(req.query.page    || '1',  10) || 1;
    const perPage = parseInt(req.query.per_page || '50', 10) || 50;
    const params  = new URLSearchParams({ page: String(page), per_page: String(perPage), status: 'publish' });
    if (req.query.category) params.set('category', String(req.query.category));
    if (req.query.search)   params.set('search',   String(req.query.search));

    const { json: items, headers } = await fetchWooRaw(`products?${params}`);
    const total      = parseInt(headers.get('X-WP-Total')      || '0', 10);
    const totalPages = parseInt(headers.get('X-WP-TotalPages') || '0', 10);

    const data = await Promise.all(
      items.map(async p => {
        const vars = p.type === 'variable' ? await fetchWooVariations(p.id) : undefined;
        return normalizeWooProduct(p, vars);
      })
    );

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data, pagination: { page, perPage, total, totalPages }, source: 'woocommerce' });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Unable to load products', details: err.message });
  }
});

// GET /api/products/slug/:slug
app.get('/api/products/slug/:slug', async (req, res) => {
  try {
    const params = new URLSearchParams({ slug: req.params.slug, per_page: '1', status: 'publish' });
    const { json: items } = await fetchWooRaw(`products?${params}`);
    const product = items[0];
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const variations = product.type === 'variable' ? await fetchWooVariations(product.id) : undefined;
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: normalizeWooProduct(product, variations), source: 'woocommerce' });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Unable to load product', details: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid product ID' });
  try {
    const { json: product } = await fetchWooRaw(`products/${id}`);
    const variations = product.type === 'variable' ? await fetchWooVariations(id) : undefined;
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: normalizeWooProduct(product, variations), source: 'woocommerce' });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Product not found', details: err.message });
  }
});

// GET /api/categories  (with pagination)
app.get('/api/categories', async (req, res) => {
  try {
    const page    = parseInt(req.query.page    || '1',  10) || 1;
    const perPage = parseInt(req.query.per_page || '20', 10) || 20;
    const params  = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      hide_empty: 'false',
      orderby: 'count',
      order: 'desc',
    });

    const { json: raw, headers } = await fetchWooRaw(`products/categories?${params}`);
    const total      = parseInt(headers.get('X-WP-Total')      || '0', 10);
    const totalPages = parseInt(headers.get('X-WP-TotalPages') || '0', 10);

    const data = raw.map(c => ({
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
    res.json({ success: true, data, pagination: { page, perPage, total, totalPages }, source: 'woocommerce' });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Unable to load categories', details: err.message });
  }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { line_items, billing, shipping } = req.body;
  if (!line_items || !Array.isArray(line_items)) {
    return res.status(400).json({ success: false, error: 'line_items required' });
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
      line_items: line_items.map(i => ({ product_id: i.product_id, variation_id: i.variation_id || 0, quantity: i.quantity })),
      shipping_lines: [{ method_id: 'flat_rate', method_title: 'Flat Rate', total: '0.00' }],
    };
    const r = await fetch(`${base}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: { Authorization: wooAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!r.ok) throw new Error(`Order failed: ${r.status} ${await r.text()}`);
    res.json({ success: true, data: await r.json() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create order', details: err.message });
  }
});

// ── Serve frontend ────────────────────────────────────────────────────────────
const clientDistPath = ensureFrontendBuild();

if (clientDistPath) {
  app.use(express.static(clientDistPath, { maxAge: '1d', etag: true }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.type('html').send(`
      <html><head><meta charset="utf-8"/><title>Luxtronics</title></head>
      <body style="font-family:system-ui;padding:32px">
        <h1>Luxtronics backend running</h1>
        <p>Frontend build not found.</p>
        <p>CWD: <code>${process.cwd()}</code></p>
        <p>Server dir: <code>${__dirname}</code></p>
        <p>Error: <code>${frontendBuildError || 'none'}</code></p>
        <p>WooCommerce URL: <code>${wooUrl() || 'NOT SET'}</code></p>
        <p><a href="/health">/health</a> · <a href="/api/status">/api/status</a></p>
      </body></html>
    `);
  });
}

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`✅ Luxtronics server on port ${port}`);
  console.log(`📁 Frontend: ${frontendPathResolved || 'NOT FOUND'}`);
  console.log(`🌐 WooCommerce: ${wooUrl() || 'NOT SET'}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
});

process.on('uncaughtException',  err => console.error('❌ Uncaught:', err));
process.on('unhandledRejection', err => console.error('❌ Rejection:', err));