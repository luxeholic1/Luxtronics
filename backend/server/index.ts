/**
 * Express Server Setup with MongoDB + WooCommerce Fallback
 * Production-ready for Hostinger deployment
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GridFSBucket, ObjectId } from 'mongodb';
import { initializeMongoDB } from './db/mongodb';
import { createProductDocument, createCategoryDocument } from './models/mongo-models';
import { validateBlogPostInput } from './models/blog-models';
import { globalRateLimiter, requireSafeContentType, sanitizeRequestBody, securityHeaders } from './middleware/security';
import { createWooCommerceProxyRoutes } from './routes/woocommerce-proxy';
import WooCommerceSync from './services/woocommerce-sync';
import { BlogService } from './services/blog-service';

// ── Load env vars using absolute paths so tsx watch always finds them ─────────
const __selfDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__selfDir, '../..'); // backend/server/ → project root
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });
console.log('📂 Project root:', projectRoot);
console.log('🔑 WOO URL at load:', process.env.VITE_WOOCOMMERCE_URL || 'NOT SET');

interface ServerConfig {
  port?: number;
  corsOrigin?: string | string[];
}

// ── Read WooCommerce creds at call-time so they're never stale ───────────────
// For multi-store support, we use India store credentials by default
// Frontend will call WooCommerce directly for store-specific operations
function wooUrl(): string { 
  return process.env.VITE_WOOCOMMERCE_URL_INDIA || process.env.VITE_WOOCOMMERCE_URL || ''; 
}
function wooKey(): string { 
  return process.env.VITE_WOOCOMMERCE_KEY_INDIA || process.env.VITE_WOOCOMMERCE_KEY || ''; 
}
function wooSecret(): string { 
  return process.env.VITE_WOOCOMMERCE_SECRET_INDIA || process.env.VITE_WOOCOMMERCE_SECRET || ''; 
}

function wooAuthHeader(): string {
  const key = wooKey();
  const secret = wooSecret();
  if (!key || !secret) throw new Error('WooCommerce credentials not configured');
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

function wooFallbackEnabled(): boolean {
  return process.env.ENABLE_WOO_FALLBACK === 'true';
}

async function wooFetch(endpoint: string): Promise<any> {
  const base = wooUrl();
  if (!base) throw new Error('WooCommerce URL not configured in environment');
  const response = await fetch(`${base}/wp-json/wc/v3/${endpoint}`, {
    headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce error ${response.status}: ${body}`);
  }
  return response.json();
}

async function fetchWooProductsRaw(params: URLSearchParams): Promise<{ items: any[]; total: number; totalPages: number }> {
  const base = wooUrl();
  if (!base) throw new Error('WooCommerce URL not configured in environment');
  const url = `${base}/wp-json/wc/v3/products?${params}`;
  const response = await fetch(url, {
    headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce API ${response.status}: ${body}`);
  }
  return {
    items: await response.json(),
    total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
    totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
  };
}

async function fetchWooVariations(productId: number): Promise<any[]> {
  try {
    return await wooFetch(`products/${productId}/variations?per_page=100`);
  } catch {
    return [];
  }
}

async function normalizeWooProducts(items: any[]): Promise<any[]> {
  return Promise.all(
    items.map(async (item) => {
      const variations = item.type === 'variable' ? await fetchWooVariations(item.id) : [];
      return createProductDocument(item, variations);
    })
  );
}

export async function setupServer(config: ServerConfig = {}): Promise<Express> {
  const port = config.port || parseInt(process.env.PORT || '3001');
  const configuredOrigin = config.corsOrigin || process.env.CORS_ORIGIN || '*';
  const corsOrigins = Array.isArray(configuredOrigin)
    ? configuredOrigin
    : String(configuredOrigin).split(',').map((o) => o.trim()).filter(Boolean);

  const app = express();
  app.set('trust proxy', 1);

  // ── Middleware ─────────────────────────────────────────────────────────────
  app.use(securityHeaders);
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(requireSafeContentType);
  app.use(sanitizeRequestBody);
  app.use(cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  }));

  // ── Register WooCommerce Proxy Routes ─────────────────────────────────────
  app.use('/api', createWooCommerceProxyRoutes());

  // ── Blog media uploads ────────────────────────────────────────────────────
  // Primary storage is MongoDB GridFS (same database the rest of the app
  // already depends on). Hostinger's nodejs/ directory is wiped on every
  // redeploy/restart, so anything saved to local disk eventually vanishes
  // along with its still-live blog post reference. Local disk is kept only
  // as a fallback for the brief window before Mongo finishes connecting.
  const uploadsDir = path.join(projectRoot, 'uploads', 'blog');
  mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(path.join(projectRoot, 'uploads'), { maxAge: '7d' }));

  const blogMediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 80 * 1024 * 1024 }, // 80MB, generous enough for short background videos
    fileFilter: (_req, file, cb) => {
      if (/^image\/|^video\//.test(file.mimetype)) return cb(null, true);
      cb(new Error('Only image or video files are allowed'));
    },
  });

  const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === 'application/pdf') return cb(null, true);
      cb(new Error('Only PDF files are allowed'));
    },
  });

  function extractPdfParagraphs(rawText: string): string[] {
    return rawText
      .replace(/\f/g, '\n\n')
      .split(/\n\s*\n/)
      .map((block) => block.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let mongoReady = false;
  let mongoError: string | null = null;
  let productService: any = null;
  let categoryService: any = null;
  let blogService: BlogService | null = null;
  let blogMediaBucket: GridFSBucket | null = null;
  const analyticsEvents: any[] = [];
  const liveVisitors = new Map<string, any>();
  const liveRetentionMs = 10 * 60 * 1000;

  const pruneLiveVisitors = () => {
    const now = Date.now();
    for (const [sessionId, visitor] of liveVisitors.entries()) {
      if (now - Number(visitor.lastSeenAt || 0) > liveRetentionMs) {
        liveVisitors.delete(sessionId);
      }
    }
  };

  // ── Health / status ───────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      success: true,
      status: mongoReady ? 'ready' : 'degraded',
      mongoReady,
      source: mongoReady ? 'mongodb' : 'woocommerce',
      wooConfigured: !!(wooUrl() && wooKey() && wooSecret()),
      mongoError,
    });
  });

  // ── ADMIN LIVE ANALYTICS ─────────────────────────────────────────────────
  // Client-side consent gating (isAnalyticsAllowed) stops real browsers, but
  // a crawler running an old cached JS bundle, or any non-browser client
  // hitting this URL directly, bypasses that entirely. This is the
  // server-side backstop: reject self-identifying bots before doing any
  // work, regardless of what JS they're running or whether they run JS at all.
  const BOT_USER_AGENT_PATTERN = /bot|spider|crawl|slurp|googleother|mediapartners|facebookexternalhit|whatsapp|telegrambot/i;
  const isBotUserAgent = (req: import('express').Request) => BOT_USER_AGENT_PATTERN.test(req.headers['user-agent'] || '');

  app.post('/api/analytics/events', (req, res) => {
    if (isBotUserAgent(req)) return res.status(204).end();

    const event = req.body || {};
    if (!event.sessionId || !event.type) {
      return res.status(400).json({ success: false, error: 'Invalid analytics event' });
    }

    analyticsEvents.unshift({ ...event, timestamp: event.timestamp || Date.now() });
    analyticsEvents.splice(1000);
    res.json({ success: true });
  });

  app.get('/api/analytics/events', (_req, res) => {
    res.json({ success: true, events: analyticsEvents.slice(0, 500) });
  });

  app.post('/api/analytics/live', (req, res) => {
    if (isBotUserAgent(req)) return res.status(204).end();

    const visitor = req.body || {};
    if (!visitor.sessionId) {
      return res.status(400).json({ success: false, error: 'Invalid live visitor heartbeat' });
    }

    liveVisitors.set(visitor.sessionId, {
      ...visitor,
      lastSeenAt: Date.now(),
      status: 'active',
    });
    pruneLiveVisitors();
    res.json({ success: true });
  });

  app.get('/api/analytics/live', (_req, res) => {
    pruneLiveVisitors();
    const now = Date.now();
    const visitors = [...liveVisitors.values()].map((visitor) => ({
      ...visitor,
      status: now - Number(visitor.lastSeenAt || 0) < 30 * 1000 ? 'active' : 'idle',
    }));
    res.json({ success: true, visitors });
  });

  // ── GET /api/products ──────────────────────────────────────────────────────
  app.get('/api/products', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = Math.min(Math.max(parseInt(req.query.per_page as string) || 50, 1), 500);
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    // MongoDB is the storefront read source. WooCommerce fallback is opt-in
    // for maintenance/dev via ENABLE_WOO_FALLBACK=true.
    if (mongoReady && productService) {
      try {
        let result;
        if (search) {
          result = await productService.searchProducts(search, page, perPage, category);
        } else if (category) {
          result = await productService.getProductsByCategory(category, page, perPage);
        } else {
          result = await productService.getProducts(page, perPage);
        }
        res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
        return res.json({
          success: true,
          data: result.products,
          pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) },
          source: 'mongodb',
        });
      } catch (err) {
        console.error('MongoDB products error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load products from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(503).json({
        success: false,
        error: mongoReady ? 'No MongoDB product cache available' : 'MongoDB is not ready',
        source: 'mongodb',
      });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage), status: 'publish' });
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const { items, total, totalPages } = await fetchWooProductsRaw(params);
      const data = await normalizeWooProducts(items);

      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data, pagination: { page, perPage, total, totalPages }, source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('WooCommerce products error:', msg);
      return res.status(503).json({ success: false, error: 'Unable to load products', details: msg });
    }
  });

  // ── GET /api/products/slug/:slug ────────────────────────────────────────────
  app.get('/api/products/slug/:slug', async (req, res) => {
    const { slug } = req.params;

    // Try MongoDB
    if (mongoReady && productService) {
      try {
        const product = await productService.getProductBySlug(slug);
        if (product) {
          res.set('Cache-Control', 'public, max-age=3600');
          return res.json({ success: true, data: product, source: 'mongodb' });
        }
      } catch (err) {
        console.error('MongoDB slug error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load product from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(404).json({ success: false, error: 'Product not found in MongoDB', source: 'mongodb' });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({ slug, per_page: '1', status: 'publish' });
      const { items } = await fetchWooProductsRaw(params);
      const raw = items[0];
      if (!raw) return res.status(404).json({ success: false, error: 'Product not found' });

      const variations = raw.type === 'variable' ? await fetchWooVariations(raw.id) : [];
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: createProductDocument(raw, variations), source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(503).json({ success: false, error: 'Unable to load product', details: msg });
    }
  });

  // ── GET /api/products/:id ───────────────────────────────────────────────────
  app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ success: false, error: 'Invalid product ID' });

    if (mongoReady && productService) {
      try {
        const product = await productService.getProductById(productId);
        if (product) {
          res.set('Cache-Control', 'public, max-age=3600');
          return res.json({ success: true, data: product, source: 'mongodb' });
        }
      } catch (err) {
        console.error('MongoDB product by ID error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load product from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(404).json({ success: false, error: 'Product not found in MongoDB', source: 'mongodb' });
    }

    // Optional WooCommerce fallback.
    try {
      const raw = await wooFetch(`products/${productId}`);
      const variations = raw.type === 'variable' ? await fetchWooVariations(productId) : [];
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: createProductDocument(raw, variations), source: 'woocommerce' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(503).json({ success: false, error: 'Product not found', details: msg });
    }
  });

  // ── GET /api/categories ─────────────────────────────────────────────────────
  app.get('/api/categories', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 20;

    // MongoDB is the storefront category source.
    if (mongoReady && productService) {
      try {
        const categories = (await productService.getAllCategoriesWithCount())
          .filter((category: any) => Number(category.productCount ?? category.count ?? 0) > 0);
        const start = (page - 1) * perPage;
        const paginated = categories.slice(start, start + perPage);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.json({
          success: true,
          data: paginated,
          pagination: { page, perPage, total: categories.length, totalPages: Math.ceil(categories.length / perPage) },
          source: 'mongodb',
        });
      } catch (err) {
        console.error('MongoDB categories error:', err);
        if (!wooFallbackEnabled()) {
          return res.status(503).json({ success: false, error: 'Unable to load categories from MongoDB', source: 'mongodb' });
        }
      }
    }

    if (!wooFallbackEnabled()) {
      return res.status(503).json({
        success: false,
        error: mongoReady ? 'No MongoDB category cache available' : 'MongoDB is not ready',
        source: 'mongodb',
      });
    }

    // Optional WooCommerce fallback.
    try {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
        hide_empty: 'true',
        orderby: 'count',
        order: 'desc',
      });
      const base = wooUrl();
      if (!base) throw new Error('WooCommerce not configured');

      const response = await fetch(`${base}/wp-json/wc/v3/products/categories?${params}`, {
        headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`WooCommerce ${response.status}`);

      const raw = await response.json();
      const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

      const data = raw
        .filter((c: any) => Number(c.count || 0) > 0)
        .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        count: c.count || 0,
        productCount: c.count || 0,
        image: c.image ? { id: c.image.id, src: c.image.src, alt: c.image.alt || '' } : null,
        sampleImage: c.image?.src || null,
      }));

      res.set('Cache-Control', 'public, max-age=1800');
      return res.json({
        success: true,
        data,
        pagination: { page, perPage, total, totalPages },
        source: 'woocommerce',
      });
    } catch (wooErr) {
      console.error('WooCommerce categories error:', wooErr);
    }

    return res.status(503).json({ success: false, error: 'Unable to load categories' });
  });

  // ── GET /api/blogs ───────────────────────────────────────────────────────────
  app.get('/api/blogs', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready', mongoError });
    }
    try {
      const tag = req.query.tag as string | undefined;
      const posts = await blogService.listPosts(tag);
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json({ success: true, data: posts });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to load blog posts', details: msg });
    }
  });

  // ── GET /api/blogs/slug/:slug ────────────────────────────────────────────────
  app.get('/api/blogs/slug/:slug', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready', mongoError });
    }
    try {
      const post = await blogService.getPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to load blog post', details: msg });
    }
  });

  // ── POST /api/blogs ───────────────────────────────────────────────────────────
  app.post('/api/blogs', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready', mongoError });
    }
    const errors = validateBlogPostInput(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }
    try {
      const post = await blogService.createPost(req.body);
      return res.status(201).json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to create blog post', details: msg });
    }
  });

  // ── PUT /api/blogs/:id ─────────────────────────────────────────────────────────
  app.put('/api/blogs/:id', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready', mongoError });
    }
    try {
      const post = await blogService.updatePost(req.params.id, req.body || {});
      if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
      return res.json({ success: true, data: post });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to update blog post', details: msg });
    }
  });

  // ── DELETE /api/blogs/:id ──────────────────────────────────────────────────────
  app.delete('/api/blogs/:id', async (req, res) => {
    if (!mongoReady || !blogService) {
      return res.status(503).json({ success: false, error: 'Blog service is not ready', mongoError });
    }
    try {
      const deleted = await blogService.deletePost(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Blog post not found' });
      return res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: 'Unable to delete blog post', details: msg });
    }
  });

  // ── POST /api/blogs/upload (image or video file) ──────────────────────────────
  app.post('/api/blogs/upload', (req, res) => {
    blogMediaUpload.single('file')(req, res, async (err: any) => {
      if (err) return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-80);
      const kind = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

      if (blogMediaBucket) {
        try {
          const uploadStream = blogMediaBucket.openUploadStream(safeName, {
            metadata: { contentType: req.file.mimetype },
          });
          await new Promise<void>((resolve, reject) => {
            uploadStream.on('error', reject);
            uploadStream.on('finish', () => resolve());
            uploadStream.end(req.file!.buffer);
          });
          const url = `/api/blogs/media/${uploadStream.id.toString()}`;
          return res.status(201).json({ success: true, data: { url, kind } });
        } catch (uploadErr) {
          console.error('GridFS upload failed, falling back to local disk:', uploadErr);
        }
      }

      try {
        const filename = `${Date.now()}-${safeName}`;
        writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
        const url = `/uploads/blog/${filename}`;
        return res.status(201).json({ success: true, data: { url, kind } });
      } catch (fallbackErr) {
        console.error('Local fallback upload failed:', fallbackErr);
        return res.status(500).json({ success: false, error: 'Upload failed' });
      }
    });
  });

  // ── GET /api/blogs/media/:id (stream image/video stored in GridFS) ────────────
  app.get('/api/blogs/media/:id', async (req, res) => {
    if (!blogMediaBucket || !ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }
    try {
      const fileId = new ObjectId(req.params.id);
      const [file] = await blogMediaBucket.find({ _id: fileId }).toArray();
      if (!file) return res.status(404).json({ success: false, error: 'Media not found' });

      res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      const downloadStream = blogMediaBucket.openDownloadStream(fileId);
      downloadStream.on('error', () => res.status(404).end());
      downloadStream.pipe(res);
    } catch {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }
  });

  // ── POST /api/blogs/parse-pdf (text extraction only) ──────────────────────────
  app.post('/api/blogs/parse-pdf', (req, res) => {
    pdfUpload.single('file')(req, res, async (err: any) => {
      if (err) return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
      if (!req.file) return res.status(400).json({ success: false, error: 'No PDF uploaded' });
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        await parser.destroy();
        const paragraphs = extractPdfParagraphs(result.text || '');
        if (paragraphs.length === 0) {
          return res.status(422).json({ success: false, error: 'No extractable text found in this PDF' });
        }
        return res.json({
          success: true,
          data: {
            suggestedTitle: paragraphs[0]?.slice(0, 120) || '',
            suggestedExcerpt: (paragraphs[1] || paragraphs[0] || '').slice(0, 220),
            content: paragraphs,
          },
        });
      } catch (parseErr) {
        const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        return res.status(500).json({ success: false, error: 'Unable to parse PDF', details: msg });
      }
    });
  });

  // ── POST /api/orders ────────────────────────────────────────────────────────
  app.post('/api/orders', async (req, res) => {
    const { line_items, billing, shipping } = req.body;
    if (!line_items || !Array.isArray(line_items)) {
      return res.status(400).json({ success: false, error: 'line_items is required and must be an array' });
    }
    try {
      const base = wooUrl();
      if (!base) throw new Error('WooCommerce not configured');

      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        billing: billing || {},
        shipping: shipping || {},
        line_items: line_items.map((item: any) => ({
          product_id: item.product_id,
          variation_id: item.variation_id || 0,
          quantity: item.quantity,
        })),
        shipping_lines: [{ method_id: 'flat_rate', method_title: 'Flat Rate', total: '0.00' }],
      };

      const orderRes = await fetch(`${base}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: { Authorization: wooAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const text = await orderRes.text();
        throw new Error(`Order creation failed: ${orderRes.status} ${text}`);
      }

      const order = await orderRes.json();
      return res.json({ success: true, data: order });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Order error:', msg);
      return res.status(500).json({ success: false, error: 'Failed to create order', details: msg });
    }
  });

  // ── POST /api/sync (protected) ──────────────────────────────────────────────
  app.post('/api/sync', async (req, res) => {
    const token = req.headers['x-sync-token'];
    if (token !== process.env.SYNC_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    if (!mongoReady) {
      return res.status(503).json({ success: false, error: 'MongoDB not ready for sync' });
    }

    // Trigger sync in background
    const db = await initializeMongoDB();
    const syncService = new WooCommerceSync(db);
    
    syncService.fullSync()
      .then(result => {
        console.log(`✅ Manual sync completed: ${result.products} products, ${result.categories} categories`);
      })
      .catch(err => {
        console.error('❌ Manual sync failed:', err);
      });

    res.json({ success: true, message: 'Sync triggered successfully in background' });
    console.log('Manual sync triggered via API');
  });

  const siteBaseUrl = (hostHeader?: string) => {
    const host = String(hostHeader || 'luxtronics.in').replace(/^www\./, '').split(':')[0];
    if (host === 'luxtronics.com.au') return 'https://luxtronics.com.au';
    if (host === 'luxtronics.co.nz') return 'https://luxtronics.co.nz';
    return 'https://luxtronics.in';
  };

  const xmlEscape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const sitemapUrl = ({
    loc,
    lastmod,
    changefreq,
    priority,
  }: {
    loc: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  }) => [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');

  app.get('/robots.txt', (req, res) => {
    const baseUrl = siteBaseUrl(req.headers.host);
    res.type('text/plain').send([
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin/',
      'Disallow: /account',
      'Disallow: /account/',
      'Disallow: /cart',
      'Disallow: /checkout',
      '',
      'Allow: /shop',
      'Allow: /product/',
      'Allow: /categories',
      'Allow: /latest-arrivals',
      'Allow: /blog',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n'));
  });

  app.get('/.well-known/security.txt', (_req, res) => {
    res.type('text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send([
      'Contact: mailto:support@luxtronics.in',
      'Preferred-Languages: en, hi',
      'Canonical: https://luxtronics.in/.well-known/security.txt',
      'Policy: https://luxtronics.in/privacy',
      'Expires: 2027-06-15T00:00:00Z',
      '',
    ].join('\n'));
  });

  app.get('/sitemap.xml', async (req, res) => {
    const baseUrl = siteBaseUrl(req.headers.host);
    const now = new Date().toISOString();
    const staticPaths = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/shop', changefreq: 'daily', priority: '0.95' },
      { path: '/latest-arrivals', changefreq: 'daily', priority: '0.9' },
      { path: '/categories', changefreq: 'weekly', priority: '0.85' },
      { path: '/blog', changefreq: 'weekly', priority: '0.75' },
      { path: '/about', changefreq: 'monthly', priority: '0.55' },
      { path: '/contact', changefreq: 'monthly', priority: '0.55' },
      { path: '/faq', changefreq: 'monthly', priority: '0.5' },
      { path: '/shipping-returns', changefreq: 'monthly', priority: '0.45' },
      { path: '/payment-method', changefreq: 'monthly', priority: '0.45' },
      { path: '/return-exchange', changefreq: 'monthly', priority: '0.55' },
      { path: '/return-policy', changefreq: 'monthly', priority: '0.55' },
      { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { path: '/terms', changefreq: 'yearly', priority: '0.3' },
    ];

    const urls = staticPaths.map((entry) =>
      sitemapUrl({
        loc: `${baseUrl}${entry.path}`,
        lastmod: now,
        changefreq: entry.changefreq,
        priority: entry.priority,
      }),
    );

    if (mongoReady && productService) {
      try {
        const products = await productService.getSitemapProducts(50000);
        for (const product of products) {
          const date = product.updatedAt || product.syncedAt;
          urls.push(sitemapUrl({
            loc: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
            lastmod: date ? new Date(date).toISOString() : now,
            changefreq: 'weekly',
            priority: '0.8',
          }));
        }
      } catch (err) {
        console.error('Sitemap product URL generation failed:', err);
      }
    }

    if (mongoReady && blogService) {
      try {
        const posts = await blogService.listPosts();
        for (const post of posts) {
          urls.push(sitemapUrl({
            loc: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
            lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : now,
            changefreq: 'monthly',
            priority: '0.6',
          }));
        }
      } catch (err) {
        console.error('Sitemap blog URL generation failed:', err);
      }
    }

    res.type('application/xml').send([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n'));
  });

  // ── Start server ───────────────────────────────────────────────────────────
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`🌐 WooCommerce URL: ${wooUrl() || '⚠️ NOT SET'}`);
  });

  // ── MongoDB init (async, non-blocking) ────────────────────────────────────
  void (async () => {
    try {
      console.log('🔄 Initializing MongoDB...');
      const db = await initializeMongoDB();
      const { ProductService } = await import('./services/product-service');
      productService = new ProductService(db);
      categoryService = productService; // ProductService has getAllCategories
      blogService = new BlogService(db);
      await blogService.createIndexes();
      blogMediaBucket = new GridFSBucket(db, { bucketName: 'blog_media' });
      mongoReady = true;
      mongoError = null;
      console.log('✅ MongoDB ready — using cached data');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('⚠️ MongoDB unavailable:', msg);
      mongoError = msg;
      console.log('ℹ️ Falling back to live WooCommerce data');
    }
  })();

  // ── Serve frontend build (production / Hostinger) ─────────────────────────
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const buildCandidates = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'build'),
    path.resolve(process.cwd(), 'frontend-build'),
    path.resolve(__dirname, '../../dist'),
  ];
  const clientDistPath = buildCandidates.find((p) => existsSync(path.join(p, 'index.html')));

  if (clientDistPath) {
    console.log(`📁 Serving frontend from: ${clientDistPath}`);

    // Crawlers that don't execute JavaScript (e.g. catalog/ads policy reviewers)
    // otherwise see a blank, generic shell on every route since this is a pure
    // CSR app. Inject real markup for a few policy pages so the raw HTTP
    // response itself is readable, while real visitors still get the full SPA.
    const renderStaticPage = ({ title, description, bodyHtml }: { title: string; description: string; bodyHtml: string }) => {
      const template = readFileSync(path.join(clientDistPath, 'index.html'), 'utf-8');
      return template
        .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
        .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
        .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
    };

    const returnPolicyHtml = `
      <main style="max-width:760px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif;line-height:1.6;color:#171717">
        <h1>Return Policy</h1>
        <p>We want every Luxtronics order to arrive correctly and safely. If something is wrong, our team will help you with a clear return, exchange or refund process. Your statutory consumer rights under applicable law remain fully preserved.</p>
        <h2>Return Window</h2>
        <p>India customers can request most returns within 3-7 days of delivery. Australia and New Zealand customers can request voluntary returns within 3-5 days of delivery. Some premium products may have product-specific windows shown on the product page.</p>
        <ul>
          <li>India: 3-7 days from confirmed delivery for most products.</li>
          <li>Australia: 3-5 days from confirmed delivery. Australian Consumer Law rights remain unaffected.</li>
          <li>New Zealand: 3-5 days from confirmed delivery. Consumer Guarantees Act rights remain unaffected.</li>
        </ul>
        <h2>Valid Return Conditions</h2>
        <p>Items must be unused, unactivated, unworn and in original condition. Original packaging, manuals, accessories, warranty cards, invoices, serial number labels and manufacturer seals must be intact. A Return Merchandise Authorisation number is required before sending any item back.</p>
        <h2>Non-Returnable Items</h2>
        <p>Opened software, activated digital licences, used consumables, damaged products caused by misuse, tampered serial labels, clearance products and products marked final sale are not eligible for voluntary returns unless defective under applicable consumer law.</p>
        <h2>How to Initiate a Return</h2>
        <ol>
          <li>Email support@luxtronics.in with subject: Return Request - Order #[Your Order Number].</li>
          <li>Include your order number, item name, reason and photos or video for defective, damaged or wrong products.</li>
          <li>Wait for approval and RMA instructions before shipping anything back.</li>
          <li>Pack the item securely in its original packaging and include the invoice.</li>
        </ol>
        <h2>Refund Timelines</h2>
        <p>Approved refunds are initiated within 2-3 business days after inspection. India payment refunds usually take 5-7 business days, bank transfers may take 7-10 business days, and international card refunds may take 7-14 business days depending on the issuing bank.</p>
        <h2>Return Shipping Fees</h2>
        <p>For change-of-mind returns, the customer is responsible for return shipping and original shipping charges are non-refundable. For dead-on-arrival, defective, wrong-item or transit-damaged cases approved by Luxtronics, we cover return pickup or provide return shipping instructions at no extra cost.</p>
        <h2>Contact for Returns</h2>
        <p>Email <a href="mailto:support@luxtronics.in">support@luxtronics.in</a> with your order number before shipping any item back. Phone support is available at +91 92664 33722, Monday to Saturday, 10:00 AM to 6:00 PM IST.</p>
      </main>
    `;

    app.get(['/return-policy', '/return-exchange'], (_req, res) => {
      res.send(renderStaticPage({
        title: 'Return Policy | Luxtronics',
        description: 'Luxtronics return, exchange and refund policy for India, Australia and New Zealand customers.',
        bodyHtml: returnPolicyHtml,
      }));
    });

    // ── KNOWN APP ROUTES vs. LEGACY WORDPRESS JUNK ─────────────────────────
    // This domain previously ran a live WordPress + WooCommerce store. Google
    // still has thousands of those old URLs queued (wp-admin, product filter
    // AJAX query strings, etc). Returning 200 for all of them both wastes
    // crawl budget and makes Google treat them as duplicates of the homepage.
    const KNOWN_EXACT_ROUTES = new Set([
      '/', '/shop', '/latest-arrivals', '/categories', '/cart', '/blog', '/contact', '/about', '/faq',
      '/shipping-returns', '/payment-method', '/return-exchange', '/return-policy', '/returns', '/refund-policy',
      '/privacy', '/terms', '/account', '/account/login', '/account/register', '/account/orders', '/account/profile',
      '/admin', '/admin/products', '/admin/invoices', '/admin/blogs', '/invoices',
    ]);
    const KNOWN_ROUTE_PREFIXES = ['/product/', '/blog/'];
    const LEGACY_WP_PATH_PATTERN = /^\/(wp-admin|wp-content|wp-json|wp-includes|wp-login\.php|xmlrpc\.php|feed|refund_returns|category|tag|author|page)\b/i;
    const LEGACY_WP_QUERY_PATTERN = /post_type=product|filter_cat=|filter_color=|filter_brands=|shop_view=|product_cat=/i;

    const isKnownAppRoute = (pathname: string) =>
      KNOWN_EXACT_ROUTES.has(pathname) || KNOWN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isLegacyWordPressJunk = (pathname: string, rawQuery?: string) =>
      LEGACY_WP_PATH_PATTERN.test(pathname) || LEGACY_WP_QUERY_PATTERN.test(rawQuery || '');

    app.use(express.static(clientDistPath, { maxAge: '1d', etag: true, index: false }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') return next();

      let statusCode = 200;
      if (isLegacyWordPressJunk(req.path, req.url.split('?')[1])) {
        statusCode = 410;
      } else if (!isKnownAppRoute(req.path)) {
        statusCode = 404;
      }

      res.status(statusCode).sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.type('html').send(`
        <html><head><meta charset="utf-8"/><title>Luxtronics API</title></head>
        <body style="font-family:system-ui;padding:32px">
          <h1>Luxtronics backend is running</h1>
          <p>WooCommerce URL: <code>${wooUrl() || 'NOT SET'}</code></p>
          <p>MongoDB: <code>${mongoReady ? 'Connected' : mongoError || 'Connecting...'}</code></p>
          <p><a href="/health">/health</a> · <a href="/api/status">/api/status</a></p>
        </body></html>
      `);
    });
  }

  // ── Error handler ─────────────────────────────────────────────────────────
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  return app;
}

// ── Direct run ────────────────────────────────────────────────────────────────
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  console.log('🚀 Starting Luxtronics backend...');
  console.log('📋 Env:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    WOOCOMMERCE_URL: process.env.VITE_WOOCOMMERCE_URL || 'NOT SET',
  });

  setupServer().catch((err) => {
    console.error('Fatal startup error:', err);
  });
}

export default setupServer;
