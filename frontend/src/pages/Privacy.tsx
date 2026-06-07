import type { MouseEvent } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const Privacy = () => {
  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Privacy Policy",
    "description": "Official privacy policy statement of Luxtronics explaining data handling and security protocols across India, Australia, and New Zealand.",
    "publisher": {
      "@type": "Organization",
      "name": "Luxtronics",
      "url": "https://luxtronics.in",
      "logo": "https://luxtronics.in/logo.png"
    },
    "mainEntity": {
      "@type": "ContactPoint",
      "email": "support@luxtronics.in",
      "telephone": "+91-92664-33722",
      "contactType": "customer support"
    }
  };

  return (
    <Layout hideBreadcrumb>

      <SEO
        title="Privacy Policy"
        description="Luxtronics privacy policy. Learn how we securely handle, protect, and process your personal data across India, Australia, and New Zealand under GDPR & IT Act."
        keywords="luxtronics privacy policy, data protection, personal data, ecommerce privacy, shopping security"
        url="/privacy"
        type="article"
        modifiedTime="2026-06-06T12:00:00+05:30"
        structuredData={privacySchema}
      />

      {/* Hero Section */}
      <section className="container pt-12 pb-12 border-b border-border/60 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal & Transparency</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container py-16 max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-1 block">
          <div className="sticky top-24 p-5 rounded-2xl border border-border bg-gradient-card">
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Quick Navigation</h3>
            <nav className="space-y-2.5 text-xs font-medium text-muted-foreground">
              <a href="#who-we-are" onClick={(e) => scrollToSection(e, "who-we-are")} className="block hover:text-primary transition-colors">1. Who We Are</a>
              <a href="#info-collect" onClick={(e) => scrollToSection(e, "info-collect")} className="block hover:text-primary transition-colors">2. Information We Collect</a>
              <a href="#how-use" onClick={(e) => scrollToSection(e, "how-use")} className="block hover:text-primary transition-colors">3. How We Use Data</a>
              <a href="#cookies" onClick={(e) => scrollToSection(e, "cookies")} className="block hover:text-primary transition-colors">4. Cookies & Analytics</a>
              <a href="#sharing" onClick={(e) => scrollToSection(e, "sharing")} className="block hover:text-primary transition-colors">5. Data Sharing</a>
              <a href="#retention" onClick={(e) => scrollToSection(e, "retention")} className="block hover:text-primary transition-colors">6. Data Retention</a>
              <a href="#rights" onClick={(e) => scrollToSection(e, "rights")} className="block hover:text-primary transition-colors">7. Your Rights</a>
              <a href="#security" onClick={(e) => scrollToSection(e, "security")} className="block hover:text-primary transition-colors">8. Data Security</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="block hover:text-primary transition-colors">9. Contact Us</a>
            </nav>
          </div>
        </aside>

        {/* Content Articles */}
        <div className="lg:col-span-3 space-y-8 max-w-3xl">

          <article id="who-we-are" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">1. Who We Are & Operations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luxtronics (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the verified e-commerce platforms luxtronics.in, luxtronics.com.au, and luxtronics.co.nz.
              We are an authorized electronics retailer dedicated to delivering premium gadgets and lifestyle technology to customers across India, Australia, and New Zealand.
            </p>
            <p className="mt-4 pt-3 border-t border-border/50 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Corporate Contact:</strong>{" "}
              <a href="mailto:support@luxtronics.in" className="text-primary hover:underline">support@luxtronics.in</a> | +91 92664 33722
            </p>
          </article>

          <article id="info-collect" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">2. Information We Collect</h2>
            <p className="text-sm text-muted-foreground mb-4">We collect information to provide better services to all our users. Here is what we track:</p>

            <div className="overflow-x-auto rounded-xl border border-border/80 mb-4">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-muted/40 text-xs text-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">What We Collect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-medium text-foreground">Account Data</td>
                    <td className="p-3">Name, verified email address, encrypted password hash.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Order & Logistics</td>
                    <td className="p-3">Billing and shipping addresses, telephone number, preferred payment method token.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Technical Tracking</td>
                    <td className="p-3">Pages visited, device architecture, browser version, search logs, anonymized IP.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed border-border">
              <strong className="text-foreground">Payment Security Note:</strong> We do <strong className="text-foreground">not</strong> collect or store credit/debit card numbers on our servers. All monetary transactions are safely routed through PCI-DSS compliant secure payment gateways.
            </p>
          </article>

          <article id="how-use" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">3. How We Process Your Information</h2>
            <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed list-disc pl-5 marker:text-primary">
              <li>To process, pack, and securely fulfill your product orders.</li>
              <li>To dispatch instantaneous order tracking status, digital invoices, and confirmations.</li>
              <li>To address customer service tickets and technical support requests efficiently.</li>
              <li>To optimize website speed, category layouts, and personalized product recommendations.</li>
              <li>To monitor potential malicious activity, mitigate commercial fraud, and maintain platform firewall integrity.</li>
              <li>To share optional, curated promotional offers (you hold full rights to opt-out via the unsubscribe link at any time).</li>
            </ul>
          </article>

          <article id="cookies" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">4. Cookies, Tracking & Third-Party Analytics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We leverage analytical cookies and operational scripts to elevate browsing fluidness and measure multi-region site performance.
            </p>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Google Analytics (GA4):</strong> We implement GA4 to parse user traffic trends.
                Data points remain strictly anonymized (including masked IP addresses). Google processes this traffic in absolute compliance with the{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Privacy Policy
                </a>.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Google Merchant Center:</strong> We sync standard, public product feeds (pricing, title, image assets) with Google Shopping channels. No individual client identifier or profile data is shared.
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl">
              You can reject Google Analytics tracking via the official{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Google Tracking Opt-out Add-on
              </a>.
            </p>
          </article>

          <article id="sharing" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">5. Zero-Data Selling & Sharing Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luxtronics maintains a strict anti-spam stance. We <strong className="text-foreground">never sell or rent</strong> customer databases to third-party brokers. Controlled data exchange occurs only with core service partners:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5 marker:text-primary">
              <li><strong className="text-foreground">Payment Gateways</strong> (To safely authorize transactions)</li>
              <li><strong className="text-foreground">Logistics & Shipping Aggregators</strong> (To safely dispatch physical parcels)</li>
              <li><strong className="text-foreground">Cloud Architecture (Firebase/Google)</strong> (For catalog performance scaling)</li>
            </ul>
          </article>

          <article id="retention" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">6. Data Retention Timelines</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Financial data and invoice history are retained for <span className="text-foreground font-medium">7 years</span> in compliance with Indian corporate tax frameworks. Standard accounts persist until a user files a formal deletion demand.
            </p>
          </article>

          <article id="rights" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">7. Your Global Privacy Rights</h2>
            <p className="text-sm text-muted-foreground mb-3">Whether browsing from India, AU, or NZ, you hold the following rights over your data:</p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5 mb-4 marker:text-primary">
              <li><strong className="text-foreground">Access & Portability:</strong> Obtain a structured copy of your profile parameters.</li>
              <li><strong className="text-foreground">Correction:</strong> Promptly rectify inaccurate or dated contact logs.</li>
              <li><strong className="text-foreground">Erasure:</strong> Request absolute wiping of your unlinked profile logs.</li>
            </ul>
            <p className="text-sm text-muted-foreground pt-3 border-t border-border/50">
              To trigger any privacy rights, reach out to our team at{" "}
              <a href="mailto:support@luxtronics.in" className="text-primary hover:underline font-medium">support@luxtronics.in</a>.
            </p>
          </article>

          <article id="security" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">8. Encryption & Security Mandate</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All interactions between your browser and our nodes are guarded via modern <strong className="text-foreground">SSL/TLS encryption</strong>. Client passwords are run through one-way cryptographic hashing functions ensuring zero plaintext exposure.
            </p>
          </article>

          <article id="contact" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <h2 className="font-semibold text-xl mb-3 text-foreground">9. Contact Our Grievance Desk</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              For security reports, compliance questionnaires, or data access actions, contact us here:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Email:</strong>{" "}
                <a href="mailto:support@luxtronics.in" className="text-primary hover:underline">support@luxtronics.in</a>
              </p>
              <p><strong className="text-foreground">Corporate Line:</strong> +91 92664 33722</p>
              <p><strong className="text-foreground">Official WhatsApp Support:</strong>{" "}
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

export default Privacy;
