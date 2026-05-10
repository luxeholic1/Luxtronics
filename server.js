import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, lstatSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Data Normalizer
function normalizeProduct(p) {
  const price = parseFloat(p.price || p.regular_price || '0');
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: price,
    regularPrice: parseFloat(p.regular_price || p.price || '0'),
    salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
    images: (p.images || []).map(img => ({ id: img.id, src: img.src, alt: img.alt || '' })),
    category: p.categories?.[0]?.name || 'Uncategorized',
    stockStatus: p.stock_status || 'instock',
  };
}

// Robust Build Finder
function findBuildDir() {
  const searchPaths = [
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'build'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, 'hostinger-deploy'),
    path.join(__dirname, 'frontend-build'),
  ];
  
  for (const p of searchPaths) {
    if (existsSync(path.join(p, 'index.html'))) {
      console.log(`✅ Found build at: ${p}`);
      return p;
    }
  }
  return null;
}

const BUILD_DIR = findBuildDir();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    buildDir: BUILD_DIR,
    cwd: process.cwd(),
    dirname: __dirname,
    node: process.version,
    env: { 
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      WOO: !!process.env.VITE_WOOCOMMERCE_URL 
    }
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const wooUrl = process.env.VITE_WOOCOMMERCE_URL;
    const wooKey = process.env.VITE_WOOCOMMERCE_KEY;
    const wooSec = process.env.VITE_WOOCOMMERCE_SECRET;
    
    if (!wooUrl || !wooKey || !wooSec) throw new Error('WooCommerce credentials missing');
    
    const auth = 'Basic ' + Buffer.from(`${wooKey}:${wooSec}`).toString('base64');
    const params = new URLSearchParams(req.query);
    const response = await fetch(`${wooUrl}/wp-json/wc/v3/products?${params}`, {
      headers: { 'Authorization': auth }
    });
    
    if (!response.ok) throw new Error(`Woo Status: ${response.status}`);
    const items = await response.json();
    res.json({ success: true, data: items.map(normalizeProduct) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Static Serving
if (BUILD_DIR) {
  // 1. Assets folder (long cache)
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true
  }));

  // 2. Root static files
  app.use(express.static(BUILD_DIR, { maxAge: '1h' }));

  // 3. SPA Fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/health') return res.status(404).end();
    
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    });
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  // Debug mode if build is missing
  app.get('*', (req, res) => {
    let fileList = [];
    try { fileList = readdirSync(__dirname); } catch (e) {}
    
    res.status(503).send(`
      <div style="font-family:sans-serif;padding:40px;">
        <h1 style="color:#e11d48">503 Service Unavailable</h1>
        <p><strong>Error:</strong> Frontend build directory not found.</p>
        <hr/>
        <p><strong>Debug Info:</strong></p>
        <ul>
          <li><strong>CWD:</strong> ${process.cwd()}</li>
          <li><strong>__dirname:</strong> ${__dirname}</li>
          <li><strong>Files in root:</strong> ${fileList.join(', ')}</li>
        </ul>
        <p>Please ensure the <code>build/</code> folder is pushed to GitHub.</p>
      </div>
    `);
  });
}

app.listen(port, () => console.log(`🚀 Server on port ${port}`));