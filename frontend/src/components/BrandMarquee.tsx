const brands = ["APPLE", "SONY", "SAMSUNG", "BOSE", "DJI", "CANON", "LOGITECH", "DYSON", "GOPRO", "JBL"];

const BrandMarquee = () => {
  return (
    <section className="border-y border-border py-10 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((b, i) => (
          <span
            key={i}
            className="mx-12 font-display font-bold text-3xl text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
