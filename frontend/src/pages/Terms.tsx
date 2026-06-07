import type { MouseEvent } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const Terms = () => {
  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "Official terms and conditions governing the use of Luxtronics retail platforms across India, Australia, and New Zealand.",
    "publisher": {
      "@type": "Organization",
      "name": "Luxtronics",
      "url": "https://luxtronics.in"
    }
  };

  return (
    <Layout hideBreadcrumb>
      <SEO
        title="Terms of Service"
        description="Read the official Terms of Service for Luxtronics. Understand our regulations regarding order cancellations, secure checkouts, shipping policies, and intellectual property."
        keywords="luxtronics terms of service, user agreement, shopping terms, ecommerce conditions, legal clauses"
        url="/terms"
        type="article"
        modifiedTime="2026-06-06T12:00:00+05:30"
        structuredData={termsSchema}
      />

      <section className="relative overflow-hidden bg-background pt-16 pb-20 border-b border-border">
        <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="container relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal Guidelines</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Terms and conditions for using Luxtronics services.</p>
            <p className="mt-2 text-xs text-muted-foreground/80">Last updated: May 15, 2026</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="/og-image.jpg"
              alt="Luxtronics Premium Audio"
              className="w-64 h-64 object-contain animate-pulse-slow filter drop-shadow-[0_0_30px_rgba(var(--primary),0.2)]"
            />
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="container py-16 max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Sticky Table of Contents */}
        <aside className="lg:col-span-1 block">
          <div className="sticky top-24 p-5 rounded-2xl border border-border bg-gradient-card">
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Quick Navigation</h3>
            <nav className="space-y-2.5 text-xs font-medium text-muted-foreground">
              <a href="#acceptance" onClick={(e) => scrollToSection(e, "acceptance")} className="block hover:text-primary transition-colors">1. Acceptance of Terms</a>
              <a href="#use" onClick={(e) => scrollToSection(e, "use")} className="block hover:text-primary transition-colors">2. Use of Website</a>
              <a href="#accounts" onClick={(e) => scrollToSection(e, "accounts")} className="block hover:text-primary transition-colors">3. Account Registration</a>
              <a href="#orders" onClick={(e) => scrollToSection(e, "orders")} className="block hover:text-primary transition-colors">4. Orders & Pricing</a>
              <a href="#shipping" onClick={(e) => scrollToSection(e, "shipping")} className="block hover:text-primary transition-colors">5. Shipping & Delivery</a>
              <a href="#returns" onClick={(e) => scrollToSection(e, "returns")} className="block hover:text-primary transition-colors">6. Returns & Refunds</a>
              <a href="#intellectual" onClick={(e) => scrollToSection(e, "intellectual")} className="block hover:text-primary transition-colors">7. Intellectual Property</a>
              <a href="#liability" onClick={(e) => scrollToSection(e, "liability")} className="block hover:text-primary transition-colors">8. Limitation of Liability</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="block hover:text-primary transition-colors">9. Contact Info</a>
            </nav>
          </div>
        </aside>

        {/* Policy Articles */}
        <div className="lg:col-span-3 space-y-8 max-w-3xl">

          <article id="acceptance" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using the Luxtronics website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our website or services.
            </p>
          </article>

          <article id="use" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">2. Use of Website & Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using this website, you agree to use it lawfully and refrain from actions that disrupt services, compromise security, or violate applicable regulations. You must be at least <span className="text-foreground font-medium">18 years old</span> to execute financial transactions on our platform.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Our website uses cookies to improve browsing, analytics, and service quality. For detailed opt-out information regarding Google Analytics tracking, please consult our official{" "}
              <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
            </p>
          </article>

          <article id="accounts" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">3. Account Registration & Credentials</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When creating an account with us, you must provide valid and current information. You are responsible for keeping your login credentials confidential and for all activity under your account.
            </p>
          </article>

          <article id="orders" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">4. Orders, Pricing & Local Currencies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Product availability and pricing may change without prior notice. We reserve the right to cancel orders due to pricing errors, payment issues, processing errors, or fraud risk.
            </p>

            {/* Currency Mapping Box */}
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground">
              <strong className="text-foreground block mb-1">Supported Currencies by Region:</strong>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">India:</strong> INR (Indian Rupee)</li>
                <li><strong className="text-foreground">Australia:</strong> AUD (Australian Dollar)</li>
                <li><strong className="text-foreground">New Zealand:</strong> NZD (New Zealand Dollar)</li>
              </ul>
            </div>
          </article>

          <article id="shipping" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">5. Shipping & Global Delivery Nodes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We ship to India, Australia, and New Zealand. Delivery times vary by location, product availability, customs clearance, carrier performance, holidays, and circumstances outside our control.
            </p>
          </article>

          <article id="returns" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">6. Returns, Refunds & Coverage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Return eligibility is evaluated based on product type, condition, packaging, accessories, and supplier or brand policy. Damage caused by misuse, accidents, unauthorized modification, or improper handling may not be covered.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              For complete details, please visit our designated{" "}
              <a href="/shipping-returns" className="text-primary hover:underline font-medium">Shipping & Returns</a> desk page.
            </p>
          </article>

          <article id="intellectual" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">7. Intellectual Property & Brand Assets</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All content on this website, including text, images, logos, software, layouts, and brand assets, is owned by Luxtronics or its licensors. You may not copy, distribute, modify, or reuse these assets without written permission.
            </p>
          </article>

          <article id="liability" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">8. Limitation of Liability & Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We provide services on a best-effort basis and are not liable for indirect, incidental, special, or consequential damages arising from website usage, downtime, delivery delays, or third-party service interruptions. These terms are governed by the applicable laws of your transaction region.
            </p>
          </article>

          <article id="contact" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">9. Contact Compliance Desk</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              For questions regarding these terms, legal notices, or service issues, contact us through these channels:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Email Notice:</strong>{" "}
                <a href="mailto:support@luxtronics.in" className="text-primary hover:underline">support@luxtronics.in</a>
              </p>
              <p><strong className="text-foreground">Corporate Line:</strong> +91 92664 33722</p>
              <p><strong className="text-foreground">Compliance WhatsApp Desk:</strong>{" "}
                <a href="https://wa.me/919266433722" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  +91 92664 33722
                </a>
              </p>
            </div>
          </article>

        </div>
      </section>
    </Layout>
  );
};

export default Terms;
