import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Battery,
  Camera,
  Car,
  ChevronDown,
  Gamepad2,
  Grid3X3,
  Headphones,
  ImageOff,
  LayoutGrid,
  List,
  Package,
  Search,
  Shield,
  ShoppingBag,
  Smartphone,
  Tag,
  Tv,
  Watch,
  Wrench,
  X,
  Zap,
  Apple,
  TreePine,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";

type ParentGroup = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  slugKeywords: string[];
};

const PARENT_GROUPS: ParentGroup[] = [
  { name: "Apple Parts", icon: Apple, description: "Genuine and compatible parts for all Apple devices", slugKeywords: ["apple-parts", "iphone-13", "iphone-14", "iphone-15", "iphone-16", "iphone-17", "iphone-air", "ipad", "mac-parts", "apple-watch", "iphone"] },
  { name: "Samsung Parts", icon: Smartphone, description: "Replacement parts for Samsung Galaxy series", slugKeywords: ["samsung-parts", "galaxy-s-series", "galaxy-note", "galaxy-s23", "galaxy-s24", "galaxy-s25", "galaxy-s26", "galaxy-z", "galaxy-tab", "galaxy-smarttag"] },
  { name: "Mobile Parts", icon: Wrench, description: "Spare parts for all major mobile brands", slugKeywords: ["mobile-parts", "replacement-parts", "repair-tools", "huawei-spare", "oppo-spare", "oneplus-spare", "motorola-spare", "nokia-spare", "honor-spare"] },
  { name: "Apple Accessories", icon: Apple, description: "Cases, cables and accessories for Apple devices", slugKeywords: ["apple-accessories", "mac-accessories", "airpods", "iphone-cases"] },
  { name: "Xiaomi Accessories", icon: Smartphone, description: "Accessories for Xiaomi and Redmi devices", slugKeywords: ["xiaomi", "redmi", "more-xiaomi"] },
  { name: "OnePlus & OPPO", icon: Smartphone, description: "Accessories for OnePlus and OPPO devices", slugKeywords: ["oneplus-oppo", "oneplus-15", "oppo-find", "oppo-reno"] },
  { name: "Mobile Accessories", icon: Battery, description: "Universal mobile accessories and essentials", slugKeywords: ["mobile-accessories", "cable-charger", "tempered-glass", "cases", "bags-cases", "feature-phones"] },
  { name: "Smart Wear", icon: Watch, description: "Smartwatches and wearable technology", slugKeywords: ["wearables", "apple-watch", "huawei-watch", "garmin", "fitbit", "samsung-watch"] },
  { name: "Smart Phones", icon: Smartphone, description: "Latest smartphones from top brands", slugKeywords: ["smart-phone", "smartphone", "android-tablet", "google", "huawei", "motorola", "honor"] },
  { name: "DJI & Insta360", icon: Camera, description: "Drones, action cameras and creator accessories", slugKeywords: ["dji", "insta360", "osmo", "gopro"] },
  { name: "Camera Accessories", icon: Camera, description: "Lenses, filters, studio and photography gear", slugKeywords: ["camera", "photo-studio", "photographic", "camera-filters", "camera-lens", "camera-accessories", "live-equipment"] },
  { name: "Game Accessories", icon: Gamepad2, description: "Gaming gear, consoles and accessories", slugKeywords: ["game-accessories", "gaming-accessories", "nintendo", "pocket-console"] },
  { name: "Consumer Electronics", icon: Tv, description: "TVs, projectors, audio and smart home devices", slugKeywords: ["consumer-electronics", "audio", "bluetooth-speakers", "projector", "android-tv", "3d-printer"] },
  { name: "In Car", icon: Car, description: "Car electronics, DVRs and parking sensors", slugKeywords: ["in-car", "car-dvr", "parking-sensor"] },
  { name: "Security", icon: Shield, description: "CCTV, IP cameras and access control systems", slugKeywords: ["cctv", "ip-camera", "access-control", "gps-tracker"] },
  { name: "Outdoor & Sports", icon: TreePine, description: "Camping, cycling, fishing and outdoor gear", slugKeywords: ["outdoor", "camping", "bicycle", "fishing"] },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function matchParent(cat: StoreCategory): number {
  const slug = (cat.slug || "").toLowerCase();
  const name = (cat.name || "").toLowerCase();

  return PARENT_GROUPS.findIndex((group) =>
    group.slugKeywords.some((keyword) => slug.includes(keyword) || name.includes(keyword.replace(/-/g, " "))),
  );
}

const SkeletonGroup = () => (
  <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
    <div className="flex animate-pulse items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/70" />
      </div>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/70" />
      ))}
    </div>
  </div>
);

