import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Package, Zap, Shield, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import heroGadget from "@/assets/hero-gadget.png";
import heroWatch from "@/assets/product-watch.png";
import { fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";

type SpotlightItem = { name: string; image: string; alt: string; accent: string };

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    badge: "🔥 Limited Time Deal",
    headline: "iPhone Essentials",
    subheadline: "Cases, rings & premium accessories",
    description: "MagSafe rings, cases and fast chargers with free shipping + 2-year warranty.",
    cta: { label: "Shop Now", to: "/shop?cat=smartphones" },
    secondary: { label: "View All Deals", to: "/shop" },
    accent: "from-orange-500 to-pink-600",
    accentSolid: "#f97316",
    tag: "SALE",
    tagColor: "bg-orange-500",
    spotlightQueries: ["iphone case", "magsafe", "phone accessory"],
    fallbackSpotlights: [
      { name: "iPhone Case", image: heroGadget, alt: "iPhone accessories", accent: "from-orange-500 to-pink-600" },
      { name: "Smart Watch", image: heroWatch, alt: "Smartwatch", accent: "from-blue-500 to-violet-600" },
    ],
  },
  {
    id: 2,
    badge: "✨ New Arrivals",
    headline: "Smart Wearables",
    subheadline: "Starting from ₹4,999",
    description: "Smartwatches, fitness bands and connected accessories built for daily use.",
    cta: { label: "Explore Now", to: "/shop?cat=wearables" },
    secondary: { label: "Compare Models", to: "/categories" },
    accent: "from-blue-500 to-violet-600",
    accentSolid: "#3b82f6",
    tag: "NEW",
    tagColor: "bg-blue-500",
    spotlightQueries: ["smartwatch", "wearable", "fitness band"],
    fallbackSpotlights: [
      { name: "Smart Watch", image: heroWatch, alt: "Smartwatch", accent: "from-blue-500 to-violet-600" },
      { name: "iPhone Case", image: heroGadget, alt: "iPhone accessories", accent: "from-orange-500 to-pink-600" },
    ],
  },
  {
    id: 3,
    badge: "⚡ Best Sellers",
    headline: "Premium Audio",
    subheadline: "Headphones & Speakers",
    description: "Crystal clear sound, deep bass and wireless freedom. Shop top audio brands.",
    cta: { label: "Shop Audio", to: "/shop?cat=audio" },
    secondary: { label: "Top Rated", to: "/shop?sort=rating" },
    accent: "from-violet-500 to-purple-700",
    accentSolid: "#8b5cf6",
    tag: "HOT",
    tagColor: "bg-violet-600",
    spotlightQueries: ["headphones", "bluetooth speaker", "earbuds"],
    fallbackSpotlights: [
      { name: "Headphones", image: heroGadget, alt: "Headphones", accent: "from-violet-500 to-purple-700" },
      { name: "Smart Watch", image: heroWatch, alt: "Smartwatch", accent: "from-blue-500 to-violet-600" },
    ],
  },
];

const AUTOPLAY = 5000;

// ─── Phone SVG assembled from parts ──────────────────────────────────────────
// Each part flies in from a different direction and assembles into a phone outline
const PHONE_PARTS = [
  // Body frame
  { id: "body",    from: { x: 0, y: -120, opacity: 0 }, delay: 0,    duration: 0.9 },
  // Screen
  { id: "screen",  from: { x: 0, y: -80,  opacity: 0 }, delay: 0.15, duration: 0.8 },
  // Camera module
  { id: "camera",  from: { x: 80, y: -60, opacity: 0 }, delay: 0.3,  duration: 0.7 },
  // Home indicator
  { id: "home",    from: { x: 0, y: 80,   opacity: 0 }, delay: 0.4,  duration: 0.7 },
  // Side buttons
  { id: "btn-l",   from: { x: -100, y: 0, opacity: 0 }, delay: 0.5,  duration: 0.6 },
  { id: "btn-r",   from: { x: 100, y: 0,  opacity: 0 }, delay: 0.55, duration: 0.6 },
  // Speaker
  { id: "speaker", from: { x: 0, y: -40,  opacity: 0 }, delay: 0.6,  duration: 0.6 },
  // Charging port
  { id: "port",    from: { x: 0, y: 100,  opacity: 0 }, delay: 0.65, duration: 0.6 },
  // Signal dots
  { id: "dot1",    from: { x: -60, y: -80, opacity: 0 }, delay: 0.75, duration: 0.5 },
  { id: "dot2",    from: { x: 60, y: -80,  opacity: 0 }, delay: 0.8,  duration: 0.5 },
  { id: "dot3",    from: { x: 0, y: -100,  opacity: 0 }, delay: 0.85, duration: 0.5 },
];

