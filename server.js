import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, lstatSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Dynamic Build Resolver
function findBuildDir() {
  const searchPaths = [
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'build'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, 'hostinger-deploy'),
    path.join(__dirname, 'frontend-build'),
  ];
  return searchPaths.find(p => existsSync(path.join(p, 'index.html')));
}

const BUILD_DIR = findBuildDir();

// WooCommerce Helpers
const wooUrl = () => process.env.VITE_WOOCOMMERCE_URL || '';
const wooAuth = () => {
  const k = process.env.VITE_WOOCOMMERCE_KEY;
  const s = process.env.VITE_WOOCOMMERCE_SECRET;
  if (!k || !s) return '';
  return 'Basic ' + Buffer.from(`${k}:${s}`).toString('base64');
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── DEBUG ROUTE (The request from the user) ──────────────────────────────────
app.get('/debug', async (req, res) => {
  let rootFiles = [];
  try { rootFiles = readdirSync(__dirname); } catch (e) { rootFiles = [e.message]; }
  
  let buildFiles = [];
  if (BUILD_DIR) {
    try { buildFiles = readdirSync(BUILD_DIR); } catch (e) { buildFiles = [e.message]; }
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    VITE_WOOCOMMERCE_URL: process.env.VITE_WOOCOMMERCE_URL,
    VITE_WOOCOMMERCE_KEY: process.env.VITE_WOOCOMMERCE_KEY ? '✅ SET' : '❌ MISSING',
    VITE_WOOCOMMERCE_SECRET: process.env.VITE_WOOCOMMERCE_SECRET ? '✅ SET' : '❌ MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING',
  };

  let wooCheck = 'Not Tested';
  if (wooUrl()) {
    try {
      const r = await fetch(`${wooUrl()}/wp-json/wc/v3/products?per_page=1`, {
        headers: { 'Authorization': wooAuth() }
      });
      wooCheck = r.ok ? '✅ Connected' : `❌ Failed (${r.status})`;
    } catch (e) {
      wooCheck = `❌ Error: ${e.message}`;
    }
  }

  res.send(`
    <html>
      <head>
        <title>Luxtronics Debug Page</title>
        <style>
          body { font-family: monospace; background: #0f172a; color: #cbd5e1; padding: 40px; line-height: 1.5; }
          h1 { color: #f43f5e; border-bottom: 1px solid #334155; padding-bottom: 10px; }
          h2 { color: #38bdf8; margin-top: 30px; }
          .card { background: #1e293b; padding: 20px; border-radius: 8px; margin-top: 10px; border: 1px solid #334155; }
          .success { color: #4ade80; }
          .error { color: #fb7185; }
          pre { background: #000; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>🛠 Luxtronics Debug Dashboard</h1>
        
        <h2>📡 Server Status</h2>
        <div class="card">
          <p><strong>Status:</strong> <span class="success">Online</span></p>
          <p><strong>CWD:</strong> ${process.cwd()}</p>
          <p><strong>Dirname:</strong> ${__dirname}</p>
          <p><strong>Node Version:</strong> ${process.version}</p>
        </div>

        <h2>📂 Build Configuration</h2>
        <div class="card">
          <p><strong>Resolved Build Dir:</strong> ${BUILD_DIR || '<span class="error">NOT FOUND</span>'}</p>
          <p><strong>Build Files:</strong></p>
          <pre>${buildFiles.join('\n') || 'None'}</pre>
        </div>

        <h2>🌐 Environment Variables</h2>
        <div class="card">
          <pre>${JSON.stringify(envVars, null, 2)}</pre>
        </div>

        <h2>🔌 External Connections</h2>
        <div class="card">
          <p><strong>WooCommerce API:</strong> ${wooCheck}</p>
        </div>

        <h2>📁 Root Directory Contents</h2>
        <div class="card">
          <pre>${rootFiles.join('\n')}</pre>
        </div>

        <p style="margin-top: 40px; color: #64748b;">Generated at ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

// ── Normal API Routes ────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', build: !!BUILD_DIR }));

app.get('/api/products', async (req, res) => {
  try {
    const url = `${wooUrl()}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const response = await fetch(url, { headers: { 'Authorization': wooAuth() } });
    if (!response.ok) throw new Error(`Woo Status: ${response.status}`);
    res.json({ success: true, data: await response.json() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Static Serving ───────────────────────────────────────────────────────────
if (BUILD_DIR) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(BUILD_DIR, { maxAge: '1h' }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    res.set('Cache-Control', 'no-store');
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    if (req.path === '/debug') return; // Handled above
    res.status(503).send(`<h1>Build Not Found</h1><p>Visit <a href="/debug">/debug</a> for more info.</p>`);
  });
}

app.listen(port, () => console.log(`Server on ${port}`));