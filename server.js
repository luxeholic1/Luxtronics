import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = parseInt(process.env.PORT || '3001', 10);

const sourceUrl = process.env.VITE_WOOCOMMERCE_URL;
const consumerKey = process.env.VITE_WOOCOMMERCE_KEY;
const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET;
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
let frontendBuildError = null;
let frontendPathResolved = null;

function resolveClientDistPath() {
  const candidates = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'dist'),
    path.join(process.cwd(), 'build'),
  ];

  const found = candidates.find((candidate) => existsSync(path.join(candidate, 'index.html')));
  return found || null;
}

function ensureFrontendBuild() {
  let clientPath = resolveClientDistPath();

  if (clientPath) {
    frontendPathResolved = clientPath;
    return clientPath;
  }

  console.log('⚠️ Frontend build not found. Running npm run build...');
  const buildResult = spawnSync('npm', ['run', 'build'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (buildResult.status !== 0) {
    console.error('❌ npm run build failed, trying direct Vite build...');

    const viteCli = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
    const viteFallback = spawnSync(process.execPath, [viteCli, 'build', '--config', path.join(__dirname, 'vite.config.ts')], {
      cwd: __dirname,
      env: process.env,
      stdio: 'inherit',
    });

    if (viteFallback.status !== 0) {
      frontendBuildError = 'Both npm build and direct Vite build failed';
      console.error('❌ Frontend build failed at startup');
      return null;
    }
  }

  clientPath = resolveClientDistPath();
  if (!clientPath) {
    frontendBuildError = 'Build command completed but dist/build index.html not found';
    console.error('❌ Build command finished but dist/build still missing');
    return null;
  }

  frontendPathResolved = clientPath;
  frontendBuildError = null;
  console.log('✅ Frontend build generated at:', clientPath);
  return clientPath;
}

function getWooAuthHeader() {
  if (!consumerKey || !consumerSecret) {
    throw new Error('WooCommerce credentials are not configured');
  }

  return 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
}

function normalizeWooProduct(product) {
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : undefined;
  const price = salePrice ?? parseFloat(product.price || '0');

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description || '',
    shortDescription: product.short_description || '',
    category: product.categories?.[0]?.name || 'Uncategorized',
    categoryId: product.categories?.[0]?.id,
    price,
    salePrice,
    regularPrice,
    images: (product.images || []).map((image) => ({
      id: image.id,
      src: image.src,
      alt: image.alt || '',
    })),
    rating: parseFloat(product.average_rating || 0),
    reviewCount: product.rating_count || 0,
    stockStatus: product.stock_status || 'instock',
  };
}

function normalizeWooCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image: category.image
      ? {
          id: category.image.id || category.id,
          src: category.image.src,
          alt: category.image.alt || '',
        }
      : undefined,
    count: category.count || 0,
  };
}

async function fetchWooProducts(params) {
  if (!sourceUrl) {
    throw new Error('WooCommerce URL not configured');
  }

  const requestUrl = `${sourceUrl}/wp-json/wc/v3/products?${params}`;
  const response = await fetch(requestUrl, {
    headers: {
      Authorization: getWooAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce API error ${response.status}: ${body}`);
  }

  return {
    items: await response.json(),
    total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
  };
}

async function fetchWooCategories() {
  if (!sourceUrl) {
    throw new Error('WooCommerce URL not configured');
  }

  const response = await fetch(`${sourceUrl}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=true`, {
    headers: {
      Authorization: getWooAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce categories error ${response.status}: ${body}`);
  }

  return response.json();
}

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(
  cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ready',
    mongoReady: false,
    fallback: 'woocommerce',
    frontendBuildPath: frontendPathResolved,
    frontendBuildError,
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10) || 1;
    const perPage = parseInt(req.query.per_page || '50', 10) || 50;
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      status: 'publish',
    });

    const category = req.query.category;
    const search = req.query.search;

    if (category) params.set('category', String(category));
    if (search) params.set('search', String(search));

    const { items, total, totalPages } = await fetchWooProducts(params);

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      data: items.map(normalizeWooProduct),
      pagination: { page, perPage, total, totalPages },
      source: 'woocommerce',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(503).json({ success: false, error: 'Unable to load products', details: message });
  }
});

app.get('/api/products/slug/:slug', async (req, res) => {
  try {
    const params = new URLSearchParams({
      slug: req.params.slug,
      per_page: '1',
      status: 'publish',
    });

    const { items } = await fetchWooProducts(params);
    const product = items[0];

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      data: normalizeWooProduct(product),
      source: 'woocommerce',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(503).json({ success: false, error: 'Unable to load product', details: message });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = (await fetchWooCategories()).map(normalizeWooCategory);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ success: true, data: categories, source: 'woocommerce' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(503).json({ success: false, error: 'Unable to load categories', details: message });
  }
});

app.get('/api/woo/status', async (_req, res) => {
  try {
    if (!sourceUrl || !consumerKey || !consumerSecret) {
      return res.json({
        connected: false,
        error: 'WooCommerce credentials missing in environment',
        sourceUrl: sourceUrl || 'not set',
      });
    }

    const response = await fetch(`${sourceUrl}/wp-json/wc/v3/products?per_page=1`, {
      headers: { Authorization: getWooAuthHeader() },
    });

    res.json({
      connected: response.ok,
      status: response.status,
      sourceUrl,
      totalProducts: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.json({ connected: false, error: message, sourceUrl: sourceUrl || 'not set' });
  }
});

const clientDistPath = ensureFrontendBuild();

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.type('html').send(`
      <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
        <body style="font-family:system-ui,sans-serif;padding:32px">
          <h1>Luxtronics backend is running</h1>
          <p>Frontend build not found yet.</p>
          <p>Build path: <code>${frontendPathResolved || 'not resolved'}</code></p>
          <p>Build error: <code>${frontendBuildError || 'none'}</code></p>
          <p>Working directory: <code>${process.cwd()}</code></p>
          <p>Server directory: <code>${__dirname}</code></p>
          <p>Health check: <a href="/health">/health</a></p>
          <p>Status: <a href="/api/status">/api/status</a></p>
        </body>
      </html>
    `);
  });
}

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log('🚀 Luxtronics standalone server started');
  console.log('📍 Port:', port);
  console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('🧪 WooCommerce URL set:', !!sourceUrl);
  console.log('🧪 MongoDB URI set:', !!process.env.MONGODB_URI);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});