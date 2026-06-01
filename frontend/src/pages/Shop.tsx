import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Search, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ImageCursorCard from "@/components/ImageCursorCard";
import SEO from "@/components/SEO";
import { fetchStoreCategories, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import type { Product } from "@/data/products";

const PAGE_SIZE = 30; // products per page

type CategoryFilter = { id: number; name: string; slug: string; count: number };
type PriceRange = "all" | "under-100" | "100-500" | "500-1000" | "1000-plus";

const PRICE_RANGES: Array<{ value: PriceRange; label: string; test: (price: number) => boolean }> = [
  { value: "all", label: "All prices", test: () => true },
  { value: "under-100", label: "Under 100", test: (price) => price < 100 },
  { value: "100-500", label: "100 to 500", test: (price) => price >= 100 && price <= 500 },
  { value: "500-1000", label: "500 to 1,000", test: (price) => price > 500 && price <= 1000 },
  { value: "1000-plus", label: "1,000+", test: (price) => price > 1000 },
];

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
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Levenshtein distance ─────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({length: m+1}, (_, i) =>
    Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// Returns true if queryWord fuzzy-matches any token in the product tokens
function fuzzyWordMatchesAnyToken(qw: string, tokens: string[]): boolean {
  const maxDist = qw.length >= 4 ? 1 : 0; // allow 1 typo for words 4+ chars
  return tokens.some(t => levenshtein(qw, t) <= maxDist);
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

  // ── Fuzzy matching: catch typos like "samsng" → "samsung", "iphon" → "iphone" ──
  if (s === 0) {
    const allTokens = [...nt, ...ct];
    const fuzzyMatchCount = words.filter(w => fuzzyWordMatchesAnyToken(w, allTokens)).length;
    if (fuzzyMatchCount === words.length) {
      // All query words fuzzy-matched in name/category
      s += 80 * fuzzyMatchCount;
    } else if (fuzzyMatchCount > 0) {
      // Partial fuzzy match in name/category
      const dtFuzzyCount = words.filter(w => fuzzyWordMatchesAnyToken(w, dt)).length;
      if (fuzzyMatchCount + dtFuzzyCount >= words.length) {
        s += 80 * fuzzyMatchCount + 20 * dtFuzzyCount;
      }
    }
  }

  if (s > 0) { s += (product.rating || 0) * 5; s -= name.length * 0.1; }
  return s;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const id = setTimeout(() => setD(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return d;
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

function ShopSidebar({
  categories,
  totalCount,
  activeCat,
  sort,
  priceRange,
  minRating,
  onCategoryChange,
  onSortChange,
  onPriceChange,
  onRatingChange,
  onClear,
}: {
  categories: CategoryFilter[];
  totalCount: number;
  activeCat: string;
  sort: string;
  priceRange: PriceRange;
  minRating: number;
  onCategoryChange: (slug: string) => void;
  onSortChange: (value: string) => void;
  onPriceChange: (value: PriceRange) => void;
  onRatingChange: (value: number) => void;
  onClear: () => void;
}) {
  const topCategories = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count).slice(0, 14),
    [categories]
  );

  return (
    <aside className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Filters</p>
          <h2 className="mt-1 font-display text-lg font-bold">Browse Store</h2>
        </div>
        <button onClick={onClear} className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
          Reset
        </button>
      </div>

      <div className="space-y-6 p-4">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Department</h3>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange("all")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeCat === "all" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="font-medium">All Products</span>
              <span className="text-xs opacity-70">{totalCount.toLocaleString()}</span>
            </button>
            {topCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  activeCat === cat.slug ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="truncate font-medium">{cat.name}</span>
                <span className="ml-2 text-xs opacity-70">{cat.count.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Sort By</h3>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none transition-colors focus:border-primary"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Price</h3>
          <div className="space-y-1">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => onPriceChange(range.value)}
                className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                  priceRange === range.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Rating</h3>
          <div className="space-y-1">
            {[0, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(rating)}
                className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                  minRating === rating ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {rating === 0 ? "All ratings" : `${rating}+ stars`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const Shop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat   = params.get("cat") || "all";
  const searchQuery = params.get("q")   || "";
  const currentPage = parseInt(params.get("page") || "1", 10);

  const [sort,       setSort]       = useState("featured");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [minRating,  setMinRating]  = useState(0);
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
            const cats: Array<{ id?: number; name?: string; slug?: string }> = Array.isArray(x.categories) ? x.categories : [];
            const productCategoryName = String(x.category || '').toLowerCase().trim();
            const productCategorySlug = slugify(x.category || '');

            return cats.some((c) => {
              const cId   = Number(c.id);
              const cSlug = slugify(String(c.slug || c.name || ''));
              const cName = String(c.name  || '').toLowerCase().trim();
              return (
                cId   === sel.id   ||
                cSlug === slugify(sel.slug) ||
                cSlug === slugify(sel.name) ||
                cName === sel.name.toLowerCase().trim() ||
                productCategorySlug === slugify(sel.slug) ||
                productCategorySlug === slugify(sel.name) ||
                productCategoryName === sel.name.toLowerCase().trim()
              );
            });
          });
        }
      }
      if (sort === "low")    p = [...p].sort((a, b) => a.price - b.price);
      if (sort === "high")   p = [...p].sort((a, b) => b.price - a.price);
      if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);
    }
    const priceRule = PRICE_RANGES.find((range) => range.value === priceRange) ?? PRICE_RANGES[0];
    p = p.filter((x) => priceRule.test(x.price));
    if (minRating > 0) p = p.filter((x) => x.rating >= minRating);
    return p;
  }, [activeCat, searchQuery, sort, products, categories, priceRange, minRating]);

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

  const resetFilters = () => {
    setSort("featured");
    setPriceRange("all");
    setMinRating(0);
    setCat("all");
  };

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}" | Luxtronics`
    : activeCat !== "all"
      ? `${categories.find(c => c.slug === activeCat)?.name || "Category"} | Luxtronics`
      : "Shop All Products | Luxtronics";

  // ── Loading skeleton ──
  const Skeleton = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border animate-pulse">
          <div className="aspect-square bg-secondary/40 mb-4" />
          <div className="px-4 pb-4">
          <div className="h-3 w-1/3 bg-secondary/40 rounded mb-2" />
          <div className="h-4 w-3/4 bg-secondary/40 rounded mb-3" />
          <div className="h-6 w-1/2 bg-secondary/40 rounded" />
          </div>
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

      <section className="container py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ShopSidebar
                categories={categories}
                totalCount={totalCount}
                activeCat={activeCat}
                sort={sort}
                priceRange={priceRange}
                minRating={minRating}
                onCategoryChange={setCat}
                onSortChange={(value) => { setSort(value); setPage(1); }}
                onPriceChange={(value) => { setPriceRange(value); setPage(1); }}
                onRatingChange={(value) => { setMinRating(value); setPage(1); }}
                onClear={resetFilters}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {searchQuery ? <Search className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {searchQuery ? "Search Results" : "Marketplace"}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {searchQuery
                      ? `Results for "${searchQuery}"`
                      : activeCat !== "all"
                        ? categories.find(c => c.slug === activeCat)?.name || "Products"
                        : "All Products"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading ? "Loading products..." : `${list.length.toLocaleString()} products matched`}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex gap-2 lg:hidden">
                    <select
                      value={activeCat}
                      onChange={(e) => setCat(e.target.value)}
                      aria-label="Select category"
                      className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary"
                    >
                      <option value="all">All Departments</option>
                      {categories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => { setSort(e.target.value); setPage(1); }}
                      className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary"
                    >
                      <option value="featured">Featured</option>
                      <option value="low">Low to High</option>
                      <option value="high">High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>

                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <X className="h-4 w-4" />
                      Clear search
                    </button>
                  )}

                  {!loading && list.length > PAGE_SIZE && (
                    <span className="inline-flex h-10 items-center justify-center rounded-xl bg-muted px-3 text-xs font-semibold text-muted-foreground">
                      {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, list.length)} of {list.length.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {(activeCat !== "all" || priceRange !== "all" || minRating > 0) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active</span>
                  {activeCat !== "all" && (
                    <button onClick={() => setCat("all")} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                      {categories.find(c => c.slug === activeCat)?.name}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {priceRange !== "all" && (
                    <button onClick={() => { setPriceRange("all"); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                      {PRICE_RANGES.find((range) => range.value === priceRange)?.label}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {minRating > 0 && (
                    <button onClick={() => { setMinRating(0); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                      {minRating}+ stars
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-28 text-center">
                <Search className="mb-5 h-10 w-10 text-muted-foreground" />
                <h3 className="font-display font-bold text-2xl mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Try changing department, price, rating, or search keyword.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold shadow-sm"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                  {paginated.map(p => (
                    <ImageCursorCard key={p.id} imageUrl={p.image} category={p.category}>
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
