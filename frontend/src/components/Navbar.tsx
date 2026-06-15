import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, Zap, ChevronDown, ChevronRight, LogOut, Smartphone, Tv, Headphones, Camera, Laptop, Watch, Gamepad2, Cpu, Battery, Globe, Package, Apple, Wrench, Car, Shield, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchSuggestions, fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";
import type { Product } from "@/data/products";
import { products as fallbackProducts } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeSmartQuery as normalizeQuerySmart, scoreTextMatch } from "@/lib/smart-search";
import { filterVisibleCategories } from "@/lib/visible-categories";

// ─── Store domains ─────────────────────────────────────────────────────────────
const STORES = [
  {
    code: "IN",
    flag: "🇮🇳",
    label: "India",
    currency: "INR",
    symbol: "₹",
    domain: "luxtronics.in",
    color: "from-primary to-accent",
    bg: "bg-primary/10",
    border: "border-primary/50",
    text: "text-primary",
  },
  {
    code: "AU",
    flag: "🇦🇺",
    label: "Australia",
    currency: "AUD",
    symbol: "A$",
    domain: "luxtronics.com.au",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-400",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    code: "NZ",
    flag: "🇳🇿",
    label: "New Zealand",
    currency: "NZD",
    symbol: "NZ$",
    domain: "luxtronics.co.nz",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

type StoreCode = typeof STORES[number]["code"];

function getCurrentStore() {
  if (typeof window === "undefined") return STORES[0];
  const host = window.location.hostname.replace(/^www\./, "");
  return STORES.find(s => s.domain === host) ?? STORES[0];
}

// ─── Category icon map ─────────────────────────────────────────────────────────
const CAT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  audio: Headphones,
  camera: Camera,
  cameras: Camera,
  smartphone: Smartphone,
  "smart phone": Smartphone,
  smartphones: Smartphone,
  wearables: Watch,
  iphone: Smartphone,
  laptops: Laptop,
  laptop: Laptop,
  gaming: Gamepad2,
  "gaming accessories": Gamepad2,
  tv: Tv,
  "smart tv": Tv,
  "android tv boxes": Tv,
  tablets: Cpu,
  "android tablet pc": Cpu,
  "mobile accessories": Battery,
  "apple accessories": Smartphone,
  "samsung accessories": Smartphone,
};

function getCatIcon(name: string): React.ComponentType<{ className?: string }> {
  return CAT_ICON_MAP[name.toLowerCase()] ?? Package;
}

const simpleLinks = [
  { to: "/", label: "Home" },
  { to: "/latest-arrivals", label: "Latest" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const megaLinks = ["Shop", "Categories"] as const;
type MegaKey = typeof megaLinks[number];

type MegaDepartment = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  patterns: RegExp[];
};

const COMPACT_DEPARTMENTS: MegaDepartment[] = [
  { name: "Mobile Accessories", icon: Battery, patterns: [/mobile.*access/i, /charger/i, /cable/i, /case/i, /cover/i, /protector/i, /screen/i, /glass/i, /tempered/i, /adapter/i, /power/i, /bag/i, /pouch/i, /holder/i, /stand/i, /mount/i, /dock/i, /magsafe/i, /airpods/i, /earbuds/i, /earphones/i, /headphones/i] },
  { name: "Smart Wear", icon: Watch, patterns: [/wearable/i, /watch/i, /fitbit/i, /garmin/i, /band/i, /glasses/i, /eyewear/i] },
  { name: "Outdoor & Sports", icon: TreePine, patterns: [/outdoor/i, /sports/i, /camping/i, /bicycle/i, /fishing/i] },
  { name: "Consumer Electronics", icon: Tv, patterns: [/consumer/i, /electronics/i, /audio/i, /speaker/i, /projector/i, /tv/i, /3d.*printer/i, /arduino/i, /vr/i, /ar/i, /live.*equipment/i] },
  { name: "DJI & Insta360", icon: Camera, patterns: [/dji/i, /insta360/i, /gopro/i, /osmo/i] },
];

const KNOWN_BRANDS = ["apple", "samsung", "sony", "bose", "jbl", "canon", "dji", "logitech", "dyson", "gopro"];
const SEARCH_REWRITES: Record<string, string> = {
  airpod: "airpods",
  airpods: "apple airpods",
  buds: "earbuds",
  earbud: "earbuds",
  earpods: "earbuds",
  magsafe: "magsafe accessories",
  magsefe: "magsafe accessories",
  iph: "iphone",
  iphon: "iphone",
  iphone: "iphone accessories",
  samsng: "samsung",
  samung: "samsung",
  charger: "fast charger",
  charging: "fast charger",
  cover: "phone case",
  case: "phone case",
  watch: "smart watch",
  smartwatch: "smart watch",
  headphone: "headphones",
  speaker: "bluetooth speaker",
};

function normalizeSmartQuery(value: string) {
  const cleaned = value.toLowerCase().trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return SEARCH_REWRITES[cleaned] ?? normalizeQuerySmart(cleaned);
}

function scoreSuggestion(product: Product, query: string) {
  const baseScore = scoreTextMatch(
    query,
    [product.name, product.category, product.description, product.brand],
    [5, 3, 1, 2],
  );
  return baseScore + (product.rating ?? 0) * 4 + Math.min(product.reviews ?? 0, 5000) / 100;
}

function categoryMatchesDepartment(category: StoreCategory, department: MegaDepartment) {
  const text = `${category.name} ${category.slug} ${category.description ?? ""}`;
  return department.patterns.some((pattern) => pattern.test(text));
}

function chunkCategories(categories: StoreCategory[], size: number) {
  const chunks: StoreCategory[][] = [];
  for (let index = 0; index < categories.length; index += size) {
    chunks.push(categories.slice(index, index + size));
  }
  return chunks;
}

const CompactCategoriesMega = ({
  categories,
  onClose,
}: {
  categories: StoreCategory[];
  onClose: () => void;
}) => {
  const groupedDepartments = useMemo(() => {
    const sorted = filterVisibleCategories(categories).sort((a, b) => (b.count || 0) - (a.count || 0));

    return COMPACT_DEPARTMENTS.map((department) => {
      const items = sorted.filter((category) => categoryMatchesDepartment(category, department));
      return { ...department, items };
    }).filter((department) => department.items.length > 0);
  }, [categories]);

  const [activeDepartment, setActiveDepartment] = useState(COMPACT_DEPARTMENTS[0].name);
  const active =
    groupedDepartments.find((department) => department.name === activeDepartment) ||
    groupedDepartments[0];
  const activeItems =
    active?.items.length
      ? active.items
      : filterVisibleCategories(categories).slice(0, 24);
  const columns = chunkCategories(activeItems.slice(0, 24), 8);

  return (
    <div className="flex max-h-[min(520px,calc(100vh-96px))] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-2xl dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
      <div className="w-[240px] shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-11 items-center justify-between bg-primary px-4 text-primary-foreground">
          <span className="text-xs font-black">Shop by Categories</span>
          <ChevronDown className="h-4 w-4" />
        </div>

        <div className="max-h-[calc(min(520px,calc(100vh-96px))-44px)] overflow-y-auto py-1">
          {groupedDepartments.length === 0 ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="mx-3 my-2 h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ))
          ) : (
            groupedDepartments.map((department) => {
              const Icon = department.icon;
              const isActive = department.name === active?.name;

              return (
                <button
                  key={department.name}
                  type="button"
                  onMouseEnter={() => setActiveDepartment(department.name)}
                  onFocus={() => setActiveDepartment(department.name)}
                  className={`group flex h-8 w-full items-center gap-2.5 px-3 text-left text-xs transition ${
                    isActive
                      ? "bg-white text-primary shadow-sm dark:bg-gray-950"
                      : "text-gray-700 hover:bg-white hover:text-primary dark:text-gray-300 dark:hover:bg-gray-950"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}`} />
                  <span className="min-w-0 flex-1 truncate font-medium">{department.name}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2.5 dark:border-gray-800">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Hover category</p>
            <h3 className="font-display text-base font-black text-gray-900 dark:text-white">{active?.name || "Categories"}</h3>
          </div>
          <Link
            to="/categories"
            onClick={onClose}
            className="text-xs font-bold text-gray-500 transition hover:text-primary"
          >
            View all
          </Link>
        </div>

        {columns.length === 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="h-7 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className={columnIndex > 0 ? "border-l border-gray-200 pl-4 dark:border-gray-800" : ""}>
                {column.map((category, itemIndex) => {
                  const Icon = getCatIcon(category.name);
                  const isHeading = itemIndex === 0;

                  return (
                    <Link
                      key={category.slug}
                      to={`/shop?cat=${encodeURIComponent(category.slug)}`}
                      onClick={onClose}
                      className={`group flex items-start gap-2 rounded px-1 py-1 transition hover:bg-primary/5 hover:text-primary ${
                        isHeading ? "mb-1 text-sm font-black text-gray-900 dark:text-white" : "text-xs font-medium text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isHeading ? (
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 group-hover:text-primary" />
                      ) : (
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-orange-400" />
                      )}
                      <span className="line-clamp-1">{category.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeMega, setActiveMega] = useState<MegaKey | null>(null);
  const [megaPosition, setMegaPosition] = useState<{ key: MegaKey; left: number; top: number; width: number } | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<MegaKey | null>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaTriggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const currentStore = getCurrentStore();

  const updateMegaPosition = (key: MegaKey) => {
    if (typeof window === "undefined") return;

    const trigger = megaTriggerRefs.current[key];
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(key === "Categories" ? 780 : 640, window.innerWidth - 24);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, 12),
      window.innerWidth - width - 12,
    );

    setMegaPosition({
      key,
      left,
      top: rect.bottom + 8,
      width,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user, logOut } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => {
      requestAnimationFrame(() => setScrolled(window.scrollY > 10));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setStoreOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    if (!activeMega) return;

    const onResize = () => updateMegaPosition(activeMega);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeMega]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setDebouncedQuery("");
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMegaEnter = (key: MegaKey) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    updateMegaPosition(key);
    setActiveMega(key);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 120);
  };

  // ── Fetch real categories for megamenu ──
  const { data: catResult } = useQuery({
    queryKey: ["navbar-categories"],
    queryFn: () => fetchStoreCategories(1, 100),
    staleTime: 1000 * 60 * 30,
  });

  // Top 12 categories by count (exclude uncategorized)
  const navCategories: StoreCategory[] = (catResult?.data ?? [])
    .filter(c => c.name.toLowerCase() !== "uncategorized")
    .filter((category) => filterVisibleCategories([category]).length > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const col1 = navCategories.slice(0, 6);
  const col2 = navCategories.slice(6, 12);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = normalizeSmartQuery(searchQuery.trim());
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleLogOut = async () => {
    await logOut();
    navigate("/");
  };

  const avatarLabel = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border/70 bg-background/88 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
            : "border-b border-border/60 bg-background/82 backdrop-blur-xl"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-[68px] flex items-center justify-between gap-3">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center shrink-0 group">
           <div className="rounded-xl bg-white dark:bg-white p-1 shadow-sm">
            <img
              src="/logo.jpeg"
              alt="Luxtronics"
              className="h-10 w-auto sm:h-12 object-contain transition-all duration-500           group-hover:scale-[1.05]"
             />
          </div>
          </Link>

          {/* ── Desktop nav with Megamenu ── */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-border/70 bg-muted/45 p-1 shadow-sm" aria-label="Main navigation">
            {/* Simple links */}
            <RouterNavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "relative px-3.5 py-2 text-sm font-semibold rounded-full transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )
              }
            >
              Home
            </RouterNavLink>

            {/* Megamenu triggers */}
            {megaLinks.map((key) => {
              const linkTo = key === "Shop" ? "/shop" : "/categories";
              return (
                <div
                  key={key}
                  ref={(node) => {
                    megaTriggerRefs.current[key] = node;
                  }}
                  className="relative"
                  onMouseEnter={() => handleMegaEnter(key)}
                  onMouseLeave={handleMegaLeave}
                >
                  {/* Clickable link + chevron */}
                  <div className={cn(
                    "flex items-center rounded-full transition-colors",
                    activeMega === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}>
                    <Link
                      to={linkTo}
                      onClick={() => setActiveMega(null)}
                      className="px-3.5 py-2 text-sm font-semibold"
                    >
                      {key}
                    </Link>
                    <button
                      onClick={() => {
                        if (activeMega === key) {
                          setActiveMega(null);
                          return;
                        }
                        updateMegaPosition(key);
                        setActiveMega(key);
                      }}
                      className="pr-2.5 py-2"
                      aria-label={`${key} submenu`}
                    >
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMega === key && "rotate-180")} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeMega === key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={() => handleMegaEnter(key)}
                        onMouseLeave={handleMegaLeave}
                        style={{
                          left: megaPosition?.key === key ? megaPosition.left : undefined,
                          top: megaPosition?.key === key ? megaPosition.top : undefined,
                          width: megaPosition?.key === key ? megaPosition.width : undefined,
                        }}
                        className={cn(
                          "fixed z-50 shadow-2xl",
                          key === "Categories"
                            ? ""
                            : "w-[640px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                        )}
                      >
                        {key === "Categories" ? (
                          <CompactCategoriesMega
                            categories={(catResult?.data ?? []).filter(c => c.name.toLowerCase() !== "uncategorized")}
                            onClose={() => setActiveMega(null)}
                          />
                        ) : (
                          <div className="flex">
                            {/* Two-column category grid */}
                            <div className="flex-1 p-5">
                              {navCategories.length === 0 ? (
                                /* Loading skeleton */
                                <div className="grid grid-cols-2 gap-1">
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                  ))}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-0">
                                  {/* Column 1 */}
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-2">
                                      Top Categories
                                    </p>
                                    {col1.map((cat) => {
                                      const Icon = getCatIcon(cat.name);
                                      return (
                                        <Link
                                          key={cat.slug}
                                          to={`/shop?cat=${encodeURIComponent(cat.slug)}`}
                                          onClick={() => setActiveMega(null)}
                                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors group"
                                        >
                                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                                          <span className="truncate">{cat.name}</span>
                                          {cat.count > 0 && (
                                            <span className="ml-auto text-[10px] text-gray-400 shrink-0">{cat.count}</span>
                                          )}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                  {/* Column 2 */}
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-2">
                                      More Categories
                                    </p>
                                    {col2.map((cat) => {
                                      const Icon = getCatIcon(cat.name);
                                      return (
                                        <Link
                                          key={cat.slug}
                                          to={`/shop?cat=${encodeURIComponent(cat.slug)}`}
                                          onClick={() => setActiveMega(null)}
                                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors group"
                                        >
                                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                                          <span className="truncate">{cat.name}</span>
                                          {cat.count > 0 && (
                                            <span className="ml-auto text-[10px] text-gray-400 shrink-0">{cat.count}</span>
                                          )}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* View all link */}
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Link
                                  to={linkTo}
                                  onClick={() => setActiveMega(null)}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                  <Zap className="h-3.5 w-3.5" />
                                  View all products →
                                </Link>
                              </div>
                            </div>

                            {/* Featured panel */}
                            <div className="w-44 bg-gradient-to-br from-primary to-accent p-5 flex flex-col justify-between shrink-0">
                              <div>
                                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white rounded-full px-2 py-0.5 mb-3">
                                  New
                                </span>
                                <p className="text-white font-bold text-base leading-snug mb-2">
                                  New Arrivals
                                </p>
                                <p className="text-white/80 text-xs leading-relaxed">
                                  Check out the latest gadgets just landed in store.
                                </p>
                              </div>
                              <Link
                                to="/latest-arrivals"
                                onClick={() => setActiveMega(null)}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors w-fit"
                              >
                                Shop now →
                              </Link>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Remaining simple links */}
            {simpleLinks.filter(l => l.to !== "/").map((l) => (
              <RouterNavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "relative px-3.5 py-2 text-sm font-semibold rounded-full transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )
                }
              >
                {l.label}
              </RouterNavLink>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {/* Search */}
            <button
              aria-label="Search products"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) { setSearchQuery(""); setDebouncedQuery(""); }
              }}
              className={cn(
                "h-9 w-9 rounded-full border border-transparent flex items-center justify-center transition-colors",
                searchOpen
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
              )}
            >
              {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>

            {/* ── Store / Domain switcher — desktop only ── */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setStoreOpen((v) => !v)}
                className={cn(
                  "h-9 flex items-center gap-1.5 rounded-full border border-transparent px-3 text-sm font-semibold transition-colors",
                  storeOpen
                    ? `${currentStore.bg} ${currentStore.text} border border-current/20`
                    : "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                )}
                aria-label="Switch store region"
              >
                <span className="text-base leading-none">{currentStore.flag}</span>
                <span className="text-xs hidden md:inline font-semibold">{currentStore.currency}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", storeOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {storeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setStoreOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 pt-3 pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                          <Globe className="h-3 w-3" /> Select your store
                        </p>
                      </div>
                      {STORES.map((store) => {
                        const isCurrent = store.code === currentStore.code;
                        return (
                          <a
                            key={store.code}
                            href={isCurrent ? "#" : `https://${store.domain}${window.location.pathname}`}
                            onClick={(e) => { if (isCurrent) e.preventDefault(); setStoreOpen(false); }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 transition-colors",
                              isCurrent
                                ? `${store.bg} border-l-2 ${store.border}`
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="text-2xl leading-none">{store.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className={cn("font-semibold text-sm", isCurrent ? store.text : "text-gray-900 dark:text-white")}>
                                {store.label}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {store.currency} · {store.symbol} · {store.domain}
                              </p>
                            </div>
                            {isCurrent && (
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r text-white", store.color)}>
                                Current
                              </span>
                            )}
                          </a>
                        );
                      })}
                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Switching store will redirect you to the regional website with local pricing.
                        </p>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Cart (${totalItems} items)`}
              className="h-9 w-9 rounded-full border border-transparent flex items-center justify-center text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-colors relative"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold flex items-center justify-center text-white shadow border-2 border-white dark:border-gray-950">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Auth — desktop */}
            {isSignedIn ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  to="/account"
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow"
                  aria-label="My account"
                >
                  {avatarLabel}
                </Link>
                <button
                  onClick={handleLogOut}
                  aria-label="Sign out"
                  className="h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/account/login"
                  className="h-9 w-9 rounded-full border border-transparent flex items-center justify-center text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Sign in"
                >
                  <User className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  to="/account/login"
                  className="hidden md:inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/account/register"
                  className="hidden md:inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm hover:scale-[1.03] active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Hamburger — mobile/tablet */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden h-9 w-9 rounded-full border border-transparent flex items-center justify-center text-foreground hover:border-border hover:bg-muted transition-colors ml-1"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Search bar (slides down) ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-visible border-t border-gray-100 dark:border-gray-800"
            >
              <div className="mx-auto max-w-3xl px-4 py-2 sm:px-6">
                <div className="relative">
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products, brands…"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="submit"
                        className="shrink-0 rounded-md bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-semibold text-white shadow hover:shadow-md transition-all"
                      >
                        Search
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setDebouncedQuery(""); }}
                      className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Search suggestions */}
                  <AnimatePresence>
                    {searchQuery.trim().length >= 2 && searchOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-[70] mt-1.5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                      >
                        <SearchSuggestions
                          query={searchQuery}
                          debouncedQuery={debouncedQuery}
                          categories={navCategories}
                          onSelect={() => { setSearchOpen(false); setSearchQuery(""); setDebouncedQuery(""); }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-white dark:bg-gray-950 shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center"
                  aria-label="Luxtronics home"
                >
                  <img
                    src="/logo.jpeg"
                    alt="Luxtronics"
                    className="h-10 w-auto max-w-[155px] object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search inside drawer */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <form
                  onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
                >
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                  />
                </form>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile navigation">
                {/* Home */}
                <RouterNavLink
                  to="/"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors mb-1",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )
                  }
                >
                  Home
                </RouterNavLink>

                {/* Expandable megamenu items */}
                {megaLinks.map((key) => {
                  const linkTo = key === "Shop" ? "/shop" : "/categories";
                  return (
                    <div key={key} className="mb-1">
                      {/* Row: link + expand toggle */}
                      <div className="flex items-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Link
                          to={linkTo}
                          onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                          className="flex-1 px-4 py-3.5 text-base font-medium text-gray-700 dark:text-gray-200"
                        >
                          {key}
                        </Link>
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
                          className="px-4 py-3.5 text-gray-500"
                          aria-label={`Expand ${key}`}
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileExpanded === key && "rotate-180")} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {mobileExpanded === key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 space-y-0.5">
                              {navCategories.length === 0 ? (
                                <div className="px-3 py-4 space-y-2">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                  ))}
                                </div>
                              ) : (
                                navCategories.map((cat) => {
                                  const Icon = getCatIcon(cat.name);
                                  return (
                                    <Link
                                      key={cat.slug}
                                      to={`/shop?cat=${encodeURIComponent(cat.slug)}`}
                                      onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                                      <span className="flex-1">{cat.name}</span>
                                      {cat.count > 0 && (
                                        <span className="text-[10px] text-gray-400">{cat.count}</span>
                                      )}
                                    </Link>
                                  );
                                })
                              )}
                              <Link
                                to={linkTo}
                                onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Zap className="h-4 w-4" />
                                View all {key === "Shop" ? "products" : "categories"}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Remaining simple links */}
                {simpleLinks.filter(l => l.to !== "/").map((l) => (
                  <RouterNavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors mb-1",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )
                    }
                  >
                    {l.label}
                  </RouterNavLink>
                ))}
              </nav>

              {/* Auth + currency at bottom */}
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {/* Store switcher row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {STORES.map((store) => {
                    const isCurrent = store.code === currentStore.code;
                    return (
                      <a
                        key={store.code}
                        href={isCurrent ? "#" : `https://${store.domain}${window.location.pathname}`}
                        onClick={(e) => { if (isCurrent) e.preventDefault(); }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                          isCurrent
                            ? `${store.bg} ${store.border} ${store.text} border`
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                        )}
                      >
                        <span>{store.flag}</span>
                        <span>{store.currency}</span>
                      </a>
                    );
                  })}
                </div>

                {isSignedIn ? (
                  <div className="flex gap-2">
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => { handleLogOut(); setMobileOpen(false); }}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/account/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-200 hover:border-primary/50 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/account/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white text-center shadow hover:shadow-md transition-all"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Search Suggestions ────────────────────────────────────────────────────────

const SearchSuggestions = ({
  query,
  debouncedQuery,
  categories,
  onSelect,
}: {
  query: string;
  debouncedQuery: string;
  categories: StoreCategory[];
  onSelect: () => void;
}) => {
  const { formatPrice } = useCurrency();
  const liveQuery = query.trim() || debouncedQuery.trim();
  const requestQuery = debouncedQuery.trim();
  const smartQuery = normalizeSmartQuery(liveQuery);
  const smartRequestQuery = normalizeSmartQuery(requestQuery);

  const { data: suggestions = [], isLoading, isError, error } = useQuery({
    queryKey: ["search-suggestions", smartRequestQuery],
    queryFn: () => fetchSearchSuggestions(smartRequestQuery),
    enabled: requestQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const instantSuggestions = useMemo(() => {
    if (smartQuery.length < 2) return [];

    return fallbackProducts
      .map((product) => ({ product, score: scoreSuggestion(product, smartQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product)
      .slice(0, 6);
  }, [smartQuery]);

  const rankedSuggestions = useMemo(() => {
    const source = suggestions.length > 0 ? suggestions : instantSuggestions;

    return [...source]
      .map((product) => ({ product, score: scoreSuggestion(product, smartQuery) }))
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product)
      .slice(0, 6);
  }, [suggestions, instantSuggestions, smartQuery]);

  const categoryMatches = useMemo(() => {
    return categories
      .map((cat) => ({
        cat,
        score: scoreTextMatch(smartQuery, [cat.name, cat.slug, cat.description], [4, 2, 1]),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || (b.cat.count ?? 0) - (a.cat.count ?? 0))
      .map(({ cat }) => cat)
      .slice(0, 3);
  }, [categories, smartQuery]);

  const brandMatches = useMemo(() => {
    const q = smartQuery.toLowerCase();
    return KNOWN_BRANDS.filter((brand) => brand.includes(q) || q.includes(brand)).slice(0, 3);
  }, [smartQuery]);

  const hasSmartRewrite = smartQuery !== liveQuery.toLowerCase().trim();

  if (isLoading && rankedSuggestions.length === 0 && requestQuery.length >= 2) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/5 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError && rankedSuggestions.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : "Failed to fetch suggestions"}
        </p>
      </div>
    );
  }

  if (rankedSuggestions.length === 0 && categoryMatches.length === 0 && brandMatches.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          No products found for <span className="font-medium text-gray-900 dark:text-white">"{liveQuery}"</span>
        </p>
        <Link
          to="/categories"
          onClick={onSelect}
          className="mt-3 inline-flex rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:text-gray-300"
        >
          Browse categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-h-[360px] overflow-y-auto py-1.5 scrollbar-hidden">
      {isLoading && rankedSuggestions.length > 0 && (
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Updating results...
        </p>
      )}

      {(hasSmartRewrite || categoryMatches.length > 0 || brandMatches.length > 0) && (
        <div className="border-b border-gray-100 px-3 pb-2 dark:border-gray-800">
          {hasSmartRewrite && (
            <Link
              to={`/shop?q=${encodeURIComponent(smartQuery)}`}
              onClick={onSelect}
              className="mb-2 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/10 dark:text-primary"
            >
              <span>Smart search: "{smartQuery}"</span>
              <Search className="h-3.5 w-3.5" />
            </Link>
          )}

          <div className="flex flex-wrap gap-2">
            {categoryMatches.map((cat) => {
              const Icon = getCatIcon(cat.name);
              return (
                <Link
                  key={cat.slug}
                  to={`/shop?cat=${encodeURIComponent(cat.slug)}`}
                  onClick={onSelect}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name}
                </Link>
              );
            })}
            {brandMatches.map((brand) => (
              <Link
                key={brand}
                to={`/shop?q=${encodeURIComponent(`${brand} accessories`)}`}
                onClick={onSelect}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-gray-700 transition-colors hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                {brand} accessories
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Best matches ({rankedSuggestions.length})
      </p>
      {rankedSuggestions.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          onClick={onSelect}
          className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 last:border-0"
        >
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category}</p>
          </div>
          <div className="text-sm font-semibold text-primary shrink-0">{formatPrice(product.price)}</div>
        </Link>
      ))}
      <Link
        to={`/shop?q=${encodeURIComponent(smartQuery)}`}
        onClick={onSelect}
        className="block w-full p-3 text-center text-xs font-medium text-gray-500 hover:text-primary transition-colors border-t border-gray-100 dark:border-gray-800"
      >
        View all results for <span className="font-semibold">"{smartQuery}"</span>
      </Link>
    </div>
  );
};

export default Navbar;
