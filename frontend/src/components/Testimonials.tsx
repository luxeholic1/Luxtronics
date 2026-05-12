import { Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "Sarah Anderson",
    role: "Product Designer",
    content: "Luxtronics is my go-to for premium tech. The curation is exceptional and delivery is always on point.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Raj Patel",
    role: "Entrepreneur",
    content: "The quality of products and customer service is unmatched. Highly recommend for anyone serious about tech.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raj",
  },
  {
    name: "Emma Chen",
    role: "Content Creator",
    content: "Fast shipping, authentic products, and amazing packaging. Every purchase feels special.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
];

const Testimonials = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden w-full relative bg-testimonials bg-cover bg-center section-bg-overlay" ref={ref}>
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
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-3">
            Customer Love
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight max-w-3xl mx-auto">
            What our <span className="text-gradient">customers</span> say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group rounded-2xl border border-border dark:border-border light:border-black/8 p-6 sm:p-8 bg-gradient-card hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/5 dark:via-transparent dark:to-accent/5 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-foreground leading-relaxed mb-6 font-medium">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
