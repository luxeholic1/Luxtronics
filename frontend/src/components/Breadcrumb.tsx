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

  return (
    <nav
      className="w-full py-3 sm:py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] mx-auto"
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
                <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              {isLast ? (
                <span
                  className={cn(
                    "font-medium text-foreground line-clamp-1",
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
                    "text-muted-foreground hover:text-foreground transition-colors line-clamp-1",
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
    </nav>
  );
};

export default Breadcrumb;