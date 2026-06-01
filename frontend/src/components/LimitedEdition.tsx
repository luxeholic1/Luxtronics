import { Link } from "react-router-dom";
import { ArrowRight, Cable, CheckCircle2, Phone, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Variant = {
  wattage: string;
  color: string;
  accent: string;
  limit: string;
  phone: string;
  specs: Array<[string, string]>;
};

const variants: Variant[] = [
  {
    wattage: "80W",
    color: "Orange",
    accent: "from-orange-400 to-amber-500",
    limit: "First 100 customers only",
    phone: "9667078738",
    specs: [
      ["USB-C cable", "80W"],
      ["USB-C2", "20W"],
      ["USB-A", "18W"],
    ],
  },
  {
    wattage: "65W",
    color: "Pink",
    accent: "from-rose-300 to-pink-500",
    limit: "First 120 customers only",
    phone: "9266433722",
    specs: [
      ["USB-C cable", "65W"],
      ["USB-C2", "20W"],
      ["USB-A", "18W"],
    ],
  },
];

const highlights = [
  ["80W", "Max output"],
  ["3", "Charging ports"],
  ["70cm", "Built-in cable"],
  ["120g", "Ultra light"],
  ["18mo", "Warranty"],
];

const features = [
  { icon: Cable, label: "Retractable USB-C" },
  { icon: Zap, label: "PD 3.0 + QC 3.0" },
  { icon: ShieldCheck, label: "Multi-safe protection" },
];

const ProductMockup = ({ variant }: { variant: Variant }) => (
  <div className="relative flex min-h-[250px] items-center justify-center">
    <div className={`absolute h-44 w-44 rounded-full bg-gradient-to-br ${variant.accent} opacity-40 blur-3xl`} />
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-56 w-40 rounded-[1.8rem] border border-white/25 bg-white/15 p-3 shadow-2xl backdrop-blur-xl"
    >
      <div className={`absolute inset-3 rounded-[1.35rem] bg-gradient-to-br ${variant.accent}`} />
      <div className="absolute inset-0 rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.08)_46%,rgba(0,0,0,0.18)_100%)]" />
      <div className="relative flex h-full flex-col justify-between rounded-[1.25rem] border border-white/25 bg-black/10 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.22em]">GaN</span>
          <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">{variant.color}</span>
        </div>
        <div>
          <div className="font-display text-5xl font-black">{variant.wattage}</div>
          <p className="text-xs font-semibold text-white/75">Wall Charger</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["C1", "C2", "A"].map((port) => (
            <span key={port} className="rounded-full bg-black/30 px-2 py-1 text-center text-[10px] font-black">
              {port}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute -right-10 top-16 h-16 w-20 rounded-full border-[8px] border-white/60 border-b-transparent border-l-transparent" />
      <div className="absolute -right-12 top-28 h-3.5 w-9 rounded-full bg-white/70" />
    </motion.div>
  </div>
);

const LimitedEdition = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const videoScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.04, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["18px", "-18px"]);

  return (
    <section ref={sectionRef} className="relative isolate w-full overflow-hidden">
      <motion.video
        style={{ y: videoY, scale: videoScale }}
        className="absolute -inset-y-16 inset-x-0 h-[calc(100%+8rem)] w-full object-cover will-change-transform"
        src="/v8.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/a3.jpg"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/42" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.42)_50%,rgba(0,0,0,0.14)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto grid min-h-[760px] w-full max-w-[1800px] gap-8 px-4 py-14 will-change-transform sm:px-6 sm:py-16 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-12 xl:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" />
            Limited offer - free shipping
          </div>
          <h2 className="font-display text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            One charger.
            <span className="block text-white/62">Infinite devices.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
            65W and 80W GaN wall chargers with a built-in retractable USB-C cable. Three ports, laptop-grade power,
            pocket-sized form.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {features.map((feature) => (
              <span key={feature.label} className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82 backdrop-blur-xl">
                <feature.icon className="h-3.5 w-3.5" />
                {feature.label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/shop?search=gan%20charger"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-black transition hover:bg-white/90"
            >
              Shop Now - Rs. 3,999
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:9667078738"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/15"
            >
              <Phone className="h-4 w-4" />
              Call 96670 78738
            </a>
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {variants.map((variant, index) => (
              <motion.article
                key={variant.wattage}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                className="overflow-hidden rounded-3xl border border-white/16 bg-white/10 shadow-2xl backdrop-blur-xl"
              >
                <ProductMockup variant={variant} />
                <div className="border-t border-white/10 p-5 text-white">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white/55">GaN - {variant.color}</p>
                      <h3 className="font-display text-3xl font-black">{variant.wattage} Charger</h3>
                    </div>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-black">{variant.limit}</span>
                  </div>
                  <div className="mb-4 flex items-end gap-2">
                    <span className="font-display text-3xl font-black">Rs. 3,999</span>
                    <span className="pb-1 text-sm font-bold text-white/45 line-through">Rs. 5,999</span>
                  </div>
                  <div className="grid gap-2">
                    {variant.specs.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-xl bg-black/22 px-3 py-2 text-sm">
                        <span className="text-white/62">{label}</span>
                        <span className="font-black">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {highlights.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-white shadow-xl backdrop-blur-xl">
                <div className="font-display text-2xl font-black">{value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/55">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm font-bold text-white/72 backdrop-blur-xl">
            {["Free shipping", "18-month warranty", "PC fireproof", "Universal voltage"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LimitedEdition;
