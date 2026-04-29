/**
 * API Routes for MongoDB Product Queries
 * Express.js endpoints for fetching cached products from MongoDB
 */

import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import { ProductService, CacheService } from '../services/product-service';
import WooCommerceSync from '../services/woocommerce-sync';

export function createProductRoutes(db: Db): Router {
  const router = Router();
  const productService = new ProductService(db);
  const cacheService = new CacheService(db);
  const syncService = new WooCommerceSync(db);

  /**
   * GET /api/products
   * Get all products with pagination
   */
  router.get('/products', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 50;
      const category = req.query.category as string;

      let result;

      if (category) {
        result = await productService.getProductsByCategory(category, page, perPage);
      } else {
        result = await productService.getProducts(page, perPage);
      }

      // Set cache headers
      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page,
          perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / perPage),
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
      });
    }
  });

  /**
   * GET /api/products/:id
   * Get single product by ID
   */
  router.get('/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
      });
    }
  });

  /**
   * GET /api/products/slug/:slug
   * Get product by slug
   */
  router.get('/products/slug/:slug', async (req: Request, res: Response) => {
    try {
      const product = await productService.getProductBySlug(req.params.slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
      });
    }
  });

  /**
   * GET /api/search
   * Search products
   */
  router.get('/search', async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 50;

      if (!searchTerm || searchTerm.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search term must be at least 2 characters',
        });
      }

      const result = await productService.searchProducts(searchTerm, page, perPage);

      res.set('Cache-Control', 'public, max-age=1800'); // 30 min cache

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page,
          perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / perPage),
        },
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  });

  /**
   * GET /api/products/filtered
   * Get products with advanced filters
   */
  router.get('/products/filtered', async (req: Request, res: Response) => {
    try {
      const filters = {
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        category: req.query.category as string,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        inStock: req.query.inStock === 'true',
      };

      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 50;

      const result = await productService.getProductsFiltered(filters, page, perPage);

      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page,
          perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / perPage),
        },
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).json({
        success: false,
        error: 'Filtering failed',
      });
    }
  });

  /**
   * GET /api/products/sort/:sortType
   * Get products sorted by price or rating
   */
  router.get('/products/sort/:sortType', async (req: Request, res: Response) => {
    try {
      const sortType = req.params.sortType as 'price-asc' | 'price-desc' | 'rating';
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 50;

      let result;

      if (sortType === 'price-asc') {
        result = await productService.getProductsSortedByPrice('asc', page, perPage);
      } else if (sortType === 'price-desc') {
        result = await productService.getProductsSortedByPrice('desc', page, perPage);
      } else if (sortType === 'rating') {
        const products = await productService.getTopRatedProducts(100);
        result = {
          products: products.slice((page - 1) * perPage, page * perPage),
          total: products.length,
        };
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid sort type',
        });
      }

      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page,
          perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / perPage),
        },
      });
    } catch (error) {
      console.error('Error sorting products:', error);
      res.status(500).json({
        success: false,
        error: 'Sorting failed',
      });
    }
  });

  /**
   * GET /api/categories
   * Get all categories
   */
  router.get('/categories', async (req: Request, res: Response) => {
    try {
      const categories = await productService.getAllCategories();

      res.set('Cache-Control', 'public, max-age=86400'); // 24 hour cache

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  });

  /**
   * GET /api/featured
   * Get featured products (top rated + recent)
   */
  router.get('/featured', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topRated = await productService.getTopRatedProducts(limit);
      const recent = await productService.getRecentProducts(limit);

      res.set('Cache-Control', 'public, max-age=3600');

      res.json({
        success: true,
        data: {
          topRated,
          recent,
        },
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured products',
      });
    }
  });

  /**
   * POST /api/sync
   * Trigger product sync from WooCommerce to MongoDB
   * Protected endpoint (should be protected with auth in production)
   */
  router.post('/sync', async (req: Request, res: Response) => {
    try {
      // Check auth token in production
      const authToken = req.headers['x-sync-token'];
      if (authToken !== process.env.SYNC_TOKEN) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const syncType = (req.body.type as string) || 'products'; // 'products', 'categories', or 'full'

      res.json({ success: true, message: 'Sync started', type: syncType });

      // Run sync in background
      if (syncType === 'full') {
        syncService.fullSync({
          onProgress: (current, total) => {
            console.log(`Sync progress: ${current}/${total}`);
          },
        });
      } else if (syncType === 'products') {
        syncService.syncProducts({
          onProgress: (current, total) => {
            console.log(`Sync progress: ${current}/${total}`);
          },
        });
      } else if (syncType === 'categories') {
        syncService.syncCategories();
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      res.status(500).json({
        success: false,
        error: 'Sync failed',
      });
    }
  });

  /**
   * POST /api/sync/incremental
   * Incremental sync (only new/updated products)
   */
  router.post('/sync/incremental', async (req: Request, res: Response) => {
    try {
      const authToken = req.headers['x-sync-token'];
      if (authToken !== process.env.SYNC_TOKEN) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      res.json({ success: true, message: 'Incremental sync started' });

      // Run in background
      syncService.incrementalSync();
    } catch (error) {
      console.error('Error triggering incremental sync:', error);
      res.status(500).json({
        success: false,
        error: 'Sync failed',
      });
    }
  });

  /**
   * GET /api/stats
   * Get database statistics
   */
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const productCount = await productService.getProductCount();
      const categories = await productService.getAllCategories();

      res.json({
        success: true,
        data: {
          totalProducts: productCount,
          totalCategories: categories.length,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }
  });

  return router;
}
