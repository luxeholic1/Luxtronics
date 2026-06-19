import { Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import newsletterBgDesktop from "@/assets/newsletter.jpg";
import newsletterBgMobile from "@/assets/mob3.jpg";
import { absoluteUrl } from "@/lib/seo";

const Newsletter = () => {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

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

  const newsletterSchema = {
    "@context": "https://schema.org",
    "@type": "NewsletterSubscription",
    "name": "Luxtronics Newsletter",
    "description": "Subscribe for exclusive drops, early access, and the latest tech updates.",
    "url": absoluteUrl("/"),
    "offers": {
      "@type": "Offer",
      "description": "Newsletter updates and early access",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <section ref={ref} className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-0 relative overflow-hidden section-bg-overlay">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${isMobile ? newsletterBgMobile : newsletterBgDesktop})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          y: bgY,
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 pointer-events-none" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsletterSchema) }} />

      <div className="w-full relative overflow-hidden rounded-none bg-gradient-card border-0 p-6 sm:p-8 md:p-12 lg:p-16 text-center max-w-[1920px] mx-auto">
        {/* Background gradients */}
        <div className="absolute inset-0 dark:bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 sm:mb-6 md:mb-8 shadow-glow group hover:scale-110 transition-transform">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-tight">
            Get <span className="text-gradient">early access</span> to new drops
          </h2>
          <p className="mt-3 sm:mt-4 md:mt-5 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Subscribe for exclusive drops, early access, and the latest tech updates from the world's top brands.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 h-9 sm:h-10 md:h-12 rounded-full border border-border bg-background/50 backdrop-blur-sm px-4 sm:px-5 md:px-6 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background/80 transition-all"
            />
            <button
              type="submit"
              className="h-9 sm:h-10 md:h-12 rounded-full bg-gradient-brand px-5 sm:px-6 md:px-8 text-xs sm:text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground/60">
            No spam. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </section>
  );
};

export default Newsletter;
