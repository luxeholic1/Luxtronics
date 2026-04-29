import { useState, useEffect } from 'react';
import { fetchWooProducts, fetchWooCategories, WooProduct } from '@/services/woocommerce';

export function useWooProducts(page = 1, perPage = 12, category?: string, search?: string) {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { products: data, total: count } = await fetchWooProducts(page, perPage, category, search);
        setProducts(data);
        setTotal(count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, perPage, category, search]);

  return { products, loading, error, total };
}

export function useWooCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchWooCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
}
