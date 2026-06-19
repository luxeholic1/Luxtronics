import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { ArrowRight, BookOpen, Calendar, Loader2, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image?: string;
  background?: string;
  foreground?: string;
  content: string[];
};

const PALETTE = [
  { background: "#fd5200", foreground: "#ffffff" },
  { background: "#000000", foreground: "#ffffff" },
  { background: "#F5F0E8", foreground: "#000000" },
  { background: "#1A3DE8", foreground: "#ffffff" },
];

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/blogs");
        const json = await response.json();
        if (!active) return;
        if (json.success) {
          setPosts(json.data || []);
        } else {
          setError(true);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const tags = Array.from(new Set(posts.map((post) => post.tag)));

  return (
    <Layout hideBreadcrumb>
      <SEO
        title="Blog — Electronics Guides & Reviews | Luxtronics"
        description="Expert guides, buying advice and reviews on smartphones, laptops, audio, cameras and wearables from the Luxtronics team."
        keywords="electronics blog, tech guides, smartphone reviews, laptop buying guide, audio reviews"
        url="https://luxtronics.in/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Luxtronics Blog",
          "url": "https://luxtronics.in/blog",
          "description": "Expert guides and reviews on premium electronics.",
          "publisher": { "@type": "Organization", "name": "Luxtronics", "url": "https://luxtronics.in" }
        }}
      />

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error || posts.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-black text-foreground">
            {error ? "Blog is unavailable right now" : "No articles published yet"}
          </h1>
          <Link to="/shop" className="text-sm font-bold text-primary hover:underline">
            Browse the shop instead
          </Link>
        </div>
      ) : (
        <FlowArt aria-label="Luxtronics Journal">
          {posts.map((post, index) => {
            const palette = PALETTE[index % PALETTE.length];
            const background = post.background || palette.background;
            const foreground = post.foreground || palette.foreground;
            const dividerClass = foreground === "#000000" ? "border-black/40" : "border-white/40";

            return (
              <FlowSection
                key={post._id}
                aria-label={post.title}
                style={{ backgroundColor: background, color: foreground }}
              >
                {post.image && (
                  <div className="absolute inset-0">
                    <img src={post.image} alt="" className="h-full w-full object-cover opacity-25" />
                    <div className="absolute inset-0" style={{ backgroundColor: background, opacity: 0.72 }} />
                  </div>
                )}

                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">
                    {String(index + 1).padStart(2, "0")} — {post.tag}
                  </p>
                  <hr className={`my-[2vw] border-none border-t ${dividerClass}`} />
                </div>

                <div className="relative">
                  <h1 className="text-[clamp(2.5rem,9vw,8rem)] font-bold uppercase leading-[0.92] tracking-tight font-display">
                    {post.title}
                  </h1>
                </div>

                <div className="relative">
                  <hr className={`my-[2vw] border-none border-t ${dividerClass}`} />
                  <p className="max-w-[60ch] text-[clamp(1rem,2.2vw,1.6rem)] font-normal leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-80">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-current/30 bg-black/10 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-black/20"
                  >
                    Read full article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FlowSection>
            );
          })}

          <FlowSection aria-label="More from Luxtronics" style={{ backgroundColor: "#0a0a0a", color: "#fff" }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">{String(posts.length + 1).padStart(2, "0")} — Keep exploring</p>
            <hr className="my-[2vw] border-none border-t border-white/30" />
            <h2 className="text-[clamp(2.5rem,9vw,8rem)] font-bold uppercase leading-[0.92] tracking-tight font-display">
              Find Your
              <br />
              Next Gear
            </h2>
            <hr className="my-[2vw] border-none border-t border-white/30" />
            <div className="mt-auto flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold">
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                </span>
              ))}
            </div>
            <Link
              to="/shop"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
            >
              Open shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FlowSection>
        </FlowArt>
      )}
    </Layout>
  );
};

export default Blog;
