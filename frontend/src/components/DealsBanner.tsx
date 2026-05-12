import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const DealsBanner = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section className="py-8 sm:py-10 md:py-12 overflow-hidden w-full bg-deals bg-cover bg-center section-bg-overlay" ref={ref}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group rounded-2xl sm:rounded-3xl border border-border dark:border-border light:border-black/8 overflow-hidden"
        >
          {/* Parallax background layers */}
          <motion.div
            style={{ y }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r dark:from-primary/20 dark:via-accent/10 dark:to-primary/20 from-primary/10 via-accent/5 to-primary/10" />
            
            {/* Tech pattern overlay */}
            <div className="absolute inset-0 opacity-50 dark:opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 107, 53, 0.03) 2px,
                    rgba(255, 107, 53, 0.03) 4px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(217, 30, 99, 0.02) 2px,
                    rgba(217, 30, 99, 0.02) 4px
                  )
                `,
              }}
            />
          </motion.div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full dark:bg-primary/20 bg-primary/10 blur-3xl"
              animate={{
                y: [0, 20, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full dark:bg-accent/20 bg-accent/10 blur-3xl"
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-2xl md:text-3xl">
                  Flash <span className="text-gradient">Deals</span> Today
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                  Up to 40% off on selected premium electronics. Limited time offer!
                </p>
              </div>
            </div>
            <Link
              to="/shop?sort=deals"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap"
            >
              Shop deals
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DealsBanner;
