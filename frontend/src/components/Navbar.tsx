import { useEffect, useRef, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, Zap, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, countries } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchSuggestions } from "@/services/store-api";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/account", label: "Account" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce: update debouncedQuery 300ms after searchQuery changes
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
  const { country, setCountry } = useCurrency();
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => {
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setDebouncedQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-smooth",
        scrolled ? "py-2 sm:py-3" : "py-3 sm:py-5"
      )}
    >
      <div
        className={cn(
          "w-full flex items-center justify-between transition-all duration-500 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] mx-auto",
          scrolled && "rounded-lg sm:rounded-xl lg:rounded-2xl border dark:border-white/10 light:border-black/10 dark:bg-black/60 light:bg-white/90 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2.5 sm:py-3 backdrop-blur-xl shadow-lg"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2 group">
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl lg:text-2xl tracking-tight dark:text-white light:text-black">
            Lux<span className="text-gradient">tronics</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "dark:text-white light:text-black" : "dark:text-white/80 light:text-black/80 dark:hover:text-white light:hover:text-black"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-brand" />
                  )}
                </>
              )}
            </RouterNavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          <ThemeToggle />

          {/* Search toggle */}
          <button
            id="navbar-search-btn"
            aria-label="Search products"
            onClick={() => {
              setSearchOpen((v) => !v);
              if (searchOpen) {
                setSearchQuery("");
                setDebouncedQuery("");
              }
            }}
            className={cn(
              "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors dark:text-white light:text-black",
              searchOpen ? "bg-primary/10 text-primary" : "dark:hover:bg-white/10 light:hover:bg-black/10"
            )}
          >
            {searchOpen ? <X className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> : <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />}
          </button>

          {/* Currency switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen((v) => !v)}
              className="hidden sm:flex h-9 items-center gap-1.5 rounded-full dark:hover:bg-white/10 light:hover:bg-black/10 px-3 text-sm font-medium transition-colors dark:text-white light:text-black"
              aria-label="Switch currency"
            >
              <span className="text-base leading-none">{country.flag}</span>
              <span className="text-xs dark:text-white/80 light:text-black/80">{country.currency}</span>
              <ChevronDown className={`h-3 w-3 dark:text-white/80 light:text-black/80 transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            {currencyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border dark:border-white/10 light:border-black/10 dark:bg-black/80 light:bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto scrollbar-hidden">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left dark:hover:bg-white/[0.08] light:hover:bg-black/[0.05] transition-colors text-sm ${country.code === c.code ? "dark:bg-primary/10 light:bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <div className="flex-1">
                        <p className="font-medium text-xs">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.currency} · {c.currencySymbol}</p>
                      </div>
                      {country.code === c.code && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full dark:hover:bg-white/10 light:hover:bg-black/10 flex items-center justify-center transition-colors relative"
          >
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px] dark:text-white light:text-black" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gradient-brand text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Auth — desktop */}
          {isSignedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account"
                className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground text-sm font-bold shadow-glow"
                aria-label="Account"
              >
                {avatarLabel}
              </Link>
              <button
                onClick={handleLogOut}
                aria-label="Sign out"
                className="h-9 w-9 rounded-full dark:hover:bg-white/10 light:hover:bg-black/10 flex items-center justify-center transition-colors dark:text-white light:text-black"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account/login"
                aria-label="Account"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full dark:hover:bg-white/10 light:hover:bg-black/10 flex items-center justify-center transition-colors dark:text-white light:text-black"
              >
                <User className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link
                to="/account/login"
                className="h-9 inline-flex items-center rounded-full border dark:border-white/20 light:border-black/20 px-4 text-sm font-medium hover:border-primary/40 transition-colors dark:text-white light:text-black"
              >
                Sign in
              </Link>
              <Link
                to="/account/register"
                className="h-9 inline-flex items-center rounded-full bg-gradient-brand px-4 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden h-9 w-9 rounded-full dark:hover:bg-white/10 light:hover:bg-black/10 flex items-center justify-center transition-colors dark:text-white light:text-black"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          searchOpen ? "max-h-[800px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
        )}
      >
        <div className="container mt-2">
          <div className="relative max-w-[1920px] mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 rounded-2xl border dark:border-white/10 light:border-black/10 dark:bg-black/60 light:bg-white/90 backdrop-blur-xl px-5 py-3 shadow-2xl"
            >
              <Search className="h-5 w-5 dark:text-white light:text-black shrink-0" />
              <input
                ref={searchInputRef}
                id="navbar-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products… (press Enter)"
                className="flex-1 bg-transparent text-sm dark:text-white light:text-black dark:placeholder:text-white/60 light:placeholder:text-black/60 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
                >
                  Search
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setDebouncedQuery("");
                }}
                className="shrink-0 dark:text-white light:text-black hover:text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {/* Search Suggestions dropdown */}
            <AnimatePresence>
              {debouncedQuery.length >= 2 && searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-4 z-50 rounded-2xl border dark:border-white/10 light:border-black/10 dark:bg-black/80 light:bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  <SearchSuggestions
                    query={searchQuery}
                    debouncedQuery={debouncedQuery}
                    onSelect={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      setDebouncedQuery("");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden container mt-2 sm:mt-3 animate-fade-up px-4 sm:px-6 max-w-[1920px] mx-auto">
          <div className="rounded-2xl border dark:border-white/10 light:border-black/10 dark:bg-black/60 light:bg-white/90 p-3 sm:p-4 flex flex-col gap-1 backdrop-blur-xl shadow-lg">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-xl border dark:border-white/10 light:border-black/10 dark:bg-white/5 light:bg-black/5 px-3 py-2 mb-2"
            >
              <Search className="h-4 w-4 dark:text-white light:text-black shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm dark:text-white light:text-black dark:placeholder:text-white/60 light:placeholder:text-black/60 focus:outline-none"
              />
            </form>

            {links.map((l) => (
              <RouterNavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "dark:bg-white/10 light:bg-black/10 dark:text-white light:text-black" : "dark:text-white/80 light:text-black/80 dark:hover:bg-white/5 light:hover:bg-black/5"
                  )
                }
              >
                {l.label}
              </RouterNavLink>
            ))}

            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
              {isSignedIn ? (
                <>
                  <Link
                    to="/account"
                    className="w-full rounded-lg border dark:border-white/20 light:border-black/20 px-4 py-3 text-sm font-medium text-center dark:text-white light:text-black dark:hover:bg-white/5 light:hover:bg-black/5"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogOut}
                    className="w-full rounded-lg border dark:border-white/20 light:border-black/20 px-4 py-3 text-sm font-medium text-center hover:border-primary/40 transition-colors dark:text-white light:text-black"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/account/login"
                    className="w-full rounded-lg border dark:border-white/20 light:border-black/20 px-4 py-3 text-sm font-medium hover:border-primary/40 transition-colors text-center dark:text-white light:text-black dark:hover:bg-white/5 light:hover:bg-black/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/account/register"
                    className="w-full rounded-lg bg-gradient-brand px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
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

  const {
    data: suggestions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      console.log("[Search] Fetching suggestions for:", debouncedQuery);
      const result = await fetchSearchSuggestions(debouncedQuery);
      console.log("[Search] Got results:", result);
      return result;
    },
    enabled: debouncedQuery.length >= 2 && !isTyping,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Still typing — show skeleton
  if (isTyping || isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/5 bg-white/5 rounded" />
              <div className="h-3 w-1/4 bg-white/5 rounded" />
            </div>
            <div className="h-3 w-12 bg-white/5 rounded self-center" />
          </div>
        ))}
      </div>
    );
  }

  // API error
  if (isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-red-400">
          ❌ {error instanceof Error ? error.message : "Failed to fetch suggestions"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">Check console for details</p>
      </div>
    );
  }

  // No results
  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No products found for{" "}
          <span className="text-foreground font-medium">"{debouncedQuery}"</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Try a different keyword</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto py-2 scrollbar-hidden">
      <p className="px-4 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        Suggestions ({suggestions.length})
      </p>
      {suggestions.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          onClick={onSelect}
          className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
        >
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary/50 shrink-0 border border-white/5">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {product.category}
            </p>
          </div>
          <div className="text-sm font-semibold text-primary shrink-0">
            {formatPrice(product.price)}
          </div>
        </Link>
      ))}
      <Link
        to={`/shop?q=${encodeURIComponent(debouncedQuery)}`}
        onClick={onSelect}
        className="block w-full p-3 text-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors border-t border-white/5"
      >
        View all results for{" "}
        <span className="font-semibold">"{debouncedQuery}"</span>
      </Link>
    </div>
  );
};

export default Navbar;