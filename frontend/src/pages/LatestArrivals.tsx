import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Clock3, Grid3X3, PackageSearch, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import ImageCursorCard from "@/components/ImageCursorCard";
import type { Product } from "@/data/products";
import { fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

const tabs = ["All", "Smartphones", "Audio", "Wearables", "Smart Glasses", "Gaming", "Chargers"] as const;

const tagMatches: Record<string, RegExp> = {
  Smartphones: /phone|iphone|samsung|mobile|galaxy|android/i,
  Audio: /audio|headphone|earbud|speaker|airpod|buds/i,
  Wearables: /watch|wearable|band|fitbit|garmin/i,
  "Smart Glasses": /smart\s*glasses|eyewear|spectacle|ar\s*glass|vr\s*glass/i,
  Gaming: /gaming|game|controller|console|playstation|xbox|nintendo/i,
  Chargers: /charger|cable|adapter|usb|power/i,
};

function productScore(product: Product) {
  const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
  let score = product.badge === "New" ? 600 : 0;
  if (/new|latest|2026|pro|max|ultra|gen|gan|usb-c/.test(text)) score += 160;
  if (/smart\s*glasses|eyewear|ar\s*glass|vr\s*glass/.test(text)) score += 180;
  score += Math.round((product.rating || 0) * 20);
  score += Math.min(product.reviews || 0, 2000) / 30;
  return score;
}

const LatestArrivals = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const { data: storeProducts = [], isLoading } = useQuery({
    queryKey: ["products", "latest-arrivals"],
    queryFn: () => fetchStoreProducts(1, 48),
    staleTime: 1000 * 60 * 20,
  });

  const latestProducts = useMemo(() => {
    const rawProducts = Array.isArray(storeProducts) ? storeProducts : [];
    const source = rawProducts.map(mapStoreProductToLocalProduct).filter((product): product is Product => product !== null);

    return [...source].sort((a, b) => productScore(b) - productScore(a)).slice(0, 36);
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    if (activeTab === "All") return latestProducts;
    const rule = tagMatches[activeTab];
    return latestProducts.filter((product) => rule.test(`${product.name} ${product.category} ${product.description}`));
  }, [activeTab, latestProducts]);

  const spotlightProducts = latestProducts.slice(0, 4);
  const spotlight = spotlightProducts[spotlightIndex] ?? latestProducts[0];

  return (
    <Layout>
      <SEO
        title="Latest Arrivals | Luxtronics"
        description="Explore the newest electronics, accessories, chargers, smart devices and premium gadgets at Luxtronics."
        keywords="latest arrivals, new electronics, new gadgets, premium tech"
        url="/latest-arrivals"
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Latest Arrivals", path: "/latest-arrivals" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/latest-arrivals")}#collection`,
            "name": "Latest Arrivals",
            "url": absoluteUrl("/latest-arrivals"),
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": latestProducts.length,
              "itemListElement": latestProducts.slice(0, 24).map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": absoluteUrl(`/product/${product.slug}`),
                "name": product.name,
              })),
            },
          },
        ]}
      />

      <main className="bg-background">
        <section className="relative isolate overflow-hidden border-b border-border">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/v8.mp4?v=latest-arrivals"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/a3.jpg"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.52)_54%,rgba(0,0,0,0.2)_100%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-4 py-12 text-white sm:px-6 lg:min-h-[680px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                Fresh stock live now
              </div>
              <h1 className="font-display text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                Latest arrivals.
                <span className="block text-white/62">Built to explore.</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                Browse new gadgets, power accessories and premium tech essentials on one interactive drop page.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                      activeTab === tab
                        ? "border-white bg-white text-black"
                        : "border-white/16 bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-2 max-w-xl">
                {[
                  ["36", "new picks"],
                  ["24h", "fast dispatch"],
                  ["4.8", "avg rating"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-xl">
                    <div className="font-display text-2xl font-black">{value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/58">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {spotlight ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={spotlight?.id}
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden rounded-3xl border border-white/16 bg-white/10 shadow-2xl backdrop-blur-xl"
                >
                  <div className="grid min-h-[430px] md:grid-cols-[1.05fr_0.95fr]">
                    <div className="flex items-center justify-center bg-white/[0.08] p-6">
                      <img
                        src={spotlight.image}
                        alt={spotlight.name}
                        className="max-h-[340px] w-full object-contain drop-shadow-2xl"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white/72">
                          <Zap className="h-3.5 w-3.5" />
                          Spotlight
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/45">{spotlight.category}</p>
                        <h2 className="mt-2 font-display text-3xl font-black leading-tight">{spotlight.name}</h2>
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/68">{spotlight.description}</p>
                      </div>
                      <Link
                        to={`/product/${spotlight.slug}`}
                        className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                      >
                        View product
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                {spotlightProducts.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSpotlightIndex(index)}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      spotlightIndex === index
                        ? "border-white bg-white text-black"
                        : "border-white/14 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/12">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black">{product.name}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider opacity-60">{product.category}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            ) : (
              <div className="min-h-[430px] rounded-3xl border border-white/16 bg-white/10 p-8 backdrop-blur-xl">
                <div className="h-full min-h-[360px] animate-pulse rounded-2xl bg-white/10" />
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-3 py-8 sm:px-4 lg:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Grid3X3 className="h-3.5 w-3.5" />
                {activeTab} drop
              </div>
              <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">Fresh products in one scan</h2>
            </div>
            <Link
              to="/shop?sort=new"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:border-primary/40 hover:text-primary"
            >
              Open full shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading && latestProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-xl border border-border bg-muted" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
              <PackageSearch className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="font-display text-2xl font-bold">No fresh items here yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try another tab or open the full shop.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {filteredProducts.slice(0, 24).map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.025, 0.25) }}
                >
                  <ImageCursorCard imageUrl={product.image} category={product.category}>
                    <ProductCard product={product} />
                  </ImageCursorCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              { icon: Clock3, title: "Daily refresh", text: "Fresh stock and highlighted picks update as the catalog changes." },
              { icon: Boxes, title: "Category quick scan", text: "Tabs keep mobile accessories, audio and gadgets easy to compare." },
              { icon: Sparkles, title: "Interactive spotlight", text: "Tap a mini product to change the hero product instantly." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <item.icon className="mb-4 h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default LatestArrivals;
