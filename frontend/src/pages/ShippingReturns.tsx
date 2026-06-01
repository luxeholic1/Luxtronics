import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Truck, RotateCcw, ShieldCheck, Clock, Package, Phone } from "lucide-react";

const ShippingReturns = () => {
  return (
    <Layout>
      <SEO
        title="Shipping & Returns Policy | Luxtronics"
        description="Free shipping on orders over ₹200. 30-day hassle-free returns with full refund. Learn about Luxtronics shipping times, return policy and warranty."
        keywords="luxtronics shipping policy, return policy, free shipping electronics, 30 day returns, refund policy"
        url="https://luxtronics.in/shipping-returns"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Shipping & Returns Policy",
          "url": "https://luxtronics.in/shipping-returns",
          "description": "Luxtronics shipping and returns policy. Free shipping, 30-day returns, full refunds.",
          "publisher": { "@type": "Organization", "name": "Luxtronics", "url": "https://luxtronics.in" }
        }}
      />

      <section className="container pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Policy</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Shipping & <span className="text-gradient">Returns</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          We want you to shop with confidence. Here's everything you need to know about our shipping and return policies.
        </p>
      </section>

      <section className="container pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Shipping */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Shipping Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Standard Shipping:</strong> 3–7 business days across India</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Express Shipping:</strong> 1–3 business days for eligible pin codes</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Free Shipping:</strong> On all orders above ₹200</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Tracking link sent via email and SMS once dispatched</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Delivery timelines may vary during peak seasons and holidays</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>International shipping available to Australia and New Zealand</span></li>
          </ul>
        </article>

        {/* Returns */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <RotateCcw className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Return Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Return Window:</strong> 30 days from the date of delivery</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Products must be unused, in original packaging with all accessories</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Original invoice/receipt required for all returns</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Refund processed within <strong className="text-foreground">5–7 business days</strong> after quality check</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Refund credited to original payment method (UPI, card, bank account)</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Hygiene products and opened software are non-returnable</span></li>
          </ul>
        </article>

        {/* Refund */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Refund Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Full Refund:</strong> If product is defective, damaged, or wrong item received</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Partial Refund:</strong> If product is returned with missing accessories</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>COD orders refunded via bank transfer within 7 business days</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Prepaid orders refunded to original payment source</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Shipping charges are non-refundable unless item is defective</span></li>
          </ul>
        </article>

        {/* Warranty */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Warranty</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">2-Year Warranty</strong> on all electronics from Luxtronics</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Warranty covers manufacturing defects and hardware failures</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Physical damage, water damage, and misuse are not covered</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Warranty claims processed within 10 business days</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Brand warranty (if applicable) is in addition to Luxtronics warranty</span></li>
          </ul>
        </article>
      </section>

      {/* Contact for returns */}
      <section className="container pb-24">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl mb-1">Need to initiate a return?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our support team within 30 days of delivery. We'll guide you through the process.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@luxtronics.in"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
            >
              Email Support
            </a>
            <a
              href="https://wa.me/919266433722?text=I%20want%20to%20initiate%20a%20return"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ShippingReturns;
