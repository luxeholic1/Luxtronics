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

const BUILD_DIR = [
  path.join(__dirname, 'build'),
  path.join(process.cwd(), 'build'),
].find(p => existsSync(path.join(p, 'index.html')));

app.use(cors());
app.use(express.json());

// DEBUG
app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) {}
  res.json({ ok: true, build: BUILD_DIR, assets });
});

// API
app.get('/api/products', async (req, res) => {
  try {
    const url = `${process.env.VITE_WOOCOMMERCE_URL}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const auth = 'Basic ' + Buffer.from(`${process.env.VITE_WOOCOMMERCE_KEY}:${process.env.VITE_WOOCOMMERCE_SECRET}`).toString('base64');
    const r = await fetch(url, { headers: { 'Authorization': auth } });
    res.json(await r.json());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SERVING
if (BUILD_DIR) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { 
    maxAge: '1y', 
    immutable: true, 
    fallthrough: false 
  }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    
    // READ HTML AND INJECT A VERSION STRING TO PROVE IT'S US
    try {
      let html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
      
      // Inject a visible flag to the title so we can confirm it's not a cached version
      html = html.replace('<title>', '<title>(LIVE v3) ');
      
      res.set({
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Version': 'v3'
      });
      res.send(html);
    } catch (e) {
      res.status(500).send('Error reading index.html');
    }
  });
} else {
  app.get('*', (req, res) => res.status(503).send('Build not found. Check /debug'));
}

app.listen(port, () => console.log(`Server started on ${port}`));