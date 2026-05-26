import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBgDesktop from "@/assets/hero.jpg";
import heroBgMobile from "@/assets/mob1.jpg";
import heroGadget from "@/assets/hero-gadget.png";
import heroWatch from "@/assets/product-watch.png";
import { fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";

type SpotlightItem = {
  name: string;
  image: string;
  alt: string;
  accent: string;
};

const GLASSES_FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" viewBox="0 0 960 960" fill="none">
      <rect width="960" height="960" rx="180" fill="transparent"/>
      <path d="M260 520c-55 0-100-45-100-100s45-100 100-100h10c55 0 100 45 100 100s-45 100-100 100h-10Z" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M700 520c-55 0-100-45-100-100s45-100 100-100h10c55 0 100 45 100 100s-45 100-100 100h-10Z" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M360 420h240" stroke="#111827" stroke-width="28" stroke-linecap="round"/>
      <path d="M160 390 110 350" stroke="#111827" stroke-width="24" stroke-linecap="round"/>
      <path d="M800 390 850 350" stroke="#111827" stroke-width="24" stroke-linecap="round"/>
    </svg>
  `);

// ─── Slide data — edit text/links/colors freely ───────────────────────────────
const SLIDES = [
  {
    id: 1,
    badge: "🔥 Limited Time Deal",
    headline: "iPhone Essentials",
    subheadline: "Rings, cases & premium accessories",
    description: "Apple-friendly accessories, MagSafe rings, cases and fast chargers with free shipping + 2-year warranty.",
    cta: { label: "Shop iPhone Accessories", to: "/shop?cat=smartphones" },
    secondary: { label: "View All Deals", to: "/shop" },
    image: heroGadget,
    imageAlt: "iPhone accessories and smartphone essentials",
    accent: "from-orange-500 to-pink-600",
    bg: "from-orange-50 via-white to-pink-50",
    darkBg: "dark:from-orange-950/40 dark:via-gray-950 dark:to-pink-950/30",
    tag: "SALE",
    tagColor: "bg-orange-500",
    spotlightQueries: ["iphone ring", "iphone case", "magsafe", "phone accessory"],
    fallbackSpotlights: [
      { name: "iPhone Accessories", image: heroGadget, alt: "iPhone accessories", accent: "from-orange-500 to-pink-600" },
      { name: "Wearables", image: heroWatch, alt: "Smartwatch and wearable products", accent: "from-blue-500 to-violet-600" },
      { name: "Glasses", image: GLASSES_FALLBACK_IMAGE, alt: "Glasses and eyewear", accent: "from-slate-500 to-indigo-600" },
    ],
  },
  {
    id: 2,
    badge: "✨ New Arrivals",
    headline: "Smart Wearables",
    subheadline: "Starting from ₹4,999",
    description: "Smartwatches, fitness bands and connected accessories built for daily use. EMI available.",
    cta: { label: "Explore Wearables", to: "/shop?cat=wearables" },
    secondary: { label: "Compare Models", to: "/categories" },
    image: heroWatch,
    imageAlt: "Smart wearable collection",
    accent: "from-blue-500 to-violet-600",
    bg: "from-blue-50 via-white to-violet-50",
    darkBg: "dark:from-blue-950/40 dark:via-gray-950 dark:to-violet-950/30",
    tag: "NEW",
    tagColor: "bg-blue-500",
    spotlightQueries: ["smartwatch", "wearable", "fitness band"],
    fallbackSpotlights: [
      { name: "Wearables", image: heroWatch, alt: "Smartwatch and wearable products", accent: "from-blue-500 to-violet-600" },
      { name: "iPhone Accessories", image: heroGadget, alt: "iPhone accessories", accent: "from-orange-500 to-pink-600" },
      { name: "Glasses", image: GLASSES_FALLBACK_IMAGE, alt: "Glasses and eyewear", accent: "from-slate-500 to-indigo-600" },
    ],
  },
  {
    id: 3,
    badge: "🕶️ Trending Now",
    headline: "Glasses & Eyewear",
    subheadline: "Blue light, style & everyday comfort",
    description: "Glasses, frames and eyewear picks for work, screen time and style. Fast shipping + 2-year warranty.",
    cta: { label: "Shop Glasses", to: "/shop?q=glasses" },
    secondary: { label: "Top Rated", to: "/shop?sort=rating" },
    image: GLASSES_FALLBACK_IMAGE,
    imageAlt: "Glasses and eyewear collection",
    accent: "from-slate-500 to-indigo-600",
    bg: "from-slate-50 via-white to-indigo-50",
    darkBg: "dark:from-slate-950/40 dark:via-gray-950 dark:to-indigo-950/30",
    tag: "GLASSES",
    tagColor: "bg-slate-700",
    spotlightQueries: ["glasses", "eyewear", "sunglasses", "spectacles"],
    fallbackSpotlights: [
      { name: "Glasses", image: GLASSES_FALLBACK_IMAGE, alt: "Glasses and eyewear", accent: "from-slate-500 to-indigo-600" },
      { name: "iPhone Accessories", image: heroGadget, alt: "iPhone accessories", accent: "from-orange-500 to-pink-600" },
      { name: "Wearables", image: heroWatch, alt: "Smartwatch and wearable products", accent: "from-blue-500 to-violet-600" },
    ],
  },
];

const AUTOPLAY_INTERVAL = 4500;

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [liveSpotlights, setLiveSpotlights] = useState<SpotlightItem[]>([]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const goTo = useCallback((index: number, dir = 1) => {
    setDirection(dir);
    setCurrent(index);
    setSpotlightIndex(0);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1);
  }, [current, goTo]);

  const slide = SLIDES[current];

  // Autoplay
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  useEffect(() => {
    let cancelled = false;

    const loadSpotlights = async () => {
      try {
        const queries = slide.spotlightQueries.length > 0 ? slide.spotlightQueries : [slide.headline];
        const storeProducts = await Promise.all(queries.map((query) => fetchStoreProducts(1, 6, query)));
        if (cancelled) return;

        const mapped = storeProducts
          .flat()
          .map(mapStoreProductToLocalProduct)
          .filter((product) => Boolean(product.image))
          .slice(0, 3)
          .map((product, index) => ({
            name: product.name,
            image: product.image,
            alt: product.name,
            accent: ["from-slate-500 to-indigo-600", "from-blue-500 to-violet-600", "from-orange-500 to-pink-600"][index % 3],
          }));

        setLiveSpotlights(mapped.length > 0 ? mapped : slide.fallbackSpotlights);
      } catch {
        if (!cancelled) setLiveSpotlights(slide.fallbackSpotlights);
      }
    };

    loadSpotlights();

    return () => {
      cancelled = true;
    };
  }, [slide]);

  const spotlightItems = useMemo(
    () => liveSpotlights.length > 0 ? liveSpotlights : slide.fallbackSpotlights,
    [liveSpotlights, slide]
  );

  useEffect(() => {
    setSpotlightIndex(0);
  }, [current]);

  useEffect(() => {
    if (spotlightItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setSpotlightIndex((index) => (index + 1) % spotlightItems.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [spotlightItems]);

  const spotlight = spotlightItems[spotlightIndex % (spotlightItems.length || 1)];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Promotional banner slider"
    >
      {/* Slide container */}
      <div className="relative w-full h-[480px] sm:h-[420px] md:h-[500px] lg:h-[560px] xl:h-[620px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg} ${slide.darkBg}`}
          >
            {/* Background image — subtle, behind content */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
              style={{ backgroundImage: `url(${heroBgDesktop})` }}
              aria-hidden="true"
            />
            {/* Mobile bg */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20 sm:hidden"
              style={{ backgroundImage: `url(${heroBgMobile})` }}
              aria-hidden="true"
            />

            <div className="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">

              {/* ── MOBILE layout (< sm): stacked, image floats top-right ── */}
              <div className="flex flex-col h-full pt-7 pb-4 sm:hidden">
                {/* Top row: text left + image right */}
                <div className="flex items-start justify-between gap-3 flex-1">
                  {/* Text */}
                  <div className="flex flex-col items-start flex-1 min-w-0 pt-1">
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold text-white px-2.5 py-1 rounded-full mb-2.5 ${slide.tagColor}`}
                    >
                      {slide.badge}
                    </motion.span>

                    <motion.h1
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-display font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white"
                    >
                      <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent text-2xl`}>
                        {slide.headline}
                      </span>
                      <br />
                      <span className="text-gray-800 dark:text-gray-100 text-lg font-bold">
                        {slide.subheadline}
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.22 }}
                      className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2"
                    >
                      {slide.description}
                    </motion.p>
                  </div>

                  {/* Product image — right side, tall */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${slide.id}-${spotlightIndex}`}
                      initial={{ opacity: 0, scale: 0.85, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.92, x: -16 }}
                      transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                      className="relative flex-shrink-0 w-[140px] h-[160px] flex items-center justify-center"
                    >
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${spotlight.accent} opacity-15 blur-2xl`} />
                      <img
  src={spotlight.image}
  alt={spotlight.alt}
  className="relative z-10 h-full w-full object-contain rounded-2xl drop-shadow-xl"
  loading="eager"
