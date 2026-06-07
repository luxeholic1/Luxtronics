import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { ArrowRight, BookOpen, Calendar, Clock3, ShoppingBag, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blog-posts";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

const GanChargerVisual = ({ compact = false }: { compact?: boolean }) => (
  <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-black">
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/v8.mp4?v=gan-blog-card"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/a3.jpg"
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-black/45" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,107,43,0.38),transparent_42%),radial-gradient(circle_at_75%_70%,rgba(231,84,128,0.25),transparent_40%)]" />
    <div className={`relative rounded-[1.7rem] border border-white/25 bg-white/15 p-3 shadow-2xl backdrop-blur-xl ${compact ? "h-48 w-36" : "h-64 w-44"}`}>
      <div className="absolute inset-3 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-pink-500" />
      <div className="absolute inset-0 rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.08)_45%,rgba(0,0,0,0.22))]" />
      <div className="relative flex h-full flex-col justify-between rounded-[1.1rem] border border-white/25 bg-black/10 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.22em]">GaN</span>
          <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">3 Port</span>
        </div>
        <div>
          <div className={`font-display font-black ${compact ? "text-4xl" : "text-5xl"}`}>80W</div>
          <p className="text-xs font-semibold text-white/75">Wall Charger</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["C1", "C2", "A"].map((port) => (
            <span key={port} className="rounded-full bg-black/30 px-2 py-1 text-center text-[10px] font-black">
              {port}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute -right-10 top-16 h-16 w-20 rounded-full border-[8px] border-white/60 border-b-transparent border-l-transparent" />
      <div className="absolute -right-12 top-28 h-3.5 w-9 rounded-full bg-white/70" />
    </div>
  </div>
);

const Blog = () => {
  const featured = blogPosts[0];
  const latest = blogPosts.slice(1);
  const tags = Array.from(new Set(blogPosts.map((post) => post.tag)));

  return (
    <Layout hideBreadcrumb>
      <SEO
        title="Blog — Electronics Guides & Reviews | Luxtronics"
        description="Expert guides, buying advice and reviews on smartphones, laptops, audio, cameras and wearables from the Luxtronics team."
        keywords="electronics blog, tech guides, smartphone reviews, laptop buying guide, audio reviews"
        url="/blog"
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Luxtronics Blog",
            "url": absoluteUrl("/blog"),
            "description": "Expert guides and reviews on premium electronics.",
            "publisher": { "@type": "Organization", "name": "Luxtronics", "url": absoluteUrl("/") },
            "blogPost": blogPosts.map((post) => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "url": absoluteUrl(`/blog/${post.slug}`),
              "description": post.excerpt,
            })),
          },
        ]}
      />

      <main className="bg-background">
        <section className="relative min-h-[520px] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/v4.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/a2.jpg"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.18)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

          <div className="container relative z-10 flex min-h-[520px] items-center py-14">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-xl">
                <BookOpen className="h-3.5 w-3.5" />
                Luxtronics Journal
              </div>
              <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-6xl">
                Smarter buying starts here.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/74 sm:text-lg">
                Sharp guides, practical reviews and clean buying advice for laptops, cameras, audio, wearables and
                everyday electronics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/82 backdrop-blur-xl">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container -mt-10 pb-16 sm:pb-20 lg:pb-24">
          {featured && (
            <Link
              to={`/blog/${featured.slug}`}
              className="group relative z-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 lg:grid-cols-[1.12fr_0.88fr]"
            >
              <div className="relative min-h-[360px] overflow-hidden bg-muted">
                {featured.visual === "gan-charger" ? (
                  <GanChargerVisual />
                ) : (
                  <img
                    src={featured.img}
                    alt={featured.title}
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute left-5 top-5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                  Editor's pick
                </div>
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                      <Tag className="h-3.5 w-3.5" />
                      {featured.tag}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {featured.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      4 min read
                    </span>
                  </div>
                  <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{featured.excerpt}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Read featured guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Latest articles</p>
                  <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-foreground">Buying guides</h2>
                </div>
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">
                  {blogPosts.length} posts
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {latest.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={post.img}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                        {post.tag}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                      </div>
                      <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Read article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topics</p>
                    <h3 className="font-display text-lg font-bold text-foreground">Explore guides</h3>
                  </div>
                </div>
                <div className="grid gap-2">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                      <span className="font-semibold text-foreground">{tag}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="relative h-44">
                  <img src="/a2.jpg" alt="Shop premium electronics" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">Shop smarter</p>
                    <h3 className="font-display text-xl font-black">Find the right gear faster.</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Use product filters when you are ready to compare categories, price and ratings.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Open shop
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Blog;
