import { Shield, Truck, RotateCcw, Headphones, Award, Lock } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹500. Express available.",
  },
  {
    icon: Shield,
    title: "2-Year Warranty",
    description: "Extended protection on selected items.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "No questions asked, full refund.",
  },
  {
    icon: Award,
    title: "Authentic Only",
    description: "100% genuine products guaranteed.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Chat, call, or email us anytime.",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    description: "SSL encrypted payments protected.",
  },
];

const TrustBadges = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 overflow-hidden w-full relative bg-trust bg-cover bg-center section-bg-overlay">
      {/* Tech grid pattern background */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative group rounded-xl sm:rounded-2xl border border-border dark:border-border light:border-black/8 p-4 sm:p-6 bg-gradient-card text-center hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/5 dark:via-transparent dark:to-accent/5 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                  <badge.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                  {badge.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