const CategoryImage = ({ cat }: { cat: StoreCategory }) => {
  const image = cat.sampleImage || cat.image?.src || null;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      {image ? (
        <img
          src={image}
          alt={cat.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageOff className="h-7 w-7 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  );
};

const ChildCard = ({ cat }: { cat: StoreCategory }) => {
  const count = cat.productCount ?? cat.count ?? 0;

  return (
    <Link
      to={`/shop?cat=${cat.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
    >
      <CategoryImage cat={cat} />
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 min-h-9 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {cat.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <Tag className="h-3 w-3" />
            Category
          </span>
          {count > 0 && <span className="text-xs font-semibold text-primary">{count.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
};

const ChildRow = ({ cat }: { cat: StoreCategory }) => {
  const count = cat.productCount ?? cat.count ?? 0;
  const image = cat.sampleImage || cat.image?.src || null;

  return (
    <Link
      to={`/shop?cat=${cat.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/60"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <img src={image} alt={cat.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{cat.name}</p>
        {count > 0 && <p className="text-xs text-muted-foreground">{count.toLocaleString()} products</p>}
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
};

const DepartmentCard = ({
  group,
  children,
  index,
  defaultOpen,
  view,
}: {
  group: ParentGroup;
  children: StoreCategory[];
  index: number;
  defaultOpen?: boolean;
  view: "grid" | "list";
}) => {
  const [open, setOpen] = useState(defaultOpen ?? index < 2);
  const Icon = group.icon;
  const totalCount = children.reduce((sum, child) => sum + (child.productCount ?? child.count ?? 0), 0);

  return (
    <motion.section
      id={slugify(group.name)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-card/85 shadow-sm backdrop-blur"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/55 sm:p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-bold text-foreground">{group.name}</span>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              {children.length} categories
            </span>
            {totalCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {totalCount.toLocaleString()} products
              </span>
            )}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{group.description}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 sm:p-5">
              {children.length === 0 ? (
                <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">No sub-categories found</p>
              ) : view === "grid" ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {children.map((cat) => (
                    <ChildCard key={cat.slug} cat={cat} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-1 md:grid-cols-2">
                  {children.map((cat) => (
                    <ChildRow key={cat.slug} cat={cat} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const Categories = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: categoryResult, isLoading } = useQuery({
    queryKey: ["categories-page"],
    queryFn: () => fetchStoreCategories(1, 200),
    staleTime: 1000 * 60 * 30,
  });

  const allCategories: StoreCategory[] = useMemo(() => {
    return (categoryResult?.data ?? []).filter((category) => category.name.toLowerCase() !== "uncategorized");
  }, [categoryResult]);

  const grouped = useMemo(() => {
    const groups = PARENT_GROUPS.map((group) => ({ group, children: [] as StoreCategory[] }));
    const unmatched: StoreCategory[] = [];

    allCategories.forEach((category) => {
      const index = matchParent(category);
      if (index >= 0) groups[index].children.push(category);
      else unmatched.push(category);
    });

    groups.forEach((group) => {
      group.children.sort((a, b) => (b.productCount ?? b.count ?? 0) - (a.productCount ?? a.count ?? 0));
    });
    unmatched.sort((a, b) => (b.productCount ?? b.count ?? 0) - (a.productCount ?? a.count ?? 0));

    return { groups, unmatched };
  }, [allCategories]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return allCategories.filter((category) => {
      const haystack = `${category.name} ${category.slug}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [allCategories, search]);

  const totalProducts = useMemo(
    () => allCategories.reduce((sum, category) => sum + (category.productCount ?? category.count ?? 0), 0),
    [allCategories],
  );

  const activeGroups = grouped.groups.filter((group) => group.children.length > 0);
  const visibleGroups = grouped.unmatched.length
    ? [...activeGroups, { group: { name: "Other", icon: Package, description: "More electronics categories", slugKeywords: [] }, children: grouped.unmatched }]
    : activeGroups;

  return (
    <Layout>
      <SEO
        title="Shop by Category | Luxtronics"
        description={`Browse ${allCategories.length} categories of premium electronics.`}
        keywords="electronics categories, smartphones, laptops, audio, cameras"
        url="https://luxtronics.com/categories"
      />

      <main className="bg-background">
        <div className="container py-10 sm:py-12 lg:py-14">
          <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories, brands, parts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
                  aria-label="Clear category search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-muted-foreground">
                <Grid3X3 className="h-4 w-4 text-primary" />
                <strong className="text-foreground">{activeGroups.length}</strong> departments
              </span>
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-muted-foreground">
                <Tag className="h-4 w-4 text-primary" />
                <strong className="text-foreground">{allCategories.length}</strong> categories
              </span>
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-muted-foreground">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <strong className="text-foreground">{totalProducts.toLocaleString()}</strong> products
              </span>
              {!search && (
                <div className="flex h-10 items-center gap-1 rounded-xl border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department Menu</p>
                    <h2 className="font-display text-lg font-bold text-foreground">Categories</h2>
                  </div>
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  {visibleGroups.map(({ group, children }) => {
                    const Icon = group.icon;
                    return (
                      <a
                        key={group.name}
                        href={`#${slugify(group.name)}`}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-foreground">{group.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary">{children.length}</span>
                      </a>
                    );
                  })}
                </div>
                <Link
                  to="/shop"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop all products
                </Link>
              </div>
            </aside>

            <section className="min-w-0">
              {isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonGroup key={index} />
                  ))}
                </div>
              )}

              {!isLoading && search && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
                      </p>
                      <p className="text-sm text-muted-foreground">Matching category names and slugs</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                      Clear search
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-card/85 p-8 text-center shadow-sm">
                      <Search className="mb-4 h-10 w-10 text-muted-foreground" />
                      <h3 className="font-display text-2xl font-bold text-foreground">No categories found</h3>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">Try a brand, device model, accessory type or part name.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                      {searchResults.map((cat) => (
                        <ChildCard key={cat.slug} cat={cat} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !search && (
                <div className="space-y-5">
                  {visibleGroups.map(({ group, children }, index) => (
                    <DepartmentCard
                      key={group.name}
                      group={group}
                      children={children}
                      index={index}
                      defaultOpen={index < 3}
                      view={view}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {!isLoading && allCategories.length > 0 && (
          <section className="border-t border-border bg-muted/35">
            <div className="container flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  Need faster discovery?
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Use shop filters for exact products.</h2>
                <p className="mt-1 text-sm text-muted-foreground">Browse all products with category, price, rating and sorting controls.</p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Open shop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
};

export default Categories;
