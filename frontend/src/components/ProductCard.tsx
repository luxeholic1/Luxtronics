import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";

const badgeStyles: Record<string, string> = {
  New: "bg-foreground text-background",
  Hot: "bg-gradient-brand text-primary-foreground",
  Sale: "bg-accent text-accent-foreground",
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    addItem(product, 1);
  };
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Luxtronics"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://luxtronics.com/product/${product.slug}`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews
    }
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <Link
        to={`/product/${product.slug}`}
        className="group relative block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elegant-hover sm:rounded-2xl"
        aria-label={`View ${product.name} - ${product.category}`}
        data-analytics-label={`Viewed ${product.name}`}
        data-product-id={product.id}
        data-product-name={product.name}
        data-product-slug={product.slug}
        data-product-category={product.category}
        data-product-price={product.price}
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/10 dark:via-transparent dark:to-accent/10 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 blur-3xl translate-y-8 scale-95 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100" />

          {product.badge && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "absolute top-2 left-2 z-20 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md",
                badgeStyles[product.badge]
              )}
            >
              {product.badge}
            </motion.span>
          )}

          <div className="relative aspect-square overflow-hidden bg-secondary/40">
            {/* Image loading skeleton */}
            <div className="absolute inset-0 skeleton opacity-0 group-hover:opacity-0 transition-opacity" />
            
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <img
              src={product.image}
              alt={`${product.name} - ${product.category} product image`}
              loading="lazy"
              width={400}
              height={400}
              className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop';
              }}
              itemProp="image"
            />
            
            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-xs font-semibold text-white bg-gradient-brand px-3 py-1.5 rounded-full">
                Quick View
              </span>
            </div>
          </div>

          <div className="space-y-1.5 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              <span itemProp="category">{product.category}</span>
            </p>
            <h3 className="font-display font-semibold text-xs leading-tight line-clamp-2 min-h-[2.35em] sm:text-sm group-hover:text-gradient transition-all" itemProp="name">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-2.5 w-2.5 sm:h-3 sm:w-3",
                      star <= Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : star - 0.5 <= product.rating
                        ? "fill-amber-400/50 text-amber-400"
                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground text-[10px] sm:text-[11px]" itemProp="ratingValue">{product.rating.toFixed(1)}</span>
              <span className="text-[9px] sm:text-[10px]" itemProp="reviewCount">({product.reviews >= 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})</span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1">
              <div className="min-w-0 flex flex-wrap items-baseline gap-1" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <span className="font-display font-bold text-sm text-foreground sm:text-base" itemProp="price">
                  {formatPrice(product.price)}
                </span>
                <meta itemProp="priceCurrency" content="USD" />
                <meta itemProp="availability" content="https://schema.org/InStock" />
                {product.oldPrice && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-7 w-7 shrink-0 rounded-full bg-secondary group-hover:bg-gradient-brand flex items-center justify-center transition-all duration-300 group-hover:shadow-glow cursor-pointer"
                aria-label={`Add ${product.name} to cart`}
                data-analytics-label={`Add ${product.name} to cart`}
                data-product-id={product.id}
                data-product-name={product.name}
                data-product-slug={product.slug}
                data-product-category={product.category}
                data-product-price={product.price}
              >
                <ShoppingBag className="h-3 w-3" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Micro-interaction indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Link>
    </>
  );
};

export default ProductCard;
