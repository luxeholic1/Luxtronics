import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

const BUILD_DIR = path.join(__dirname, 'prod-build-final');

// Fallback keys in case process.env fails on Hostinger
const FB_FALLBACK = {
  apiKey: "AIzaSyDi14g9T1nZW3i-QiHlYbFG-xI7cWnic4A",
  authDomain: "luxtronics-61482.firebaseapp.com",
  projectId: "luxtronics-61482",
  storageBucket: "luxtronics-61482.firebasestorage.app",
  messagingSenderId: "261498538242",
  appId: "1:261498538242:web:2873817a30f25b86f99a1b"
};

app.use(cors());
app.use(express.json());

// ── DEBUG ───────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  res.json({
    ok: true,
    env: {
      FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? 'SET (' + process.env.VITE_FIREBASE_API_KEY.length + ' chars)' : 'MISSING',
      WOO_URL: process.env.VITE_WOOCOMMERCE_URL || 'MISSING',
    },
    build_dir: BUILD_DIR,
    build_exists: existsSync(path.join(BUILD_DIR, 'index.html'))
  });
});

// ── API ─────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(`${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`).toString('base64');
    const r = await fetch(url, { 
      headers: { 
        'Authorization': auth,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      } 
    });
    if (!r.ok) throw new Error(`Woo Status: ${r.status}`);
    res.json({ success: true, data: await r.json() });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── ASSET RESOLVER ──────────────────────────────────────────────────────────
app.get('/assets/:filename', (req, res, next) => {
  const { filename } = req.params;
  let target = filename.split('?')[0];
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
        apiKey: process.env.VITE_FIREBASE_API_KEY || FB_FALLBACK.apiKey,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || FB_FALLBACK.authDomain,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || FB_FALLBACK.projectId,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || FB_FALLBACK.storageBucket,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FB_FALLBACK.messagingSenderId,
        appId: process.env.VITE_FIREBASE_APP_ID || FB_FALLBACK.appId
      };
      
      const configScript = `<script>window.__FIREBASE_CONFIG = ${JSON.stringify(fbConfig)};</script>`;
      // Use a more robust replace for <head>
      html = html.replace(/<head>/i, `<head>${configScript}`);
      
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