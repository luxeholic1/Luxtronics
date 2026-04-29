import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Privacy <span className="text-gradient">policy</span>
        </h1>
      </section>

      <section className="container pb-24 space-y-6">
        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Information we collect</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We collect details you provide during account creation, checkout, and support communication. We also collect
            basic device and usage data to improve site performance and reliability.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">How we use your information</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Data is used to process orders, provide support, communicate updates, and prevent fraud. We do not sell
            personal data to third parties.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-semibold text-lg">Your rights</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            You may request access, correction, or deletion of your personal data by contacting support.
          </p>
        </article>
      </section>
    </Layout>
  );
};

export default Privacy;
