import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Globe, ChevronDown, ArrowRight } from "lucide-react";
import { countries, CountryInfo } from "@/context/CurrencyContext";



interface SplashScreenProps {
  onEnter: (country: CountryInfo) => void;
}

const SplashScreen = ({ onEnter }: SplashScreenProps) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => onEnter(selectedCountry), 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(0 0% 2%)" }}
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            {/* Gradient orbs */}
            <motion.div
              animate={{
                x: [0, 60, -40, 0],
                y: [0, -40, 30, 0],
                scale: [1, 1.3, 0.9, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full blur-[160px]"
              style={{ background: "hsl(18 100% 55% / 0.15)" }}
            />
            <motion.div
              animate={{
                x: [0, -50, 40, 0],
                y: [0, 30, -50, 0],
                scale: [1, 0.8, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full blur-[160px]"
              style={{ background: "hsl(328 100% 55% / 0.12)" }}
            />
            <motion.div
              animate={{
                x: [0, 30, -30, 0],
                y: [0, -60, 20, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full blur-[120px]"
              style={{ background: "hsl(260 80% 55% / 0.08)" }}
            />

            {/* Floating particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -80],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: `hsl(${18 + Math.random() * 310} 80% 65%)`,
                }}
              />
            ))}

            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-8"
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-white" strokeWidth={2} />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-gradient-brand"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
                Welcome to
              </p>
              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl tracking-tight leading-[0.95]">
                Enter the world of
                <br />
                <span className="text-gradient">Luxtronics</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Premium electronics from the world's finest brands. Choose your region to explore curated tech for your market.
              </p>
            </motion.div>

            {/* Country Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 sm:mt-10 w-full max-w-sm"
            >
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-5 py-4 text-left hover:border-primary/40 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-2xl">{selectedCountry.flag}</span>
                    <div>
                      <p className="text-sm font-semibold">{selectedCountry.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedCountry.currency} · luxtronics{selectedCountry.domain}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-white/10 bg-[hsl(0_0%_6%)] backdrop-blur-xl shadow-2xl overflow-hidden z-50 max-h-[280px] overflow-y-auto scrollbar-hidden origin-top"
                    >
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setSelectedCountry(country);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.06] transition-colors ${
                            selectedCountry.code === country.code ? "bg-primary/10 border-l-2 border-primary" : ""
                          }`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{country.name}</p>
                            <p className="text-xs text-muted-foreground">{country.currency}</p>
                          </div>
                          {selectedCountry.code === country.code && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Enter Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-8"
            >
              <button
                onClick={handleEnter}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-brand px-10 py-4 sm:px-12 sm:py-5 text-sm sm:text-base font-bold text-white shadow-glow hover:shadow-glow-pink transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Enter Store</span>
                <ArrowRight className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/3 bg-white/20 skew-x-12"
                />
              </button>
            </motion.div>

            {/* Country Grid Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-2 sm:gap-3 max-w-lg"
            >
              {countries.slice(0, 8).map((c, i) => (
                <motion.button
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + i * 0.05 }}
                  onClick={() => {
                    setSelectedCountry(c);
                  }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs transition-all duration-300 ${
                    selectedCountry.code === c.code
                      ? "border-primary/60 bg-primary/10 text-foreground shadow-glow"
                      : "border-white/8 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="hidden sm:inline font-medium">{c.name}</span>
                  <span className="sm:hidden font-medium">{c.code}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
