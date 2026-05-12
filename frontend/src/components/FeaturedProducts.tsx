import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";
import { fetchStoreProducts, fetchStoreProduct, mapStoreProductToLocalProduct } from "@/services/store-api";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const queryClient = useQueryClient();

  const { data: storeProducts = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchStoreProducts(1, 8),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const prefetchProduct = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => fetchStoreProduct(slug),
      staleTime: 1000 * 60 * 15,
    });
  };

  const products = useMemo(() => {
    if (storeProducts.length > 0) {
      return storeProducts
        .map(mapStoreProductToLocalProduct)
        .filter((p): p is Product => p !== null);
    }
    return staticProducts;
  }, [storeProducts]);

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="flex items-end justify-between mb-6 sm:mb-10 md:mb-12 gap-3 sm:gap-4 flex-wrap max-w-[1920px] mx-auto">
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
            Featured
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight max-w-xl leading-tight">
            Best sellers <span className="text-gradient">this week</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors font-medium group flex items-center gap-1"
        >
          Shop all <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 max-w-[1920px] mx-auto">
        {isLoading && products.length === 0 ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl sm:rounded-2xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          products.slice(0, 8).map((p) => (
            <div 
              key={p.id}
              onMouseEnter={() => prefetchProduct(p.slug)}
              className="animate-fade-in"
            >
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};


export default FeaturedProducts;
