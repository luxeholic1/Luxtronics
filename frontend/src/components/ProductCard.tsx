import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

const badgeStyles: Record<string, string> = {
  New: "bg-foreground text-background",
  Hot: "bg-gradient-brand text-primary-foreground",
  "-20%": "bg-accent text-accent-foreground",
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice } = useCurrency();
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block rounded-xl sm:rounded-2xl bg-gradient-card border border-border p-3 sm:p-5 transition-all duration-500 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-1 [perspective:1400px]"
    >
      <div className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateX(8deg)_rotateY(-10deg)_translateY(-4px)]">
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/5 blur-2xl translate-y-6 scale-95 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.badge && (
          <span
            className={cn(
              "absolute top-2 left-2 sm:top-4 sm:left-4 z-20 text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-transform duration-500 group-hover:[transform:translateZ(42px)]",
              badgeStyles[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}

        <div className="relative aspect-square rounded-lg sm:rounded-xl bg-secondary/40 overflow-hidden mb-3 sm:mb-4 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:[transform:translateZ(28px)]">
          <div className="absolute inset-0 bg-gradient-radial opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={400}
            height={400}
            className="relative h-3/4 w-3/4 object-contain transition-transform duration-700 group-hover:scale-110 group-hover:[transform:translateZ(48px)]"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2 transition-transform duration-500 group-hover:[transform:translateZ(18px)]">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="font-display font-semibold text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-gradient transition-all">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary" />
            <span className="font-medium text-foreground text-[11px] sm:text-xs">{product.rating}</span>
            <span className="text-[10px] sm:text-xs">({product.reviews.toLocaleString()})</span>
          </div>

          <div className="flex items-end justify-between pt-1.5 sm:pt-2">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display font-bold text-lg sm:text-xl">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-secondary group-hover:bg-gradient-brand flex items-center justify-center transition-all duration-300 group-hover:shadow-glow group-hover:[transform:translateZ(24px)]">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
