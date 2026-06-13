import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const trustItems = [
  { icon: Truck, label: "Checkout shipping" },
  { icon: ShieldCheck, label: "Support coverage" },
  { icon: Zap, label: "Latest tech" },
];

const stats = [
  { value: "1,600+", label: "Curated products" },
  { value: "3", label: "Global regions" },
  { value: "24/7", label: "Order support" },
];

const Hero = () => {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black text-white" aria-label="Luxtronics hero">
      <div className="relative min-h-[680px] sm:min-h-[720px] lg:min-h-[760px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/a6.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/v4.mp4" type="video/mp4" />
        </video>


        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1400px] items-center px-5 py-24 sm:min-h-[720px] sm:px-8 lg:min-h-[760px] lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl rounded-[28px] border border-white/14 bg-black/[0.28] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/86">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Premium Electronics Store
            </div>

            <h1 className="mt-7 max-w-2xl font-display text-4xl font-extrabold leading-[1.04] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Upgrade Your Everyday Tech
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              Shop premium smartphones, audio, wearables, gaming gear and smart accessories curated for performance, style and reliable delivery.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/14 active:translate-y-0"
              >
                Explore Categories
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white/82">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/14 pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-extrabold text-white sm:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium text-white/54 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
