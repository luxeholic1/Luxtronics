import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { fetchStoreCategories } from "@/services/store-api";
import type { StoreCategory } from "@/services/store-api";

const PER_PAGE = 12;

const CARD_GRADIENTS = [
  { bg: "from-violet-500/15 to-pink-500/5",    glow: "group-hover:bg-violet-500/20",   icon: "from-violet-500/30 to-pink-500/20"   },
  { bg: "from-cyan-500/15 to-blue-500/5",      glow: "group-hover:bg-cyan-500/20",     icon: "from-cyan-500/30 to-blue-500/20"     },
  { bg: "from-orange-500/15 to-yellow-500/5",  glow: "group-hover:bg-orange-500/20",   icon: "from-orange-500/30 to-yellow-500/20" },
  { bg: "from-emerald-500/15 to-teal-500/5",   glow: "group-hover:bg-emerald-500/20",  icon: "from-emerald-500/30 to-teal-500/20"  },
  { bg: "from-rose-500/15 to-red-500/5",       glow: "group-hover:bg-rose-500/20",     icon: "from-rose-500/30 to-red-500/20"      },
  { bg: "from-purple-500/15 to-indigo-500/5",  glow: "group-hover:bg-purple-500/20",   icon: "from-purple-500/30 to-indigo-500/20" },
  { bg: "from-sky-500/15 to-blue-500/5",       glow: "group-hover:bg-sky-500/20",      icon: "from-sky-500/30 to-blue-500/20"      },
  { bg: "from-amber-500/15 to-yellow-500/5",   glow: "group-hover:bg-amber-500/20",    icon: "from-amber-500/30 to-yellow-500/20"  },
  { bg: "from-lime-500/15 to-green-500/5",     glow: "group-hover:bg-lime-500/20",     icon: "from-lime-500/30 to-green-500/20"    },
  { bg: "from-fuchsia-500/15 to-pink-500/5",   glow: "group-hover:bg-fuchsia-500/20",  icon: "from-fuchsia-500/30 to-pink-500/20"  },
  { bg: "from-red-500/15 to-orange-500/5",     glow: "group-hover:bg-red-500/20",      icon: "from-red-500/30 to-orange-500/20"    },
  { bg: "from-teal-500/15 to-cyan-500/5",      glow: "group-hover:bg-teal-500/20",     icon: "from-teal-500/30 to-cyan-500/20"     },
];

const SkeletonCard = () => (
  <div className="rounded-3xl bg-gradient-card border border-border min-h-[260px] animate-pulse" />
);

const Categories = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await fetchStoreCategories(p, PER_PAGE);
      setCategories(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return (
    <Layout>
      {/* ── Header ───────────────────────────────────────────── */}
      <section className="container pt-32 pb-10">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Browse</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
              Shop by <span className="text-gradient">category</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Explore our full range of premium electronics, organised by category.
            </p>
          </div>
          {total > 0 && (
            <p className="text-sm text-muted-foreground shrink-0">
              {total} categories
            </p>
          )}
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <section className="container pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No categories found.</p>
            <Link to="/shop" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
              Browse all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              // Pick gradient by global position (page offset + index)
              const gi = ((page - 1) * PER_PAGE + idx) % CARD_GRADIENTS.length;
              const g = CARD_GRADIENTS[gi];
              const count = cat.productCount ?? cat.count ?? 0;
              const image = cat.sampleImage || cat.image?.src || null;

              return (
                <Link
                  key={cat.slug}
                  to={`/shop?cat=${cat.slug}`}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-8 min-h-[260px] flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                >
                  {/* Top accent line */}
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${g.bg} opacity-80 rounded-t-3xl`} />

                  {/* Glow blob */}
                  <div className={`absolute -right-8 -bottom-8 h-52 w-52 rounded-full bg-primary/5 blur-[80px] transition-all duration-500 ${g.glow}`} />

                  {/* Icon badge */}
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br ${g.icon} border border-white/10 mb-5`}>
                      <Package className="h-5 w-5 text-foreground/80" />
                    </div>

                    <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                      {cat.name}
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1.5">
                      {count > 0 ? `${count} product${count !== 1 ? "s" : ""}` : "View products"}
                    </p>

                    {cat.description && (
                      <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 max-w-[75%]">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Product image */}
                  {image ? (
                    <img
                      src={image}
                      alt={cat.name}
                      loading="lazy"
                      width={160}
                      height={160}
                      className="absolute right-4 bottom-14 h-32 w-32 object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 opacity-90"
                    />
                  ) : (
                    <div className="absolute right-6 bottom-14 h-28 w-28 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                    Browse collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="container pb-16 flex items-center justify-center gap-3">
          {/* Prev */}
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page === 1}
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Show first, last, current ±1, and ellipsis
            const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
            const showEllipsisBefore = p === page - 2 && page > 3;
            const showEllipsisAfter  = p === page + 2 && page < totalPages - 2;

            if (!show && !showEllipsisBefore && !showEllipsisAfter) return null;
            if (showEllipsisBefore || showEllipsisAfter) {
              return (
                <span key={`e${p}`} className="text-muted-foreground text-sm px-1">…</span>
              );
            }

            return (
              <button
                key={p}
                onClick={() => loadPage(p)}
                className={`h-10 min-w-10 px-3 rounded-full text-sm font-medium border transition-all ${
                  page === p
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => loadPage(page + 1)}
            disabled={page === totalPages}
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── All products CTA ──────────────────────────────────── */}
      {!loading && categories.length > 0 && (
        <div className="container pb-24 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-[1.03]"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </Layout>
  );
};

export default Categories;
