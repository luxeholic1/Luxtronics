type Brand = { name: string; logo: string };

const defaultBrands: Brand[] = [
  { name: "Apple", logo: "/brands/Apple_logo_black.svg" },
  { name: "Sony", logo: "/brands/Sony_logo.svg" },
  { name: "Samsung", logo: "/brands/Samsung_Black_icon.svg" },
  { name: "Bose", logo: "/brands/Bose_logo.svg" },
  { name: "Canon", logo: "/brands/Canon_logo.svg" },
  { name: "Logitech", logo: "/brands/Logitech_Logo_2012.svg" },
  { name: "Dyson", logo: "/brands/Dyson_logo.svg" },
  { name: "JBL", logo: "/brands/JBL-Logo.svg" },
];

const BrandMarquee = ({
  brands = defaultBrands,
  eyebrow = "Brand accessories",
  title = "We sell accessories for top brands, trusted for quality and performance.",
  compact = false,
}: {
  brands?: Brand[];
  eyebrow?: string;
  title?: string;
  compact?: boolean;
}) => {
  return (
    <section className={`w-full overflow-hidden border-y border-border/70 bg-background ${compact ? "py-6 sm:py-8" : "py-8 sm:py-10 md:py-12"}`}>
      <div className={`mx-auto flex max-w-[1400px] flex-col gap-2 px-5 text-center sm:px-8 ${compact ? "mb-5" : "mb-6 sm:mb-8"}`}>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h2 className={`font-display font-bold tracking-tight text-foreground ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl md:text-4xl"}`}>
          {title}
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className={`mx-2 inline-flex items-center justify-center rounded-2xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:mx-3 sm:px-5 ${compact ? "min-w-[160px] sm:min-w-[190px] sm:py-3" : "min-w-[180px] sm:min-w-[210px] sm:py-4"}`}
              itemProp="brand"
            >
              <div className={`flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] ${compact ? "h-14" : "h-16"}`}>
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className={`object-contain ${compact ? "max-h-8 max-w-[124px]" : "max-h-9 max-w-[140px]"}`}
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
