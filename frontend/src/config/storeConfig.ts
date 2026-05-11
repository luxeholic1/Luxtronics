// src/config/storeConfig.ts

export interface StoreConfig {
  currency: string;
  symbol: string;
  country: string;
  label: string;
}

const STORE_CONFIG: Record<string, StoreConfig> = {
  'luxtronics.in': {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
  },
  'luxtronics.com.au': {
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
  },
  'luxtronics.co.nz': {
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
  },
};

// Fallback for localhost dev
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'luxtronics.in';

export const storeConfig: StoreConfig = STORE_CONFIG[hostname] ?? STORE_CONFIG['luxtronics.in'];

// Single WooCommerce API URL (shared across all domains)
export const API_URL = 'https://luxtronics.luxtronics.in/wp-json/wc/v3';
