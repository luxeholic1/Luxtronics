import { Link } from "react-router-dom";
import { ArrowRight, Zap, Camera, Headphones, Laptop, Smartphone, Watch, GamepadIcon } from "lucide-react";
import { motion } from "framer-motion";

const CategoryShowcase = () => {
  const categories = [
    {
      id: 1,
      title: "LIMITED EDITION",
      subtitle: "Pro Laptops up to 30% off",
      cta: "Shop now",
      icon: Laptop,
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      link: "/shop?cat=laptops&sort=featured",
    },
    {
      id: 2,
      title: "NEW DROP",
      subtitle: "Capture the extraordinary",
      cta: "Discover",
      icon: Camera,
      color: "from-amber-500 to-red-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      link: "/shop?cat=cameras&sort=new",
    },
    {
      id: 3,
      title: "AUDIO ELITE",
      subtitle: "Immersive sound experience",
      cta: "Explore",
      icon: Headphones,
      color: "from-emerald-500 to-cyan-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      link: "/shop?cat=audio&sort=rating",
    },
    {
      id: 4,
      title: "SMART TECH",
      subtitle: "Next-gen smartphones",
      cta: "View",
      icon: Smartphone,
      color: "from-violet-500 to-pink-600",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      link: "/shop?cat=smartphones&sort=featured",
    },
    {
      id: 5,
      title: "WEARABLES",
      subtitle: "Smart watches & fitness",
      cta: "Browse",
      icon: Watch,
      color: "from-rose-500 to-orange-600",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      link: "/shop?cat=wearables&sort=new",
    },
    {
      id: 6,
      title: "GAMING",
      subtitle: "Pro gaming gear",
      cta: "Play",
      icon: GamepadIcon,
      color: "from-green-500 to-lime-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      link: "/shop?cat=gaming&sort=rating",
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Featured Categories
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
            Shop by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Browse our curated collections of premium electronics. Each category features exclusive products and special offers.
          </p>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link
                  to={category.link}
                  className={`block h-full rounded-2xl border ${category.borderColor} ${category.bgColor} p-6 sm:p-8 transition-all duration-500 hover:shadow-elegant hover:-translate-y-1 overflow-hidden relative`}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Animated border on hover */}
                  <div className={`absolute inset-0 rounded-2xl border-2 ${category.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="mb-4">
                      <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">
                        <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                          {category.title}
                        </span>
                      </h3>
                      <p className="text-lg font-semibold text-foreground">
                        {category.subtitle}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {category.cta}
                      </span>
                      <div className={`h-10 w-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br ${category.color} group-hover:shadow-lg`}>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  {/* Floating particles removed — caused unnecessary repaints */}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View all categories CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all duration-500 hover:scale-105"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;