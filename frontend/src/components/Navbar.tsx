import { useEffect, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";
import { Search, ShoppingBag, User, Menu, X, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, countries } from "@/context/CurrencyContext";

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
  const location = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const showSignedIn = isLoaded && isSignedIn;
  const { country, setCountry } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-smooth",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between transition-all duration-500",
          scrolled && "rounded-2xl border border-white/5 bg-background/10 px-6 py-3 backdrop-blur-md"
        )}
      >
        <Link to="/" className="flex items-center gap-1 sm:gap-2 group">
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl lg:text-2xl tracking-tight">
            Lux<span className="text-gradient">tronics</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          <button
            aria-label="Search"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen((v) => !v)}
              className="hidden sm:flex h-9 items-center gap-1.5 rounded-full hover:bg-secondary px-3 text-sm font-medium transition-colors"
              aria-label="Switch currency"
            >
              <span className="text-base leading-none">{country.flag}</span>
              <span className="text-xs text-muted-foreground">{country.currency}</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            {currencyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-white/8 bg-[hsl(0_0%_6%)] shadow-2xl overflow-hidden max-h-80 overflow-y-auto scrollbar-hidden">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition-colors text-sm ${
                        country.code === c.code ? "bg-primary/10 border-l-2 border-primary" : ""
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
          <Link
            to="/cart"
            aria-label="Cart"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors relative"
          >
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gradient-brand text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              2
            </span>
          </Link>
          {showSignedIn ? (
            <div className="hidden sm:flex items-center justify-center">
              <UserButton />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account/login"
                aria-label="Account"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <User className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link
                to="/account/login"
                className="h-9 inline-flex items-center rounded-full border border-border px-4 text-sm font-medium hover:border-primary/40 transition-colors"
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
            className="md:hidden h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden container mt-2 sm:mt-3 animate-fade-up px-4 sm:px-6">
          <div className="rounded-2xl border border-white/5 bg-background/35 p-3 sm:p-4 flex flex-col gap-1 backdrop-blur-xl">
            {links.map((l) => (
              <RouterNavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  )
                }
              >
                {l.label}
              </RouterNavLink>
            ))}
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
              {showSignedIn && (
                <div className="px-2 py-2">
                  <UserButton />
                </div>
              )}
              {!showSignedIn && (
                <>
                  <Link
                    to="/account/login"
                    className="w-full rounded-lg border border-border px-4 py-3 text-sm font-medium hover:border-primary/40 transition-colors text-center"
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

export default Navbar;
