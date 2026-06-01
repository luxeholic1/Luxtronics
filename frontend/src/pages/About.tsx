import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { ArrowRight, CheckCircle2, Headphones, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Sparkles,
    title: "Curated, not crowded",
    text: "Every category is shaped around useful upgrades, reliable accessories and refined everyday tech.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-first sourcing",
    text: "We focus on products that balance performance, design, build quality and long-term practicality.",
  },
  {
    icon: Truck,
    title: "Built for modern buyers",
    text: "Clear browsing, fast discovery and dependable shopping support across essentials and premium gear.",
  },
  {
    icon: Headphones,
    title: "Support that understands tech",
    text: "From device compatibility to accessory selection, the experience is designed to feel simple.",
  },
];

const milestones = ["Premium electronics", "Mobile parts", "Accessories", "Smart wear", "Creator gear"];

const About = () => {
  return (
    <Layout>
      <SEO
        title="About Luxtronics — Premium Electronics Store"
        description="Luxtronics curates premium electronics for India, Australia and New Zealand. We bridge high-performance technology with refined lifestyle aesthetics."
        keywords="about luxtronics, premium electronics store, tech store India, electronics Australia"
        url="https://luxtronics.in/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Luxtronics",
          "url": "https://luxtronics.in/about",
          "description": "Luxtronics curates premium electronics for India, Australia and New Zealand.",
          "publisher": {
            "@type": "Organization",
            "name": "Luxtronics",
            "url": "https://luxtronics.in",
            "logo": { "@type": "ImageObject", "url": "https://luxtronics.in/logo.png" }
          }
        }}
      />

      <main className="bg-background">
        <section className="container py-10 sm:py-12 lg:py-14">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div className="rounded-2xl border border-border bg-card/85 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">About Luxtronics</p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Premium tech, selected with intention.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Luxtronics curates electronics, parts and accessories for people who want their devices to perform well,
                look refined and fit cleanly into everyday work, travel and lifestyle routines.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {milestones.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Shop products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Explore categories
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img src="/a3.jpg" alt="Premium electronics workspace" className="h-full min-h-[360px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Our philosophy</p>
                <p className="mt-2 font-display text-2xl font-bold leading-tight">Smart, by choice.</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Useful technology should feel premium before checkout and dependable long after delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-10 sm:pb-12 lg:pb-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {values.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container pb-16 sm:pb-20 lg:pb-24">
          <div className="grid gap-6 rounded-2xl border border-border bg-card/85 p-6 shadow-sm backdrop-blur sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">What we believe</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Electronics should feel sharp, useful and easy to choose.</h2>
            </div>
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                We started Luxtronics with a clear idea: technology is not only about specs. It is part of your workspace,
                your travel kit, your daily rhythm and the way you present yourself.
              </p>
              <p>
                That is why our store puts selection first. Instead of overwhelming buyers with endless noise, we organize
                products around categories that matter: device parts, trusted accessories, smart wearables, audio, creator
                tools and everyday electronics.
              </p>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                {["Refined catalog experience", "Useful premium accessories", "Clear product discovery", "Practical tech support"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default About;
