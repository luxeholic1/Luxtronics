const brands = ["APPLE", "SONY", "SAMSUNG", "BOSE", "DJI", "CANON", "LOGITECH", "DYSON", "GOPRO", "JBL"];

const BrandMarquee = () => {
  return (
    <section className="border-y border-border dark:border-border light:border-black/8 py-8 sm:py-10 md:py-12 overflow-x-hidden w-full">
      <div className="flex animate-marquee whitespace-nowrap gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        {[...brands, ...brands].map((b, i) => (
          <span
            key={i}
            className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 font-display font-bold text-2xl sm:text-3xl md:text-4xl text-muted-foreground/40 hover:text-primary transition-colors duration-300"
            itemProp="brand"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
