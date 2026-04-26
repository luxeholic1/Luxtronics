import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { products } from "@/data/products";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Cart = () => {
  const [items, setItems] = useState([
    { product: products[0], qty: 1 },
    { product: products[2], qty: 2 },
  ]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  const addToCart = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { product: target, qty: 1 }];
    });
  };

  const relatedProducts = products
    .filter((p) => !items.some((item) => item.product.id === p.id))
    .slice(0, 8);

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight mb-12">
          Your <span className="text-gradient">cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-5 rounded-2xl bg-gradient-card border border-border"
                >
                  <div className="h-24 w-24 rounded-xl bg-secondary/40 flex items-center justify-center flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </p>
                    <h3 className="font-display font-semibold text-lg leading-tight mt-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-border rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-display font-bold text-lg">
                        ${(product.price * qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center self-start"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 h-fit p-6 rounded-2xl bg-gradient-card border border-border">
              <h3 className="font-display font-bold text-xl mb-6">Order summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">${total.toLocaleString()}</span>
                </div>
              </div>
              <button className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all">
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Free shipping on orders over $200
              </p>
            </aside>
          </div>
        )}
      </section>

      <section className="container pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-primary font-medium uppercase tracking-widest mb-2">Recommended</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
              Related <span className="text-gradient">items</span>
            </h2>
          </div>
        </div>

        <Carousel
          opts={{ align: "start", loop: false }}
          className="w-full"
        >
          <CarouselContent>
            {relatedProducts.map((product) => (
              <CarouselItem key={product.id} className="basis-[84%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <article className="h-full rounded-2xl border border-border bg-gradient-card p-4">
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="aspect-square rounded-xl bg-secondary/40 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        width={240}
                        height={240}
                        className="h-3/4 w-3/4 object-contain"
                      />
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-display text-xl font-bold">${product.price}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className="inline-flex items-center rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
                    >
                      Add item
                    </button>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 h-9 w-9 border-border bg-background/80 backdrop-blur" />
          <CarouselNext className="-right-3 h-9 w-9 border-border bg-background/80 backdrop-blur" />
        </Carousel>
      </section>
    </Layout>
  );
};

export default Cart;
