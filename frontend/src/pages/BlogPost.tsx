import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar, ArrowLeft, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import SEO from "@/components/SEO";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";
import { getFallbackBlogPost, type BlogPost } from "@/data/blog-posts";

const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split("T")[0];
};

// Groups paragraphs into editorial "chapters" of 2 so long posts read as
// distinct full-bleed sections instead of one continuous wall of text.
const chunkParagraphs = (paragraphs: string[], size = 2) => {
  const chunks: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += size) {
    chunks.push(paragraphs.slice(i, i + size));
  }
  return chunks;
};

const ReadingProgressBar = ({ color }: { color: string }) => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left"
      style={{ backgroundColor: color, scaleX: scrollYProgress }}
    />
  );
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
        if (active) setPost(json.success ? json.data : getFallbackBlogPost(slug) || null);
      } catch {
        if (active) setPost(getFallbackBlogPost(slug) || null);
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
      <Layout hideBreadcrumb>
        <section className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </section>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout hideBreadcrumb>
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
  const accent = post.background || "#fd5200";
  const accentForeground = post.foreground || "#ffffff";
  const chapters = chunkParagraphs(post.content);

  return (
    <Layout hideBreadcrumb>
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

      <ReadingProgressBar color={accent} />

      {/* ── Full-bleed hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black text-white">
        {post.video ? (
          <video
            src={post.video}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={post.image}
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            width={1600}
            height={1000}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.5),transparent_55%)]" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="container pt-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </div>

          <div className="container flex flex-1 flex-col items-start justify-center pb-20">
            <p
              className="mb-4 text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {post.tag}
            </p>
            <h1 className="max-w-4xl font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {post.excerpt}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-white/55">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
          </div>

          <div className="container flex justify-center pb-8">
            <ChevronDown className="h-5 w-5 animate-bounce text-white/50" />
          </div>
        </div>
      </section>

      {/* ── Content chapters ───────────────────────────────────────────── */}
      {chapters.map((chapter, index) => {
        const tinted = index % 2 === 1;
        const galleryImage = post.images?.[index];
        const imageOnRight = index % 2 === 1;

        const chapterText = (
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-display text-sm font-black tracking-widest" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: `${accent}33` }} />
              <span className="text-xs font-medium text-muted-foreground">
                {String(chapters.length).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-6">
              {chapter.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed text-foreground/85 sm:text-xl">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        );

        if (galleryImage) {
          return (
            <section key={chapter[0]} className="border-y border-border/60">
              <div className="container grid min-h-[70vh] items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
                <div className={imageOnRight ? "lg:order-2" : ""}>
                  <div className="overflow-hidden rounded-2xl border border-border/70">
                    <img src={galleryImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                </div>
                <div className={imageOnRight ? "lg:order-1" : "flex justify-end"}>{chapterText}</div>
              </div>
            </section>
          );
        }

        return (
          <section
            key={chapter[0]}
            className={tinted ? "border-y border-border/60" : ""}
            style={tinted ? { backgroundColor: `${accent}0d` } : undefined}
          >
            <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 sm:py-24">
              {chapterText}
            </div>
          </section>
        );
      })}

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section
        className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center"
        style={{ backgroundColor: accent, color: accentForeground }}
      >
        <h2 className="font-display text-3xl font-black tracking-tight sm:text-5xl">
          Ready to upgrade your setup?
        </h2>
        <p className="mt-4 max-w-xl text-base opacity-85 sm:text-lg">
          Explore the gear we curated to go with this story.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Shop related gear <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors"
            style={{ borderColor: `${accentForeground}55` }}
          >
            More articles
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
