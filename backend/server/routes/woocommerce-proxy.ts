/**
 * WooCommerce Proxy Routes
 * Proxies all WooCommerce REST API calls from the frontend to the source store
 * (luxtronics.luxtronics.in), avoiding CORS issues in the browser.
 */

import { Router, Request, Response } from 'express';

export function createWooCommerceProxyRoutes(): Router {
  const router = Router();

  const SOURCE_URL = process.env.VITE_WOOCOMMERCE_URL;
  const CONSUMER_KEY = process.env.VITE_WOOCOMMERCE_KEY;
  const CONSUMER_SECRET = process.env.VITE_WOOCOMMERCE_SECRET;

  function getAuthHeader(): string {
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error('WooCommerce credentials are not configured');
    }
    return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  }

  /**
   * GET /api/woo/products
   * Proxy product list from source WooCommerce store
   */
  router.get('/woo/products', async (req: Request, res: Response) => {
    try {
      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured' });
      }

      const params = new URLSearchParams();
      // Forward all safe query params
      const allowed = ['per_page', 'page', 'category', 'search', 'orderby', 'order', 'after', 'status'];
      for (const key of allowed) {
        if (req.query[key]) params.set(key, String(req.query[key]));
      }
      // Default status to publish for frontend display
      if (!params.has('status')) params.set('status', 'publish');

      const url = `${SOURCE_URL}/wp-json/wc/v3/products?${params}`;

      const wooRes = await fetch(url, {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!wooRes.ok) {
        const body = await wooRes.text();
        console.error('WooCommerce API error:', wooRes.status, body);
        return res.status(wooRes.status).json({
          success: false,
          error: `WooCommerce API error: ${wooRes.statusText}`,
        });
      }

      const products = await wooRes.json();

      // Forward WooCommerce pagination headers
      res.set('X-WP-Total', wooRes.headers.get('X-WP-Total') || '0');
      res.set('X-WP-TotalPages', wooRes.headers.get('X-WP-TotalPages') || '0');
      res.set('Cache-Control', 'public, max-age=300'); // 5 min cache

      return res.json(products);
    } catch (error) {
      console.error('Error proxying WooCommerce products:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch products from store' });
    }
  });

  /**
   * GET /api/woo/products/:id
   * Proxy single product from source WooCommerce store
   */
  router.get('/woo/products/:id', async (req: Request, res: Response) => {
    try {
      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured' });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products/${req.params.id}`;

      const wooRes = await fetch(url, {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!wooRes.ok) {
        return res.status(wooRes.status).json({
          success: false,
          error: `Product not found: ${wooRes.statusText}`,
        });
      }

      const product = await wooRes.json();
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(product);
    } catch (error) {
      console.error('Error proxying WooCommerce product:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch product from store' });
    }
  });

  /**
   * GET /api/woo/categories
   * Proxy product categories from source WooCommerce store
   */
  router.get('/woo/categories', async (req: Request, res: Response) => {
    try {
      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured' });
      }

      const params = new URLSearchParams({ per_page: '100', hide_empty: 'true' });
      const url = `${SOURCE_URL}/wp-json/wc/v3/products/categories?${params}`;

      const wooRes = await fetch(url, {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!wooRes.ok) {
        return res.status(wooRes.status).json({
          success: false,
          error: `Failed to fetch categories: ${wooRes.statusText}`,
        });
      }

      const categories = await wooRes.json();
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      return res.json(categories);
    } catch (error) {
      console.error('Error proxying WooCommerce categories:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch categories from store' });
    }
  });

  /**
   * GET /api/woo/status
   * Health check for WooCommerce source store connection
   */
  router.get('/woo/status', async (_req: Request, res: Response) => {
    try {
      if (!SOURCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
        return res.json({
          connected: false,
          error: 'WooCommerce credentials missing in environment',
          sourceUrl: SOURCE_URL || 'not set',
        });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products?per_page=1`;
      const wooRes = await fetch(url, {
        headers: { Authorization: getAuthHeader() },
      });

      const total = parseInt(wooRes.headers.get('X-WP-Total') || '0');

      return res.json({
        connected: wooRes.ok,
        status: wooRes.status,
        sourceUrl: SOURCE_URL,
        totalProducts: total,
      });
    } catch (error: any) {
      res.json({ connected: false, error: error.message, sourceUrl: SOURCE_URL });
    }
  });

  return router;
}
