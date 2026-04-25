import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Terms of <span className="text-gradient">service</span>
        </h1>
      </section>

      <section className="container pb-24 space-y-6">
        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Use of website</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            By using this website, you agree to use it lawfully and refrain from actions that disrupt services,
            compromise security, or violate applicable regulations.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Orders and pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Product availability and pricing may change without prior notice. We reserve the right to cancel orders in
            case of pricing errors, payment issues, or fraud risk.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Liability</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We provide services on a best-effort basis and are not liable for indirect or consequential losses arising
            from website usage, downtime, or third-party service interruptions.
          </p>
        </article>
      </section>
    </Layout>
  );
};

export default Terms;
