import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Headphones, Watch, Laptop, Gamepad2, Camera, Package } from "lucide-react";
import { motion } from "framer-motion";
import { fetchStoreCategories } from "@/services/store-api";
import { categories as staticCategories } from "@/data/products";
import shopBgDesktop from "@/assets/shop.jpg";
import shopBgMobile from "@/assets/mob2.jpg";

const icons = {
  smartphones: Smartphone,
  audio: Headphones,
  wearables: Watch,
  laptops: Laptop,
  gaming: Gamepad2,
  cameras: Camera,
};

const CategoryStrip = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    const resizeHandler = () => {
      requestAnimationFrame(checkMobile);
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

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
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative bg-cover bg-center section-bg-overlay"
        style={{
          backgroundImage: `url(${isMobile ? shopBgMobile : shopBgDesktop})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40 pointer-events-none" />
        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="flex items-end justify-between mb-6 sm:mb-10 md:mb-12 gap-3 sm:gap-4 flex-wrap relative z-10 max-w-[1920px] mx-auto">
          <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl dark:bg-black/40 light:bg-white/90 backdrop-blur-xl border dark:border-white/10 light:border-black/10 shadow-xl">
            <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
              Shop by Category
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight max-w-xl leading-tight dark:text-white light:text-black">
              Find what <span className="text-gradient">moves you</span>
            </h2>
          </div>
          <Link to="/categories" className="text-xs sm:text-sm dark:text-white light:text-black hover:text-primary transition-colors font-medium group flex items-center gap-1 p-3 sm:p-4 rounded-lg dark:bg-black/40 light:bg-white/90 backdrop-blur-xl border dark:border-white/10 light:border-black/10">
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 relative z-10 max-w-[1920px] mx-auto">
        {isLoading && displayCategories.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl sm:rounded-2xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          displayCategories.slice(0, 6).map((cat) => {
            const Icon = icons[cat.slug as keyof typeof icons] || Package;
            const count = (cat as any).productCount ?? cat.count ?? 0;
            return (
              <Link
                key={cat.slug}
                to={`/shop?cat=${cat.slug}`}
                className="group relative rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-card border border-border dark:border-border light:border-black/8 p-3 sm:p-4 md:p-6 text-center hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-1 hover:shadow-elegant overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto rounded-lg sm:rounded-xl md:rounded-2xl bg-secondary group-hover:bg-gradient-brand flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-all duration-500 group-hover:shadow-glow group-hover:scale-110">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate">{cat.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{count} items</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};


export default CategoryStrip;