function PhoneAssembly({ accentColor, trigger }: { accentColor: string; trigger: number }) {
  return (
    <svg
      viewBox="0 0 200 380"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body frame */}
      <motion.rect
        key={`body-${trigger}`}
        x="30" y="10" width="140" height="360" rx="28"
        stroke={accentColor} strokeWidth="3.5" fill="none"
        strokeOpacity="0.6"
        initial={{ opacity: 0, y: -120 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Screen area */}
      <motion.rect
        key={`screen-${trigger}`}
        x="40" y="55" width="120" height="240" rx="12"
        fill={accentColor} fillOpacity="0.08"
        stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.4"
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Camera island */}
      <motion.rect
        key={`cam-${trigger}`}
        x="60" y="20" width="80" height="26" rx="13"
        fill={accentColor} fillOpacity="0.15"
        stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.5"
        initial={{ opacity: 0, x: 80, y: -60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Camera lens 1 */}
      <motion.circle
        key={`lens1-${trigger}`}
        cx="82" cy="33" r="7"
        fill={accentColor} fillOpacity="0.2"
        stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.6"
        initial={{ opacity: 0, x: 80, y: -60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Camera lens 2 */}
      <motion.circle
        key={`lens2-${trigger}`}
        cx="104" cy="33" r="7"
        fill={accentColor} fillOpacity="0.2"
        stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.6"
        initial={{ opacity: 0, x: 80, y: -60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.38, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Flash */}
      <motion.circle
        key={`flash-${trigger}`}
        cx="126" cy="33" r="4"
        fill={accentColor} fillOpacity="0.4"
        stroke={accentColor} strokeWidth="1" strokeOpacity="0.7"
        initial={{ opacity: 0, x: 80, y: -60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Home indicator */}
      <motion.rect
        key={`home-${trigger}`}
        x="75" y="315" width="50" height="5" rx="2.5"
        fill={accentColor} fillOpacity="0.5"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Left volume buttons */}
      <motion.rect
        key={`vol1-${trigger}`}
        x="26" y="100" width="4" height="28" rx="2"
        fill={accentColor} fillOpacity="0.5"
        stroke={accentColor} strokeWidth="1" strokeOpacity="0.6"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      />
      <motion.rect
        key={`vol2-${trigger}`}
        x="26" y="140" width="4" height="28" rx="2"
        fill={accentColor} fillOpacity="0.5"
        stroke={accentColor} strokeWidth="1" strokeOpacity="0.6"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.52, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Right power button */}
      <motion.rect
        key={`pwr-${trigger}`}
        x="170" y="120" width="4" height="40" rx="2"
        fill={accentColor} fillOpacity="0.5"
        stroke={accentColor} strokeWidth="1" strokeOpacity="0.6"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Speaker grille dots */}
      {[0,1,2,3,4,5,6].map((i) => (
        <motion.circle
          key={`sp-${i}-${trigger}`}
          cx={82 + i * 6} cy={340} r="1.5"
          fill={accentColor} fillOpacity="0.5"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.03, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />
      ))}
      {/* Charging port */}
      <motion.rect
        key={`port-${trigger}`}
        x="85" y="355" width="30" height="8" rx="4"
        fill={accentColor} fillOpacity="0.3"
        stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.5"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Screen content lines */}
      <motion.rect
        key={`line1-${trigger}`}
        x="55" y="80" width="90" height="6" rx="3"
        fill={accentColor} fillOpacity="0.2"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        style={{ transformOrigin: "55px 83px" }}
      />
      <motion.rect
        key={`line2-${trigger}`}
        x="55" y="96" width="70" height="4" rx="2"
        fill={accentColor} fillOpacity="0.15"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ transformOrigin: "55px 98px" }}
      />
      {/* App grid dots */}
      {[0,1,2,3,4,5,6,7,8].map((i) => (
        <motion.rect
          key={`app-${i}-${trigger}`}
          x={55 + (i % 3) * 36} y={160 + Math.floor(i / 3) * 36}
          width="24" height="24" rx="6"
          fill={accentColor} fillOpacity="0.12"
          stroke={accentColor} strokeWidth="1" strokeOpacity="0.2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85 + i * 0.04, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: `${55 + (i % 3) * 36 + 12}px ${160 + Math.floor(i / 3) * 36 + 12}px` }}
        />
      ))}
      {/* Signal/wifi dots top right of screen */}
      {[0,1,2].map((i) => (
        <motion.circle
          key={`sig-${i}-${trigger}`}
          cx={130 + i * 10} cy={68} r="2.5"
          fill={accentColor} fillOpacity={0.3 + i * 0.2}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 + i * 0.05, duration: 0.5 }}
        />
      ))}
    </svg>
  );
}

