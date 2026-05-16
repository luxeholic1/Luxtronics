import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ImageCursorCard from "@/components/ImageCursorCard";
import StylishCategoryDisplay from "@/components/StylishCategoryDisplay";
import SEO from "@/components/SEO";
import { fetchStoreCategories, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import type { Product } from "@/data/products";

type CategoryFilter = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

// ─────────────────────────────────────────────
// AMAZON-STYLE RELEVANCE SCORING
// Higher score = more relevant = shown first
// ─────────────────────────────────────────────
function scoreProduct(product: Product, query: string, words: string[]): number {
  const name  = product.name.toLowerCase();
  const cat   = product.category.toLowerCase();
  const desc  = (product.description || "").toLowerCase();
  const q     = query.toLowerCase();

  let score = 0;

  // ── Tier 1: Exact / near-exact name match (highest value) ──
  if (name === q)                      score += 1000;   // perfect match
  if (name.startsWith(q + " "))        score += 800;    // "iPhone 15" → "iPhone 15 Pro"
  if (name.includes(" " + q))          score += 700;    // query appears as a word block
  if (name.includes(q))                score += 600;    // query appears anywhere in name

  // ── Tier 2: All query words appear in name ──
  const allInName = words.every(w => name.includes(w));
  if (allInName)                       score += 500;

  // ── Tier 3: Word-order bonus (words appear in same sequence) ──
  if (allInName && words.length > 1) {
    let lastIdx = -1;
    let inOrder = true;
    for (const w of words) {
      const idx = name.indexOf(w, lastIdx + 1);
      if (idx <= lastIdx) { inOrder = false; break; }
      lastIdx = idx;
    }
    if (inOrder) score += 200;
  }

  // ── Tier 4: Partial word / prefix match in name ──
  // E.g. "samsu" should match "samsung"
  const prefixMatches = words.filter(w => name.split(/\s+/).some(token => token.startsWith(w)));
  score += prefixMatches.length * 80;

  // ── Tier 5: Category match ──
  if (cat.includes(q))                 score += 150;
  const allInCat = words.every(w => (name + " " + cat).includes(w));
  if (!allInName && allInCat)          score += 120;

  // ── Tier 6: Description match (lowest priority) ──
  const allInDesc = words.every(w => desc.includes(w));
  if (!allInName && !allInCat && allInDesc) score += 50;

  // ── Tie-breaker: rating & name length ──
  // Shorter names that match = more specific = slightly preferred
  if (score > 0) {
    score += (product.rating || 0) * 5;
    score -= name.length * 0.1;
  }

  return score;
}

// Returns true if product passes minimum relevance threshold
function productMatchesQuery(product: Product, query: string, words: string[]): boolean {
  return scoreProduct(product, query, words) > 0;
}

// ─────────────────────────────────────────────
// DEBOUNCE HOOK — prevents API call on every keystroke
// ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────
const Shop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat    = params.get("cat") || "all";
  const searchQuery  = params.get("q")   || "";
  const [sort, setSort] = useState("featured");

  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Debounce the raw URL search param so API fires only after typing stops
  const debouncedQuery = useDebounce(searchQuery, 350);

  // ── SEO helpers ──
  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}" | Luxtronics`;
    if (activeCat !== "all") {
      const category = categories.find(c => c.slug === activeCat);
      return `${category?.name || "Category"} Products | Luxtronics`;
    }
    return "All Products | Premium Electronics Store";
  };

  const getPageDescription = (productCount: number) => {
    if (searchQuery) {
      return `Browse ${productCount} premium electronics products matching "${searchQuery}". Find the best deals on smartphones, laptops, audio, and more.`;
    }
    return "Browse our curated collection of premium electronics from top brands. Free shipping, 2-year warranty, 30-day returns.";
  };

  // ── Data fetching ──
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [categoryData, productData] = await Promise.all([
          fetchStoreCategories(),
          // Always pass query to WooCommerce for server-side pre-filter.
          // Client-side re-ranking happens in useMemo below.
          debouncedQuery
            ? fetchStoreProducts(1, 500, debouncedQuery)
            : fetchStoreProducts(1, 100),
        ]);

        if (!mounted) return;

        setCategories(categoryData.data);
        setProducts(productData.map(mapStoreProductToLocalProduct));
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load products");
        setCategories([]);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [debouncedQuery]); // re-fetch only when debounced query changes

  // ── Main list computation ──
  const list = useMemo(() => {
    let p = [...products];

    // ── Search filtering & ranking ──
    if (searchQuery) {
      const q     = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);

      // 1. Filter: keep only products that have a score > 0
      p = p.filter(product => productMatchesQuery(product, q, words));

      // 2. Sort by relevance score (descending)
      p.sort((a, b) => {
        const scoreB = scoreProduct(b, q, words);
        const scoreA = scoreProduct(a, q, words);
        return scoreB - scoreA;
      });

    } else {
      // ── Category filtering (only when no search active) ──
      if (activeCat !== "all") {
        const selectedCategory = categories.find(c => c.slug === activeCat);
        if (selectedCategory) {
          p = p.filter(x =>
            x.categories &&
            Array.isArray(x.categories) &&
            x.categories.some(cat =>
              cat.id   === selectedCategory.id   ||
              cat.slug === selectedCategory.slug ||
              cat.name.toLowerCase().trim() === selectedCategory.name.toLowerCase().trim()
            )
          );
        }
      }

      // ── Sort (only when no search, so we don't override relevance ranking) ──
      if (sort === "low")    p = [...p].sort((a, b) => a.price - b.price);
      if (sort === "high")   p = [...p].sort((a, b) => b.price - a.price);
      if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);
    }

    return p;
  }, [activeCat, searchQuery, sort, products, categories]);

  return (
    <Layout>
      <SEO
        title={getPageTitle()}
        description={getPageDescription(list.length)}
        keywords={searchQuery ? `${searchQuery}, electronics, gadgets` : "electronics, gadgets, smartphones, laptops, audio, wearables"}
        url={`https://luxtronics.com/shop${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}${activeCat !== "all" ? `?cat=${activeCat}` : ""}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": getPageTitle(),
          "description": getPageDescription(list.length),
          "url": "https://luxtronics.com/shop",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": list.length,
            "itemListElement": list.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "url": `https://luxtronics.com/product/${(product as any).slug || product.id}`,
                "image": product.image,
                "description": product.description,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "USD",
                },
              },
            })),
          },
        }}
      />

      <section className="container pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Shop</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          {searchQuery ? (
            <>Results for <span className="text-gradient">"{searchQuery}"</span></>
          ) : (
            <>All <span className="text-gradient">products</span></>
          )}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {searchQuery
            ? `Showing ${list.length} result${list.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : "Browse our curated collection of premium electronics. Filter by category and sort to find your perfect match."}
        </p>
      </section>

      <section className="container pb-16 sm:pb-20 lg:pb-24">
        {/* Category Display */}
        <div className="mb-12">
          <StylishCategoryDisplay
            categories={categories.map(cat => ({
              ...cat,
              color: "text-primary",
              gradient: "from-primary/20 to-accent/20",
              icon: () => <div>{cat.name.charAt(0)}</div>,
              description: `Browse ${cat.count} premium ${cat.name.toLowerCase()} products`,
            }))}
            activeCat={activeCat}
            onCategoryChange={(slug) => {
              setParams(searchQuery ? { q: searchQuery, cat: slug } : { cat: slug });
            }}
          />
        </div>

        {/* Sort & Filter Bar — hide sort when searching (results are ranked by relevance) */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8 p-4 rounded-2xl bg-gradient-card border border-border">
          <div className="flex items-center gap-2">
            {!searchQuery && (
              <>
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="new">New Arrivals</option>
                </select>
              </>
            )}
            {searchQuery && (
              <span className="text-sm text-muted-foreground italic">
                Results sorted by relevance
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {list.length} of {products.length} products
            </span>
            {activeCat !== "all" && !searchQuery && (
              <button
                onClick={() => setParams({})}
                className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-primary/40 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading products</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-24">Loading products…</p>
        ) : list.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">
              {searchQuery
                ? `No products found for "${searchQuery}".`
                : "No products found."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setParams({})}
                className="mt-4 px-6 py-2 rounded-full bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {list.map((p) => (
              <ImageCursorCard key={p.id} imageUrl={p.image}>
                <ProductCard product={p} />
              </ImageCursorCard>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Shop;