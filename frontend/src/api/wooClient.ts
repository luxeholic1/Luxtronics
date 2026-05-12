// src/api/wooClient.ts
import { storeConfig } from '../config/storeConfig';

// Get store-specific WooCommerce API keys based on current domain
function getStoreCredentials() {
  const country = storeConfig.country;
  
  let key = '';
  let secret = '';
  
  switch (country) {
    case 'IN':
      key = import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA || '';
      secret = import.meta.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';
      break;
    case 'AU':
      key = import.meta.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA || '';
      secret = import.meta.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || '';
      break;
    case 'NZ':
      key = import.meta.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND || '';
      secret = import.meta.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || '';
      break;
    default:
      key = import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA || '';
      secret = import.meta.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';
  }
  
  return { key, secret };
}

export interface WooResponse<T> {
  data?: T;
  error?: string;
}

export async function wcFetch(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const { key, secret } = getStoreCredentials();
  const apiUrl = storeConfig.apiUrl;
  
  // Append consumer_key and consumer_secret to the URL
  const separator = endpoint.includes('?') ? '&' : '?';
  const urlWithAuth = `${apiUrl}${endpoint}${separator}consumer_key=${key}&consumer_secret=${secret}`;

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
