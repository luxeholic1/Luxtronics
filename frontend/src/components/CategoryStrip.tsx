import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Headphones, Watch, Laptop, Gamepad2, Camera, Package } from "lucide-react";
import { fetchStoreCategories } from "@/services/store-api";
import { categories as staticCategories } from "@/data/products";

const icons = {
  smartphones: Smartphone,
  audio: Headphones,
  wearables: Watch,
  laptops: Laptop,
  gaming: Gamepad2,
  cameras: Camera,
};

const CategoryStrip = () => {
  const { data: categoryResult, isLoading } = useQuery({
    queryKey: ['categories', 'strip'],
    queryFn: () => fetchStoreCategories(1, 6),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const displayCategories = useMemo(() => {
    if (categoryResult?.data && categoryResult.data.length > 0) return categoryResult.data;
    return staticCategories;
  }, [categoryResult]);

  return (
    <section className="container py-16 sm:py-24 px-4 sm:px-6 lg:px-0">
      <div className="flex items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4 flex-wrap">
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
            Shop by Category
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-xl">
            Find what <span className="text-gradient">moves you</span>
          </h2>
        </div>
        <Link to="/categories" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {isLoading && displayCategories.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          displayCategories.slice(0, 6).map((cat) => {
            const Icon = icons[cat.slug as keyof typeof icons] || Package;
            const count = (cat as any).productCount ?? cat.count ?? 0;
            return (
              <Link
                key={cat.slug}
                to={`/shop?cat=${cat.slug}`}
                className="group relative rounded-lg sm:rounded-2xl bg-gradient-card border border-border p-3 sm:p-6 text-center hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="h-10 w-10 sm:h-14 sm:w-14 mx-auto rounded-lg sm:rounded-2xl bg-secondary group-hover:bg-gradient-brand flex items-center justify-center mb-2 sm:mb-4 transition-all duration-500 group-hover:shadow-glow">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm truncate">{cat.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{count} items</p>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};


export default CategoryStrip;
