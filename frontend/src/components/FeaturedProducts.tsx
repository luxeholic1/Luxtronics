import { Link } from "react-router-dom";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  return (
    <section className="container py-16 sm:py-24 px-4 sm:px-6 lg:px-0">
      <div className="flex items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4 flex-wrap">
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
            Featured
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-xl">
            Best sellers <span className="text-gradient">this week</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
        >
          Shop all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
