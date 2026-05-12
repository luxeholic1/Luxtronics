import { Link } from "react-router-dom";
import { ArrowRight, Zap, Percent } from "lucide-react";
import { motion } from "framer-motion";
import laptopImage from "@/assets/product-laptop.png";
import headphonesImage from "@/assets/product-headphones.png";
import watchImage from "@/assets/product-watch.png";

const LimitedEditionSection = () => {
  const limitedEditionItems = [
    {
      id: 1,
      title: "Pro Laptops",
      subtitle: "LIMITED EDITION",
      discount: "up to 30% off",
      image: laptopImage,
      link: "/shop?cat=laptops&sort=featured",
      color: "from-blue-500/20 to-cyan-500/20",
      textColor: "text-blue-400",
      badgeColor: "bg-blue-500/20",
    },
    {
      id: 2,
      title: "Premium Audio",
      subtitle: "NEW DROP",
      discount: "Capture the extraordinary",
      image: headphonesImage,
      link: "/shop?cat=audio&sort=new",
      color: "from-purple-500/20 to-pink-500/20",
      textColor: "text-purple-400",
      badgeColor: "bg-purple-500/20",
    },
    {
      id: 3,
      title: "Smart Watches",
      subtitle: "LIMITED STOCK",
      discount: "Next-gen wearables",
      image: watchImage,
      link: "/shop?cat=wearables&sort=featured",
      color: "from-emerald-500/20 to-teal-500/20",
      textColor: "text-emerald-400",
      badgeColor: "bg-emerald-500/20",
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="flex items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4 flex-wrap">
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
            Exclusive Collections
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-2xl">
            <span className="text-gradient">Limited Editions</span> &{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              New Drops
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl">
            Discover exclusive collections and limited edition products with special pricing.
            Don't miss out on these curated selections.
          </p>
        </div>
        <Link
          to="/shop?sort=new"
          className="inline-flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-foreground group"
        >
          View all collections
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {limitedEditionItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative"
          >
            <Link
              to={item.link}
              className="block rounded-3xl overflow-hidden bg-gradient-to-br from-black/40 to-black/20 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 ${item.badgeColor} backdrop-blur-sm px-3 py-1 rounded-full mb-3`}>
                      <Zap className="h-3 w-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        {item.subtitle}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className={`h-10 w-10 rounded-full ${item.badgeColor} flex items-center justify-center`}>
                    <Percent className="h-5 w-5" />
                  </div>
                </div>

                <p className={`text-lg sm:text-xl font-semibold mb-6 ${item.textColor}`}>
                  {item.discount}
                </p>

                <div className="relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/30 to-secondary/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-contain scale-90 group-hover:scale-100 transition-transform duration-700"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* CTA Button */}
                <div className="mt-6 sm:mt-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-sm font-semibold group-hover:border-white/20 transition-all duration-300">
                    Shop now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { value: "24h", label: "Flash Sale", desc: "Ends soon" },
          { value: "500+", label: "Limited Items", desc: "In stock" },
          { value: "4.9★", label: "Customer Rating", desc: "Based on 10K+ reviews" },
          { value: "Free", label: "Express Shipping", desc: "On all orders" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="rounded-2xl bg-gradient-card border border-border p-4 sm:p-6 text-center hover:border-primary/40 transition-all duration-300"
          >
            <div className="font-display font-bold text-2xl sm:text-3xl text-gradient mb-1">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm font-semibold mb-1">{stat.label}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              {stat.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LimitedEditionSection;