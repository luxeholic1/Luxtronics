import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { fetchStoreProduct, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import { sanitizeHtml } from "@/lib/sanitize";
import { redirectToWooCheckout } from "@/lib/woo-checkout";
import { trackAnalyticsEvent, updateLiveVisitor } from "@/lib/analytics";
import {
  absoluteUrl,
  breadcrumbSchema,
  cleanText,
  offerReturnPolicyReference,
  offerShippingDetailsSchema,
  toSchemaInteger,
  toSchemaPrice,
} from "@/lib/seo";
import SEO from "@/components/SEO";
import type { Product } from "@/data/products";

type Variation = NonNullable<Product["variations"]>[0];

const ProductDetail = () => {
  const { slug = "" } = useParams();
  const { formatPrice, country } = useCurrency();

  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // ─── Fetch Product Detail ───────────────────────────────────────────────
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const detail = await fetchStoreProduct(slug);
      if (detail) {
        const mapped = mapStoreProductToLocalProduct(detail);
        if (mapped) return mapped;
      }

      return null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Fetch Related Products ─────────────────────────────────────────────
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: async () => {
      const storeProducts = await fetchStoreProducts(1, 12); // Fetch fewer for speed
      const rawProducts = Array.isArray(storeProducts) ? storeProducts : [];
      const mapped = rawProducts
        .map(mapStoreProductToLocalProduct)
        .filter((item): item is Product => item !== null && item.slug !== slug);
      return mapped.slice(0, 4);
    },
    enabled: !!product,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // ─── Auto-select first variation when product loads ─────────────────────
  useEffect(() => {
    if (product?.variations && product.variations.length > 0) {
      const firstVar = product.variations[0];
      setSelectedVariation(firstVar);
      const initialAttrs: Record<string, string> = {};
      firstVar.attributes.forEach((attr) => {
        initialAttrs[attr.name] = attr.option;
      });
      setSelectedAttributes(initialAttrs);
    }
  }, [product]);

  // ─── Match variation when attributes change ──────────────────────────────
  useEffect(() => {
    if (!product?.variations?.length) return;
    const match = product.variations.find((v) =>
      v.attributes.every((attr) => selectedAttributes[attr.name] === attr.option)
    );
    setSelectedVariation(match || null);
    // If the matched variation has an image, switch to it
    if (match?.image) setActiveImageIndex(-1); // -1 = show variation image
  }, [selectedAttributes, product]);

  // ─── Attribute change ────────────────────────────────────────────────────
  const handleAttributeChange = (attributeName: string, option: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: option }));
  };

  // ─── Derived values ──────────────────────────────────────────────────────
  const currentPrice = selectedVariation?.price ?? product?.price ?? 0;
  const currentOldPrice = selectedVariation?.oldPrice ?? product?.oldPrice;
  const variationImage = activeImageIndex === -1 ? (selectedVariation?.image ?? null) : null;
  const offerCurrency = country.currency || "INR";
  const schemaPrice = currentPrice * (country.exchangeRate || 1);
  const schemaShippingMax = 15 * (country.exchangeRate || 1);
  const sourceRating = Number((product as any)?.sourceRating || 0);
  const sourceReviewCount = Number((product as any)?.sourceReviewCount || 0);
  const seoProductName = product ? cleanText(product.name, 58) : '';

  // Build images list (product images)
  const productImages: string[] = useMemo(() => {
    if (!product) return [];
    return [product.image].filter(Boolean);
  }, [product]);

  const displayImage =
    variationImage ||
    productImages[activeImageIndex] ||
    product?.image ||
    "";

  const inStock = selectedVariation
    ? selectedVariation.stockStatus === "instock"
    : true;

  // ─── Add to cart flash ───────────────────────────────────────────────────
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    if (!product) return;
    
    // Add product to cart with selected variation and correct qty
    const productToAdd = {
      ...product,
      // Store variation_id on the product so Cart can pass it to WooCommerce
      woo_variation_id: selectedVariation ? Number(selectedVariation.id) : undefined,
    };
    
    addItem(productToAdd, qty); // ← use qty state, not hardcoded 1
    
    // Show success animation
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    
  };

  const related = useMemo(() => relatedProducts, [relatedProducts]);

  useEffect(() => {
    if (!product) return;
    trackAnalyticsEvent({
      type: "product_view",
      path: `/product/${product.slug}`,
      title: product.name,
      label: product.name,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productCategory: product.category,
      productPrice: product.price,
    });
    updateLiveVisitor({
      path: `/product/${product.slug}`,
      title: product.name,
      section: "Product detail",
      lastAction: `Viewing ${product.name}`,
      currentProductId: product.id,
      currentProductName: product.name,
      currentProductSlug: product.slug,
      currentProductCategory: product.category,
    });
  }, [product]);

  // ─── Unique attribute names ──────────────────────────────────────────────
  const attributeNames: string[] = useMemo(() => {
    if (!product?.variations) return [];
    return Array.from(
      new Set(product.variations.flatMap((v) => v.attributes.map((a) => a.name)))
    );
  }, [product]);

  // Options available for each attribute name
  const getOptionsForAttribute = (attrName: string): string[] =>
    Array.from(
      new Set(
        product?.variations
          ?.filter((v) => v.attributes.some((a) => a.name === attrName))
          .map((v) => v.attributes.find((a) => a.name === attrName)?.option)
          .filter((o): o is string => Boolean(o))
      )
    );

  // Is this option available given the current selections for OTHER attributes?
  const isOptionAvailable = (attrName: string, option: string): boolean => {
    if (!product?.variations) return false;
    const otherAttrs = { ...selectedAttributes, [attrName]: option };
    return product.variations.some((v) =>
      Object.entries(otherAttrs).every(([name, val]) => {
        const varAttr = v.attributes.find((a) => a.name === name);
        return varAttr?.option === val;
      })
    );
  };

  // ─── Loading / not found states ──────────────────────────────────────────
  if (productLoading && !product) {
    return (
      <Layout>
        <div className="container pt-40 text-center">
          <div className="inline-flex items-center gap-3 text-muted-foreground animate-pulse">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="font-display text-xl">Loading product…</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container pt-40 text-center">
          <h1 className="font-display text-4xl mb-4">Product not found</h1>
          <Link to="/shop" className="text-primary">← Back to shop</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${seoProductName} — Buy Online | Luxtronics`}
        description={cleanText(product.description || `Buy ${product.name} online at Luxtronics. Check product availability, coverage details, and shipping options before checkout.`)}
        keywords={`${product.name}, ${product.category}, buy ${product.name} online, luxtronics`}
        url={`/product/${slug}`}
        image={product.image}
        type="product"
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.category, path: `/shop?category=${product.category}` },
            { name: product.name, path: `/product/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${absoluteUrl(`/product/${slug}`)}#product`,
            "name": product.name,
            "description": cleanText(product.description || product.name, 5000),
            "image": [product.image, ...(product.images || [])].filter(Boolean).map((src) => absoluteUrl(src)),
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": product.brand || "Luxtronics"
            },
            "offers": {
              "@type": "Offer",
              "url": absoluteUrl(`/product/${slug}`),
              "priceCurrency": offerCurrency,
              "price": toSchemaPrice(schemaPrice),
              "availability": inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition",
              "seller": {
                "@type": "Organization",
                "name": "Luxtronics",
                "url": absoluteUrl("/"),
                "@id": `${absoluteUrl("/")}#organization`
              },
              "hasMerchantReturnPolicy": offerReturnPolicyReference(country.code),
              "shippingDetails": offerShippingDetailsSchema({
                countryCode: country.code,
                currency: offerCurrency,
                maxShippingValue: schemaShippingMax,
              })
            },
            "aggregateRating": sourceReviewCount > 0 && sourceRating > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": sourceRating,
              "reviewCount": toSchemaInteger(sourceReviewCount),
              "bestRating": 5,
              "worstRating": 1
            } : undefined,
            "category": product.category
          },
        ]}
      />
      <section className="container pt-6 pb-16">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.92fr_1.08fr] mt-6">
          {/* ── LEFT: Image Gallery ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-sm group">
              <div className="absolute inset-0 bg-gradient-radial opacity-60" />
              <div className="absolute inset-4 rounded-[1.25rem] border border-white/40 bg-background/20 dark:border-white/5" />
              <img
                key={displayImage}
                src={displayImage}
                alt={product.name}
                width={800}
                height={800}
                className="relative mx-auto h-full w-[82%] object-contain transition-all duration-500 group-hover:scale-105"
              />

              {/* Previous / Next arrows for multiple images */}
              {productImages.length > 1 && activeImageIndex !== -1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((i) => Math.max(0, i - 1))}
                    disabled={activeImageIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 backdrop-blur border border-border flex items-center justify-center hover:bg-background transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((i) => Math.min(productImages.length - 1, i + 1))}
                    disabled={activeImageIndex === productImages.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 backdrop-blur border border-border flex items-center justify-center hover:bg-background transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Stock badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                inStock
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 h-20 w-20 rounded-xl border-2 flex items-center justify-center bg-gradient-card overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? "border-primary shadow-glow scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="h-14 w-14 object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col rounded-2xl border border-border bg-card/85 p-4 shadow-sm backdrop-blur sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {product.category}
                </p>
                <h1 className="max-w-3xl font-display text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem]">
                  {product.name}
                </h1>
              </div>

              <div className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                inStock
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-border py-4">
              {/* Rating */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(product.rating)
                          ? "h-4 w-4 fill-primary text-primary"
                          : "h-4 w-4 text-muted-foreground"
                      }
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({(product.reviews || 0).toLocaleString()})
                </span>
              </div>

              {/* Price */}
              <div className="ml-auto flex flex-wrap items-baseline gap-2">
                <span className="font-display text-3xl font-black text-gradient sm:text-4xl">
                  {formatPrice(currentPrice)}
                </span>
                {currentOldPrice && currentOldPrice > currentPrice && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(currentOldPrice)}
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                      Sale price
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* ── Variation Selectors ── */}
            {attributeNames.length > 0 && (
              <div className="mt-5 space-y-4">
                <div className="h-px bg-border" />

                {attributeNames.map((attrName) => {
                  const options = getOptionsForAttribute(attrName);
                  const selected = selectedAttributes[attrName];

                  // Detect if this is a color attribute
                  const isColor = /colou?r/i.test(attrName);

                  return (
                    <div key={attrName} className="space-y-2.5 rounded-xl border border-border bg-background/55 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {attrName}
                        </span>
                        {selected && (
                          <span className="text-xs text-primary font-medium">{selected}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {options.map((option) => {
                          const isSelected = selected === option;
                          const available = isOptionAvailable(attrName, option);

                          return (
                            <button
                              key={option}
                              id={`attr-${attrName}-${option}`}
                              onClick={() => available && handleAttributeChange(attrName, option)}
                              disabled={!available}
                              className={`
                                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                                border transition-all duration-200 select-none
                                ${isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-glow scale-105"
                                  : available
                                    ? "border-border text-foreground hover:border-primary/60 hover:bg-secondary/50 hover:scale-105"
                                    : "border-border/40 text-muted-foreground/40 cursor-not-allowed line-through"
                                }
                              `}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 shrink-0" />
                              )}
                              {option}
                              {!available && (
                                <span className="absolute inset-0 rounded-full overflow-hidden">
                                  <span
                                    className="absolute top-1/2 left-0 right-0 h-px bg-border/60 -rotate-6"
                                    style={{ transform: "rotate(-6deg) translateY(-50%)" }}
                                  />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* No match warning */}
                {attributeNames.length > 0 && !selectedVariation && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    This combination is not available. Please choose a different option.
                  </div>
                )}

                <div className="h-px bg-border" />
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mt-5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Qty
              </span>
              <div className="flex items-center gap-3 border border-border rounded-full px-3 py-1.5 bg-secondary/20">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="text-sm font-bold w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  trackAnalyticsEvent({
                    type: "product_intent",
                    label: `Buy now ${product.name}`,
                    path: `/product/${product.slug}`,
                    productId: product.id,
                    productName: product.name,
                    productSlug: product.slug,
                    productCategory: product.category,
                    productPrice: currentPrice,
                  });
                  // Buy Now - Direct to WooCommerce checkout
                  redirectToWooCheckout(
                    [{
                      product_id: Number(product.id),
                      quantity: qty,
                      variation_id: selectedVariation ? Number(selectedVariation.id) : undefined,
                    }],
                    window.location.hostname,
                    country.currency
                  );
                }}
                disabled={!inStock || (attributeNames.length > 0 && !selectedVariation)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                data-analytics-label={`Buy now ${product.name}`}
                data-product-id={product.id}
                data-product-name={product.name}
                data-product-slug={product.slug}
                data-product-category={product.category}
                data-product-price={currentPrice}
              >
                <ShoppingBag className="h-4 w-4" />
                Buy Now
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!inStock || (attributeNames.length > 0 && !selectedVariation)}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                    : "border-border bg-transparent text-foreground hover:bg-secondary"
                }`}
                data-analytics-label={`Add ${product.name} to cart`}
                data-product-id={product.id}
                data-product-name={product.name}
                data-product-slug={product.slug}
                data-product-category={product.category}
                data-product-price={currentPrice}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart!
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>

              <button className="h-12 w-12 rounded-xl border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors flex-shrink-0">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-5 rounded-xl border border-border bg-background/55 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Product info</h2>
                  <button
                    type="button"
                    onClick={() => setShowMoreInfo((value) => !value)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    {showMoreInfo ? "Show less" : "More info"}
                  </button>
                </div>
                <div className="relative">
                  <div
                    className={`prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground transition-all ${
                      showMoreInfo ? "" : "max-h-36 overflow-hidden"
                    }`}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
                  />
                  {!showMoreInfo && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                  )}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-3 gap-2 pt-5 border-t border-border">
              {[
                { icon: Truck, label: "Shipping options" },
                { icon: Shield, label: "Coverage varies" },
                { icon: RotateCcw, label: "Return support" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-background/55 px-2 py-3 text-center">
                  <f.icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                  <p className="text-[11px] font-semibold text-muted-foreground">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="container pb-24">
        <h2 className="font-display font-bold text-3xl mb-8">
          You may also <span className="text-gradient">like</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
