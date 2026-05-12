// src/config/storeConfig.ts

export interface StoreConfig {
  currency: string;
  symbol: string;
  country: string;
  label: string;
  apiUrl: string;
}

const STORE_CONFIG: Record<string, StoreConfig> = {
  'luxtronics.in': {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.in': {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    label: 'India',
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'luxtronics.com.au': {
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.com.au': {
    currency: 'AUD',
    symbol: 'A$',
    country: 'AU',
    label: 'Australia',
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'luxtronics.co.nz': {
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
  'www.luxtronics.co.nz': {
    currency: 'NZD',
    symbol: 'NZ$',
    country: 'NZ',
    label: 'New Zealand',
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
  },
};

// Fallback for localhost dev
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'luxtronics.in';

export const storeConfig: StoreConfig = STORE_CONFIG[hostname] ?? STORE_CONFIG['luxtronics.in'];

// Export API_URL for backward compatibility
export const API_URL = storeConfig.apiUrl;
