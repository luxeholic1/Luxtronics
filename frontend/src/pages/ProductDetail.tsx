import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { getProduct, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { fetchStoreProduct, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import { sanitizeHtml } from "@/lib/sanitize";
import { redirectToWooCheckout } from "@/lib/woo-checkout";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import type { Product } from "@/data/products";

type Variation = NonNullable<Product["variations"]>[0];

const ProductDetail = () => {
  const { slug = "" } = useParams();
  const { formatPrice, country } = useCurrency();
  const fallbackProduct = getProduct(slug);

  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // ─── Fetch Product Detail ───────────────────────────────────────────────
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const detail = await fetchStoreProduct(slug);
      if (detail) {
        const mapped = mapStoreProductToLocalProduct(detail);
        if (mapped) return mapped;
      }
      
      // If not found by slug directly, try to find in the products list as a backup
      const allProducts = await fetchStoreProducts(1, 100);
      const found = allProducts.find(p => p.slug === slug);
      if (found) {
        const mapped = mapStoreProductToLocalProduct(found);
        if (mapped) return mapped;
      }
      
      return fallbackProduct || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Fetch Related Products ─────────────────────────────────────────────
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: async () => {
      const storeProducts = await fetchStoreProducts(1, 12); // Fetch fewer for speed
      const mapped = storeProducts
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
    
    // Show toast notification
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
    });
  };

  const related = useMemo(() => relatedProducts, [relatedProducts]);

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
      {/* ── Full Product Schema for Google Shopping ── */}
      <SEO
        title={`${product.name} — Buy Online | Luxtronics`}
        description={product.description
          ? product.description.replace(/<[^>]+>/g, '').slice(0, 160)
          : `Buy ${product.name} online at Luxtronics. Free shipping, 2-year warranty, 30-day returns.`
        }
        keywords={`${product.name}, ${product.category}, buy ${product.name} online, luxtronics`}
        url={`https://luxtronics.in/product/${slug}`}
        image={product.image}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description?.replace(/<[^>]+>/g, '') || product.name,
          "image": [product.image, ...(product.images || [])].filter(Boolean),
          "sku": product.id,
          "brand": {
            "@type": "Brand",
            "name": "Luxtronics"
          },
          "offers": {
            "@type": "Offer",
            "url": `https://luxtronics.in/product/${slug}`,
            "priceCurrency": "INR",
            "price": currentPrice,
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "availability": inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Luxtronics",
              "url": "https://luxtronics.in"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "INR"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
                "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 30,
              "returnMethod": "https://schema.org/ReturnByMail"
            }
          },
          "aggregateRating": product.reviews > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviews,
            "bestRating": 5,
            "worstRating": 1
          } : undefined,
          "category": product.category
        }}
      />
      <section className="container pt-32 pb-20">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* ── LEFT: Image Gallery ── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl bg-gradient-card border border-border flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial opacity-60" />
              <img
                key={displayImage}
                src={displayImage}
                alt={product.name}
                width={800}
                height={800}
                className="relative h-3/4 w-3/4 object-contain transition-all duration-500 group-hover:scale-105"
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
                    <img src={img} alt="" className="h-14 w-14 object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">
              {product.category}
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4 text-sm">
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
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({(product.reviews || 0).toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-6">
              <span className="font-display font-bold text-5xl text-gradient">
                {formatPrice(currentPrice)}
              </span>
              {currentOldPrice && currentOldPrice > currentPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(currentOldPrice)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div
              className="mt-5 text-muted-foreground leading-relaxed prose prose-sm max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />

            {/* ── Variation Selectors ── */}
            {attributeNames.length > 0 && (
              <div className="mt-6 space-y-5">
                <div className="h-px bg-border" />

                {attributeNames.map((attrName) => {
                  const options = getOptionsForAttribute(attrName);
                  const selected = selectedAttributes[attrName];

                  // Detect if this is a color attribute
                  const isColor = /colou?r/i.test(attrName);

                  return (
                    <div key={attrName} className="space-y-3">
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
                                relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                                border-2 transition-all duration-200 select-none
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
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
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
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingBag className="h-4 w-4" />
                Buy Now
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!inStock || (attributeNames.length > 0 && !selectedVariation)}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 px-7 py-4 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                    : "border-border bg-transparent text-foreground hover:bg-secondary"
                }`}
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

              <button className="h-14 w-14 rounded-full border-2 border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors flex-shrink-0">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "2-Year Warranty" },
                { icon: RotateCcw, label: "30-Day Returns" },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <f.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">{f.label}</p>
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