/>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="flex items-center gap-2.5 mt-4"
                >
                  <Link
                    to={slide.cta.to}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r ${slide.accent} px-4 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all`}
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to={slide.secondary.to}
                    className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap"
                  >
                    {slide.secondary.label}
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 dark:text-gray-400"
                >
                  {["Free Shipping", "2-Yr Warranty", "Easy Returns"].map((t) => (
                    <span key={t} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                      {t}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* ── DESKTOP layout (≥ sm): side by side ── */}
              <div className="hidden sm:grid grid-cols-2 gap-6 md:gap-10 items-center h-full">
                {/* Text */}
                <div className="flex flex-col items-start text-left z-10">
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white px-3 py-1 rounded-full mb-3 sm:mb-4 ${slide.tagColor}`}
                  >
                    {slide.badge}
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-gray-900 dark:text-white"
                  >
                    <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                      {slide.headline}
                    </span>
                    <br />
                    <span className="text-gray-800 dark:text-gray-100 text-3xl md:text-4xl lg:text-5xl font-bold">
                      {slide.subheadline}
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md leading-relaxed"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3"
                  >
                    <Link
                      to={slide.cta.to}
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${slide.accent} px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300`}
                    >
                      {slide.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={slide.secondary.to}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 hover:shadow-md transition-all duration-300"
                    >
                      {slide.secondary.label}
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.42 }}
                    className="mt-5 sm:mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
                  >
                    {["Free Shipping", "2-Year Warranty", "Easy Returns"].map((t) => (
                      <span key={t} className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {t}
                      </span>
                    ))}
                  </motion.div>
                </div>

                {/* Product image */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${slide.id}-${spotlightIndex}-desktop`}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    className="relative flex items-center justify-center h-[220px] md:h-[300px] lg:h-[360px]"
                  >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${spotlight.accent} opacity-10 blur-3xl scale-75`} />
                    <img
                      src={spotlight.image}
                      alt={spotlight.alt}
                      className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
                      loading="eager"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
