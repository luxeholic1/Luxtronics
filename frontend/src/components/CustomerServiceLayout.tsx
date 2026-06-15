import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

const SERVICE_LINKS = [
  { label: "About Luxtronics", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "FAQs", to: "/faq" },
  { label: "Shipping Information", to: "/shipping-returns" },
  { label: "Payment Method", to: "/payment-method" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Return Policy", to: "/return-exchange" },
];

type CustomerServiceLayoutProps = {
  title: string;
  eyebrow?: string;
  heroImage?: string;
  heroAlt?: string;
  children: ReactNode;
};

export default function CustomerServiceLayout({
  title,
  eyebrow = "Customer Service",
  heroImage = "/a1.jpg",
  heroAlt = "Luxtronics customer service and product support",
  children,
}: CustomerServiceLayoutProps) {
  const { pathname } = useLocation();

  return (
    <main className="bg-white text-neutral-950">
      <section className="mx-auto grid w-full max-w-[1800px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:px-14 xl:px-20">
        <aside className="min-w-0 lg:pt-2">
          <div className="lg:sticky lg:top-24">
            <h1 className="text-2xl font-semibold tracking-normal text-neutral-950">{eyebrow}</h1>
            <nav className="mt-8 grid gap-3 text-base sm:grid-cols-2 lg:mt-16 lg:block lg:space-y-8 lg:text-lg">
              {SERVICE_LINKS.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block min-w-0 rounded-sm py-1 leading-snug transition-colors ${
                      active ? "font-medium text-neutral-950" : "text-neutral-400 hover:text-neutral-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <div className="overflow-hidden">
            <img
              src={heroImage}
              alt={heroAlt}
              className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[460px]"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="mx-auto max-w-5xl py-10 sm:py-12">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">Luxtronics</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-neutral-950 sm:text-4xl">{title}</h2>
            <div className="mt-8 space-y-8 text-[15px] leading-8 text-neutral-500 sm:text-lg sm:leading-9">
              {children}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
