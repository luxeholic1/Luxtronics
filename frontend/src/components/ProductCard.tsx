import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const badgeStyles: Record<string, string> = {
  New: "bg-foreground text-background",
  Hot: "bg-gradient-brand text-primary-foreground",
  "-20%": "bg-accent text-accent-foreground",
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
    });
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
        className="group relative block rounded-2xl sm:rounded-3xl bg-gradient-card border border-border dark:border-border light:border-black/8 p-4 sm:p-5 md:p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-elegant-hover hover:-translate-y-2 sm:hover:-translate-y-1 [perspective:1600px] overflow-hidden"
        aria-label={`View ${product.name} - ${product.category}`}
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/10 dark:via-transparent dark:to-accent/10 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateX(6deg)_rotateY(-8deg)_translateY(-6px)]">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15 blur-3xl translate-y-8 scale-95 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100" />

          {product.badge && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "absolute top-2 left-2 sm:top-4 sm:left-4 z-20 text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-500 group-hover:[transform:translateZ(42px)] shadow-md",
                badgeStyles[product.badge]
              )}
            >
              {product.badge}
            </motion.span>
          )}

          <div className="relative aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 overflow-hidden mb-3 sm:mb-4 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/5 transition-transform duration-500 group-hover:[transform:translateZ(28px)]">
            {/* Image loading skeleton */}
            <div className="absolute inset-0 skeleton opacity-0 group-hover:opacity-0 transition-opacity" />
            
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <img
              src={product.image}
              alt={`${product.name} - ${product.category} product image`}
              loading="lazy"
              width={400}
              height={400}
              className="relative h-3/4 w-3/4 object-contain transition-transform duration-700 group-hover:scale-110 group-hover:[transform:translateZ(48px)] will-change-transform"
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

          <div className="space-y-1.5 sm:space-y-2 transition-transform duration-500 group-hover:[transform:translateZ(18px)]">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <span itemProp="category">{product.category}</span>
            </p>
            <h3 className="font-display font-semibold text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-gradient transition-all" itemProp="name">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-muted-foreground" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary" />
              <span className="font-medium text-foreground text-[11px] sm:text-xs" itemProp="ratingValue">{product.rating}</span>
              <span className="text-[10px] sm:text-xs" itemProp="reviewCount">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-end justify-between pt-1.5 sm:pt-2">
              <div className="flex items-baseline gap-1.5 sm:gap-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <span className="font-display font-bold text-lg sm:text-xl text-foreground" itemProp="price">
                  {formatPrice(product.price)}
                </span>
                <meta itemProp="priceCurrency" content="USD" />
                <meta itemProp="availability" content="https://schema.org/InStock" />
                {product.oldPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-secondary group-hover:bg-gradient-brand flex items-center justify-center transition-all duration-300 group-hover:shadow-glow group-hover:[transform:translateZ(24px)] cursor-pointer"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
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
