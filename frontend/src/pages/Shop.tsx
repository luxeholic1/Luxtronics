import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { fetchStoreCategories, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import type { Product } from "@/data/products";

type CategoryFilter = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat = params.get("cat") || "all";
  const searchQuery = params.get("q") || "";           // ← FIX: read search query from URL
  const [sort, setSort] = useState("featured");
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [categoryData, productData] = await Promise.all([
          fetchStoreCategories(),
          fetchStoreProducts(),                         // ← loads all products once; filtering is done client-side
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

    return () => {
      mounted = false;
    };
  }, []);                                               // ← FIX: no dependency on searchQuery; products load once

  const list = useMemo(() => {
    let p = [...products];

    // Filter by search query (from URL param ?q=...)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      p = p.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (activeCat !== "all") {
      const selectedCategory = categories.find((c) => c.slug === activeCat);
      if (selectedCategory) {
        p = p.filter((x) => 
          x.categoryId === selectedCategory.id || 
          x.category.toLowerCase().trim() === selectedCategory.name.toLowerCase().trim()
        );
      }
    }

    // Sort
    if (sort === "low") p = [...p].sort((a, b) => a.price - b.price);
    if (sort === "high") p = [...p].sort((a, b) => b.price - a.price);
    if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);

    return p;
  }, [activeCat, searchQuery, sort, products, categories]);

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">
          Shop
        </p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          {searchQuery ? (
            <>
              Results for{" "}
              <span className="text-gradient">"{searchQuery}"</span>
            </>
          ) : (
            <>
              All <span className="text-gradient">products</span>
            </>
          )}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {searchQuery
            ? `Showing ${list.length} result${list.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : "Browse our curated collection of premium electronics. Filter by category and sort to find your perfect match."}
        </p>
      </section>

      <section className="container pb-24">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setParams(searchQuery ? { q: searchQuery } : {})}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                activeCat === "all"
                  ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                  : "border-border hover:border-foreground"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() =>
                  setParams(searchQuery ? { q: searchQuery, cat: c.slug } : { cat: c.slug })
                }
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  activeCat === c.slug
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                    : "border-border hover:border-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading products</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-24">Loading products...</p>
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
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Shop;