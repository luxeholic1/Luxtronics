import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Link } from "react-router-dom";
import heroGadget from "@/assets/hero-gadget.png";
import heroLaptop from "@/assets/product-laptop.png";
import heroHeadphones from "@/assets/product-headphones.png";
import heroWatch from "@/assets/product-watch.png";

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % categorySlides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-hero grain">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] animate-glow-pulse" />

      <div className="container relative min-h-screen flex items-center pt-28 pb-12 sm:pt-36 lg:pt-40 sm:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              New Arrivals · Spring Collection
            </motion.span>

            <h1 className="font-display font-bold text-3xl xs:text-4xl sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-[1.1] md:leading-[0.95] tracking-tight">
              <span className="text-gradient">Premium tech</span>
              <br />
              <span className="md:inline">for everyday life</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Curated electronics from the world's leading brands. Experience speed,
              power, and innovation — delivered to your door.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all duration-500 hover:scale-105 active:scale-95"
              >
                Explore Now
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold hover:border-foreground transition-all duration-300 hover:bg-background"
              >
                Browse Categories
              </Link>
            </div>

            <div className="mt-8 sm:mt-12 flex items-center justify-center md:justify-start gap-8 sm:gap-12 w-full">
              {[
                { num: "12K+", label: "Products" },
                { num: "98%", label: "Happy Buyers" },
                { num: "24/7", label: "Support" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center md:items-start shrink-0">
                  <div className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-gradient">{s.num}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 uppercase tracking-widest font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            className="relative h-[300px] sm:h-[450px] md:h-[500px] lg:h-[600px] xl:h-[750px] 2xl:h-[850px] flex items-center justify-center order-first md:order-last"
          >
            <div className="absolute inset-0 bg-gradient-radial opacity-80" />
            <div className="relative z-10 h-full w-full">
              <AnimatePresence mode="wait">
                <Link to="/categories" aria-label="Browse categories" className="absolute inset-0 block">
                  <motion.img
                    key={activeSlide}
                    src={categorySlides[activeSlide].src}
                    alt={categorySlides[activeSlide].alt}
                    width={1280}
                    height={1280}
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute inset-0 h-full w-full object-contain animate-float cursor-pointer ${categorySlides[activeSlide].glow}`}
                  />
                </Link>
              </AnimatePresence>

            </div>
            {/* Floating accent dots */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 right-10 h-3 w-3 rounded-full bg-accent shadow-glow-pink"
            />
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-1/3 left-10 h-2 w-2 rounded-full bg-primary shadow-glow"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <Mouse className="h-5 w-5 animate-bounce" />
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;
