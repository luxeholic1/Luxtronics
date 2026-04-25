import Layout from "@/components/Layout";

const faqs = [
  {
    q: "How long does delivery usually take?",
    a: "Standard delivery takes 3-7 business days depending on your location. Express options are available at checkout in eligible regions.",
  },
  {
    q: "Can I return a product if I change my mind?",
    a: "Yes. Most products are eligible for return within 30 days in original condition with packaging and proof of purchase.",
  },
  {
    q: "Do your products come with warranty?",
    a: "Yes. Warranty coverage depends on product category and brand. Warranty details are listed on each product page.",
  },
  {
    q: "How can I track my order?",
    a: "After dispatch, you will receive tracking details by email and SMS. You can also contact support for live status updates.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support major cards, UPI in supported regions, and selected digital wallets based on availability.",
  },
];

const FAQ = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Support</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Frequently asked <span className="text-gradient">questions</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Quick answers to common questions around shipping, returns, payments, and support.
        </p>
      </section>

      <section className="container pb-24 space-y-4">
        {faqs.map((item) => (
          <article key={item.q} className="rounded-2xl border border-border bg-gradient-card p-6">
            <h2 className="font-semibold text-lg">{item.q}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
};

export default FAQ;
