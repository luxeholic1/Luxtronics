// src/config/storeConfig.ts

export interface StoreConfig {
  apiUrl: string;
  currency: string;
  symbol: string;
  country: string;
  label: string;
}

const STORE_CONFIG: Record<string, StoreConfig> = {
  'luxtronics.in': {
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
  },
  'luxtronics.com.au': {
    apiUrl: 'https://luxtronics.com.au/wp-json/wc/v3',
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
  },
  'luxtronics.co.nz': {
    apiUrl: 'https://luxtronics.co.nz/wp-json/wc/v3',
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
  },
};

// Fallback for localhost dev
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'luxtronics.in';

export const storeConfig: StoreConfig = STORE_CONFIG[hostname] ?? STORE_CONFIG['luxtronics.in'];

export const API_URL = storeConfig.apiUrl;
