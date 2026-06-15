/**
 * WooCommerce to MongoDB Sync Service
 * Syncs products from WooCommerce REST API to MongoDB
 */

import { Db } from 'mongodb';
import { ProductService, CacheService } from './product-service';
import {
  createProductDocument,
  createCategoryDocument,
  MongoProduct,
  SyncStatus,
} from '../models/mongo-models';

interface SyncOptions {
  batchSize?: number;
  delay?: number;
  onProgress?: (current: number, total: number) => void;
  concurrency?: number;
  syncVariations?: boolean;
}

export class WooCommerceSync {
  private productService: ProductService;
  private cacheService: CacheService;
  private db: Db;
  private readonly SYNC_STATUS_COLLECTION = 'sync_status';

  constructor(db: Db) {
    this.db = db;
    this.productService = new ProductService(db);
    this.cacheService = new CacheService(db);
  }

  /**
   * Sync products from WooCommerce to MongoDB
   */
  async syncProducts(options: SyncOptions = {}): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    // WooCommerce API hard limit is 100 per page — always use 100
    const WC_PAGE_SIZE = 100;
    const delay = options.delay || 500;
    const concurrency = Math.max(1, options.concurrency || Number(process.env.WOO_SYNC_CONCURRENCY || 4));
    const syncVariations = options.syncVariations ?? process.env.SYNC_VARIATIONS === 'true';

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Record sync start
      await this.recordSyncStatus('products', 'in_progress');

      // Get total product count from WooCommerce
      const totalProducts = await this.getTotalProductCount();
      const totalPages = Math.ceil(totalProducts / WC_PAGE_SIZE);
      console.log(`Starting sync of ${totalProducts} products across ${totalPages} pages...`);

