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

// SEARCH FOR BUILD
const BUILD_DIR = [
  path.join(__dirname, 'build'),
  path.join(process.cwd(), 'build'),
  path.join(__dirname, 'dist'),
].find(p => existsSync(path.join(p, 'index.html')));

app.use(cors());
app.use(express.json());

// ── DEBUG ───────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let indexHtml = 'NOT FOUND';
  let assets = [];
  try { 
    indexHtml = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8'); 
    assets = readdirSync(path.join(BUILD_DIR, 'assets'));
  } catch (e) {}

  res.send(`
    <html>
      <body style="font-family:monospace; background:#111; color:#eee; padding:20px;">
        <h1>🛠 Debug Info</h1>
        <p><strong>Build Dir:</strong> ${BUILD_DIR}</p>
        <p><strong>Assets found:</strong> ${assets.join(', ')}</p>
        <hr/>
        <h2>📄 index.html Content (First 2000 chars):</h2>
        <pre style="background:#000; padding:10px; border:1px solid #444;">${indexHtml.substring(0, 2000).replace(/</g, '&lt;')}</pre>
        <hr/>
        <h2>📦 Environment:</h2>
        <pre>${JSON.stringify({ PORT: process.env.PORT, WOO: !!process.env.VITE_WOOCOMMERCE_URL }, null, 2)}</pre>
      </body>
    </html>
  `);
});

// ── API ─────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(`${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`).toString('base64');
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    res.json(await r.json());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SERVING ──────────────────────────────────────────────────────────────────
if (BUILD_DIR) {
  // Prevent MIME mismatch by disabling fallthrough
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { 
    maxAge: '1y', 
    immutable: true, 
    fallthrough: false 
  }));

  app.use(express.static(BUILD_DIR));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => res.status(503).send('Build not found. check /debug'));
}

app.listen(port, () => console.log(`Server started on ${port}`));