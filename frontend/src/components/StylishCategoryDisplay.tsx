import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  Headphones, 
  Watch, 
  Laptop, 
  Gamepad2, 
  Camera,
  Zap,
  Percent,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
  color: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}

const StylishCategoryDisplay = ({ 
  categories, 
  activeCat,
  onCategoryChange 
}: { 
  categories: Category[];
  activeCat: string;
  onCategoryChange: (slug: string) => void;
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Default categories if none provided
  const defaultCategories: Category[] = [
    {
      id: 1,
      name: "Smartphones",
      slug: "smartphones",
      count: 245,
      description: "Latest models with cutting-edge technology",
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-cyan-500/20",
      icon: Smartphone,
    },
    {
      id: 2,
      name: "Audio",
      slug: "audio",
      count: 189,
      description: "Premium sound experience",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-pink-500/20",
      icon: Headphones,
    },
    {
      id: 3,
      name: "Wearables",
      slug: "wearables",
      count: 156,
      description: "Smart watches & fitness trackers",
      color: "text-emerald-400",
      gradient: "from-emerald-500/20 to-teal-500/20",
      icon: Watch,
    },
    {
      id: 4,
      name: "Laptops",
      slug: "laptops",
      count: 98,
      description: "Pro laptops for work & creativity",
      color: "text-orange-400",
      gradient: "from-orange-500/20 to-red-500/20",
      icon: Laptop,
    },
    {
      id: 5,
      name: "Gaming",
      slug: "gaming",
      count: 167,
      description: "High-performance gaming gear",
      color: "text-violet-400",
      gradient: "from-violet-500/20 to-fuchsia-500/20",
      icon: Gamepad2,
    },
    {
      id: 6,
      name: "Cameras",
      slug: "cameras",
      count: 76,
      description: "Professional photography equipment",
      color: "text-amber-400",
      gradient: "from-amber-500/20 to-yellow-500/20",
      icon: Camera,
    },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Featured categories (first 3)
  const featuredCategories = displayCategories.slice(0, 3);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-brand/10 backdrop-blur-sm border border-primary/20 px-4 py-1.5 mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Shop by Category
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Discover{" "}
            <span className="text-gradient">Premium Collections</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">
            Browse our curated categories featuring limited editions and new drops
          </p>
        </div>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground group"
        >
          View all categories
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Featured Categories - Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {featuredCategories.map((category, index) => {
          const Icon = category.icon;
          const isActive = activeCat === category.slug;
          const isHovered = hoveredCategory === category.slug;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCategory(category.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative"
            >
              <button
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br from-black/40 to-black/20 border transition-all duration-500",
                  isActive
                    ? "border-primary/40 shadow-glow"
                    : "border-white/10 hover:border-white/20 hover:shadow-2xl",
                  "hover:-translate-y-2"
                )}
              >
                {/* Background gradient */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                    category.gradient,
                    (isActive || isHovered) && "opacity-100"
                  )}
                />

                {/* Content */}
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500",
                          isActive || isHovered
                            ? "bg-white/20 backdrop-blur-sm"
                            : "bg-white/10"
                        )}
                      >
                        <Icon className={cn("h-6 w-6", category.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                            {index === 0 ? "LIMITED EDITION" : index === 1 ? "NEW DROP" : "BEST SELLER"}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] font-bold bg-gradient-brand px-2 py-0.5 rounded-full text-primary-foreground">
                              -30%
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                        isActive || isHovered
                          ? "bg-white/20 backdrop-blur-sm"
                          : "bg-white/10"
                      )}
                    >
                      {index === 0 ? (
                        <Percent className="h-4 w-4" />
                      ) : index === 1 ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-display font-bold text-gradient">
                        {category.count}+
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Products
                      </div>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                        isActive || isHovered
                          ? "bg-white/20 backdrop-blur-sm border border-white/20"
                          : "bg-white/10 border border-white/10"
                      )}
                    >
                      {index === 0 ? "Shop now" : index === 1 ? "Discover" : "Explore"}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500",
                    isHovered && "opacity-100"
                  )}
                />
              </button>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full bg-gradient-brand"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* All Categories - Compact Grid */}
      <div className="pt-4">
        <h3 className="font-display font-semibold text-lg sm:text-xl mb-4">
          All Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {displayCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCat === category.slug;

            return (
              <button
                key={category.slug}
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "group relative rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center transition-all duration-300",
                  isActive
                    ? "bg-gradient-card border border-primary/40 shadow-glow"
                    : "bg-gradient-card border border-border hover:border-primary/30 hover:shadow-elegant"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-10 sm:w-10 mx-auto rounded-lg flex items-center justify-center mb-2 transition-all duration-300",
                    isActive
                      ? "bg-gradient-brand shadow-glow"
                      : "bg-secondary group-hover:bg-gradient-brand/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm truncate">
                  {category.name}
                </h4>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {category.count} items
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Stats */}
      <AnimatePresence>
        {hoveredCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl bg-gradient-card border border-white/10 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-semibold text-lg">
                  {displayCategories.find(c => c.slug === hoveredCategory)?.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayCategories.find(c => c.slug === hoveredCategory)?.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-gradient">
                  {displayCategories.find(c => c.slug === hoveredCategory)?.count}+
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Premium Products
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylishCategoryDisplay;