/**
 * Express Server Setup with MongoDB
 * Main server file that integrates all services
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { initializeMongoDB, disconnectMongoDB } from './db/mongodb';
import { createProductRoutes } from './routes/products';
import { createUserRoutes } from './routes/users';
import { createWooCommerceProxyRoutes } from './routes/woocommerce-proxy';
import { createProductDocument, createCategoryDocument } from './models/mongo-models';
import { globalRateLimiter, sanitizeRequestBody, securityHeaders } from './middleware/security';

// Load environment variables — .env first, then .env.local overrides
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

interface ServerConfig {
  port?: number;
  corsOrigin?: string | string[];
}

export async function setupServer(config: ServerConfig = {}): Promise<Express> {
  const port = config.port || parseInt(process.env.PORT || '3001');
  const configuredOrigin = config.corsOrigin || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const corsOrigin = Array.isArray(configuredOrigin)
    ? configuredOrigin
    : String(configuredOrigin)
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

  const app = express();
  app.set('trust proxy', 1);

  const sourceUrl = process.env.VITE_WOOCOMMERCE_URL;
  const consumerKey = process.env.VITE_WOOCOMMERCE_KEY;
  const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET;

  function getWooAuthHeader(): string {
    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials are not configured');
    }

    return 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  }

  async function fetchWooProducts(params: URLSearchParams): Promise<{ items: any[]; total: number; totalPages: number }> {
    if (!sourceUrl) {
      throw new Error('WooCommerce URL not configured');
    }

    const requestUrl = `${sourceUrl}/wp-json/wc/v3/products?${params}`;
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: getWooAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`WooCommerce API error ${response.status}: ${body}`);
    }

    const items = await response.json();
    return {
      items,
      total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
      totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
    };
  }

  async function fetchWooCategories(): Promise<any[]> {
    if (!sourceUrl) {
      throw new Error('WooCommerce URL not configured');
    }

    const response = await fetch(`${sourceUrl}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=true`, {
      headers: {
        Authorization: getWooAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`WooCommerce categories error ${response.status}: ${body}`);
    }

    return response.json();
  }

  // Middleware
  app.use(securityHeaders);
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(sanitizeRequestBody);
  app.use(
    cors({
      origin: corsOrigin.length > 0 ? corsOrigin : true,
      credentials: true,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  let mongoReady = false;
  let mongoError: string | null = null;
  let db: any = null;

  app.get('/api/status', (req, res) => {
    res.json({
      success: true,
      status: mongoReady ? 'ready' : 'degraded',
      mongoReady,
      fallback: mongoReady ? 'mongodb' : 'woocommerce',
      details: mongoError,
    });
  });

  app.get('/api/products', async (req, res, next) => {
    if (mongoReady) {
      return next();
    }

    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 50;
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        status: 'publish',
      });

      const category = req.query.category as string;
      const search = req.query.search as string;

      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const { items, total, totalPages } = await fetchWooProducts(params);
      const products = items.map(createProductDocument);

      res.set('Cache-Control', 'public, max-age=300');
      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          perPage,
          total,
          totalPages,
        },
        source: 'woocommerce',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(503).json({
        success: false,
        error: 'Unable to load products',
        details: message,
        mongoError,
      });
    }
  });

  app.get('/api/categories', async (req, res, next) => {
    if (mongoReady) {
      return next();
    }

    try {
      const categories = (await fetchWooCategories()).map((category) => ({
        ...createCategoryDocument(category),
        image: category.image
          ? {
              id: category.image.id || category.id,
              src: category.image.src,
              alt: category.image.alt || '',
            }
          : undefined,
      }));

      res.set('Cache-Control', 'public, max-age=3600');
      res.json({
        success: true,
        data: categories,
        source: 'woocommerce',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(503).json({
        success: false,
        error: 'Unable to load categories',
        details: message,
        mongoError,
      });
    }
  });

  app.get('/api/products/slug/:slug', async (req, res, next) => {
    if (mongoReady) {
      return next();
    }

    try {
      const params = new URLSearchParams({
        slug: req.params.slug,
        per_page: '1',
        status: 'publish',
      });

      const { items } = await fetchWooProducts(params);
      const product = items[0];

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      res.set('Cache-Control', 'public, max-age=300');
      res.json({
        success: true,
        data: createProductDocument(product),
        source: 'woocommerce',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(503).json({
        success: false,
        error: 'Unable to load product',
        details: message,
        mongoError,
      });
    }
  });

  // Start server immediately so Hostinger sees the app as healthy even while MongoDB connects.
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  void (async () => {
    try {
      console.log('🔄 Initializing MongoDB...');
      console.log('📋 MONGODB_URI exists:', !!process.env.MONGODB_URI);
      console.log('📋 MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME);

      db = await initializeMongoDB();
      console.log('✅ MongoDB initialized successfully!');
      mongoReady = true;

      // Register API routes once the database is available.
      const productRoutes = createProductRoutes(db);
      const userRoutes = createUserRoutes(db);
      app.use('/api', productRoutes);
      app.use('/api', userRoutes);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to initialize MongoDB:', errorMsg);
      mongoError = errorMsg;
    }
  })();

  // Register WooCommerce proxy routes — independent of MongoDB
  const wooProxyRoutes = createWooCommerceProxyRoutes();
  app.use('/api', wooProxyRoutes);

  // Serve frontend build in production.
  const primaryBuildPath = path.resolve(process.cwd(), 'dist');
  const fallbackBuildPath = path.resolve(process.cwd(), 'build');
  const clientDistPath = existsSync(primaryBuildPath) ? primaryBuildPath : fallbackBuildPath;

  if (existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }

      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.type('html').send(`
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Luxtronics API</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 32px; line-height: 1.5; }
              code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>Luxtronics backend is running</h1>
            <p>This port serves API routes only until the frontend build is present.</p>
            <p>Open the frontend shop at <code>http://localhost:5173</code>.</p>
            <p>Health check: <a href="/health">/health</a></p>
          </body>
        </html>
      `);
    });
  }

  if (process.env.NODE_ENV === 'production' && existsSync(clientDistPath)) {
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }

      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  // 404 fallback - important for Hostinger
  app.use((req, res) => {
    console.warn(`❌ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
      success: false,
      error: 'Not Found',
      path: req.path,
    });
  });

  return app;
}

// Start server if this file is run directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  console.log('🚀 Starting Luxtronics backend...');
  console.log('📋 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  });

  setupServer()
    .then(() => {
      console.log('✅ Server setup completed successfully');
    })
    .catch(error => {
      console.error('❌ Server setup error:', error);
      // Don't exit - let Hostinger know server is at least responsive
      console.error('Server will continue with limited functionality');
    });
}

export default setupServer;
