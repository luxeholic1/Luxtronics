import { Link } from "react-router-dom";
import { ArrowRight, Zap, Star, Shield } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LimitedEdition = () => {
  const limitedProducts = [
    {
      id: 1,
      title: "Pro Laptops",
      subtitle: "up to 30% off",
      description: "Powerful workstations for creators and professionals",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
      color: "from-blue-500/20 to-purple-500/20",
      textColor: "text-blue-400",
      badge: "LIMITED EDITION",
      link: "/shop?cat=laptops",
    },
    {
      id: 2,
      title: "NEW DROP",
      subtitle: "Capture the extraordinary",
      description: "Latest camera gear and photography equipment",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
      color: "from-amber-500/20 to-red-500/20",
      textColor: "text-amber-400",
      badge: "JUST LAUNCHED",
      link: "/shop?cat=cameras",
    },
    {
      id: 3,
      title: "Audio Elite",
      subtitle: "Immersive sound experience",
      description: "Premium headphones and speakers for audiophiles",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w-1200&auto=format&fit=crop",
      color: "from-emerald-500/20 to-cyan-500/20",
      textColor: "text-emerald-400",
      badge: "EXCLUSIVE",
      link: "/shop?cat=audio",
    },
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden bg-limited bg-cover bg-center section-bg-overlay" ref={useRef(null)}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Tech grid pattern */}
      <motion.div 
        className="absolute inset-0 opacity-30 dark:opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0 0', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Animated blob background */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-radial from-primary/5 via-transparent to-transparent"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className="container relative z-10">
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
              Exclusive Collections
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
            <span className="text-gradient">Limited Edition</span> Drops
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Discover exclusive products with special pricing. Limited quantities available.
          </p>
        </motion.div>

        {/* Product cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {limitedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <Link
                to={product.link}
                className="block h-full rounded-3xl overflow-hidden border border-border bg-gradient-card hover:border-primary/40 transition-all duration-500 hover:shadow-elegant"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Image container */}
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <motion.img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover will-change-transform"
                    whileHover={{ scale: 1.15 }}
                    initial={{ scale: 1 }}
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      <Star className="h-2.5 w-2.5" />
                      {product.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <div className="mb-3">
                    <h3 className={`font-display font-bold text-xl sm:text-2xl ${product.textColor} mb-1`}>
                      {product.title}
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-foreground">
                      {product.subtitle}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">2-Year Warranty</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Fast Shipping</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Shop now
                    </span>
                    <div className="h-10 w-10 rounded-full bg-secondary group-hover:bg-gradient-brand flex items-center justify-center transition-all duration-300 group-hover:shadow-glow">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold hover:border-primary/40 hover:bg-background transition-all duration-300 hover:shadow-elegant"
          >
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LimitedEdition;