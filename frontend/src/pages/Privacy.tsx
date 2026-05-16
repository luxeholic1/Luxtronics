import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <Layout>
      <SEO
        title="Privacy Policy | Luxtronics"
        description="Luxtronics privacy policy. How we collect, use and protect your personal data. GDPR and Indian IT Act compliant."
        keywords="luxtronics privacy policy, data protection, personal data"
        url="https://luxtronics.in/privacy"
      />

      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Privacy <span className="text-gradient">Policy</span>
        </h1>
        <p className="mt-4 text-muted-foreground">Last updated: May 2026</p>
      </section>

      <section className="container pb-24 space-y-6 max-w-4xl">

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">1. Who We Are</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Luxtronics ("we", "us", "our") operates the websites luxtronics.in, luxtronics.com.au, and luxtronics.co.nz.
            We are an electronics retailer selling premium gadgets and electronics to customers in India, Australia, and New Zealand.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Contact:</strong> support@luxtronics.in | +91 92664 33722
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">2. Information We Collect</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li><strong className="text-foreground">Account data:</strong> Name, email address, password (encrypted)</li>
            <li><strong className="text-foreground">Order data:</strong> Billing address, shipping address, phone number, payment method type</li>
            <li><strong className="text-foreground">Usage data:</strong> Pages visited, products viewed, search queries, device type, browser</li>
            <li><strong className="text-foreground">Communication data:</strong> Messages sent via contact form or email</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            We do <strong className="text-foreground">not</strong> store full credit/debit card numbers. Payments are processed securely by WooCommerce and payment gateways.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">3. How We Use Your Information</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li>Process and fulfil your orders</li>
            <li>Send order confirmations, shipping updates, and invoices</li>
            <li>Provide customer support</li>
            <li>Improve our website and product listings</li>
            <li>Prevent fraud and ensure security</li>
            <li>Send promotional emails (only with your consent — you can unsubscribe anytime)</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">4. Cookies and Analytics</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience and analyse site traffic.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Google Analytics (GA4):</strong> We use Google Analytics to understand how visitors use our site.
            Google Analytics collects anonymised data including pages visited, time on site, and general location.
            IP addresses are anonymised before storage. Google may use this data in accordance with their{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Privacy Policy
            </a>.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Google Merchant Center:</strong> We share product data (name, price, image, availability) with
            Google Merchant Center to display our products in Google Shopping. This data is product information only — no personal customer data is shared.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You can opt out of Google Analytics tracking by installing the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">5. Data Sharing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do <strong className="text-foreground">not sell</strong> your personal data to third parties. We share data only with:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li><strong className="text-foreground">Payment processors</strong> (to complete transactions)</li>
            <li><strong className="text-foreground">Shipping partners</strong> (to deliver your order)</li>
            <li><strong className="text-foreground">Google Analytics</strong> (anonymised usage data)</li>
            <li><strong className="text-foreground">Google Merchant Center</strong> (product data only, no personal data)</li>
            <li><strong className="text-foreground">Firebase (Google)</strong> (product catalogue caching — no personal data)</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">6. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We retain your order data for 7 years as required by Indian tax law. Account data is retained until you request deletion.
            Analytics data is retained for 14 months (Google Analytics default).
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">7. Your Rights</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
            <li><strong className="text-foreground">Correction:</strong> Update incorrect or incomplete data</li>
            <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</li>
            <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing emails at any time</li>
            <li><strong className="text-foreground">Portability:</strong> Request your data in a machine-readable format</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            To exercise any of these rights, email us at{" "}
            <a href="mailto:support@luxtronics.in" className="text-primary hover:underline">support@luxtronics.in</a>.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">8. Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use SSL/TLS encryption for all data transmission. Passwords are hashed and never stored in plain text.
            Payment data is handled by PCI-DSS compliant payment processors. We regularly review our security practices.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">9. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our services are not directed to children under 13. We do not knowingly collect personal data from children.
            If you believe a child has provided us with personal data, please contact us immediately.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">10. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of significant changes via email or
            a prominent notice on our website. Continued use of our services after changes constitutes acceptance.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg mb-3">11. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For any privacy-related questions or requests:
          </p>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Email:</strong>{" "}
              <a href="mailto:support@luxtronics.in" className="text-primary hover:underline">support@luxtronics.in</a>
            </p>
            <p><strong className="text-foreground">Phone:</strong> +91 92664 33722</p>
            <p><strong className="text-foreground">WhatsApp:</strong>{" "}
              <a href="https://wa.me/919266433722" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                +91 92664 33722
              </a>
            </p>
          </div>
        </article>

      </section>
    </Layout>
  );
};

export default Privacy;
