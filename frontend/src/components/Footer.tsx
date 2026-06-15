import { Link } from "react-router-dom";
import { Zap, Instagram, Twitter, Youtube, Facebook } from "lucide-react";

// ── Update these URLs to your real social media pages ──────────────────────────
const SOCIAL_LINKS = [
  { Icon: Instagram, href: "https://www.instagram.com/luxtronics.in/", label: "Instagram" },
  { Icon: Twitter,   href: "https://x.com/luxtronics",                  label: "Twitter / X" },
  { Icon: Youtube,   href: "https://www.youtube.com/@luxtronics",       label: "YouTube" },
  { Icon: Facebook,  href: "https://www.facebook.com/luxtronics",       label: "Facebook" },
];

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Categories", to: "/categories" },
      { label: "Cart", to: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Shipping Information", to: "/shipping-returns" },
      { label: "Payment Method", to: "/payment-method" },
      { label: "Return Policy", to: "/return-exchange" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
];

const PAYMENT_LOGOS = [
  { label: "PayPal", src: "/brands/paypal-color-icon.svg" },
  { label: "Google Pay", src: "/brands/google-pay-acceptance-mark-icon.svg" },
  { label: "Mastercard", src: "/brands/master-card-icon.svg" },
  { label: "Visa", src: "/brands/visa-icon.svg" },
  { label: "Apple Pay", src: "/brands/apple-pay-icon.svg" },
  { label: "PayU", src: "/brands/payu-icon.svg" },
  { label: "UPI", src: "/brands/upi-icon.svg" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Organization schema for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Luxtronics",
    "url": "https://luxtronics.in",
    "logo": "https://luxtronics.in/logo.jpeg",
    "description": "Premium electronics curated for the next generation of creators and tech enthusiasts",
    "sameAs": [
      "https://instagram.com/luxtronics",
      "https://twitter.com/luxtronics",
      "https://youtube.com/@luxtronics"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Suite 2601, Tower 16, Lotus Boulevard, Sector 100",
      "addressLocality": "Noida",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "201304",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@luxtronics.in",
      "telephone": "+91-92664-33722",
      "availableLanguage": ["en", "hi"]
    }
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-black text-white sm:mt-32 lg:mt-40">
      {/* Organization schema */}
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("/footer.jpg")` }}
      />
      <div className="absolute inset-0 bg-black/68" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-white/14 bg-black/35 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:grid-cols-2 sm:gap-10 sm:p-8 lg:grid-cols-4 lg:gap-12 lg:p-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6 group">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-black tracking-tight text-white sm:text-xl lg:text-2xl">
              Lux<span className="text-gradient">tronics</span>
            </span>
          </Link>
          <p className="mb-6 max-w-sm text-sm leading-6 text-white/72">
            Premium electronics curated for the next generation of creators and tech enthusiasts.
          </p>
          <p className="mb-5 max-w-sm text-xs leading-5 text-white/55">
            Suite 2601, Tower 16, Lotus Boulevard, Sector 100, Noida 201304, Uttar Pradesh, India
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/70">
            Genuine Products
          </span>

          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/70">
           Secure Payments
           </span>

           <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/70">
             Worldwide Shipping
            </span>
           </div>
          <div className="flex gap-3 flex-wrap">
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${label}`}
                className="h-10 w-10 rounded-full border border-white/18 bg-white/10 flex items-center justify-center text-white/70 hover:border-white/35 hover:bg-white/18 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-display text-xs font-black uppercase tracking-[0.18em] text-white sm:mb-4 md:mb-5">
              {col.title}
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm font-medium text-white/68 transition-colors duration-200 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>

        

<div className="mt-5 rounded-2xl border border-white/14 bg-black/35 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gradient">Secure payments</p>
      <p className="mt-1 text-sm font-medium text-white/74">Trusted checkout options accepted at Luxtronics.</p>
    </div>
  
   <div className="flex flex-wrap gap-2.5 items-center justify-start sm:justify-end">
  {PAYMENT_LOGOS.map((logo) => {

    const isPayU = logo.label === "PayU";
    const isUPI = logo.label === "UPI";

    return (
      <div
        key={logo.label}
       
        className="flex h-11 w-[82px] items-center justify-center rounded-xl border border-black/10 bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.05)] transition-all hover:scale-105 hover:border-white/40 duration-200 shrink-0 overflow-hidden px-2"
        title={logo.label}
        aria-label={logo.label}
      >
        <img
          src={logo.src}
          alt={logo.label}
          loading="lazy"
          
          className={`h-full w-full object-contain filter select-none transition-transform ${
            isPayU || isUPI ? "scale-70" : "scale-[1.30]"
          }`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.innerHTML = `<span class="text-[10px] font-black tracking-tight text-black">${logo.label}</span>`;
          }}
        />
      </div>
    );
  })}
</div>
  </div>
</div>
      </div>
      
      <div className="relative z-10 border-t border-white/12 bg-black/14 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-4 px-4 py-6 text-center text-xs font-medium text-white/62 sm:flex-row sm:gap-6 sm:px-6 sm:py-8 sm:text-left md:px-8 lg:px-12 xl:px-16">
          <p>© {currentYear} Luxtronics. All rights reserved. Premium electronics for creators.</p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/payment-method" className="hover:text-white transition-colors">Payments</Link>
            <Link to="/faq" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
