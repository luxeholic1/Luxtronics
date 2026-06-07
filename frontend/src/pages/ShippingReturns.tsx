import type { MouseEvent } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const ShippingReturns = () => {
  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  const shippingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Shipping and Returns Policy",
    "description": "Luxtronics official shipping timelines, delivery coverage across India, Australia, NZ, and product return eligibility rules.",
    "publisher": {
      "@type": "Organization",
      "name": "Luxtronics",
      "url": "https://luxtronics.in"
    }
  };

  return (
    <Layout hideBreadcrumb>
      <SEO
        title="Shipping & Returns Policy"
        description="Understand Luxtronics shipping timelines, international coverage to AU/NZ, return eligibility criteria, and secure refund workflows."
        keywords="luxtronics shipping, delivery time, return policy, refund status, international shipping electronics"
        url="/shipping-returns"
        type="article"
        modifiedTime="2026-06-06T12:00:00+05:30"
        structuredData={shippingSchema}
      />



      {/* Main Layout with Sticky Navigation */}
      <section className="container py-16 max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-1 block">
          <div className="sticky top-24 p-5 rounded-2xl border border-border bg-gradient-card">
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">Policy Index</h3>
            <nav className="space-y-2.5 text-xs font-medium text-muted-foreground">
              <a href="#shipping-policy" onClick={(e) => scrollToSection(e, "shipping-policy")} className="block hover:text-primary transition-colors">1. Shipping Policy</a>
              <a href="#return-policy" onClick={(e) => scrollToSection(e, "return-policy")} className="block hover:text-primary transition-colors">2. Return Eligibility</a>
              <a href="#refund-workflow" onClick={(e) => scrollToSection(e, "refund-workflow")} className="block hover:text-primary transition-colors">3. Refund Workflow</a>
              <a href="#coverage" onClick={(e) => scrollToSection(e, "coverage")} className="block hover:text-primary transition-colors">4. Product Coverage</a>
              <a href="#initiate" onClick={(e) => scrollToSection(e, "initiate")} className="block hover:text-primary transition-colors">5. Initiate a Return</a>
            </nav>
          </div>
        </aside>

        {/* Content Node */}
        <div className="lg:col-span-3 space-y-8 max-w-3xl">

          {/* Shipping Policy */}
          <article id="shipping-policy" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">

              <h2 className="font-semibold text-xl text-foreground">1. Shipping & Dispatch Policy</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              We focus on safe, secure, and fast fulfillment. All shipments come with full tracking nodes sent straight to your communication channels once dispatched.
            </p>

            {/* Structured Logistics Table */}
            <div className="overflow-x-auto rounded-xl border border-border/80 mb-4">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-muted/40 text-xs text-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3">Region</th>
                    <th className="p-3">Shipping Tier</th>
                    <th className="p-3">Estimated Transit Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-medium text-foreground">India</td>
                    <td className="p-3">Standard / Express</td>
                    <td className="p-3">3–7 Business Days (Express available via PIN checkout)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Australia</td>
                    <td className="p-3">International Standard</td>
                    <td className="p-3">7–14 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">New Zealand</td>
                    <td className="p-3">International Standard</td>
                    <td className="p-3">7–14 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Return Policy */}
          <article id="return-policy" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">

              <h2 className="font-semibold text-xl text-foreground">2. Return Eligibility Matrix</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              To keep our premium standards high, returns are evaluated dynamically based on these strict conditions:
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed list-disc pl-5 marker:text-primary">
              <li>Items must remain <strong className="text-foreground">completely unused</strong>, housed inside their original unsealed packaging block.</li>
              <li>Every original asset—including manuals, protection wrappers, certificates, and peripheral accessories—must be inside the return box.</li>
              <li>A valid, verifiable Luxtronics original invoice/receipt token is mandatory for checking order history.</li>
              <li className="text-destructive-foreground font-medium list-none bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 mt-2">
                <strong className="text-foreground">Non-Returnable Goods:</strong> Personal hygiene products (like unsealed in-ear monitors/earbuds) and opened digital license keys or software packets cannot be returned under any conditions.
              </li>
            </ul>
          </article>

          {/* Refund Workflow */}
          <article id="refund-workflow" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">

              <h2 className="font-semibold text-xl text-foreground">3. Refund Processing & Timelines</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once your package rolls into our inspection warehouse, it goes through a physical quality assurance check. Approved refunds are fired back directly to your original channel node:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5 marker:text-primary">
              <li><strong className="text-foreground">Prepaid Gateways (UPI, Cards, NetBanking):</strong> Sent back to the sourcing financial node within 5-7 business days post-approval.</li>
              <li><strong className="text-foreground">Cash on Delivery (COD):</strong> Our grievance desk coordinates directly to wire the balance securely to your verified bank account or UPI address.</li>
              <li>Original shipping fees are strictly non-refundable unless the product is certified as factory defective by our labs.</li>
            </ul>
          </article>

          {/* Product Coverage */}
          <article id="coverage" className="scroll-mt-24 rounded-2xl border border-border bg-gradient-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">

              <h2 className="font-semibold text-xl text-foreground">4. Manufacturer & Brand Product Coverage</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hardware coverage parameters follow individual supplier clauses and brand blueprints.
            </p>
            <p className="mt-3 text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
              <strong className="text-foreground">Exclusion Parameters:</strong> Physical fractures, liquid corrosion, electric surges from unstable adapters, and custom technical modifications done outside authorized centers completely void any platform coverage support.
            </p>
          </article>

          {/* Action Box: Need to initiate a return */}
          <article id="initiate" className="scroll-mt-24 rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-background to-muted/30 p-8 text-center shadow-lg">
            <h2 className="font-display font-bold text-2xl mb-2 text-foreground">Need to initiate a return?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Contact our global support desks with your unique order identifier. We will generate your shipping slip and guide you right through the return cycle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:support@luxtronics.in"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-md"
              >
                Email Support
              </a>
              <a
                href="https://wa.me/919266433722"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-border bg-gradient-card text-foreground font-medium text-sm px-6 py-3 rounded-xl hover:bg-muted transition-all"
              >
                WhatsApp Chat
              </a>
            </div>
          </article>

        </div>
      </section>
    </Layout>
  );
};

export default ShippingReturns;
