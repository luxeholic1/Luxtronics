import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mouse, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroGadget from "@/assets/hero-gadget.png";
import heroLaptop from "@/assets/product-laptop.png";
import heroHeadphones from "@/assets/product-headphones.png";
import heroBgDesktop from "@/assets/hero.jpg";
import heroBgMobile from "@/assets/mob1.jpg";


const categorySlides = [
  {
    src: heroGadget,
    alt: "Smartphones category showcase",
    glow: "drop-shadow-[0_25px_60px_rgba(255,80,40,0.4)]",
  },
  {
    src: heroLaptop,
    alt: "Laptops category showcase",
    glow: "drop-shadow-[0_25px_60px_rgba(70,120,255,0.35)]",
  },
  {
    src: heroHeadphones,
    alt: "Audio category showcase",
    glow: "drop-shadow-[0_25px_60px_rgba(255,130,80,0.35)]",
  },
];

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    const resizeHandler = () => {
      requestAnimationFrame(checkMobile);
    };
    window.addEventListener('resize', resizeHandler);
    
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % categorySlides.length);
    }, 3200);

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setMousePosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-hero grain bg-cover bg-center section-bg-overlay"
      style={{
        backgroundImage: `url(${isMobile ? heroBgMobile : heroBgDesktop})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: isMobile ? 'scroll' : 'fixed',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
      {/* Tech pattern background with parallax */}
      <div 
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(217, 30, 99, 0.08) 0%, transparent 50%)
          `,
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
        }}
      />

      {/* Enhanced ambient blobs with parallax */}
      <div 
        className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse will-change-transform"
        style={{
          transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
        }}
      />
      <div 
        className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] animate-glow-pulse will-change-transform"
        style={{
          transform: `translate(${-mousePosition.x * 0.08}px, ${-mousePosition.y * 0.08}px)`,
        }}
      />

      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 will-change-transform" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
        }} />
      </div>

      <div className="w-full relative flex flex-col md:flex-row items-center justify-center min-h-screen py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center w-full max-w-[1920px] mx-auto">

          {/* Enhanced Copy Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left justify-center"
          >
            {/* Glass container for better visibility */}
            <div className="relative p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl dark:bg-black/40 light:bg-white/90 backdrop-blur-xl border dark:border-white/10 light:border-black/10 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium mb-4 sm:mb-6 backdrop-blur-xl border dark:border-white/10 light:border-black/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                  New Arrivals · Spring Collection
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="font-display font-bold text-4xl xs:text-5xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] md:leading-[0.95] tracking-tight"
              >
                <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                  Premium Tech
                </span>
                <br />
                <span className="md:inline text-white">
                  For Everyday Life
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-white max-w-lg leading-relaxed"
              >
                Curated electronics from the world's leading brands. Experience speed,
                power, and innovation — delivered to your door with free shipping.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4"
              >
                <Link
                  to="/shop"
                  className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10">Explore Now</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1 relative z-10" />
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Link>
                <Link
                  to="/categories"
                  className="group inline-flex items-center gap-2 rounded-full border border-border dark:bg-black/30 light:bg-white/50 backdrop-blur-xl px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold hover:border-primary/40 transition-all duration-300 hover:shadow-elegant"
                >
                  Browse Categories
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </Link>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8 sm:mt-10 flex items-center justify-center md:justify-start gap-6 sm:gap-8 lg:gap-10 w-full"
              >
                {[
                  { num: "12K+", label: "Products" },
                  { num: "98%", label: "Happy Buyers"},
                  { num: "24/7", label: "Support"},
                ].map((s, index) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center md:items-start shrink-0 group"
                  >
                    <div className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-gradient group-hover:scale-105 transition-transform">
                      {s.num}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white mt-1 uppercase tracking-widest font-semibold group-hover:text-primary transition-colors">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Product Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            className="relative flex items-center justify-center order-first md:order-last
              h-[280px] sm:h-[380px] md:h-[450px] lg:h-[520px] xl:h-[580px] w-full"
          >
            {/* Enhanced background effects */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.1),transparent_100%)]" />
            
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary/30"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${30 + (i * 5)}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}

            <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 dark:border-white/10 light:border-black/8 bg-gradient-to-br from-black/5 via-transparent to-black/5 dark:from-black/50 dark:via-black/30 dark:to-black/40 backdrop-blur-sm shadow-2xl">
              <AnimatePresence mode="wait">
                <Link to="/categories" aria-label="Browse categories" className="absolute inset-0 block group">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Subtle background for light mode only */}
                    <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/5 dark:via-transparent dark:to-accent/5" />
                    
                    <motion.img
                      src={categorySlides[activeSlide].src}
                      alt={categorySlides[activeSlide].alt}
                      width={1280}
                      height={1280}
                      loading="eager"
                      className={`h-full w-full object-contain animate-float cursor-pointer ${categorySlides[activeSlide].glow} group-hover:scale-105 transition-transform duration-700`}
                      animate={{
                        rotate: [0, 1, 0, -1, 0],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  
                  {/* Minimal overlay - only on hover and dark mode */}
                  <div className="absolute inset-0 bg-gradient-to-t dark:from-black/30 dark:via-black/10 dark:to-transparent from-transparent to-transparent opacity-0 group-hover:opacity-100 dark:opacity-100 transition-opacity duration-500" />
                </Link>
              </AnimatePresence>
            </div>

            {/* Enhanced floating accent elements */}
            <motion.div
              animate={{ 
                y: [0, -25, 0],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-1/4 right-8 h-4 w-4 rounded-full bg-gradient-brand shadow-glow-pink flex items-center justify-center"
            >
              <div className="h-1 w-1 rounded-full bg-white" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-1/3 left-8 h-3 w-3 rounded-full bg-accent shadow-glow"
            />
          </motion.div>

        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-6 w-px bg-gradient-to-b from-primary via-accent to-transparent"
        />
        <div className="flex items-center gap-1.5">
          <Mouse className="h-3 w-3" />
          <span className="text-[9px] uppercase tracking-widest font-medium">Scroll to explore</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;