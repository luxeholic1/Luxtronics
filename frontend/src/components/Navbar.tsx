import { useEffect, useRef, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, Zap, ChevronDown, LogOut, Smartphone, Tv, Headphones, Camera, Laptop, Watch, Gamepad2, Home as HomeIcon, Cpu, Battery, Globe, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchSuggestions, fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";
import { motion, AnimatePresence } from "framer-motion";

// ─── Store domains ─────────────────────────────────────────────────────────────
const STORES = [
  {
    code: "IN",
    flag: "🇮🇳",
    label: "India",
    currency: "INR",
    symbol: "₹",
    domain: "luxtronics.in",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-400",
    text: "text-orange-600 dark:text-orange-400",
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
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const megaLinks = ["Shop", "Categories"] as const;
type MegaKey = typeof megaLinks[number];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeMega, setActiveMega] = useState<MegaKey | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<MegaKey | null>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStore = getCurrentStore();

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
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const col1 = navCategories.slice(0, 6);
  const col2 = navCategories.slice(6, 12);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
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
            ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-md border-b border-gray-200 dark:border-gray-800"
            : "bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white">
              Lux<span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">tronics</span>
            </span>
          </Link>

          {/* ── Desktop nav with Megamenu ── */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {/* Simple links */}
            <RouterNavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  className="relative"
                  onMouseEnter={() => handleMegaEnter(key)}
                  onMouseLeave={handleMegaLeave}
                >
                  {/* Clickable link + chevron */}
                  <div className={cn(
                    "flex items-center rounded-lg transition-colors",
                    activeMega === key
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}>
                    <Link
                      to={linkTo}
                      onClick={() => setActiveMega(null)}
                      className="px-3 py-2 text-sm font-medium"
                    >
                      {key}
                    </Link>
                    <button
                      onClick={() => setActiveMega(activeMega === key ? null : key)}
                      className="pr-2 py-2"
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[640px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
                      >
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
                                        to={`/shop?cat=${cat.slug}`}
                                        onClick={() => setActiveMega(null)}
                                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
                                      >
                                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
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
                                        to={`/shop?cat=${cat.slug}`}
                                        onClick={() => setActiveMega(null)}
                                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
                                      >
                                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
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
                                className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                              >
                                <Zap className="h-3.5 w-3.5" />
                                View all {key === "Shop" ? "products" : "categories"} →
                              </Link>
                            </div>
                          </div>

                          {/* Featured panel */}
                          <div className="w-44 bg-gradient-to-br from-orange-500 to-pink-600 p-5 flex flex-col justify-between shrink-0">
                            <div>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white rounded-full px-2 py-0.5 mb-3">
                                {key === "Shop" ? "New" : "Sale"}
                              </span>
                              <p className="text-white font-bold text-base leading-snug mb-2">
                                {key === "Shop" ? "New Arrivals" : "Deals of the Day"}
                              </p>
                              <p className="text-white/80 text-xs leading-relaxed">
                                {key === "Shop"
                                  ? "Check out the latest gadgets just landed in store."
                                  : "Limited-time offers on top electronics."}
                              </p>
                            </div>
                            <Link
                              to={key === "Shop" ? "/shop" : "/shop?sort=sale"}
                              onClick={() => setActiveMega(null)}
                              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors w-fit"
                            >
                              Shop now →
                            </Link>
                          </div>
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
                className={({ isActive }) =>
                  cn(
                    "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  )
                }
              >
                {l.label}
              </RouterNavLink>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Search */}
            <button
              aria-label="Search products"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) { setSearchQuery(""); setDebouncedQuery(""); }
              }}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                searchOpen
                  ? "bg-orange-100 dark:bg-orange-950/40 text-orange-600"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>

            {/* ── Store / Domain switcher — desktop only ── */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setStoreOpen((v) => !v)}
                className={cn(
                  "h-9 flex items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
                  storeOpen
                    ? `${currentStore.bg} ${currentStore.text} border border-current/20`
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
              className="h-9 w-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-[10px] font-bold flex items-center justify-center text-white shadow border-2 border-white dark:border-gray-950">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Auth — desktop */}
            {isSignedIn ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  to="/account"
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow"
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
                  className="h-9 w-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Sign in"
                >
                  <User className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  to="/account/login"
                  className="hidden md:inline-flex h-9 items-center rounded-full border border-gray-300 dark:border-gray-600 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/account/register"
                  className="hidden md:inline-flex h-9 items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-4 text-sm font-semibold text-white shadow hover:shadow-md hover:scale-105 active:scale-95 transition-all"
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
              className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
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
              className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="relative">
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 shadow-sm"
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
                        className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:shadow-md transition-all"
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
                    {debouncedQuery.length >= 2 && searchOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
                      >
                        <SearchSuggestions
                          query={searchQuery}
                          debouncedQuery={debouncedQuery}
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
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-bold text-base text-gray-900 dark:text-white">
                    Lux<span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">tronics</span>
                  </span>
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
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
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
                                      to={`/shop?cat=${cat.slug}`}
                                      onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
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
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
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
                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
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
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-200 hover:border-orange-400 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/account/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white text-center shadow hover:shadow-md transition-all"
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
  onSelect,
}: {
  query: string;
  debouncedQuery: string;
  onSelect: () => void;
}) => {
  const { formatPrice } = useCurrency();
  const isTyping = query.trim() !== debouncedQuery;

  const { data: suggestions = [], isLoading, isError, error } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => fetchSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !isTyping,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (isTyping || isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/5 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : "Failed to fetch suggestions"}
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          No products found for <span className="font-medium text-gray-900 dark:text-white">"{debouncedQuery}"</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto py-2 scrollbar-hidden">
      <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Suggestions ({suggestions.length})
      </p>
      {suggestions.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          onClick={onSelect}
          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category}</p>
          </div>
          <div className="text-sm font-semibold text-orange-600 shrink-0">{formatPrice(product.price)}</div>
        </Link>
      ))}
      <Link
        to={`/shop?q=${encodeURIComponent(debouncedQuery)}`}
        onClick={onSelect}
        className="block w-full p-3 text-center text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors border-t border-gray-100 dark:border-gray-800"
      >
        View all results for <span className="font-semibold">"{debouncedQuery}"</span>
      </Link>
    </div>
  );
};

export default Navbar;
