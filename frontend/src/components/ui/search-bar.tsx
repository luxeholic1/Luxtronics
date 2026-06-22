import { forwardRef, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClear?: () => void;
  placeholder?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onSubmit, onClear, placeholder = "Search..." }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const isUnsupportedBrowser = useMemo(() => {
      if (typeof window === "undefined") return false;
      const ua = navigator.userAgent.toLowerCase();
      const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
      const isChromeOniOS = ua.includes("crios");
      return isSafari || isChromeOniOS;
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isFocused) {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 800);
    };

    const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{
          x: [0, (Math.random() - 0.5) * 40],
          y: [0, (Math.random() - 0.5) * 40],
          scale: [0, Math.random() * 0.8 + 0.4],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: Math.random() * 1.5 + 1.5,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="absolute h-3 w-3 rounded-full bg-gradient-to-r from-accent to-primary"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: "blur(2px)",
        }}
      />
    ));

    const clickParticles = isClicked
      ? Array.from({ length: 14 }, (_, i) => (
          <motion.div
            key={`click-${i}`}
            initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
            animate={{
              x: mousePosition.x + (Math.random() - 0.5) * 160,
              y: mousePosition.y + (Math.random() - 0.5) * 160,
              scale: Math.random() * 0.8 + 0.2,
              opacity: [1, 0],
            }}
            transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
            className="absolute h-3 w-3 rounded-full"
            style={{
              background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 200) + 55}, ${Math.floor(Math.random() * 255)}, 0.8)`,
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
            }}
          />
        ))
      : null;

    return (
      <div className="relative w-full">
        <GooeyFilter />
        <motion.form
          onSubmit={onSubmit}
          className="relative flex w-full items-center justify-center"
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className={cn(
              "relative flex w-full items-center overflow-hidden rounded-full border backdrop-blur-md",
              isFocused
                ? "border-transparent shadow-xl"
                : "border-border bg-background/60"
            )}
            animate={{
              boxShadow: isClicked
                ? "0 0 40px hsl(var(--accent) / 0.5), 0 0 15px hsl(var(--primary) / 0.5) inset"
                : isFocused
                ? "0 15px 35px rgba(0, 0, 0, 0.2)"
                : "0 0 0 rgba(0, 0, 0, 0)",
            }}
            onClick={handleClick}
          >
            {isFocused && (
              <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 0.15,
                  background: [
                    "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                    "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                    "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                    "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                  ],
                }}
                transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            )}

            <div
              className="absolute inset-0 -z-5 overflow-hidden rounded-full"
              style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
            >
              {particles}
            </div>

            {isClicked && (
              <>
                <motion.div
                  className="absolute inset-0 -z-5 rounded-full bg-accent/10"
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 -z-5 rounded-full bg-white dark:bg-white/20"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </>
            )}

            {clickParticles}

            <motion.div
              className="pl-4 py-2.5"
              animate={{ rotate: 0, scale: 1 }}
            >
              <Search
                size={18}
                strokeWidth={isFocused ? 2.5 : 2}
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isFocused ? "text-accent" : "text-muted-foreground"
                )}
              />
            </motion.div>

            <input
              ref={ref}
              type="search"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className={cn(
                "relative z-10 w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground",
                isFocused ? "text-foreground tracking-wide" : "text-foreground/80"
              )}
            />

            {value && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                className="mr-2 shrink-0 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition-all"
              >
                Search
              </motion.button>
            )}

            {onClear && value && (
              <button
                type="button"
                onClick={onClear}
                className="mr-2 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            {isFocused && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.1, 0.2, 0.1, 0],
                  background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              />
            )}
          </motion.div>
        </motion.form>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
