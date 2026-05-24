import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Package, Search, X, Sparkles, ChevronDown, ChevronRight,
  Smartphone, Headphones, Watch, Camera, Gamepad2, Tv,
  Battery, Zap, ShoppingBag, Tag, Shield, Car, TreePine,
  Apple, Wrench, Globe, ImageOff, LayoutGrid, List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";

// ─── Parent groups ────────────────────────────────────────────────────────────
const PARENT_GROUPS: {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  slugKeywords: string[];
  palette: number;
}[] = [
  { name: "Apple Parts", icon: Apple, description: "Genuine & compatible parts for all Apple devices", slugKeywords: ["apple-parts","iphone-13","iphone-14","iphone-15","iphone-16","iphone-17","iphone-air","ipad","mac-parts","apple-watch","iphone"], palette: 0 },
  { name: "Samsung Parts", icon: Smartphone, description: "Replacement parts for Samsung Galaxy series", slugKeywords: ["samsung-parts","galaxy-s-series","galaxy-note","galaxy-s23","galaxy-s24","galaxy-s25","galaxy-s26","galaxy-z","galaxy-tab","galaxy-smarttag"], palette: 1 },
  { name: "Mobile Parts", icon: Wrench, description: "Spare parts for all major mobile brands", slugKeywords: ["mobile-parts","replacement-parts","repair-tools","huawei-spare","oppo-spare","oneplus-spare","motorola-spare","nokia-spare","honor-spare"], palette: 2 },
  { name: "Apple Accessories", icon: Apple, description: "Cases, cables & accessories for Apple devices", slugKeywords: ["apple-accessories","mac-accessories","airpods","iphone-cases"], palette: 3 },
  { name: "Xiaomi Accessories", icon: Smartphone, description: "Accessories for Xiaomi & Redmi devices", slugKeywords: ["xiaomi","redmi","more-xiaomi"], palette: 4 },
  { name: "OnePlus & OPPO Accessories", icon: Smartphone, description: "Accessories for OnePlus & OPPO devices", slugKeywords: ["oneplus-oppo","oneplus-15","oppo-find","oppo-reno"], palette: 5 },
  { name: "Mobile Accessories", icon: Battery, description: "Universal mobile accessories & essentials", slugKeywords: ["mobile-accessories","cable-charger","tempered-glass","cases","bags-cases","feature-phones"], palette: 6 },
  { name: "Smart Wear", icon: Watch, description: "Smartwatches & wearable technology", slugKeywords: ["wearables","apple-watch","huawei-watch","garmin","fitbit","samsung-watch"], palette: 7 },
  { name: "Smart Phones", icon: Smartphone, description: "Latest smartphones from top brands", slugKeywords: ["smart-phone","smartphone","android-tablet","google","huawei","motorola","honor"], palette: 8 },
  { name: "DJI & Insta360 Accessories", icon: Camera, description: "Drones, action cameras & accessories", slugKeywords: ["dji","insta360","osmo","gopro"], palette: 9 },
  { name: "Camera Accessories", icon: Camera, description: "Lenses, filters, studio & photography gear", slugKeywords: ["camera","photo-studio","photographic","camera-filters","camera-lens","camera-accessories","live-equipment"], palette: 10 },
  { name: "Game Accessories", icon: Gamepad2, description: "Gaming gear, consoles & accessories", slugKeywords: ["game-accessories","gaming-accessories","nintendo","pocket-console"], palette: 11 },
  { name: "Consumer Electronics", icon: Tv, description: "TVs, projectors, audio & smart home devices", slugKeywords: ["consumer-electronics","audio","bluetooth-speakers","projector","android-tv","3d-printer"], palette: 0 },
  { name: "In Car", icon: Car, description: "Car electronics, DVRs & parking sensors", slugKeywords: ["in-car","car-dvr","parking-sensor"], palette: 1 },
  { name: "Security", icon: Shield, description: "CCTV, IP cameras & access control systems", slugKeywords: ["cctv","ip-camera","access-control","gps-tracker"], palette: 2 },
  { name: "Outdoor & Sports", icon: TreePine, description: "Camping, cycling, fishing & outdoor gear", slugKeywords: ["outdoor","camping","bicycle","fishing"], palette: 3 },
];

