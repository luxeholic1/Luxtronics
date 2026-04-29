import { useState, useEffect, useCallback, useRef } from 'react';
import {
  bulkFetchProducts,
  getProductsOptimized,
  prefetchNextPage,
  clearExpiredCaches,
} from '@/services/bulk-import';
import { WooProduct } from '@/services/woocommerce';

interface UseLazyProductsOptions {
  perPage?: number;
  autoLoad?: boolean;
  category?: string;
}

/**
 * Hook for lazy loading products with pagination
 * Optimized for handling 1 lakh+ products
 */
export function useLazyProducts(options: UseLazyProductsOptions = {}) {
  const {
    perPage = 50,
    autoLoad = true,
    category = undefined,
  } = options;

  const [products, setProducts] = useState<WooProduct[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);

  // Load products for current page
  const loadPage = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const data = await getProductsOptimized(pageNum, perPage, category);

        if (pageNum === 1) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }

        setHasMore(data.length === perPage);
        setError(null);
        pageRef.current = pageNum;

        // Prefetch next page
        if (data.length === perPage) {
          prefetchNextPage(pageNum, perPage, category);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [perPage, category]
  );

  // Load initial page
  useEffect(() => {
    if (autoLoad) {
      loadPage(1);
    }

    // Cleanup: clear expired caches periodically
    const interval = setInterval(clearExpiredCaches, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [autoLoad, loadPage]);

  // Load more handler for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = pageRef.current + 1;
      setPage(nextPage);
      loadPage(nextPage);
    }
  }, [loading, hasMore, loadPage]);

  return {
    products,
    loading,
    hasMore,
    error,
    page: pageRef.current,
    loadMore,
    reload: () => loadPage(1),
  };
}

/**
 * Hook for virtual scrolling with 1 lakh products
 * Uses intersection observer for infinite scroll
 */
export function useInfiniteScroll(
  options: UseLazyProductsOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    products,
    loading,
    hasMore,
    error,
    loadMore,
  } = useLazyProducts(options);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loading && hasMore) {
            loadMore();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before reaching bottom
        threshold: 0.01,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  return {
    containerRef,
    sentinelRef,
    products,
    loading,
    hasMore,
    error,
  };
}

/**
 * Hook for search with debouncing
 */
export function useProductSearch(debounceMs = 500) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const search = useCallback((term: string) => {
    setSearchTerm(term);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setLoading(true);

    // Debounce search
    debounceTimer.current = setTimeout(async () => {
      if (!term.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        // Since WooCommerce search is limited, we search in local products
        // For better performance, implement server-side search
        // Or use Elasticsearch/Algolia for large datasets
        
        // Use backend proxy to avoid CORS — no credentials needed in the browser
        const response = await fetch(
          `/api/woo/products?search=${encodeURIComponent(term)}&per_page=50`
        );

        const data: WooProduct[] = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debounceMs]);

  return {
    searchTerm,
    results,
    loading,
    search,
  };
}
