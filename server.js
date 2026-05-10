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

// ✅ Updated folder name
const BUILD_DIR = path.join(__dirname, 'build');

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

// ── WooCommerce API ───────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(
      `${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`
    ).toString('base64');

    console.log(`Proxying to: ${url}`);

    const r = await fetch(url, {
      headers: {
        'Authorization': auth,
        'User-Agent': 'LuxtronicsServer/1.0',
        'Accept': 'application/json',
      },
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error(`Woo Error (${r.status}):`, errText);
      return res.status(500).json({ success: false, error: `Woo ${r.status}: ${errText.slice(0, 200)}` });
    }

    res.json({ success: true, data: await r.json() });
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── WooCommerce connection test ───────────────────────────────────────────────
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
// Remaps stale hashed filenames (from LiteSpeed/browser cache) to fixed names.
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

  // Exact file exists → let static middleware handle it
  if (existsSync(path.join(BUILD_DIR, 'assets', filename))) return next();

  // Try remap hashed → fixed
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

  // Truly missing asset → 404 (never serve index.html for assets)
  console.warn(`❌ Asset not found: ${filename}`);
  return res.status(404).end();
});

// ── STATIC + SPA ──────────────────────────────────────────────────────────────
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {

  // Serve assets — no long-term cache since filenames have no hashes
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    },
  }));

  // Other static files (favicon, robots.txt, etc.)
  app.use(express.static(BUILD_DIR, { index: false }));

  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/assets') ||
      req.path === '/debug'
    ) return res.status(404).end();

    try {
      let html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

      // Inject Firebase config so the built app can read window.__FIREBASE_CONFIG
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

      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Surrogate-Control': 'no-store',   // Tells LiteSpeed not to cache HTML
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
  app.get('*', (req, res) =>
    res.status(503).send(`Build not found at: ${BUILD_DIR} — check /debug`)
  );
}

app.listen(port, () => {
  console.log(`🚀 Server ready on port ${port}`);
  console.log(`📁 Build dir:   ${BUILD_DIR}`);
  console.log(`   Exists:      ${existsSync(path.join(BUILD_DIR, 'index.html'))}`);
});