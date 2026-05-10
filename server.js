import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// EXTREME CLEANUP: Delete any folders that might be causing cache issues
try {
  const staleDirs = ['hostinger-deploy', 'frontend-build', 'dist'];
  staleDirs.forEach(dir => {
    const p = path.join(__dirname, dir);
    if (existsSync(p)) {
      console.log(`🧹 Removing stale dir: ${dir}`);
      rmSync(p, { recursive: true, force: true });
    }
  });
} catch (e) { console.error('Cleanup error:', e); }

const BUILD_DIR = path.join(__dirname, 'prod-build-final');

app.use(cors());
app.use(express.json());

// DEBUG
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
        <h1>🛠 Ultra Debug Info (v4)</h1>
        <p><strong>Build Dir:</strong> ${BUILD_DIR}</p>
        <p><strong>Assets found:</strong> ${assets.join(', ')}</p>
        <hr/>
        <h2>📄 index.html Content:</h2>
        <pre style="background:#000; padding:10px; border:1px solid #444;">${indexHtml.replace(/</g, '&lt;')}</pre>
      </body>
    </html>
  `);
});

// SERVING
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { 
    maxAge: '1y', 
    immutable: true, 
    fallthrough: false 
  }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    
    try {
      let html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
      
      // Inject version tag AND cache-busting query params to all assets
      const cacheBuster = `?v=${Date.now()}`;
      html = html.replace(/\.js"/g, `.js${cacheBuster}"`);
      html = html.replace(/\.css"/g, `.css${cacheBuster}"`);
      html = html.replace('<title>', `<title>(FINAL v4) `);
      
      res.set({
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.send(html);
    } catch (e) {
      res.status(500).send('Error reading index.html');
    }
  });
} else {
  app.get('*', (req, res) => res.status(503).send('prod-build-final not found. Check /debug'));
}

app.listen(port, () => console.log(`Server started on ${port}`));