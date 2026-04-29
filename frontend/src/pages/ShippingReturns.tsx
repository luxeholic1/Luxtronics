import Layout from "@/components/Layout";

const ShippingReturns = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Policy</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Shipping & <span className="text-gradient">returns</span>
        </h1>
      </section>

      <section className="container pb-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <h2 className="font-display font-bold text-2xl">Shipping</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li>Standard shipping: 3-7 business days.</li>
            <li>Express shipping: 1-3 business days for eligible pin codes.</li>
            <li>Tracking link is shared once order is dispatched.</li>
            <li>Delivery timelines can vary during high-demand periods.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <h2 className="font-display font-bold text-2xl">Returns</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
            <li>Return window: 30 days from delivery date.</li>
            <li>Products must be unused with original packaging and invoice.</li>
            <li>Refunds are processed after quality check approval.</li>
            <li>Some accessories and hygiene products may be non-returnable.</li>
          </ul>
        </article>
      </section>
    </Layout>
  );
};

export default ShippingReturns;
