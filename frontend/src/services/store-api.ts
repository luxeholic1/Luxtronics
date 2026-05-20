import type { Product } from '@/data/products';
import { storeConfig } from '@/config/storeConfig';
import { 
  fetchProductsFromFirebase, 
  fetchProductFromFirebase,
  fetchCategoriesFromFirebase,
  searchProductsInFirebase,
  checkFirebaseAvailability 
} from './firebase-products';

// Backend API URL - only used if backend is available
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface StoreImage {
  id: number;
  src: string;
  alt?: string;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: StoreImage;
  sampleImage?: string;   // first product image for this category (used in UI)
  count: number;
  productCount?: number;
}

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  price: number;
  salePrice?: number;
  regularPrice: number;
  images: StoreImage[];
  rating: number;
  reviewCount: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  variations?: Array<{
    id: number;
    sku?: string;
    price: number;
    salePrice?: number;
    regularPrice: number;
    stockStatus: 'instock' | 'outofstock' | 'onbackorder';
    stock?: number;
    attributes: Array<{
      name: string;
      option?: string;
      value?: string;
    }>;
    image?: StoreImage;
  }>;
}

export interface WooCommerceOrder {
  id: number;
  order_key: string;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  payment_method: string;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    subtotal: string;
    total: string;
    price: number;
    image?: {
      src: string;
    };
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchStoreProducts(page = 1, perPage = 100, search?: string): Promise<StoreProduct[]> {
  // Try Firebase first (10-30x faster)
  try {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      console.log('[Store API] Fetching from Firebase (fast)');
      const products = await fetchProductsFromFirebase(page, perPage, search);
      
      if (products.length > 0) {
        console.log(`[Store API] Firebase returned ${products.length} products`);
        return products;
      }
    }
  } catch (error) {
    console.warn('[Store API] Firebase fetch failed, falling back to WooCommerce:', error);
  }

  // Fallback to WooCommerce API (slower but always works)
  console.log('[Store API] Fetching from WooCommerce API (fallback)');
  
  const { apiUrl } = storeConfig;
  const { key, secret } = getStoreCredentials();
  const authHeader = 'Basic ' + btoa(`${key}:${secret}`);

  // perPage=0 means "fetch ALL" — paginate through WooCommerce 100 at a time
  if (perPage === 0 || perPage > 100) {
    const allProducts: StoreProduct[] = [];
    const maxPerPage = 100;
    let currentPage = 1;

    while (true) {
      let url = `${apiUrl}/products?per_page=${maxPerPage}&page=${currentPage}&status=publish`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;

      allProducts.push(...products);

      // If we got fewer than maxPerPage, we've reached the last page
      if (products.length < maxPerPage) break;

      // If perPage is a specific number (not 0), stop when we have enough
      if (perPage > 0 && allProducts.length >= perPage) break;

      currentPage++;
    }

    return allProducts;
  }

  // Single page fetch (perPage ≤ 100)
  let url = `${apiUrl}/products?per_page=${perPage}&page=${page}&status=publish`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await fetch(url, {
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

  const products = await response.json();
  return Array.isArray(products) ? products : [];
}

// Get store-specific credentials
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

export async function fetchStoreProduct(slug: string): Promise<StoreProduct | null> {
  // Try Firebase first (10-30x faster)
  try {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      console.log('[Store API] Fetching product from Firebase (fast)');
      const product = await fetchProductFromFirebase(slug);
      
      if (product) {
        console.log(`[Store API] Firebase returned product: ${product.name}`);
        
        // If it's a variable product, fetch variations from WooCommerce
        if (product.type === 'variable' && product.id) {
          try {
            const { apiUrl } = storeConfig;
            const { key, secret } = getStoreCredentials();
            const variationsUrl = `${apiUrl}/products/${product.id}/variations?per_page=100`;
            const authHeader = 'Basic ' + btoa(`${key}:${secret}`);
            
            const variationsResponse = await fetch(variationsUrl, {
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
              },
            });
            
            if (variationsResponse.ok) {
              const variations = await variationsResponse.json();
              product.variations = Array.isArray(variations) ? variations : [];
            }
          } catch (error) {
            console.error('Failed to fetch variations:', error);
          }
        }
        
        return product;
      }
    }
  } catch (error) {
    console.warn('[Store API] Firebase fetch failed, falling back to WooCommerce:', error);
  }

  // Fallback to WooCommerce API
  console.log('[Store API] Fetching product from WooCommerce API (fallback)');
  
