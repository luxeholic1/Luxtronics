import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Gamepad2,
  Headphones,
  Smartphone,
  Sparkles,
  Truck,
  ShieldCheck,
  Watch,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
import heroBackdrop from "@/assets/flatlay-macbook-ipad-dark.jpeg";

const trustItems = [
  { icon: Truck, label: "Fast regional delivery" },
  { icon: ShieldCheck, label: "Protected checkout" },
  { icon: Zap, label: "Fresh tech drops" },
];

const stats = [
  { value: "1,600+", label: "Curated products" },
  { value: "3", label: "Global regions" },
  { value: "24/7", label: "Order support" },
];

const categoryPills = [
  { icon: Smartphone, label: "Phones", to: "/shop?category=smartphones" },
  { icon: Headphones, label: "Audio", to: "/shop?category=audio" },
  { icon: Watch, label: "Wearables", to: "/shop?category=wearables" },
  { icon: Gamepad2, label: "Gaming", to: "/shop?category=gaming" },
];

// Public Spline demo scene — swap for a Luxtronics-branded export from spline.design
const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#05060a]" aria-label="Luxtronics hero">
      {/* Parallax photography backdrop */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <img
          src={heroBackdrop}
          alt=""
          className="h-full w-full object-cover opacity-45"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/85 to-[#05060a]/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-[#05060a]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(96,165,250,0.18),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_30%)]" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[660px] max-w-[1440px] flex-col gap-10 px-5 py-16 sm:px-8 lg:min-h-[760px] lg:flex-row lg:items-center lg:gap-6 lg:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex-1"
        >
          <div className="inline-flex items-center gap-2 border border-white/16 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/86 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-sky-300" />
            New season tech edit
          </div>

          <h1 className="mt-7 max-w-xl font-display text-5xl font-extrabold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
            Tech that feels one step ahead.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-neutral-300 sm:text-lg">
            Discover sharper phones, richer audio, smarter wearables and gaming gear picked for people who want
            their setup to look as good as it performs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center gap-2 bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-sky-100 active:translate-y-0"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex min-h-12 items-center gap-2 border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/45 hover:bg-white/16 active:translate-y-0"
            >
              Explore Categories
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoryPills.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex min-h-16 items-center justify-between border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/86 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/45 hover:bg-white/16"
              >
                <span>{label}</span>
                <Icon className="h-5 w-5 text-sky-300 transition duration-300 group-hover:scale-110" />
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-14 items-center gap-2 border border-white/12 bg-black/45 px-4 py-3 text-sm font-medium text-white/82 backdrop-blur-xl"
              >
                <Icon className="h-4 w-4 shrink-0 text-sky-300" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/14 pt-5 lg:hidden">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-extrabold text-white sm:text-2xl">{stat.value}</div>
                <div className="mt-1 text-xs font-medium text-white/54 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3D scene — desktop/tablet only, Spline is too heavy for most phones */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden flex-1 self-stretch lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.14),transparent_65%)]" />
          <SplineScene scene={SPLINE_SCENE_URL} className="h-full w-full" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto hidden max-w-[1440px] grid-cols-3 gap-3 border-t border-white/14 bg-black/30 px-16 py-6 backdrop-blur-sm lg:grid"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 text-sky-300">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs font-medium text-white/54">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Hero;