// ─── Floating particles in background ────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 3,
}));

function FloatingParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Mini product card ────────────────────────────────────────────────────────
function MiniCard({ item, accent, dimmed }: { item: SpotlightItem; accent: string; dimmed?: boolean }) {
  return (
    <div className={`w-[150px] md:w-[175px] rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl transition-all ${dimmed ? "opacity-50 scale-90" : "opacity-100"}`}>
      <div className={`h-[110px] md:h-[130px] bg-gradient-to-br ${accent} bg-opacity-10 flex items-center justify-center relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
        <img src={item.image} alt={item.alt} className="relative z-10 h-full w-full object-contain p-2 drop-shadow-xl" loading="eager" />
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] text-green-600 dark:text-green-400 font-semibold">In Stock</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [liveSpotlights, setLiveSpotlights] = useState<SpotlightItem[]>([]);
  const [direction, setDirection] = useState(1);
  const [phoneTrigger, setPhoneTrigger] = useState(0);

  const goTo = useCallback((index: number, dir = 1) => {
    setDirection(dir);
    setCurrent(index);
    setSpotlightIndex(0);
    setPhoneTrigger(t => t + 1);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length, 1), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, -1), [current, goTo]);

  const slide = SLIDES[current];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY);
    return () => clearInterval(t);
  }, [paused, next]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const results = await Promise.all(slide.spotlightQueries.map(q => fetchStoreProducts(1, 4, q)));
        if (cancelled) return;
        const mapped = results.flat()
          .map(mapStoreProductToLocalProduct)
          .filter(p => Boolean(p.image))
          .slice(0, 3)
          .map((p, i) => ({
            name: p.name,
            image: p.image,
            alt: p.name,
            accent: ["from-orange-500 to-pink-600", "from-blue-500 to-violet-600", "from-violet-500 to-purple-700"][i % 3],
          }));
        setLiveSpotlights(mapped.length > 0 ? mapped : slide.fallbackSpotlights);
      } catch {
        if (!cancelled) setLiveSpotlights(slide.fallbackSpotlights);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slide]);

  const spotlightItems = useMemo(
    () => liveSpotlights.length > 0 ? liveSpotlights : slide.fallbackSpotlights,
    [liveSpotlights, slide]
  );

  useEffect(() => { setSpotlightIndex(0); }, [current]);

  useEffect(() => {
    if (spotlightItems.length <= 1) return;
    const t = setInterval(() => setSpotlightIndex(i => (i + 1) % spotlightItems.length), 2500);
    return () => clearInterval(t);
  }, [spotlightItems]);

  const spotlight = spotlightItems[spotlightIndex % (spotlightItems.length || 1)];

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  // Gradient colors for phone
  const phoneColor = slide.accentSolid;

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero banner"
    >
      <div className="relative w-full h-[520px] sm:h-[500px] md:h-[580px] lg:h-[640px] xl:h-[700px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 bg-gray-950 dark:bg-gray-950"
          >
            {/* ── Deep dark gradient bg ── */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${phoneColor}18, transparent 70%),
                             radial-gradient(ellipse 50% 40% at 20% 80%, ${phoneColor}10, transparent 60%),
                             linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)`,
              }}
            />

            {/* ── Floating particles ── */}
            <FloatingParticles color={phoneColor} />

            {/* ── Grid lines (subtle) ── */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(${phoneColor}40 1px, transparent 1px), linear-gradient(90deg, ${phoneColor}40 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* ── PHONE ASSEMBLY — background right side ── */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:w-[42%] lg:w-[40%] flex items-center justify-center pointer-events-none">
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 blur-[80px] opacity-20"
                style={{ background: `radial-gradient(circle at center, ${phoneColor}, transparent 70%)` }}
              />
              <div className="relative w-[180px] sm:w-[200px] md:w-[240px] lg:w-[280px] xl:w-[300px] h-full max-h-[500px]">
                <PhoneAssembly accentColor={phoneColor} trigger={phoneTrigger} />
              </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 flex items-center">
              <div className="w-full sm:w-[58%] lg:w-[55%] flex flex-col items-start">

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mb-4 sm:mb-5"
                >
                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-1.5 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${phoneColor}cc, ${phoneColor}88)`, boxShadow: `0 0 20px ${phoneColor}40` }}
                  >
                    {slide.badge}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight"
                >
                  <span
                    className="block"
                    style={{
                      background: `linear-gradient(135deg, #ffffff 0%, ${phoneColor} 60%, #ffffff 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {slide.headline}
                  </span>
                  <span className="block text-white/70 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-1">
                    {slide.subheadline}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-4 text-sm sm:text-base text-white/50 max-w-sm leading-relaxed"
                >
                  {slide.description}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.5 }}
                  className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3"
                >
                  <Link
                    to={slide.cta.to}
                    className="inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${phoneColor}, ${phoneColor}bb)`,
                      boxShadow: `0 8px 32px ${phoneColor}50`,
                    }}
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={slide.secondary.to}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-white/80 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    {slide.secondary.label}
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
                >
                  {[
                    { icon: Truck, label: "Free Shipping" },
                    { icon: Shield, label: "2-Year Warranty" },
                    { icon: Zap, label: "Fast Delivery" },
                  ].map(({ icon: Icon, label }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-center gap-1.5 text-xs text-white/50"
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: phoneColor }} />
                      {label}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Product count */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <Package className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-xs font-semibold text-white/60">1,676+ Products Available</span>
                </motion.div>
              </div>

              {/* ── Floating product cards (desktop) ── */}
              <div className="hidden sm:flex absolute right-4 md:right-8 lg:right-16 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-10">
                {/* Back card */}
                {spotlightItems.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    style={{ transform: "rotate(6deg) translateX(20px)" }}
                  >
                    <MiniCard
                      item={spotlightItems[(spotlightIndex + 1) % spotlightItems.length]}
                      accent={slide.accent}
                      dimmed
                    />
                  </motion.div>
                )}

                {/* Front card — floating */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${slide.id}-${spotlightIndex}`}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -16 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="animate-float"
                    style={{ zIndex: 10, marginTop: "-20px" }}
                  >
                    <MiniCard item={spotlight} accent={slide.accent} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Slide progress bar ── */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <motion.div
                key={`progress-${slide.id}`}
                className="h-full"
                style={{ background: phoneColor }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: AUTOPLAY / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Nav arrows ── */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex items-center justify-center gap-2 py-3 bg-gray-950 border-b border-white/5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-7 h-2" : "w-2 h-2 bg-white/20 hover:bg-white/40"
            }`}
            style={i === current ? { background: SLIDES[i].accentSolid } : {}}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
