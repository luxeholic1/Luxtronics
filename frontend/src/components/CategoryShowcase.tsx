import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import menuData from "../data/mega-menu.json";

type MenuItem = {
  title: string;
  slug: string;
  children?: { title: string; slug: string }[];
};

const CategoryShowcase = () => {
  const [active, setActive] = useState<string | null>(null);

  const menu = menuData as MenuItem[];

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Categories</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
            Browse by Category
          </h2>
        </motion.div>

        {/* Top-level pills */}
        <div className="relative">
          <div className="flex flex-wrap gap-3 items-center justify-start mb-4">
            {menu.map((item) => (
              <button
                key={item.slug}
                onMouseEnter={() => setActive(item.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(item.slug)}
                onBlur={() => setActive(null)}
                className={`px-4 py-2 rounded-full border text-sm font-medium hover:bg-primary/5 transition-colors ${active === item.slug ? 'bg-primary/10 border-primary' : 'bg-white/50'}`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Mega panel */}
          <div className="absolute left-0 right-0 top-full mt-2 pointer-events-none">
            {menu.map((item) => (
              <div
                key={item.slug}
                onMouseEnter={() => setActive(item.slug)}
                onMouseLeave={() => setActive(null)}
                className={`pointer-events-auto bg-white rounded-xl shadow-lg p-6 transition-all duration-200 mx-auto max-w-6xl ${active === item.slug ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}
                style={{
                  transformOrigin: 'top center'
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(item.children || []).map((child) => (
                    <Link
                      key={child.slug}
                      to={`/shop?cat=${child.slug}`}
                      className="block p-2 rounded hover:bg-gray-50 text-sm font-medium"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View all categories CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all duration-300"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;