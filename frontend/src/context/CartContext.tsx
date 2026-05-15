import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
