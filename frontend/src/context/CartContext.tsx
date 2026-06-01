import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  qty: number;
}

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'luxtronics_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [addedQty, setAddedQty] = useState(1);

  // Load cart from localStorage on mount
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addItem = (product: Product, qty = 1) => {
    setAddedProduct(product);
    setAddedQty(qty);
    setItems((prev) => {
      // Normalise id to string for reliable comparison (guards against number/string mismatch)
      const pid = String(product.id);
      const existing = prev.find((i) => String(i.product.id) === pid);
      if (existing) {
        return prev.map((i) =>
          String(i.product.id) === pid ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });
  };

  useEffect(() => {
    if (!addedProduct) return;
    const timer = window.setTimeout(() => setAddedProduct(null), 2800);
    return () => window.clearTimeout(timer);
  }, [addedProduct]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => String(i.product.id) !== String(id)));

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (String(i.product.id) === String(id) ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems }}>
      {children}
      <AnimatePresence>
        {addedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-5 right-5 z-[9997] w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            role="status"
            aria-live="polite"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />
            <div className="flex gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img
                  src={addedProduct.image}
                  alt={addedProduct.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = "/logo.jpeg";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold text-foreground">Product added to cart</p>
                </div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{addedProduct.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Qty {addedQty} · Ready for checkout</p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href="/cart"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    View cart
                  </a>
                  <button
                    type="button"
                    onClick={() => setAddedProduct(null)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
                  >
                    Continue
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddedProduct(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close cart notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
