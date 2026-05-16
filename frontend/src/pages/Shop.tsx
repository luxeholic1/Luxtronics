import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, Search, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ImageCursorCard from "@/components/ImageCursorCard";
import SEO from "@/components/SEO";
import { fetchStoreCategories, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import type { Product } from "@/data/products";

const PAGE_SIZE = 28; // products per page

type CategoryFilter = { id: number; name: string; slug: string; count: number };

// ─── Smart search engine ──────────────────────────────────────────────────────
function tokenise(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}
function wordMatchesToken(qw: string, pt: string): boolean {
  return /^\d+$/.test(qw) ? pt === qw : pt.startsWith(qw);
}
function allWordsInTokens(words: string[], tokens: string[]): boolean {
  return words.every(w => tokens.some(t => wordMatchesToken(w, t)));
}
function scoreProduct(product: Product, q: string, words: string[]): number {
  const name = product.name.toLowerCase();
  const nt   = tokenise(name);
  const ct   = tokenise(product.category.toLowerCase());
  const dt   = tokenise((product.description || "").toLowerCase());
  let s = 0;
  if (name === q)                                          s += 1000;
  if (name.startsWith(q + " ") || name.startsWith(q + ",")) s += 800;
  const inName = allWordsInTokens(words, nt);
  if (inName) {
    s += 600;
    if (words.length > 1) {
      let last = -1, ok = true;
      for (const w of words) {
        const idx = nt.findIndex((t, i) => i > last && wordMatchesToken(w, t));
        if (idx === -1) { ok = false; break; }
        last = idx;
      }
      if (ok) s += 200;
    }
  }
  if (!inName && allWordsInTokens(words, [...nt, ...ct])) s += 120;
  if (!inName && allWordsInTokens(words, dt))             s += 40;
  if (s > 0) { s += (product.rating || 0) * 5; s -= name.length * 0.1; }
  return s;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const id = setTimeout(() => setD(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return d;
}

// ─── Category icon map ────────────────────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  audio: "🎧", camera: "📷", "smart phone": "📱", smartphone: "📱",
  wearables: "⌚", iphone: "🍎", uncategorized: "📦",
};
function catEmoji(name: string) {
  return CAT_EMOJI[name.toLowerCase()] ?? "🛍️";
}

// ─── Pagination component ─────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-primary/50 hover:bg-secondary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`h-9 w-9 rounded-full text-sm font-medium transition-all ${
              p === page
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "border border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-primary/50 hover:bg-secondary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const Shop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat   = params.get("cat") || "all";
  const searchQuery = params.get("q")   || "";
  const currentPage = parseInt(params.get("page") || "1", 10);

  const [sort,       setSort]       = useState("featured");
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0); // real total from source
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 350);

  // ── Fetch ──
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [catData, prodData] = await Promise.all([
          fetchStoreCategories(),
          debouncedQuery
            ? fetchStoreProducts(1, 500, debouncedQuery)
            : fetchStoreProducts(1, 0),   // 0 = fetch ALL (Firebase ignores limit; WooCommerce paginates)
        ]);
        if (!mounted) return;
        setCategories(catData.data.filter(c => c.name.toLowerCase() !== "uncategorized" || c.count > 0));
        setProducts(prodData.map(mapStoreProductToLocalProduct));
        setTotalCount(prodData.length); // real count from source
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [debouncedQuery]);

  // ── Filtered + sorted list ──
  const list = useMemo(() => {
    let p = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const words = tokenise(q);
      p = p.filter(x => scoreProduct(x, q, words) > 0);
      p.sort((a, b) => {
        const q2 = searchQuery.toLowerCase().trim();
        const ws = tokenise(q2);
        return scoreProduct(b, q2, ws) - scoreProduct(a, q2, ws);
      });
    } else {
      if (activeCat !== "all") {
        const sel = categories.find(c => c.slug === activeCat);
        if (sel) {
          p = p.filter(x => {
            // Check all possible category fields — Firebase stores raw WooCommerce data
            const cats: any[] = Array.isArray((x as any).categories) ? (x as any).categories : [];

            return cats.some((c: any) => {
              const cId   = Number(c.id);
              const cSlug = String(c.slug  || '').toLowerCase().trim();
              const cName = String(c.name  || '').toLowerCase().trim();
              return (
                cId   === sel.id   ||
                cSlug === sel.slug.toLowerCase().trim() ||
                cName === sel.name.toLowerCase().trim()
              );
            });
          });
        }
      }
      if (sort === "low")    p = [...p].sort((a, b) => a.price - b.price);
      if (sort === "high")   p = [...p].sort((a, b) => b.price - a.price);
      if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);
    }
    return p;
  }, [activeCat, searchQuery, sort, products, categories]);

  // ── Paginated slice ──
  const paginated = useMemo(
    () => list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [list, currentPage]
  );

  const setPage = (p: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setCat = (slug: string) => {
    const next: Record<string, string> = { cat: slug, page: "1" };
    if (searchQuery) next.q = searchQuery;
    setParams(next);
  };

  const clearSearch = () => setParams({});

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}" | Luxtronics`
    : activeCat !== "all"
      ? `${categories.find(c => c.slug === activeCat)?.name || "Category"} | Luxtronics`
      : "Shop All Products | Luxtronics";

  // ── Loading skeleton ──
  const Skeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-gradient-card border border-border p-5 animate-pulse">
          <div className="aspect-square rounded-2xl bg-secondary/40 mb-4" />
          <div className="h-3 w-1/3 bg-secondary/40 rounded mb-2" />
          <div className="h-4 w-3/4 bg-secondary/40 rounded mb-3" />
          <div className="h-6 w-1/2 bg-secondary/40 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={`Browse ${totalCount.toLocaleString()} premium electronics. Free shipping, 2-year warranty, 30-day returns.`}
        keywords={searchQuery ? `${searchQuery}, electronics, gadgets` : "electronics, gadgets, smartphones, laptops"}
        url={`https://luxtronics.com/shop`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": pageTitle,
          "url": "https://luxtronics.com/shop",
        }}
      />

      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="container relative pt-28 sm:pt-32 lg:pt-36 pb-10 sm:pb-14">
          {searchQuery ? (
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Search className="h-3 w-3" /> Search Results
                </div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight">
                  Results for{" "}
                  <span className="text-gradient">"{searchQuery}"</span>
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {loading ? "Searching…" : `${list.length} product${list.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/40 text-sm font-medium transition-all"
              >
                <X className="h-3.5 w-3.5" /> Clear search
              </button>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3 bg-primary/10 px-3 py-1.5 rounded-full">
                <Sparkles className="h-3 w-3" /> Premium Collection
              </div>
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none">
                {activeCat !== "all"
                  ? <>{categories.find(c => c.slug === activeCat)?.name || "Category"} <span className="text-gradient">Products</span></>
                  : <>All <span className="text-gradient">Products</span></>
                }
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-lg">
                {loading
                  ? "Loading products…"
                  : `${totalCount.toLocaleString()} premium electronics — free shipping, 2-year warranty.`
                }
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="container py-8 sm:py-10 lg:py-12">

        {/* ── Category pills ── */}
        {!searchQuery && (
          <div className="mb-8 flex flex-wrap gap-2">
            {[{ id: 0, name: "All", slug: "all", count: totalCount }, ...categories].map(cat => {
              const active = cat.slug === activeCat;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setCat(cat.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    active
                      ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow scale-105"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{catEmoji(cat.name)}</span>
                  <span>{cat.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-secondary"}`}>
                    {cat.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-card border border-border">
          {/* Left: sort + active filter badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              {!searchQuery ? (
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="h-9 rounded-full border border-border bg-background px-3 pr-8 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              ) : (
                <span className="text-sm text-muted-foreground italic">Sorted by relevance</span>
              )}
            </div>

            {activeCat !== "all" && !searchQuery && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                {catEmoji(categories.find(c => c.slug === activeCat)?.name || "")}
                {categories.find(c => c.slug === activeCat)?.name}
                <button onClick={() => setCat("all")} className="ml-1 hover:text-foreground transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right: count + page info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {!loading && (
              <>
                <span>
                  {list.length > PAGE_SIZE
                    ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, list.length)} of ${list.length.toLocaleString()}`
                    : `${list.length.toLocaleString()} product${list.length !== 1 ? "s" : ""}`
                  }
                </span>
                {list.length > PAGE_SIZE && (
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary border border-border">
                    Page {currentPage} / {Math.ceil(list.length / PAGE_SIZE)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 mb-6">
            <p className="text-sm text-red-400 font-medium">Failed to load products</p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        )}

        {/* ── Product grid ── */}
        {loading ? (
          <Skeleton />
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center text-4xl mb-6">
              {searchQuery ? "🔍" : "📦"}
            </div>
            <h3 className="font-display font-bold text-2xl mb-2">
              {searchQuery ? "No results found" : "No products here"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? `We couldn't find anything for "${searchQuery}". Try a different keyword.`
                : "This category is empty right now. Check back soon!"}
            </p>
            <button
              onClick={clearSearch}
              className="px-6 py-3 rounded-full bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-glow"
            >
              {searchQuery ? "Clear search" : "Browse all products"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map(p => (
                <ImageCursorCard key={p.id} imageUrl={p.image}>
                  <ProductCard product={p} />
                </ImageCursorCard>
              ))}
            </div>

            <Pagination
              page={currentPage}
              total={list.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </Layout>
  );
};

export default Shop;
