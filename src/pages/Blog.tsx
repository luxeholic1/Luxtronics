import Layout from "@/components/Layout";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blog-posts";

const Blog = () => (
  <Layout>
    <section className="container pt-32 pb-16">
      <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Blog</p>
      <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
        Stories & <span className="text-gradient">guides</span>
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
        Cinematic visual stories with practical buying insights. Hover any card to reveal a glass-style preview.
      </p>
    </section>

    <section className="container pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogPosts.map((p) => (
        <Link
          key={p.slug}
          to={`/blog/${p.slug}`}
          className="group relative min-h-[420px] rounded-3xl border border-border/70 overflow-hidden hover:border-primary/40 transition-all duration-500 hover:-translate-y-1"
        >
          <img
            src={p.img}
            alt={p.title}
            loading="lazy"
            width={400}
            height={300}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_45%)] opacity-60" />

          <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
            <span>{p.tag}</span>
            <span className="inline-flex items-center gap-1 text-white/70">
              <Calendar className="h-3 w-3" />
              {p.date}
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl transition-all duration-500 opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0">
            <h3 className="font-display font-bold text-xl leading-tight text-white">{p.title}</h3>
            <p className="text-sm text-white/80 mt-2">{p.excerpt}</p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-white">
              Read article <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}

      <div className="md:col-span-3 mt-2 flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
        >
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </Layout>
);

export default Blog;
