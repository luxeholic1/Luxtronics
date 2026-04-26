import Layout from "@/components/Layout";
import { Sparkles, ShieldCheck, Truck, Headphones } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">About</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Our Story: <span className="text-gradient">Where Innovation Meets Identity</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          At Luxtonics.in, we believe that technology is more than just a collection of circuits, pixels, and glass.
          It is an extension of who you are and how you navigate the world.
        </p>
        <p className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">
          We started Luxtonics with a singular vision: to curate a digital experience that bridges the gap between
          high-performance technology and refined lifestyle aesthetics. We are not interested in selling gadgets just
          for the sake of specs. We are here to provide the tools that empower your ambitions, simplify your rhythm,
          and elevate your personal brand.
        </p>
      </section>

      <section className="container pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            icon: Sparkles,
            title: "Intentional Choices",
            text: "In a world of endless options, we build for people who choose what they use with intention.",
          },
          {
            icon: ShieldCheck,
            title: "Identity Through Tech",
            text: "Every device you pick reflects high-end thinking and intelligent decision-making.",
          },
          {
            icon: Truck,
            title: "Performance + Aesthetics",
            text: "Our collection is curated for products that look as sharp as they perform every day.",
          },
          {
            icon: Headphones,
            title: "Tools That Empower",
            text: "From wearable tech to workspace upgrades, we focus on products that elevate your rhythm.",
          },
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
          <h2 className="font-display font-bold text-3xl">The Luxtonics Philosophy</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
            At Luxtonics, we stop talking about the product and start talking about you. When you choose a device from
            our collection, you are not just buying hardware. You are signaling to the world that you are a person who
            makes intelligent, high-end decisions and curates life with gear that performs as strongly as it presents.
          </p>
          <h3 className="mt-8 font-display font-bold text-2xl">Our Promise</h3>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">
            Whether you are upgrading your workspace or leveling up your everyday carry, we ensure every product on our
            platform meets high standards of quality, design, and innovation. We do not just deliver electronics; we
            deliver the competitive edge.
          </p>
          <p className="mt-6 text-lg font-semibold tracking-wide">
            Luxtonics. Smart, By Choice.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
