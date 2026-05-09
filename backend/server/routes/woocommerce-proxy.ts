/**
 * WooCommerce Proxy Routes
 * Proxies all WooCommerce REST API calls from the frontend to the source store
 * (luxtronics.luxtronics.in), avoiding CORS issues in the browser.
 */

import { Router, Request, Response } from 'express';

export function createWooCommerceProxyRoutes(): Router {
  const router = Router();

  // Multi-domain support: different stores for different domains
  const STORES = {
    'luxtronics.com': {
      url: process.env.VITE_WOOCOMMERCE_URL || process.env.WOOCOMMERCE_URL_US,
      key: process.env.VITE_WOOCOMMERCE_KEY || process.env.WOOCOMMERCE_KEY_US,
      secret: process.env.VITE_WOOCOMMERCE_SECRET || process.env.WOOCOMMERCE_SECRET_US,
    },
    'luxtronics.com.au': {
      url: process.env.WOOCOMMERCE_URL_AU,
      key: process.env.WOOCOMMERCE_KEY_AU,
      secret: process.env.WOOCOMMERCE_SECRET_AU,
    },
    'luxtronics.co.nz': {
      url: process.env.WOOCOMMERCE_URL_NZ,
      key: process.env.WOOCOMMERCE_KEY_NZ,
      secret: process.env.WOOCOMMERCE_SECRET_NZ,
    },
  };

  function getStoreConfig(host: string) {
    // Remove www. if present
    const domain = host.replace(/^www\./, '');
    return STORES[domain] || STORES['luxtronics.com']; // Default to US store
  }

  function getAuthHeader(host: string): string {
    const store = getStoreConfig(host);
    if (!store.key || !store.secret) {
      throw new Error('WooCommerce credentials are not configured for this domain');
    }
    return 'Basic ' + Buffer.from(`${store.key}:${store.secret}`).toString('base64');
  }

  function getSourceUrl(host: string): string {
    const store = getStoreConfig(host);
    return store.url;
  }

  /**
   * GET /api/woo/products
   * Proxy product list from source WooCommerce store
   */
  router.get('/woo/products', async (req: Request, res: Response) => {
    try {
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);

      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured for this domain' });
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
          Authorization: getAuthHeader(host),
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
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);

      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured for this domain' });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products/${req.params.id}`;

      const wooRes = await fetch(url, {
        headers: {
          Authorization: getAuthHeader(host),
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
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);

      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured for this domain' });
      }

      const params = new URLSearchParams({ per_page: '100', hide_empty: 'true' });
      const url = `${SOURCE_URL}/wp-json/wc/v3/products/categories?${params}`;

      const wooRes = await fetch(url, {
        headers: {
          Authorization: getAuthHeader(host),
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
  router.get('/woo/status', async (req: Request, res: Response) => {
    try {
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);
      const store = getStoreConfig(host);

      if (!SOURCE_URL || !store.key || !store.secret) {
        return res.json({
          connected: false,
          error: 'WooCommerce credentials missing in environment for this domain',
          sourceUrl: SOURCE_URL || 'not set',
          domain: host,
        });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products?per_page=1`;
      const wooRes = await fetch(url, {
        headers: { Authorization: getAuthHeader(host) },
      });

      const total = parseInt(wooRes.headers.get('X-WP-Total') || '0');

      return res.json({
        connected: wooRes.ok,
        status: wooRes.status,
        sourceUrl: SOURCE_URL,
        domain: host,
        totalProducts: total,
      });
    } catch (error: any) {
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);
      res.json({ connected: false, error: error.message, sourceUrl: SOURCE_URL, domain: host });
    }
  });

  /**
   * POST /api/woo/products
   * Create a new product in WooCommerce
   */
  router.post('/woo/products', async (req: Request, res: Response) => {
    try {
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);

      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured for this domain' });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products`;

      const wooRes = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeader(host),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!wooRes.ok) {
        const errorBody = await wooRes.text();
        return res.status(wooRes.status).json({
          success: false,
          error: `Failed to create product: ${wooRes.statusText}`,
          details: errorBody,
        });
      }

      const product = await wooRes.json();
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, error: 'Failed to create product' });
    }
  });

  /**
   * PUT /api/woo/products/:id
   * Update a product in WooCommerce
   */
  router.put('/woo/products/:id', async (req: Request, res: Response) => {
    try {      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);
      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured' });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products/${req.params.id}`;

      const wooRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!wooRes.ok) {
        const errorBody = await wooRes.text();
        return res.status(wooRes.status).json({
          success: false,
          error: `Failed to update product: ${wooRes.statusText}`,
          details: errorBody,
        });
      }

      const product = await wooRes.json();
      return res.json({ success: true, data: product });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, error: 'Failed to update product' });
    }
  });

  /**
   * DELETE /api/woo/products/:id
   * Delete a product from WooCommerce
   */
  router.delete('/woo/products/:id', async (req: Request, res: Response) => {
    try {
      const host = req.headers.host || 'luxtronics.com';
      const SOURCE_URL = getSourceUrl(host);

      if (!SOURCE_URL) {
        return res.status(500).json({ success: false, error: 'WooCommerce URL not configured for this domain' });
      }

      const url = `${SOURCE_URL}/wp-json/wc/v3/products/${req.params.id}?force=true`;

      const wooRes = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: getAuthHeader(host),
          'Content-Type': 'application/json',
        },
      });

      if (!wooRes.ok) {
        const errorBody = await wooRes.text();
        return res.status(wooRes.status).json({
          success: false,
          error: `Failed to delete product: ${wooRes.statusText}`,
          details: errorBody,
        });
      }

      const result = await wooRes.json();
      return res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
  });

  return router;
}