      let nextPage = 1;
      const syncPage = async (page: number) => {
        try {
          const products = await this.fetchProductsFromWooCommerce(page, WC_PAGE_SIZE);

          if (products.length === 0) return;

          // Convert and save to MongoDB
          const mongoProducts = [];
          for (const product of products) {
            let variations: any[] = [];
            if (syncVariations && product.type === 'variable') {
              try {
                variations = await this.fetchVariationsFromWooCommerce(product.id);
                console.log(`Fetched ${variations.length} variations for product ${product.id}`);
              } catch (error) {
                console.error(`Failed to fetch variations for product ${product.id}:`, error);
                // Continue without variations
              }
            }
            mongoProducts.push(createProductDocument(product, variations));
          }

          const savedCount = await this.productService.saveProducts(mongoProducts);

          synced += savedCount;
          options.onProgress?.(synced, totalProducts);

          console.log(
            `✅ Synced page ${page}/${totalPages}: ${savedCount} products (${synced}/${totalProducts})`
          );

          // Delay between pages to avoid API rate limiting
          if (page < totalPages) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          failed += 1;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Page ${page} error: ${errorMsg}`);
          console.error(`❌ Page ${page} failed:`, errorMsg);
          // Continue to next page even if this one failed
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, totalPages) }, async () => {
        while (nextPage <= totalPages) {
          const page = nextPage;
          nextPage += 1;
          await syncPage(page);
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
        }
      });

      await Promise.all(workers);

      // Record sync completion
      await this.recordSyncStatus('products', 'completed', synced, failed, errors);

      console.log(`✅ Sync completed: ${synced} products synced, ${failed} failed`);

      return { synced, failed, errors };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);
      await this.recordSyncStatus('products', 'failed', synced, failed, errors);
      return { synced, failed, errors };
    }
  }

  /**
   * Sync categories from WooCommerce to MongoDB
   */
  async syncCategories(): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = [];
    let synced = 0;

    try {
      await this.recordSyncStatus('categories', 'in_progress');

      const categories = await this.fetchCategoriesFromWooCommerce();

      const mongoCategories = categories.map(createCategoryDocument);
      synced = await this.productService.saveCategories(mongoCategories);

      await this.recordSyncStatus('categories', 'completed', synced, 0, []);

      console.log(`✅ Synced ${synced} categories`);

      return { synced, errors };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);
      await this.recordSyncStatus('categories', 'failed', synced, 0, errors);
      return { synced, errors };
    }
  }

  /**
   * Full sync (products + categories)
   */
  async fullSync(options: SyncOptions = {}): Promise<{
    products: number;
    categories: number;
    errors: string[];
  }> {
    console.log('🔄 Starting full sync...');

    const productResult = await this.syncProducts(options);
    const categoryResult = await this.syncCategories();

    const allErrors = [...productResult.errors, ...categoryResult.errors];

    console.log('✅ Full sync completed');

    return {
      products: productResult.synced,
      categories: categoryResult.synced,
      errors: allErrors,
    };
  }

  /**
   * Incremental sync (only new/updated products since last sync)
   */
  async incrementalSync(): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const lastSync = await this.getLastSyncTime('products');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const syncAfter = lastSync || twoHoursAgo;

    console.log(`Syncing products modified after ${syncAfter.toISOString()}`);

    // Fetch modified products from WooCommerce
    const products = await this.fetchModifiedProductsFromWooCommerce(syncAfter);

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const mongoProducts = await Promise.all(
        products.map(async (product: any) => {
          let variations: any[] = [];
          if (product.type === 'variable') {
            try {
              variations = await this.fetchVariationsFromWooCommerce(product.id);
              console.log(`Fetched ${variations.length} variations for product ${product.id}`);
            } catch {
              // Continue without variations
            }
          }
          return createProductDocument(product, variations);
        })
      );
      synced = await this.productService.saveProducts(mongoProducts);

      console.log(`✅ Incremental sync: ${synced} products updated`);

      return { synced, failed, errors };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);
      return { synced, failed, errors };
    }
  }

  /**
   * Fetch products from WooCommerce API
   */
  private async fetchProductsFromWooCommerce(
    page: number,
    perPage: number
  ): Promise<any[]> {
    // Use India store credentials for sync (main store)
    const storeUrl = process.env.VITE_WOOCOMMERCE_URL_INDIA;
    const consumerKey = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
    const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

    if (!storeUrl || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const params = new URLSearchParams({
      per_page: Math.min(perPage, 100).toString(),
      page: page.toString(),
      orderby: 'date',
      order: 'asc',
    });

    const url = `${storeUrl}/wp-json/wc/v3/products?${params}`;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch categories from WooCommerce
   */
  private async fetchCategoriesFromWooCommerce(): Promise<any[]> {
    // Use India store credentials for sync (main store)
    const storeUrl = process.env.VITE_WOOCOMMERCE_URL_INDIA;
    const consumerKey = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
    const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

    if (!storeUrl || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const allCategories: any[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        per_page: '100',
        page: String(page),
        hide_empty: 'false',
        orderby: 'count',
        order: 'desc',
      });
      const url = `${storeUrl}/wp-json/wc/v3/products/categories?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Failed to fetch categories page ${page}: ${response.status} ${body.slice(0, 300)}`);
      }

      const categories = await response.json();
      allCategories.push(...categories);
      totalPages = Number(response.headers.get('X-WP-TotalPages') || '1');
      console.log(`Fetched categories page ${page}/${totalPages} (${allCategories.length} total)`);
      page += 1;
    } while (page <= totalPages);

    return allCategories;
  }

  /**
   * Get total product count from WooCommerce
   */
  private async getTotalProductCount(): Promise<number> {
    // Use India store credentials for sync (main store)
    const storeUrl = process.env.VITE_WOOCOMMERCE_URL_INDIA;
    const consumerKey = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
    const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

    const url = `${storeUrl}/wp-json/wc/v3/products?per_page=1`;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const total = parseInt(response.headers.get('X-WP-Total') || '0');
    return total;
  }

  /**
   * Fetch modified products since last sync
   */
  private async fetchModifiedProductsFromWooCommerce(
    after: Date
  ): Promise<any[]> {
    // Use India store credentials for sync (main store)
    const storeUrl = process.env.VITE_WOOCOMMERCE_URL_INDIA;
    const consumerKey = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
    const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

    const params = new URLSearchParams({
      per_page: '100',
      after: after.toISOString(),
      orderby: 'date',
    });

    const url = `${storeUrl}/wp-json/wc/v3/products?${params}`;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch modified products');
    }

    return response.json();
  }

  /**
   * Fetch variations for a variable product from WooCommerce
   */
  private async fetchVariationsFromWooCommerce(productId: number): Promise<any[]> {
    // Use India store credentials for sync (main store)
    const storeUrl = process.env.VITE_WOOCOMMERCE_URL_INDIA;
    const consumerKey = process.env.VITE_WOOCOMMERCE_KEY_INDIA;
    const consumerSecret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA;

    if (!storeUrl || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const url = `${storeUrl}/wp-json/wc/v3/products/${productId}/variations?per_page=100`;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch variations for product ${productId}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Record sync status
   */
  private async recordSyncStatus(
    type: 'products' | 'categories' | 'full',
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    totalProcessed: number = 0,
    failedCount: number = 0,
    errors: string[] = []
  ): Promise<void> {
    const collection = this.db.collection(this.SYNC_STATUS_COLLECTION);

    const syncRecord: SyncStatus = {
      type,
      status,
      startedAt: new Date(),
      totalProcessed,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
      nextSyncAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };

    if (status === 'completed' || status === 'failed') {
      syncRecord.completedAt = new Date();
    }

    await collection.insertOne(syncRecord);
  }

  /**
   * Get last sync time
   */
  private async getLastSyncTime(type: string): Promise<Date | null> {
    const collection = this.db.collection(this.SYNC_STATUS_COLLECTION);

    const lastSync = await collection
      .findOne(
        { type, status: 'completed' },
        { sort: { completedAt: -1 } }
      );

    return lastSync?.completedAt || null;
  }
}

export default WooCommerceSync;
