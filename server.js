import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { MongoClient } from 'mongodb';

dotenv.config({ path: path.join(__dirname, '.env') });

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

app.use(cors());
app.use(express.json());

// ── DEBUG ─────────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) {}

  res.json({
    ok: true,
    build: BUILD_DIR,
    buildExists: existsSync(path.join(BUILD_DIR, 'index.html')),
    env_check: {
      FIREBASE_KEY: mask(process.env.VITE_FIREBASE_API_KEY),
      WOO_URL: process.env.VITE_WOOCOMMERCE_URL,
      WOO_KEY: mask(process.env.VITE_WOOCOMMERCE_KEY),
      WOO_SEC: mask(process.env.VITE_WOOCOMMERCE_SECRET),
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
      if (category) query.category = { $regex: category, $options: 'i' };

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
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(
      `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
    ).toString('base64');

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
    const auth = 'Basic ' + Buffer.from(
      `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
    ).toString('base64');
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?slug=${slug}`;
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    const items = await r.json();
    const item = items[0];

    if (!item) return res.status(404).json({ success: false, error: 'Product not found' });

    // Fetch variations if it's a variable product
    let variations = [];
    if (item.type === 'variable') {
      const vUrl = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products/${item.id}/variations`;
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
    const auth = 'Basic ' + Buffer.from(
      `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
    ).toString('base64');
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products/${id}`;
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    const item = await r.json();

    if (!item || item.code === 'rest_no_route') return res.status(404).json({ success: false, error: 'Product not found' });

    // Fetch variations if it's a variable product
    let variations = [];
    if (item.type === 'variable') {
      const vUrl = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products/${item.id}/variations`;
      const vr = await fetch(vUrl, { headers: { 'Authorization': auth } });
      variations = await vr.json();
    }
    
    res.json({ success: true, data: { ...item, variations }, source: 'woocommerce' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products/categories?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(
      `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
    ).toString('base64');

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

// ── WOOCOMMERCE TEST ──────────────────────────────────────────────────────────
app.get('/api/test-woo', async (req, res) => {
  const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=1`;
  const auth = 'Basic ' + Buffer.from(
    `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
  ).toString('base64');

  try {
    const r = await fetch(url, { headers: { Authorization: auth } });
    const text = await r.text();
    res.json({ status: r.status, url, body: text.slice(0, 500) });
  } catch (err) {
    res.json({ error: err.message, url });
  }
});

// ── UNIVERSAL ASSET RESOLVER ──────────────────────────────────────────────────
// Handles stale hashed filenames from LiteSpeed/browser cache
const HASH_MAP = [
  [/^index-.*\.js$/,           'index.js'],
  [/^index-.*\.css$/,          'index.css'],
  [/^vendor-react-.*\.js$/,    'vendor-react.js'],
  [/^vendor-ui-.*\.js$/,       'vendor-ui.js'],
  [/^vendor-query-.*\.js$/,    'vendor-query.js'],
  [/^vendor-icons-.*\.js$/,    'vendor-icons.js'],
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
        apiKey:            process.env.VITE_FIREBASE_API_KEY,
        authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId:             process.env.VITE_FIREBASE_APP_ID,
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