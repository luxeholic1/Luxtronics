import React, { useMemo } from 'react';
import { useInfiniteScroll } from '@/hooks/use-lazy-products';
import { convertWooProductToLocalProduct } from '@/services/product-converter';

interface ProductListProps {
  perPage?: number;
  category?: string;
  onProductSelect?: (productId: string) => void;
}

/**
 * Optimized Product List Component with Infinite Scroll
 * Handles 1 lakh+ products efficiently
 */
export const OptimizedProductList: React.FC<ProductListProps> = ({
  perPage = 50,
  category,
  onProductSelect,
}) => {
  const {
    containerRef,
    sentinelRef,
    products,
    loading,
    hasMore,
    error,
  } = useInfiniteScroll({
    perPage,
    category,
  });

  // Convert WooCommerce products to local format
  const localProducts = useMemo(
    () => products.map(convertWooProductToLocalProduct),
    [products]
  );

  return (
    <div ref={containerRef} className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localProducts.map(product => (
          <div
            key={product.id}
            className="cursor-pointer"
            onClick={() => onProductSelect?.(product.id)}
          >
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden bg-gray-200 aspect-square rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                {product.badge && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    {product.badge}
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1 my-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviews})
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-lg">₹{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-gray-500 line-through text-sm">
                      ₹{product.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sentinel element for infinite scroll trigger */}
      <div ref={sentinelRef} className="py-8 text-center">
        {loading && (
          <div className="flex justify-center items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="text-gray-600 ml-2">Loading more products...</span>
          </div>
        )}

        {!hasMore && localProducts.length > 0 && (
          <p className="text-gray-500">No more products to load</p>
        )}
      </div>
    </div>
  );
};

export default OptimizedProductList;
