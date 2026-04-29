import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingBag, Heart, Truck, Shield, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import { getProduct, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchStoreProductBySlug, fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Product } from "@/data/products";

const ProductDetail = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const fallbackProduct = getProduct(slug);
  const [product, setProduct] = useState<Product | null>(fallbackProduct || null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!fallbackProduct);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [detail, storeProducts] = await Promise.all([
          fetchStoreProductBySlug(slug),
          fetchStoreProducts(),
        ]);

        if (!mounted) {
          return;
        }

        const resolvedProduct = detail ? mapStoreProductToLocalProduct(detail) : fallbackProduct || null;
        const resolvedRelated = storeProducts
          .map(mapStoreProductToLocalProduct)
          .filter((item) => item.slug !== slug)
          .slice(0, 4);

        setProduct(resolvedProduct);
        setRelatedProducts(resolvedRelated.length > 0 ? resolvedRelated : products.filter((item) => item.slug !== slug).slice(0, 4));
      } catch {
        if (!mounted) {
          return;
        }

        setProduct(fallbackProduct || null);
        setRelatedProducts(products.filter((item) => item.slug !== slug).slice(0, 4));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const related = useMemo(() => relatedProducts, [relatedProducts]);

  if (loading && !product) {
    return (
      <Layout>
        <div className="container pt-40 text-center">
          <h1 className="font-display text-4xl mb-4">Loading product...</h1>
          <Link to="/shop" className="text-primary">← Back to shop</Link>
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
      <section className="container pt-32 pb-20">
        <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          <div className="relative aspect-square rounded-3xl bg-gradient-card border border-border flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial opacity-60" />
            <img
              src={product.image}
              alt={product.name}
              width={800}
              height={800}
              className="relative h-3/4 w-3/4 object-contain animate-float"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">
              {product.category}
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-4 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(product.rating) ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-muted-foreground"}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div
              className="mt-6 text-muted-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />

            <div className="flex items-baseline gap-3 mt-8">
              <span className="font-display font-bold text-5xl text-gradient">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => navigate("/checkout", { state: { product } })}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="h-4 w-4" />
                Buy Now
              </button>
              <button 
                onClick={() => {
                  // In a real app we'd add it to a global cart, 
                  // but here we can just go to the cart directly or show a toast
                  navigate("/cart");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-7 py-4 text-sm font-semibold text-foreground hover:bg-secondary transition-all"
              >
                Add to Cart
              </button>
              <button className="h-14 w-14 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors flex-shrink-0">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-border">
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

      <section className="container pb-24">
        <h2 className="font-display font-bold text-3xl mb-8">You may also like</h2>
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