// ─── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES = [
  { from: "from-violet-500", to: "to-purple-600",  light: "bg-violet-50 dark:bg-violet-950/30",   text: "text-violet-600 dark:text-violet-400",   border: "border-violet-200 dark:border-violet-800/40"   },
  { from: "from-cyan-500",   to: "to-blue-600",    light: "bg-cyan-50 dark:bg-cyan-950/30",       text: "text-cyan-600 dark:text-cyan-400",       border: "border-cyan-200 dark:border-cyan-800/40"       },
  { from: "from-orange-500", to: "to-pink-600",    light: "bg-orange-50 dark:bg-orange-950/30",   text: "text-orange-600 dark:text-orange-400",   border: "border-orange-200 dark:border-orange-800/40"   },
  { from: "from-emerald-500",to: "to-teal-600",    light: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/40" },
  { from: "from-rose-500",   to: "to-red-600",     light: "bg-rose-50 dark:bg-rose-950/30",       text: "text-rose-600 dark:text-rose-400",       border: "border-rose-200 dark:border-rose-800/40"       },
  { from: "from-amber-500",  to: "to-yellow-500",  light: "bg-amber-50 dark:bg-amber-950/30",     text: "text-amber-600 dark:text-amber-400",     border: "border-amber-200 dark:border-amber-800/40"     },
  { from: "from-sky-500",    to: "to-indigo-600",  light: "bg-sky-50 dark:bg-sky-950/30",         text: "text-sky-600 dark:text-sky-400",         border: "border-sky-200 dark:border-sky-800/40"         },
  { from: "from-fuchsia-500",to: "to-pink-600",    light: "bg-fuchsia-50 dark:bg-fuchsia-950/30", text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-200 dark:border-fuchsia-800/40" },
  { from: "from-lime-500",   to: "to-green-600",   light: "bg-lime-50 dark:bg-lime-950/30",       text: "text-lime-600 dark:text-lime-400",       border: "border-lime-200 dark:border-lime-800/40"       },
  { from: "from-teal-500",   to: "to-cyan-600",    light: "bg-teal-50 dark:bg-teal-950/30",       text: "text-teal-600 dark:text-teal-400",       border: "border-teal-200 dark:border-teal-800/40"       },
  { from: "from-indigo-500", to: "to-violet-600",  light: "bg-indigo-50 dark:bg-indigo-950/30",   text: "text-indigo-600 dark:text-indigo-400",   border: "border-indigo-200 dark:border-indigo-800/40"   },
  { from: "from-red-500",    to: "to-orange-600",  light: "bg-red-50 dark:bg-red-950/30",         text: "text-red-600 dark:text-red-400",         border: "border-red-200 dark:border-red-800/40"         },
];

function matchParent(cat: StoreCategory): number {
  const slug = (cat.slug || "").toLowerCase();
  const name = (cat.name || "").toLowerCase();
  for (let i = 0; i < PARENT_GROUPS.length; i++) {
    if (PARENT_GROUPS[i].slugKeywords.some(kw => slug.includes(kw) || name.includes(kw.replace(/-/g, " ")))) {
      return i;
    }
  }
  return -1;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonGroup = () => (
  <div className="rounded-2xl border border-border bg-gradient-card animate-pulse">
    <div className="p-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-secondary/60" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-secondary/60 rounded" />
        <div className="h-3 w-1/2 bg-secondary/40 rounded" />
      </div>
    </div>
    <div className="px-5 pb-5 grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-secondary/40" />)}
    </div>
  </div>
);

