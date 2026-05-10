import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env with absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

const BUILD_DIR = path.join(__dirname, 'prod-build-final');

function mask(str) {
  if (!str) return '❌ MISSING';
  return str.substring(0, 3) + '...' + str.substring(str.length - 2);
}

app.use(cors());
app.use(express.json());

// ── DEBUG ───────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) {}
  
  res.json({
    ok: true,
    build: BUILD_DIR,
    env_check: {
      FIREBASE_KEY: mask(process.env.VITE_FIREBASE_API_KEY),
      WOO_URL: process.env.VITE_WOOCOMMERCE_URL,
      WOO_KEY: mask(process.env.VITE_WOOCOMMERCE_KEY),
      WOO_SEC: mask(process.env.VITE_WOOCOMMERCE_SECRET),
    },
    assets: assets.filter(a => !a.startsWith('.'))
  });
});

// ── API ─────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(`${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`).toString('base64');
    
    console.log(`Proxying to: ${url}`);
    
    const r = await fetch(url, { 
      headers: { 
        'Authorization': auth,
        'User-Agent': 'LuxtronicsServer/1.0',
        'Accept': 'application/json'
      } 
    });
    
    if (!r.ok) {
      const errText = await r.text();
      console.error(`Woo Error (${r.status}):`, errText);
      throw new Error(`Woo Error ${r.status}: ${errText}`);
    }
    
    res.json({ success: true, data: await r.json() });
  } catch (err) { 
    console.error('API Error:', err.message);
    res.status(500).json({ success: false, error: err.message }); 
  }
});

// ── UNIVERSAL ASSET RESOLVER ────────────────────────────────────────────────
app.get('/assets/:filename', (req, res, next) => {
  const { filename } = req.params;
  let target = filename.split('?')[0]; // strip query params
  
  if (target.startsWith('index-') && target.endsWith('.js')) target = 'index.js';
  if (target.startsWith('index-') && target.endsWith('.css')) target = 'index.css';
  if (target.startsWith('vendor-react-')) target = 'vendor-react.js';
  if (target.startsWith('vendor-ui-')) target = 'vendor-ui.js';
  if (target.startsWith('vendor-query-')) target = 'vendor-query.js';
  if (target.startsWith('vendor-icons-')) target = 'vendor-icons.js';
  if (target.startsWith('vendor-firebase-')) target = 'vendor-firebase.js';

  const fullPath = path.join(BUILD_DIR, 'assets', target);
  if (existsSync(fullPath)) return res.sendFile(fullPath);
  next();
});

// ── SERVING ──────────────────────────────────────────────────────────────────
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(BUILD_DIR));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    
    try {
      let html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
      
      const fbConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID
      };
      
      const configScript = `<script>window.__FIREBASE_CONFIG = ${JSON.stringify(fbConfig)};</script>`;
      html = html.replace('<head>', `<head>${configScript}`);
      
      // Inject cache-busting
      const cacheBuster = `?v=${Date.now()}`;
     
      res.set({
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      });
      res.send(html);
    } catch (e) { res.status(500).send('Error reading index.html'); }
  });
} else {
  app.get('*', (req, res) => res.status(503).send('prod-build-final not found.'));
}

app.listen(port, () => console.log(`🚀 Ready on ${port}`));