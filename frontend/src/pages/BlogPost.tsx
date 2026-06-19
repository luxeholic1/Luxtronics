import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image?: string;
  content: string[];
};

const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split("T")[0];
};

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPost(null);
    (async () => {
      try {
        const response = await fetch(`/api/blogs/slug/${encodeURIComponent(slug)}`);
        const json = await response.json();
        if (active) setPost(json.success ? json.data : null);
      } catch {
        if (active) setPost(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <section className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </section>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <section className="container pt-10 pb-24 max-w-2xl text-center">
          <h1 className="font-display font-bold text-4xl tracking-tight">Article not found</h1>
          <p className="mt-4 text-muted-foreground">The blog you are looking for is unavailable.</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </section>
      </Layout>
    );
  }

  const isoDate = toIsoDate(post.date);

  return (
    <Layout>
      <SEO
        title={`${post.title} | Luxtronics Blog`}
        description={post.excerpt}
        keywords={`${post.tag}, electronics, tech guide, luxtronics`}
        url={`/blog/${post.slug}`}
        type="article"
        publishedTime={isoDate}
        image={post.image}
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": isoDate,
            "dateModified": isoDate,
            "author": { "@type": "Organization", "name": "Luxtronics" },
            "publisher": { "@type": "Organization", "name": "Luxtronics", "url": absoluteUrl("/") },
            "image": post.image ? absoluteUrl(post.image) : undefined,
            "mainEntityOfPage": absoluteUrl(`/blog/${post.slug}`),
            "url": absoluteUrl(`/blog/${post.slug}`)
          },
        ]}
      />
      <section className="container pt-10 pb-10">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </section>

      <section className="container pb-12">
        <article className="relative overflow-hidden rounded-3xl border border-border/70 min-h-[480px]">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              width={1200}
              height={700}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/54 to-black/18" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.48)_52%,rgba(0,0,0,0.1)_100%)]" />

          <div className="relative z-10 flex min-h-[480px] items-end p-6 sm:p-10">
            <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/85">
                <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1">{post.tag}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight text-white">
                {post.title}
              </h1>
              <p className="mt-4 text-white/80 leading-relaxed">{post.excerpt}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="container pb-24 max-w-4xl">
        <div className="rounded-3xl border border-border bg-gradient-card p-7 sm:p-10 space-y-6">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}

          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
            >
              Shop related gear <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40"
            >
              More articles
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