// ─── Child card (image box) ───────────────────────────────────────────────────
const ChildCard = ({ cat, palette }: { cat: StoreCategory; palette: typeof PALETTES[0] }) => {
  const count = cat.productCount ?? cat.count ?? 0;
  const image = cat.sampleImage || cat.image?.src || null;
  return (
    <Link
      to={`/shop?cat=${cat.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border ${palette.border} bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className={`relative h-24 w-full ${palette.light} flex items-center justify-center overflow-hidden`}>
        {image ? (
          <img src={image} alt={cat.name} loading="lazy" decoding="async"
            className="h-full w-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground/30" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">{cat.name}</p>
        {count > 0 && <p className={`text-[10px] font-bold mt-0.5 ${palette.text}`}>{count.toLocaleString()} items</p>}
      </div>
    </Link>
  );
};

// ─── Child row (list view) ────────────────────────────────────────────────────
const ChildRow = ({ cat, palette }: { cat: StoreCategory; palette: typeof PALETTES[0] }) => {
  const count = cat.productCount ?? cat.count ?? 0;
  const image = cat.sampleImage || cat.image?.src || null;
  return (
    <Link
      to={`/shop?cat=${cat.slug}`}
      className="group flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/40 transition-colors"
    >
      <div className={`h-10 w-10 rounded-lg shrink-0 ${palette.light} flex items-center justify-center overflow-hidden border ${palette.border}`}>
        {image
          ? <img src={image} alt={cat.name} loading="lazy" className="h-full w-full object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
          : <Package className="h-4 w-4 text-muted-foreground/40" />}
      </div>
      <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</span>
      {count > 0 && <span className={`text-xs font-bold shrink-0 ${palette.text}`}>{count.toLocaleString()}</span>}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
};

// ─── Parent group accordion card ─────────────────────────────────────────────
const ParentGroupCard = ({
  group, children, index, defaultOpen, view,
}: {
  group: typeof PARENT_GROUPS[0];
  children: StoreCategory[];
  index: number;
  defaultOpen?: boolean;
  view: "grid" | "list";
}) => {
  const [open, setOpen] = useState(defaultOpen ?? index < 3);
  const p = PALETTES[group.palette % PALETTES.length];
  const Icon = group.icon;
  const totalCount = children.reduce((s, c) => s + (c.productCount ?? c.count ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`rounded-2xl border ${p.border} bg-white dark:bg-gray-900 overflow-hidden`}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${p.from} ${p.to} flex items-center justify-center shadow-md shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-bold text-lg text-foreground">{group.name}</h2>
            {children.length > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.light} ${p.text} border ${p.border}`}>
                {children.length} sub-categories
              </span>
            )}
            {totalCount > 0 && (
              <span className="text-[10px] text-muted-foreground">· {totalCount.toLocaleString()} products</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{group.description}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className={`h-px w-full bg-gradient-to-r ${p.from} ${p.to} mb-4 opacity-30`} />
              {children.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No sub-categories found</p>
              ) : view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {children.map(cat => <ChildCard key={cat.slug} cat={cat} palette={p} />)}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {children.map(cat => <ChildRow key={cat.slug} cat={cat} palette={p} />)}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link to="/shop" className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.text} hover:underline`}>
                  Browse all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Categories = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: categoryResult, isLoading } = useQuery({
    queryKey: ["categories-page"],
    queryFn: () => fetchStoreCategories(1, 200),
    staleTime: 1000 * 60 * 30,
  });

  const allCategories: StoreCategory[] = useMemo(() => {
    return (categoryResult?.data ?? []).filter(c => c.name.toLowerCase() !== "uncategorized");
  }, [categoryResult]);

  const grouped = useMemo(() => {
    const groups = PARENT_GROUPS.map(g => ({ group: g, children: [] as StoreCategory[] }));
    const unmatched: StoreCategory[] = [];
    allCategories.forEach(cat => {
      const idx = matchParent(cat);
      if (idx >= 0) groups[idx].children.push(cat);
      else unmatched.push(cat);
    });
    groups.forEach(g => g.children.sort((a, b) => (b.productCount ?? b.count ?? 0) - (a.productCount ?? a.count ?? 0)));
    return { groups, unmatched };
  }, [allCategories]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allCategories.filter(c => c.name.toLowerCase().includes(q));
  }, [allCategories, search]);

  const totalProducts = useMemo(
    () => allCategories.reduce((s, c) => s + (c.productCount ?? c.count ?? 0), 0),
    [allCategories]
  );

  const activeGroups = grouped.groups.filter(g => g.children.length > 0);

  return (
    <Layout>
      <SEO
        title="Shop by Category | Luxtronics"
        description={`Browse ${allCategories.length} categories of premium electronics.`}
        keywords="electronics categories, smartphones, laptops, audio, cameras"
        url="https://luxtronics.com/categories"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/8 blur-[100px]" />
        </div>
        <div className="container relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3 w-3" /> All Categories
            </div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none mb-4">
              Shop by <span className="text-gradient">Category</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-8">
              {isLoading ? "Loading categories…" : `${activeGroups.length} departments · ${allCategories.length} categories · ${totalProducts.toLocaleString()} products`}
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-2xl border border-border bg-background/80 backdrop-blur text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      {!isLoading && allCategories.length > 0 && (
        <div className="border-b border-border bg-secondary/30">
          <div className="container py-3.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <strong className="text-foreground">{activeGroups.length}</strong> departments
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <strong className="text-foreground">{allCategories.length}</strong> categories
              </span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <strong className="text-foreground">{totalProducts.toLocaleString()}</strong> products
              </span>
              {search && (
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Search className="h-3.5 w-3.5" />
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
                </span>
              )}
            </div>
            {!search && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
                <button
                  onClick={() => setView("grid")}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${view === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${view === "list" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container py-10 sm:py-12 lg:py-16">

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonGroup key={i} />)}
          </div>
        )}

        {/* Search results */}
        {!isLoading && search && (
          searchResults.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl mb-6">🔍</div>
              <h3 className="font-display font-bold text-2xl mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-6">No results for "{search}".</p>
              <button onClick={() => setSearch("")} className="px-6 py-3 rounded-full bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-glow">Clear search</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {searchResults.map((cat, i) => {
                const pi = matchParent(cat);
                const p = PALETTES[(pi >= 0 ? PARENT_GROUPS[pi].palette : i) % PALETTES.length];
                return <ChildCard key={cat.slug} cat={cat} palette={p} />;
              })}
            </div>
          )
        )}

        {/* Grouped view */}
        {!isLoading && !search && (
          <div className="space-y-4">
            {activeGroups.map((g, i) => (
              <ParentGroupCard key={g.group.name} group={g.group} children={g.children} index={i} defaultOpen={i < 3} view={view} />
            ))}
            {grouped.unmatched.length > 0 && (
              <ParentGroupCard
                group={{ name: "Other", icon: Package, description: "Miscellaneous categories", slugKeywords: [], palette: 11 }}
                children={grouped.unmatched}
                index={activeGroups.length}
                defaultOpen={false}
                view={view}
              />
            )}
          </div>
        )}

      </div>

      {/* Bottom CTA */}
      {!isLoading && allCategories.length > 0 && (
        <section className="border-t border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container py-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Zap className="h-3 w-3" /> Can't find what you need?
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-4">
              Browse <span className="text-gradient">all products</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Search across {totalProducts.toLocaleString()} products with smart filters and instant results.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Categories;
