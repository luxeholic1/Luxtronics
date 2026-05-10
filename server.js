import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

const BUILD_DIR = path.join(__dirname, 'prod-build-final');

app.use(cors());
app.use(express.json());

// ── WooCommerce Helpers ──────────────────────────────────────────────────────
const wooUrl = () => process.env.VITE_WOOCOMMERCE_URL || '';
const wooAuth = () => {
  const k = process.env.VITE_WOOCOMMERCE_KEY;
  const s = process.env.VITE_WOOCOMMERCE_SECRET;
  if (!k || !s) return '';
  return 'Basic ' + Buffer.from(`${k}:${s}`).toString('base64');
};

function normalizeProduct(p) {
  const regPrice = parseFloat(p.regular_price || p.price || '0');
  const salePrice = p.sale_price ? parseFloat(p.sale_price) : undefined;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: salePrice ?? regPrice,
    regularPrice: regPrice,
    salePrice,
    images: (p.images || []).map(img => ({ id: img.id, src: img.src, alt: img.alt || '' })),
    category: p.categories?.[0]?.name || 'Uncategorized',
    description: p.description || '',
    stockStatus: p.stock_status || 'instock',
  };
}

// ── API ──────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const url = `${wooUrl()}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const r = await fetch(url, { headers: { 'Authorization': wooAuth() } });
    const items = await r.json();
    res.json({ success: true, data: Array.isArray(items) ? items.map(normalizeProduct) : [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) {}
  res.json({ ok: true, build: BUILD_DIR, assets });
});

// ── UNIVERSAL ASSET RESOLVER (The Ultimate Fix) ──────────────────────────────
// If a browser asks for a hashed file (stale cache), redirect it to the fixed filename.
app.get('/assets/:filename', (req, res, next) => {
  const { filename } = req.params;
  
  // Map hashed names to fixed names
  let target = filename;
  if (filename.startsWith('index-') && filename.endsWith('.js')) target = 'index.js';
  if (filename.startsWith('index-') && filename.endsWith('.css')) target = 'index.css';
  if (filename.startsWith('vendor-react-')) target = 'vendor-react.js';
  if (filename.startsWith('vendor-ui-')) target = 'vendor-ui.js';
  if (filename.startsWith('vendor-query-')) target = 'vendor-query.js';
  if (filename.startsWith('vendor-icons-')) target = 'vendor-icons.js';
  if (filename.startsWith('vendor-firebase-')) target = 'vendor-firebase.js';

  const fullPath = path.join(BUILD_DIR, 'assets', target);
  
  if (existsSync(fullPath)) {
    console.log(`🎯 Universal Resolver: ${filename} -> ${target}`);
    return res.sendFile(fullPath, { maxAge: '1y', immutable: true });
  }
  
  next();
});

// ── SERVING ──────────────────────────────────────────────────────────────────
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(BUILD_DIR));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => res.status(503).send('Build not found. Please run npm run build.'));
}

app.listen(port, () => console.log(`🚀 Server ready on ${port}`));