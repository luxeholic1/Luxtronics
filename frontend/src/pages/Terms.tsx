import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="container pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Terms of <span className="text-gradient">service</span>
        </h1>
      </section>

      <section className="container pb-16 sm:pb-20 lg:pb-24 space-y-6">
        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Acceptance of Terms</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            By accessing and using Luxtronics website and services, you accept and agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our website or services.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Use of Website</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            By using this website, you agree to use it lawfully and refrain from actions that disrupt services,
            compromise security, or violate applicable regulations. You must be at least 18 years old to make purchases 
            on our website.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Cookies and Tracking Technologies</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Our website uses cookies and similar tracking technologies to enhance your browsing experience and analyze 
            website traffic. By using our website, you consent to the use of cookies in accordance with our Privacy Policy.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We use Google Analytics to collect information about how visitors use our site. This data helps us improve 
            our services and user experience. You can opt-out of Google Analytics tracking by installing the{" "}
            <a 
              href="https://tools.google.com/dlpage/gaoptout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Account Registration</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            When you create an account with us, you must provide accurate, complete, and current information. You are 
            responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
            under your account.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Orders and Pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Product availability and pricing may change without prior notice. We reserve the right to cancel orders in
            case of pricing errors, payment issues, or fraud risk. All prices are listed in the local currency of your 
            selected region (INR for India, AUD for Australia, NZD for New Zealand).
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            By placing an order, you agree to pay the total amount including product price, shipping fees, and applicable 
            taxes. Payment is processed securely through our payment partners.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Shipping and Delivery</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We ship to India, Australia, and New Zealand. Delivery times vary by location and product availability. 
            We are not responsible for delays caused by customs, weather, or carrier issues beyond our control.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Returns and Refunds</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We offer a 30-day return policy for most products. Items must be in original condition with all packaging 
            and accessories. Refunds will be processed to the original payment method within 7-10 business days after 
            we receive the returned item. Please refer to our Shipping & Returns page for detailed information.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Warranty</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            All products come with a 2-year manufacturer warranty unless otherwise stated. Warranty claims must be 
            submitted with proof of purchase. Warranty does not cover damage caused by misuse, accidents, or unauthorized 
            modifications.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Intellectual Property</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            All content on this website, including text, images, logos, and software, is the property of Luxtronics or 
            its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or create 
            derivative works without our express written permission.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Third-Party Services</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Our website may contain links to third-party websites and services, including payment processors, shipping 
            carriers, and analytics providers. We are not responsible for the content, privacy practices, or terms of 
            service of these third parties. Your use of third-party services is subject to their respective terms.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Limitation of Liability</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We provide services on a best-effort basis and are not liable for indirect, incidental, special, or consequential 
            damages arising from website usage, downtime, or third-party service interruptions. Our total liability shall 
            not exceed the amount paid by you for the product or service in question.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Indemnification</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            You agree to indemnify and hold Luxtronics harmless from any claims, damages, losses, or expenses arising 
            from your use of our website, violation of these terms, or infringement of any third-party rights.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Governing Law</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            These Terms of Service are governed by the laws of the jurisdiction in which you are located (India, Australia, 
            or New Zealand). Any disputes shall be resolved in the courts of the applicable jurisdiction.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Changes to Terms</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon 
            posting on this page. Your continued use of our website after changes are posted constitutes acceptance of the 
            modified terms. We recommend reviewing this page periodically.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Contact Information</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            If you have any questions about these Terms of Service, please contact us through our{" "}
            <a href="/contact" className="text-primary hover:underline">Contact page</a> or email us at support@luxtronics.in
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <p className="text-xs text-muted-foreground">
            <strong>Last Updated:</strong> May 15, 2026
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            By using Luxtronics, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service 
            and our Privacy Policy.
          </p>
        </article>
      </section>
    </Layout>
  );
};

export default Terms;
