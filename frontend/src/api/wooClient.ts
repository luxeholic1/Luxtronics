// src/api/wooClient.ts
import { API_URL } from '../config/storeConfig';

// WooCommerce REST API keys (per store)
// Store these in .env per domain — see Step 5
const CK = import.meta.env.VITE_WOOCOMMERCE_KEY || '';
const CS = import.meta.env.VITE_WOOCOMMERCE_SECRET || '';

export interface WooResponse<T> {
  data?: T;
  error?: string;
}

export async function wcFetch(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  // Append consumer_key and consumer_secret to the URL
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithAuth = `${API_URL}${endpoint}${separator}consumer_key=${CK}&consumer_secret=${CS}`;

  const res = await fetch(urlWithAuth, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    throw new Error(`WC API error: ${res.status}`);
  }
  
  return res.json();
}

// Convenience methods
export const getProducts = (params = '') => wcFetch(`/products?${params}`);
export const getProduct = (id: number) => wcFetch(`/products/${id}`);
export const getCart = () => wcFetch(`/cart`);
export const createOrder = (data: Record<string, unknown>) => wcFetch(`/orders`, { 
  method: 'POST', 
  body: JSON.stringify(data) 
});
