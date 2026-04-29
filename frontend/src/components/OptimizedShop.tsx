/**
 * Optimized Shop Component with WooCommerce Integration
 * Handles 1 lakh products efficiently with lazy loading and pagination
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';
import { useInfiniteScroll, useProductSearch } from '@/hooks/use-lazy-products';
import { convertWooProductToLocalProduct } from '@/services/product-converter';
import { useWooCategories } from '@/hooks/use-woo-products';

const OptimizedShop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat = params.get('cat') || 'all';
  const [sort, setSort] = useState('featured');
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch products with infinite scroll
  const {
    containerRef: scrollRef,
    sentinelRef,
    products: wooProducts,
    loading,
    hasMore,
    error,
  } = useInfiniteScroll({
    perPage: 50,
    category: activeCat === 'all' ? undefined : activeCat,
  });

  // Fetch categories
  const { categories } = useWooCategories();

  // Convert WooCommerce products to local format
  const localProducts = wooProducts.map(convertWooProductToLocalProduct);

  // Sort products
  const sortedProducts = useCallback((products: any[]) => {
    const sorted = [...products];
    
    if (sort === 'low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === 'high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    
    return sorted;
  }, [sort]);

  const displayedProducts = sortedProducts(localProducts);

  // Handle category change
  const handleCategoryChange = (categorySlug: string) => {
    setParams(categorySlug === 'all' ? {} : { cat: categorySlug });
    // Scroll to top when changing category
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section ref={containerRef} className="container pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-0">
        <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
          Shop
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
          All <span className="text-gradient">products</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl">
          Browse our curated collection of premium electronics. Filter by category and sort to find your perfect match.
        </p>
      </section>

      {/* Shop Section */}
      <section className="container pb-16 sm:pb-24 px-4 sm:px-6 lg:px-0">
        {/* Filters and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap overflow-x-auto pb-2 w-full sm:w-auto">
            <button
              onClick={() => handleCategoryChange('all')}
              className={cn(
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap',
                activeCat === 'all'
                  ? 'bg-gradient-brand text-primary-foreground border-transparent shadow-glow'
                  : 'border-border hover:border-foreground'
              )}
            >
              All
            </button>
            
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={cn(
                  'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap',
                  activeCat === category.slug
                    ? 'bg-gradient-brand text-primary-foreground border-transparent shadow-glow'
                    : 'border-border hover:border-foreground'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 sm:h-10 rounded-full border border-border bg-background px-3 sm:px-4 text-xs sm:text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading products</p>
            <p>{error}</p>
          </div>
        )}

        {/* Products Grid with Infinite Scroll */}
        <div ref={scrollRef} className="w-full">
          {displayedProducts.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground py-16 sm:py-24">
              No products found. Try adjusting your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 py-6 sm:py-8 text-center">
            {loading && (
              <div className="flex justify-center items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div 
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div 
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span className="text-gray-600 ml-2">Loading more products...</span>
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && (
              <p className="text-gray-500">All products loaded</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OptimizedShop;
