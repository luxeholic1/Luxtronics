import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar, ArrowLeft, ArrowRight, ChevronDown, Loader2, Tag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import SEO from "@/components/SEO";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitize";
import { getFallbackBlogPost, fallbackBlogPosts, type BlogPost } from "@/data/blog-posts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split("T")[0];
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Groups paragraphs into editorial "chapters" of 1 so long posts read as
// distinct full-bleed, image-first sections instead of one continuous wall of text.
const chunkParagraphs = (paragraphs: string[], size = 1) => {
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
  const [otherPosts, setOtherPosts] = useState<BlogPost[]>([]);

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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/blogs");
        const json = await response.json();
        if (active) setOtherPosts(json.success && json.data?.length > 0 ? json.data : fallbackBlogPosts);
      } catch {
        if (active) setOtherPosts(fallbackBlogPosts);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
  const articleBody = post.bodyHtml ? stripHtml(post.bodyHtml) : post.content.join(" ");
  const wordCount = articleBody ? articleBody.split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));
  const relatedPosts = otherPosts.filter((p) => p.slug !== post.slug).slice(0, 4);

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
            "publisher": {
              "@type": "Organization",
              "name": "Luxtronics",
              "url": absoluteUrl("/"),
              "logo": { "@type": "ImageObject", "url": absoluteUrl("/logo.jpeg") },
            },
            "image": post.image ? absoluteUrl(post.image) : undefined,
            "mainEntityOfPage": absoluteUrl(`/blog/${post.slug}`),
            "url": absoluteUrl(`/blog/${post.slug}`),
            "keywords": post.tag,
            "articleBody": articleBody || undefined,
            "wordCount": wordCount || undefined,
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

      {/* ── Rich HTML content (imported from the team's own HTML/CSS) ────── */}
      {post.bodyHtml ? (
        <section className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="max-w-none">
              <div
                className="prose prose-lg dark:prose-invert w-full max-w-none prose-headings:font-display prose-img:rounded-2xl"
                style={{ "--tw-prose-links": accent } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyHtml) }}
              />

              {post.images && post.images.length > 0 && (
                <div className="mt-12">
                  <h3 className="mb-4 font-display text-lg font-bold tracking-tight">Gallery</h3>
                  <Carousel opts={{ loop: post.images.length > 1, align: "start" }} className="w-full">
                    <CarouselContent>
                      {post.images.map((src, index) => (
                        <CarouselItem key={src} className="sm:basis-1/2">
                          <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                            <img
                              src={src}
                              alt={`${post.title} — illustration ${index + 1}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              width={1200}
                              height={900}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {post.images.length > 1 && (
                      <>
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                      </>
                    )}
                  </Carousel>
                </div>
              )}
            </article>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border p-5">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {post.tag}
                </span>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{readMinutes} min read</p>
              </div>

              {relatedPosts.length > 0 && (
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="font-display text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    More from the blog
                  </h3>
                  <div className="mt-4 space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related._id}
                        to={`/blog/${related.slug}`}
                        className="group flex gap-3"
                      >
                        {related.image && (
                          <img
                            src={related.image}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                            {related.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{related.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/shop"
                className="block rounded-2xl px-5 py-4 text-center text-sm font-bold transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: accent, color: accentForeground }}
              >
                Shop related gear
              </Link>
            </aside>
          </div>
        </section>
      ) : (
        chapters.map((chapter, index) => {
        const tinted = index % 2 === 1;
        const galleryImage = post.images?.[index];

        const sectionLabel = (
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="font-display text-sm font-black tracking-widest" style={{ color: accent }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-16" style={{ backgroundColor: `${accent}33` }} />
            <span className="text-xs font-medium text-muted-foreground">
              {String(chapters.length).padStart(2, "0")}
            </span>
          </div>
        );

        const chapterText = (
          <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
            {sectionLabel}
            {chapter.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-relaxed text-foreground/85 sm:text-xl">
                {paragraph}
              </p>
            ))}
          </div>
        );

        if (galleryImage) {
          return (
            <section key={chapter[0]} className="border-y border-border/60">
              <div className="relative h-[55vh] w-full overflow-hidden sm:h-[70vh]">
                <img
                  src={galleryImage}
                  alt={`${post.title} — ${post.tag} illustration ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                />
              </div>
              <div className="container py-12 sm:py-16">
                {chapterText}
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
            <div className="container py-12 sm:py-16">
              {chapterText}
            </div>
          </section>
        );
        })
      )}

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