  try {
    // Direct WooCommerce API call
    const { apiUrl } = storeConfig;
    const { key, secret } = getStoreCredentials();
    
    const url = `${apiUrl}/products?slug=${encodeURIComponent(slug)}&per_page=1&status=publish`;
    const authHeader = 'Basic ' + btoa(`${key}:${secret}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) return null;
    
    const products = await response.json();
    const product = Array.isArray(products) && products.length > 0 ? products[0] : null;
    
    if (!product) return null;
    
    // If it's a variable product, fetch variations
    if (product.type === 'variable' && product.id) {
      try {
        const variationsUrl = `${apiUrl}/products/${product.id}/variations?per_page=100`;
        const variationsResponse = await fetch(variationsUrl, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        });
        
        if (variationsResponse.ok) {
          const variations = await variationsResponse.json();
          product.variations = Array.isArray(variations) ? variations : [];
        }
      } catch (error) {
        console.error('Failed to fetch variations:', error);
        // Continue without variations
      }
    }
    
    return product;
  } catch {
    return null;
  }
}

export async function fetchStoreCategories(page = 1, perPage = 20): Promise<{
  data: StoreCategory[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
}> {
  // Try Firebase first (10-30x faster)
  try {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      console.log('[Store API] Fetching categories from Firebase (fast)');

      // Pre-load products cache so fetchCategoriesFromFirebase can enrich with sample images
      try { await fetchProductsFromFirebase(); } catch { /* non-fatal */ }

      const categories = await fetchCategoriesFromFirebase();
      
      if (categories.length > 0) {
        console.log(`[Store API] Firebase returned ${categories.length} categories`);
        return {
          data: categories,
          pagination: { 
            page: 1, 
            perPage: categories.length, 
            total: categories.length, 
            totalPages: 1 
          },
        };
      }
    }
  } catch (error) {
    console.warn('[Store API] Firebase fetch failed, falling back to WooCommerce:', error);
  }

  // Fallback to WooCommerce API
  console.log('[Store API] Fetching categories from WooCommerce API (fallback)');
  
  // Direct WooCommerce API call
  const { apiUrl } = storeConfig;
  const { key, secret } = getStoreCredentials();
  
  const url = `${apiUrl}/products/categories?page=${page}&per_page=${perPage}&hide_empty=false`;
  const authHeader = 'Basic ' + btoa(`${key}:${secret}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const categories = await response.json();
  const total = parseInt(response.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
  
  return {
    data: Array.isArray(categories) ? categories : [],
    pagination: { page, perPage, total, totalPages },
  };
}

/**
 * Fetch search suggestions based on a query
 */
export async function fetchSearchSuggestions(query: string): Promise<Product[]> {
  if (!query || query.length < 2) return [];
  
  // Try Firebase first (10-30x faster)
  try {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      console.log('[Store API] Searching in Firebase (fast)');
      const products = await searchProductsInFirebase(query);
      
      if (products.length > 0) {
        console.log(`[Store API] Firebase search returned ${products.length} results`);
        return products.slice(0, 5).map(mapStoreProductToLocalProduct);
      }
    }
  } catch (error) {
    console.warn('[Store API] Firebase search failed, falling back to WooCommerce:', error);
  }

  // Fallback to WooCommerce API
  console.log('[Store API] Searching in WooCommerce API (fallback)');
  
  // Direct WooCommerce API call
  const { apiUrl } = storeConfig;
  const { key, secret } = getStoreCredentials();
  
  const url = `${apiUrl}/products?search=${encodeURIComponent(query)}&per_page=5&status=publish`;
  const authHeader = 'Basic ' + btoa(`${key}:${secret}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) return [];
    
    const products = await response.json();
    
    if (!Array.isArray(products)) return [];
    
    return products.map(mapStoreProductToLocalProduct);
  } catch {
    return [];
  }
}

export function mapStoreProductToLocalProduct(product: StoreProduct): Product {
  if (!product) {
    return {} as Product;
  }

  const parsePrice = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') return parseFloat(p) || 0;
    return 0;
  };

  const images = Array.isArray(product.images) ? product.images : [];
  const mainImage = images[0]?.src || '';
  const allImages = images.map(img => img.src).filter(Boolean);
  
  // Handle both MongoDB format (price, salePrice, regularPrice) and WooCommerce format (price, sale_price, regular_price)
  const price = parsePrice((product as any).sale_price || product.salePrice || (product as any).price || product.price);
  const regularPrice = parsePrice((product as any).regular_price || product.regularPrice || (product as any).price || product.price);

  return {
    id: (product.id ?? Math.random()).toString(),
    slug: product.slug || '',
    name: product.name || 'Unnamed Product',
    // Normalise categories — handle both WooCommerce raw format and already-mapped format
    categories: Array.isArray(product.categories)
      ? product.categories.map((c: any) => ({
          id:   Number(c.id   ?? 0),
          name: String(c.name ?? ''),
          slug: String(c.slug ?? ''),
        }))
      : [],
    category: product.categories?.[0]?.name || 'Uncategorized',
    categoryId: product.categories?.[0]?.id,
    price: Math.round(price),
    oldPrice: regularPrice > price ? Math.round(regularPrice) : undefined,
    image: mainImage,
    images: allImages.length > 0 ? allImages : [mainImage],
    rating: Number((product as any).average_rating || product.rating || 5),
    reviews: Number((product as any).rating_count || product.reviewCount || 0),
    description: (product as any).short_description || product.description || product.shortDescription || '',
    badge: regularPrice > price ? '-20%' : undefined,
    variations: (Array.isArray(product.variations) ? product.variations : [])
      .map((variation) => {
        if (!variation) return null;
        const vPrice = parsePrice(variation.salePrice ?? variation.price);
        const vRegular = parsePrice(variation.regularPrice || variation.price);
        
        // Ensure attributes are always an array and handle missing name/option
        const vAttrs = Array.isArray(variation.attributes) 
          ? variation.attributes.map(a => ({
              name: String(a.name || ''),
              option: String(a.option || a.value || '')
            })).filter(a => a.name && a.option)
          : [];

        return {
          id: (variation.id ?? Math.random()).toString(),
          sku: variation.sku,
          price: Math.round(vPrice > 0 ? vPrice : price),
          oldPrice: vRegular > (vPrice || price) ? Math.round(vRegular) : undefined,
          attributes: vAttrs,
          image: variation.image?.src,
          stockStatus: variation.stockStatus || 'instock',
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null),
  };
}


// All 3 store configs for cross-store order fetching
const ALL_STORES = [
  {
    label: 'India',
    apiUrl: 'https://luxtronics.luxtronics.in/wp-json/wc/v3',
    storeBase: 'https://luxtronics.luxtronics.in',
    getKey:    () => import.meta.env.VITE_WOOCOMMERCE_KEY_INDIA    || '',
    getSecret: () => import.meta.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  },
  {
    label: 'Australia',
    apiUrl: 'https://storeau.luxtronics.luxtronics.in/wp-json/wc/v3',
    storeBase: 'https://storeau.luxtronics.luxtronics.in',
    getKey:    () => import.meta.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA    || '',
    getSecret: () => import.meta.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || '',
  },
  {
    label: 'New Zealand',
    apiUrl: 'https://storenz.luxtronics.luxtronics.in/wp-json/wc/v3',
    storeBase: 'https://storenz.luxtronics.luxtronics.in',
    getKey:    () => import.meta.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND    || '',
    getSecret: () => import.meta.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || '',
  },
];

/**
 * Fetch customer orders from ALL 3 stores and merge them.
 * Each order gets a `storeBase` field so Track Order links to the correct store.
 */
export async function fetchCustomerOrders(customerEmail: string): Promise<(WooCommerceOrder & { storeBase: string; storeLabel: string })[]> {
  const results = await Promise.allSettled(
    ALL_STORES.map(async (store) => {
      const key    = store.getKey();
      const secret = store.getSecret();
      if (!key || !secret) return [];

      const url = `${store.apiUrl}/orders?search=${encodeURIComponent(customerEmail)}&per_page=100&orderby=date&order=desc`;
      const authHeader = 'Basic ' + btoa(`${key}:${secret}`);

      const response = await fetch(url, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      });

      if (!response.ok) return [];

      const orders = await response.json();
      if (!Array.isArray(orders)) return [];

      // Tag each order with which store it came from
      return orders.map((o: WooCommerceOrder) => ({
        ...o,
        storeBase:  store.storeBase,
        storeLabel: store.label,
      }));
    })
  );

  // Flatten all fulfilled results, sort by date descending
  const allOrders = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);

  allOrders.sort((a, b) =>
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  return allOrders;
}

/**
 * Fetch single order by ID
 */
export async function fetchOrder(orderId: number): Promise<WooCommerceOrder | null> {
  try {
    const { apiUrl } = storeConfig;
    const { key, secret } = getStoreCredentials();
    
    const url = `${apiUrl}/orders/${orderId}`;
    const authHeader = 'Basic ' + btoa(`${key}:${secret}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}
