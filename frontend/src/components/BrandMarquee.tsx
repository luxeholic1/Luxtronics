  const brands = [
  { name: "Apple", logo: "/brands/Apple_logo_black.svg" },
  { name: "Sony", logo: "/brands/Sony_logo.svg" },
  { name: "Samsung", logo: "/brands/Samsung_Black_icon.svg" },
  { name: "Bose", logo: "/brands/Bose_logo.svg" },
  { name: "Canon", logo: "/brands/Canon_logo.svg" },
  { name: "Logitech", logo: "/brands/Logitech_Logo_2012.svg" },
  { name: "Dyson", logo: "/brands/Dyson_logo.svg" },
  { name: "JBL", logo: "/brands/JBL-Logo.svg" },
];

const BrandMarquee = () => {
  return (
    <section className="w-full overflow-hidden border-y border-border/70 bg-background py-8 sm:py-10 md:py-12">
      <div className="mx-auto mb-6 flex max-w-[1400px] flex-col gap-2 px-5 text-center sm:mb-8 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Brand accessories</p>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          We sell accessories from top brands, trusted for quality and performance.
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="mx-2 inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:mx-3 sm:min-w-[210px] sm:px-5 sm:py-4"
              itemProp="brand"
            >
              <div className="flex h-16 w-full items-center justify-center rounded-xl bg-white px-5 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="max-h-9 max-w-[140px] object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
