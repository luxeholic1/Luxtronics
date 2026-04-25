import Layout from "@/components/Layout";
import { Sparkles, ShieldCheck, Truck, Headphones } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">About</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Built for modern <span className="text-gradient">tech shopping</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          Luxtronics helps people discover reliable electronics faster. We curate products, simplify decision-making,
          and support buyers with clear policies and responsive service.
        </p>
      </section>

      <section className="container pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Sparkles, title: "Curated Selection", text: "Handpicked products across audio, wearables, laptops, and gaming." },
          { icon: ShieldCheck, title: "Trust First", text: "Verified sellers, transparent pricing, and straightforward warranty guidance." },
          { icon: Truck, title: "Fast Delivery", text: "Streamlined fulfillment with clear shipping timelines and updates." },
          { icon: Headphones, title: "Real Support", text: "Human support team focused on solving issues quickly." },
        ].map((item) => (
          <article key={item.title} className="rounded-3xl border border-border bg-gradient-card p-6">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
              <item.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="container pb-24">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 sm:p-10">
          <h2 className="font-display font-bold text-3xl">Our mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
            Technology should feel exciting, not overwhelming. Our mission is to make product discovery and purchase
            confidence simple for everyone, whether you are upgrading your home office or buying your first premium gadget.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
