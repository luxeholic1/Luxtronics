import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const currentPath = pathnames[0] || "";

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...pathnames.map((path, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { label, href };
    }),
  ];

  if (breadcrumbItems.length <= 1) return null;

  const currentLabel = breadcrumbItems[breadcrumbItems.length - 1]?.label ?? "Luxtronics";

  const bannerMap: Record<string, { image: string; eyebrow: string; subtitle: string }> = {
    shop: {
      image: "/a1.jpg",
      eyebrow: "Shop Luxtronics",
      subtitle: "Browse premium electronics, accessories and everyday tech essentials.",
    },
    categories: {
      image: "/a2.jpg",
      eyebrow: "Curated categories",
      subtitle: "Find the right device, accessory or upgrade without the clutter.",
    },
    product: {
      image: "/a2.jpg",
      eyebrow: "Product details",
      subtitle: "Explore specs, pricing, warranty and availability before you buy.",
    },
    cart: {
      image: "/a6.jpg",
      eyebrow: "Your cart",
      subtitle: "Review your selected products and continue to secure checkout.",
    },
    checkout: {
      image: "/a6.jpg",
      eyebrow: "Checkout",
      subtitle: "Complete your order with local pricing and reliable delivery.",
    },
    account: {
      image: "/a3.jpg",
      eyebrow: "Account",
      subtitle: "Manage your profile, orders and Luxtronics shopping experience.",
    },
    blog: {
      image: "/a3.jpg",
      eyebrow: "Insights",
      subtitle: "Stories, buying guides and updates from the Luxtronics team.",
    },
    contact: {
      image: "/a3.jpg",
      eyebrow: "Support",
      subtitle: "Reach our team for orders, partnerships or product guidance.",
    },
    about: {
      image: "/a3.jpg",
      eyebrow: "About Luxtronics",
      subtitle: "Premium technology curated for people who choose with intention.",
    },
    faq: {
      image: "/a6.jpg",
      eyebrow: "Help center",
      subtitle: "Quick answers about shipping, returns, payments and warranty.",
    },
    privacy: {
      image: "/a6.jpg",
      eyebrow: "Policy",
      subtitle: "How Luxtronics handles your data and shopping privacy.",
    },
    terms: {
      image: "/a6.jpg",
      eyebrow: "Legal",
      subtitle: "Terms and conditions for using Luxtronics services.",
    },
    "shipping-returns": {
      image: "/a6.jpg",
      eyebrow: "Shipping & returns",
      subtitle: "Delivery, warranty and return information for your orders.",
    },
  };

  const banner = bannerMap[currentPath] ?? {
    image: "/a3.jpg",
    eyebrow: "Luxtronics",
    subtitle: "Premium electronics and accessories for modern lifestyles.",
  };

  return (
    <section className="relative isolate min-h-[260px] w-full overflow-hidden bg-black text-white sm:min-h-[310px] lg:min-h-[360px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${banner.image}")` }}
      />
      <div className="absolute inset-0 bg-black/46" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.24)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[260px] max-w-[1400px] items-center px-5 py-14 sm:min-h-[310px] sm:px-8 lg:min-h-[360px] lg:px-16">
        <div className="max-w-3xl rounded-[28px] border border-white/14 bg-white/[0.075] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-7 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/68">{banner.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {currentLabel}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">{banner.subtitle}</p>

          <nav
            className="mt-6"
            aria-label="Breadcrumb"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <li
                    key={item.href}
                    className="flex items-center gap-1.5 sm:gap-2"
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                  >
                    {index === 0 ? (
                      <Home className="h-3.5 w-3.5 text-white/52 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-white/44 flex-shrink-0" />
                    )}
                    {isLast ? (
                      <span
                        className={cn(
                          "font-semibold text-white line-clamp-1",
                          index === 0 && "ml-0.5 sm:ml-1"
                        )}
                        itemProp="name"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        to={item.href}
                        className={cn(
                          "text-white/58 hover:text-white transition-colors line-clamp-1",
                          index === 0 && "ml-0.5 sm:ml-1"
                        )}
                        itemProp="item"
                      >
                        <span itemProp="name">{item.label}</span>
                      </Link>
                    )}
                    <meta itemProp="position" content={(index + 1).toString()} />
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
      
      {/* Structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": `https://luxtronics.com${item.href}`,
            })),
          }),
        }}
      />
    </section>
  );
};

export default Breadcrumb;
