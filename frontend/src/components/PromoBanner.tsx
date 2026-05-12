import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import laptop from "@/assets/product-laptop.png";
import camera from "@/assets/product-camera.png";
import storeBgDesktop from "@/assets/bg-store.jpg";
import storeBgMobile from "@/assets/mob1.jpg";

const PromoBanner = () => {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    const resizeHandler = () => {
      requestAnimationFrame(checkMobile);
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6" ref={ref}>
      {/* Left Promo Card */}
      <motion.div 
        className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-cover bg-center bg-gradient-card border border-border dark:border-border light:border-black/8 p-6 sm:p-8 md:p-10 lg:p-12 min-h-[240px] sm:min-h-[320px] md:min-h-[380px] flex flex-col justify-between group hover:border-primary/40 transition-all duration-500"
        style={{
          backgroundImage: `url(${isMobile ? storeBgMobile : storeBgDesktop})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="absolute -right-10 -bottom-10 h-48 sm:h-64 md:h-72 w-48 sm:w-64 md:w-72 rounded-full dark:bg-primary/20 bg-primary/15 blur-[60px] sm:blur-[80px] group-hover:dark:bg-primary/30 group-hover:bg-primary/20 transition-all" />
        <div className="relative z-10">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-semibold mb-2 sm:mb-3">
            Limited Edition
          </p>
          <h3 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            Pro Laptops
            <br />
            <span className="text-gradient">up to 30% off</span>
          </h3>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <Link
            to="/shop?cat=laptops"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold hover:gap-3 transition-all group/link"
          >
            Shop now <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <motion.img
            src={laptop}
            alt="Laptop promo - high performance laptops at discount"
            loading="lazy"
            width={400}
            height={400}
            className="absolute right-0 bottom-0 h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-56 lg:w-56 object-contain will-change-transform"
            style={{ y }}
            whileHover={{ scale: 1.15 }}
          />
        </div>
      </motion.div>

      {/* Right Promo Card */}
      <motion.div 
        className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-cover bg-center bg-gradient-card border border-border dark:border-border light:border-black/8 p-6 sm:p-8 md:p-10 lg:p-12 min-h-[240px] sm:min-h-[320px] md:min-h-[380px] flex flex-col justify-between group hover:border-accent/40 transition-all duration-500"
        style={{
          backgroundImage: `url(${isMobile ? storeBgMobile : storeBgDesktop})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(217,30,99,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(217,30,99,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="absolute -left-10 -top-10 h-48 sm:h-64 md:h-72 w-48 sm:w-64 md:w-72 rounded-full dark:bg-accent/20 bg-accent/15 blur-[60px] sm:blur-[80px] group-hover:dark:bg-accent/30 group-hover:bg-accent/20 transition-all" />
        <div className="relative z-10">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-accent font-semibold mb-2 sm:mb-3">
            New Drop
          </p>
          <h3 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            Capture the
            <br />
            <span className="text-gradient">extraordinary</span>
          </h3>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <Link
            to="/shop?cat=cameras"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold hover:gap-3 transition-all group/link"
          >
            Discover <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <motion.img
            src={camera}
            alt="Camera promo - professional cameras and lenses"
            loading="lazy"
            width={400}
            height={400}
            className="absolute right-0 bottom-0 h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-56 lg:w-56 object-contain will-change-transform"
            style={{ y }}
            whileHover={{ scale: 1.15 }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default PromoBanner;
