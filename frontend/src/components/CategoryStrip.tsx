import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Headphones, Watch, Laptop, Gamepad2, Camera, Package } from "lucide-react";
import { motion } from "framer-motion";
import { fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";
import { categories as staticCategories } from "@/data/products";

type DisplayCategory = Pick<StoreCategory, "name" | "slug" | "count" | "productCount">;

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
    queryKey: ["categories", "strip"],
    queryFn: () => fetchStoreCategories(1, 6),
    staleTime: 1000 * 60 * 60,
  });

  const displayCategories: DisplayCategory[] = useMemo(() => {
    if (categoryResult?.data && categoryResult.data.length > 0) return categoryResult.data;
    return staticCategories;
  }, [categoryResult]);

  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.8)_52%,hsl(var(--background))_100%)] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-12 lg:py-28 xl:px-16 ">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("/a2.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-xl">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Premium categories
            </div>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Refined tech categories for every setup.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Premium accessories, devices and essentials ko clean sections mein browse karo. No clutter, bas quick discovery.
            </p>
          </div>

          <Link
            to="/categories"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-bold text-foreground shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-lg"
          >
            View all categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
        {isLoading && displayCategories.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="min-h-[190px] rounded-2xl border border-white/20 bg-background/45 backdrop-blur-xl animate-pulse" />
          ))
        ) : (
          displayCategories.slice(0, 6).map((cat, index) => {
            const Icon = icons[cat.slug as keyof typeof icons] || Package;
            const count = cat.productCount ?? cat.count ?? 0;

            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="h-full"
              >
                <Link
                  to={`/shop?cat=${cat.slug}`}
                  className="group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-background/54 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-background/72 hover:shadow-[0_24px_80px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/[0.08] sm:p-5"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_42%,rgba(255,255,255,0.08)_100%)] opacity-60 dark:opacity-20" />

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/70 text-foreground shadow-sm backdrop-blur transition duration-300 group-hover:border-primary/35 group-hover:text-primary">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="mt-auto">
                      <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-foreground">
                        {cat.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                          {count} items
                        </p>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-foreground transition duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
        </div>
      </div>
    </section>
  );
};


export default CategoryStrip;
