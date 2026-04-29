/**
 * Bulk Product Import Service
 * Fetches products via the backend proxy (/api/woo/*) instead of calling
 * WooCommerce directly — avoids CORS issues in the browser.
 */

import { WooProduct } from './woocommerce';

const API_BASE = '/api/woo';

interface ImportOptions {
  batchSize?: number;
  delay?: number;
  onProgress?: (current: number, total: number) => void;
}

interface ImportCache {
  timestamp: number;
  data: Map<string, WooProduct>;
  expiresIn: number;
}

// In-memory cache for fetched products
const productCache = new Map<string, ImportCache>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchProductsPage(
  page: number,
  perPage: number,
  category?: string
): Promise<{ products: WooProduct[]; total: number }> {
  const params = new URLSearchParams({
    per_page: Math.min(perPage, 100).toString(),
    page: page.toString(),
    orderby: 'id',
    order: 'asc',
  });
  if (category) params.set('category', category);

  const response = await fetch(`${API_BASE}/products?${params}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const products: WooProduct[] = await response.json();
  const total = parseInt(response.headers.get('X-WP-Total') || '0');
  return { products, total };
}

// ---------------------------------------------------------------------------
// Cache utilities
// ---------------------------------------------------------------------------

export function cacheProducts(key: string, products: WooProduct[], expiresIn = CACHE_DURATION) {
  productCache.set(key, {
    timestamp: Date.now(),
    data: new Map(products.map(p => [p.id.toString(), p])),
    expiresIn,
  });
}

export function getCachedProducts(key: string): Map<string, WooProduct> | null {
  const cache = productCache.get(key);
  if (!cache) return null;
  if (Date.now() - cache.timestamp > cache.expiresIn) {
    productCache.delete(key);
    return null;
  }
  return cache.data;
}

export function clearExpiredCaches() {
  const now = Date.now();
  for (const [key, cache] of productCache.entries()) {
    if (now - cache.timestamp > cache.expiresIn) {
      productCache.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Bulk fetch generator
// ---------------------------------------------------------------------------

export async function* bulkFetchProducts(
  totalProducts: number,
  options: ImportOptions = {}
) {
  const batchSize = options.batchSize || 100;
  const delay = options.delay || 1000;

  let page = 1;
  let loaded = 0;

  while (loaded < totalProducts) {
    try {
      const { products } = await fetchProductsPage(page, batchSize);
      if (products.length === 0) break;

      loaded += products.length;
      options.onProgress?.(loaded, totalProducts);
      yield products;
      page++;

      if (loaded < totalProducts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error fetching batch at page ${page}:`, error);
      throw error;
    }
  }
}

// ---------------------------------------------------------------------------
// Bulk import
// ---------------------------------------------------------------------------

export async function bulkImportProducts(
  options: ImportOptions = {}
): Promise<{ imported: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  try {
    // Get total count first (fetch page 1 with per_page=1)
    const countRes = await fetch(`${API_BASE}/products?per_page=1`);
    const totalProducts = parseInt(countRes.headers.get('X-WP-Total') || '0');
    console.log(`Starting bulk import of ${totalProducts} products...`);

    for await (const batch of bulkFetchProducts(totalProducts, options)) {
      try {
        cacheProducts(`batch-${imported}`, batch);
        imported += batch.length;
      } catch (error) {
        failed += 1;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(errorMsg);
      }
    }

    console.log(`✅ Import completed: ${imported} imported, ${failed} failed`);
    return { imported, failed, errors };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(errorMsg);
    return { imported, failed, errors };
  }
}

// ---------------------------------------------------------------------------
// Optimized single-page fetch with cache
// ---------------------------------------------------------------------------

export async function getProductsOptimized(
  page = 1,
  perPage = 50,
  category?: string,
  useCache = true
): Promise<WooProduct[]> {
  const cacheKey = `products-${page}-${perPage}-${category || 'all'}`;

  if (useCache) {
    const cached = getCachedProducts(cacheKey);
    if (cached && cached.size > 0) {
      return Array.from(cached.values());
    }
  }

  const { products } = await fetchProductsPage(page, perPage, category);

  if (useCache) {
    cacheProducts(cacheKey, products);
  }

  return products;
}

// ---------------------------------------------------------------------------
// Prefetch next page in background
// ---------------------------------------------------------------------------

export function prefetchNextPage(currentPage: number, perPage: number, category?: string) {
  getProductsOptimized(currentPage + 1, perPage, category).catch(err =>
    console.error('Prefetch error:', err)
  );
}
