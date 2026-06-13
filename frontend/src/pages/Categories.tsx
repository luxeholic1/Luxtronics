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
  ChevronRight,
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
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";
import { scoreTextMatch } from "@/lib/smart-search";
import { filterVisibleCategories } from "@/lib/visible-categories";
import { fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";

type ParentGroup = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  slugKeywords: string[];
};

const PARENT_GROUPS: ParentGroup[] = [
  { name: "Mobile Accessories", icon: Battery, description: "Universal mobile accessories and essentials", slugKeywords: ["mobile-accessories", "cable-charger", "tempered-glass", "cases", "case", "cover", "protector", "screen", "glass", "charger", "cable", "adapter", "bags-cases", "bag", "pouch", "holder", "stand", "mount", "dock", "magsafe", "airpods", "earbuds", "earphones", "headphones", "feature-phones"] },
  { name: "Smart Wear", icon: Watch, description: "Smartwatches, smart glasses and wearable technology", slugKeywords: ["wearables", "apple-watch", "huawei-watch", "garmin", "fitbit", "samsung-watch", "smart-glasses", "glasses", "eyewear"] },
  { name: "Outdoor & Sports", icon: TreePine, description: "Camping, cycling, fishing and outdoor gear", slugKeywords: ["outdoor", "camping", "bicycle", "fishing"] },
  { name: "Consumer Electronics", icon: Tv, description: "TVs, projectors, audio and smart home devices", slugKeywords: ["consumer-electronics", "audio", "bluetooth-speakers", "projector", "android-tv", "3d-printer", "arduino", "vr", "ar", "live-equipment"] },
  { name: "DJI & Insta360", icon: Camera, description: "Drones, action cameras and creator accessories", slugKeywords: ["dji", "insta360", "osmo", "gopro"] },
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
  <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
    <div className="flex animate-pulse items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/70" />
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-lg bg-muted/70" />
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
      className="group overflow-hidden rounded-lg border border-border bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
    >
      <CategoryImage cat={cat} />
      <div className="space-y-1.5 p-2.5">
        <p className="line-clamp-2 min-h-8 text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {cat.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-1 text-[10px] font-medium text-muted-foreground">
            <Tag className="h-3 w-3" />
            Category
          </span>
          {count > 0 && <span className="text-[11px] font-semibold text-primary">{count.toLocaleString()}</span>}
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
      className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/60"
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
      className="scroll-mt-28 overflow-hidden rounded-xl border border-border bg-card/85 shadow-sm backdrop-blur"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/55"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold text-foreground">{group.name}</span>
            <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {children.length} categories
            </span>
            {totalCount > 0 && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {totalCount.toLocaleString()} products
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{group.description}</span>
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
            <div className="border-t border-border p-3">
              {children.length === 0 ? (
                <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">No sub-categories found</p>
              ) : view === "grid" ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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

function chunkCategories(categories: StoreCategory[], size: number) {
  const chunks: StoreCategory[][] = [];
  for (let index = 0; index < categories.length; index += size) {
    chunks.push(categories.slice(index, index + size));
  }
  return chunks;
}

const CompactCategoryBrowser = ({
  groups,
  allCategories,
}: {
  groups: Array<{ group: ParentGroup; children: StoreCategory[] }>;
  allCategories: StoreCategory[];
}) => {
  const firstGroup = groups.find((item) => item.children.length > 0)?.group.name || groups[0]?.group.name || "";
  const [activeName, setActiveName] = useState(firstGroup);
  const activeGroup = groups.find((item) => item.group.name === activeName) || groups[0];
  const activeChildren = activeGroup?.children.length ? activeGroup.children : allCategories.slice(0, 28);
  const columns = chunkCategories(activeChildren.slice(0, 28), 7);
  const totalActive = activeChildren.reduce((sum, cat) => sum + (cat.productCount ?? cat.count ?? 0), 0);

  return (
    <section className="mb-5 hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:block">
      <div className="grid min-h-[430px] grid-cols-[280px_minmax(0,1fr)]">
        <div className="border-r border-border bg-muted/45">
          <div className="flex h-12 items-center justify-between bg-primary px-4 text-primary-foreground">
            <span className="text-sm font-black">Shop by Categories</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="max-h-[380px] overflow-y-auto py-1">
            {groups.map(({ group, children }) => {
              const Icon = group.icon;
              const isActive = activeGroup?.group.name === group.name;
              return (
                <button
                  key={group.name}
                  type="button"
                  onMouseEnter={() => setActiveName(group.name)}
                  onFocus={() => setActiveName(group.name)}
                  className={`group flex h-9 w-full items-center gap-3 px-4 text-left text-sm transition ${
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-foreground hover:bg-background hover:text-primary"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <span className="min-w-0 flex-1 truncate font-medium">{group.name}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{children.length}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/45" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 px-5 py-4">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Hover to browse</p>
              <h2 className="font-display text-lg font-black text-foreground">{activeGroup?.group.name || "Categories"}</h2>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="font-bold text-foreground">{activeChildren.length} categories</div>
              {totalActive > 0 && <div>{totalActive.toLocaleString()} products</div>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className={columnIndex > 0 ? "border-l border-border pl-5" : ""}>
                {column.map((category, itemIndex) => {
                  const count = category.productCount ?? category.count ?? 0;
                  const isHeading = itemIndex === 0;
                  return (
                    <Link
                      key={category.slug}
                      to={`/shop?cat=${category.slug}`}
                      className={`group flex items-start gap-2 rounded px-1 py-1.5 transition hover:bg-primary/5 hover:text-primary ${
                        isHeading ? "mb-1 text-base font-black text-foreground" : "text-sm font-medium text-muted-foreground"
                      }`}
                    >
                      <span className={isHeading ? "mt-1 h-2 w-2 shrink-0 rounded-sm bg-primary" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-orange-400"} />
                      <span className="min-w-0 flex-1 truncate">{category.name}</span>
                      {count > 0 && <span className="text-[10px] font-bold opacity-50">{count}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Categories = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categorySort, setCategorySort] = useState<"popular" | "az">("popular");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data: categoryResult, isLoading } = useQuery({
    queryKey: ["categories-page"],
    queryFn: () => fetchStoreCategories(1, 200),
    staleTime: 1000 * 60 * 30,
  });

  const allCategories: StoreCategory[] = useMemo(() => {
    return filterVisibleCategories(
      (categoryResult?.data ?? []).filter((category) => category.name.toLowerCase() !== "uncategorized"),
    );
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

    return allCategories
      .map((category) => ({
        category,
        score: scoreTextMatch(query, [category.name, category.slug, category.description], [4, 2, 1]),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || (b.category.productCount ?? b.category.count ?? 0) - (a.category.productCount ?? a.category.count ?? 0))
      .map(({ category }) => category);
  }, [allCategories, search]);

  const totalProducts = useMemo(
    () => allCategories.reduce((sum, category) => sum + (category.productCount ?? category.count ?? 0), 0),
    [allCategories],
  );
  const topCategories = useMemo(
    () => [...allCategories]
      .sort((a, b) => (b.productCount ?? b.count ?? 0) - (a.productCount ?? a.count ?? 0))
      .slice(0, 8),
    [allCategories],
  );

  const activeGroups = grouped.groups.filter((group) => group.children.length > 0);
  const visibleGroups = activeGroups;
  const displayGroups = useMemo(() => {
    const selected = departmentFilter === "all"
      ? visibleGroups
      : visibleGroups.filter(({ group }) => slugify(group.name) === departmentFilter);

    return selected.map(({ group, children }) => ({
      group,
      children: [...children].sort((a, b) => {
        if (categorySort === "az") return a.name.localeCompare(b.name);
        return (b.productCount ?? b.count ?? 0) - (a.productCount ?? a.count ?? 0);
      }),
    }));
  }, [visibleGroups, categorySort, departmentFilter]);

  return (
    <Layout>
      <SEO
        title="Shop by Category | Luxtronics"
        description={`Browse ${allCategories.length} categories of premium electronics.`}
        keywords="electronics categories, smartphones, laptops, audio, cameras"
        url="/categories"
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/categories")}#categories`,
            "name": "Shop by Category",
            "url": absoluteUrl("/categories"),
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": allCategories.length,
              "itemListElement": allCategories.slice(0, 50).map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": category.name,
                "url": absoluteUrl(`/shop?category=${category.slug}`),
              })),
            },
          },
        ]}
      />

      <main className="bg-background">
        <div className="container py-6 sm:py-8 lg:py-10">
          <div className="mb-4 rounded-xl border border-border bg-card/85 p-3 shadow-sm backdrop-blur">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Categories</p>
                <h1 className="font-display text-xl font-black text-foreground">Browse departments</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-muted-foreground">
                  <strong className="text-foreground">{activeGroups.length}</strong> departments
                </span>
                <span className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-muted-foreground">
                  <strong className="text-foreground">{allCategories.length}</strong> categories
                </span>
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories, brands, parts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
                  aria-label="Clear category search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-9 min-w-[150px] rounded-lg border border-border bg-background px-2.5 font-semibold outline-none transition focus:border-primary"
              >
                <option value="all">All departments</option>
                {visibleGroups.map(({ group }) => (
                  <option key={group.name} value={slugify(group.name)}>{group.name}</option>
                ))}
              </select>
              <select
                value={categorySort}
                onChange={(event) => setCategorySort(event.target.value as "popular" | "az")}
                className="h-9 rounded-lg border border-border bg-background px-2.5 font-semibold outline-none transition focus:border-primary"
              >
                <option value="popular">Popular first</option>
                <option value="az">A to Z</option>
              </select>
              {!search && (
                <div className="flex h-9 items-center gap-1 rounded-lg border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>

          {!isLoading && !search && displayGroups.length > 0 && (
            <CompactCategoryBrowser groups={displayGroups} allCategories={allCategories} />
          )}

          {!isLoading && topCategories.length > 0 && !search && (
            <section className="mb-4 overflow-hidden rounded-xl border border-border bg-card/85 shadow-sm backdrop-blur lg:hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popular picks</p>
                  <h2 className="font-display text-lg font-bold text-foreground">Shop categories</h2>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  Shop all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="scrollbar-hidden flex gap-3 overflow-x-auto px-4 py-4">
                {topCategories.map((cat, index) => {
                  const parentIndex = matchParent(cat);
                  const Icon = parentIndex >= 0 ? PARENT_GROUPS[parentIndex].icon : Package;
                  const count = cat.productCount ?? cat.count ?? 0;
                  return (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.035, duration: 0.25 }}
                      className="w-[150px] shrink-0 sm:w-[176px]"
                    >
                      <Link
                        to={`/shop?cat=${cat.slug}`}
                        className="group block overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {cat.sampleImage || cat.image?.src ? (
                            <img
                              src={cat.sampleImage || cat.image?.src}
                              alt={cat.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Icon className="h-8 w-8 text-muted-foreground/45" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                          {count > 0 && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-black">
                              {count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 p-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-foreground">{cat.name}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card/85 p-3 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department Menu</p>
                    <h2 className="font-display text-base font-bold text-foreground">Categories</h2>
                  </div>
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  {displayGroups.map(({ group, children }) => {
                    const Icon = group.icon;
                    return (
                      <a
                        key={group.name}
                        href={`#${slugify(group.name)}`}
                        className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition hover:bg-muted"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
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
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
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
                  {displayGroups.map(({ group, children }, index) => (
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
