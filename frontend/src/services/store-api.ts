import type { Product } from '@/data/products';
import { storeConfig } from '@/config/storeConfig';
import { getMarketRating } from '@/lib/market-ratings';
import { scoreTextMatch } from '@/lib/smart-search';
import { 
  fetchProductsFromFirebase, 
  fetchProductFromFirebase,
  fetchCategoriesFromFirebase,
  searchProductsInFirebase,
} from './firebase-products';

// Backend API URL - empty in production means same-origin Hostinger Express server.
// Guard against accidentally baking local dev URLs into deployed bundles.
const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const isLocalBackendUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(configuredBackendUrl);
const isBrowserOnLocalhost =
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
const BACKEND_URL = isLocalBackendUrl && !isBrowserOnLocalhost ? '' : configuredBackendUrl;

const apiUrl = (path: string) => `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;

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

const CATEGORY_RULES = [
  { name: 'Smartphones', slug: 'smartphones', patterns: [/phone/i, /iphone/i, /mobile/i, /smartphone/i, /handset/i] },
  { name: 'Laptops', slug: 'laptops', patterns: [/laptop/i, /macbook/i, /notebook/i, /ultrabook/i] },
  { name: 'Audio', slug: 'audio', patterns: [/headphone/i, /earbud/i, /speaker/i, /audio/i, /sound/i, /buds?/i] },
  { name: 'Wearables', slug: 'wearables', patterns: [/watch/i, /smartwatch/i, /wearable/i, /fitness band/i, /band/i] },
  { name: 'Gaming', slug: 'gaming', patterns: [/gaming/i, /gamepad/i, /controller/i, /console/i, /ps5/i, /xbox/i] },
  { name: 'Cameras', slug: 'cameras', patterns: [/camera/i, /dslr/i, /mirrorless/i, /lens/i, /photograph/i] },
  { name: 'Chargers & Cables', slug: 'chargers-cables', patterns: [/charger/i, /cable/i, /adapter/i, /usb-c/i, /type-c/i, /power bank/i] },
  { name: 'Smart Home', slug: 'smart-home', patterns: [/smart home/i, /home device/i, /automation/i, /robot/i, /sensor/i, /smart bulb/i] },
];

function isUncategorizedCategory(name: string) {
  const normalized = String(name || '').trim().toLowerCase();
  return !normalized || normalized === 'uncategorized' || normalized === 'uncategorised';
}

function inferCategoryFromProduct(product: StoreProduct) {
  const searchableText = [
    product?.name,
    product?.slug,
    product?.description,
    product?.shortDescription,
    ...(Array.isArray(product?.categories) ? product.categories.map((category: any) => category?.name || category?.slug || '') : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(searchableText))) {
      return { id: 0, name: rule.name, slug: rule.slug };
    }
  }

  return null;
}

function resolveProductCategories(product: StoreProduct) {
  const existing = Array.isArray(product.categories)
    ? product.categories
        .filter((category: any) => category && !isUncategorizedCategory(category.name) && !isUncategorizedCategory(category.slug))
        .map((category: any) => ({
          id: Number(category.id ?? 0),
          name: String(category.name ?? ''),
          slug: String(category.slug ?? ''),
        }))
        .filter((category) => category.name && category.slug)
    : [];

  if (existing.length > 0) {
    return existing;
  }

  const inferred = inferCategoryFromProduct(product);
  return inferred ? [inferred] : [];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  total?: number;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function fetchProductsFromStoreCache(
  page: number,
  perPage: number,
  search?: string
): Promise<{ products: StoreProduct[]; total: number; totalPages: number }> {
  let url = apiUrl(`/api/products?per_page=${perPage}&page=${page}`);
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await fetchJson<ApiResponse<StoreProduct[]>>(url);
  const products = Array.isArray(response.data) ? response.data : [];
  const total = Number(response.pagination?.total ?? response.total ?? products.length);
  const totalPages = Number(response.pagination?.totalPages ?? Math.ceil(total / perPage)) || 1;

  return { products, total, totalPages };
}

export async function fetchStoreProducts(page = 1, perPage = 100, search?: string): Promise<StoreProduct[]> {
  // Try Firestore first (fastest path). If the collection has products, use it
  // even when sync_status is stale or missing.
  try {
    console.log('[Store API] Fetching from Firestore (fast)');
    const firebaseProducts = await fetchProductsFromFirebase(page, perPage, search);
    const products = Array.isArray(firebaseProducts) ? firebaseProducts : [];

    if (products.length > 0) {
      console.log(`[Store API] Firestore returned ${products.length} products`);
      return products;
    }
  } catch (error) {
    console.warn('[Store API] Firestore fetch failed, falling back:', error);
  }

  // Fallback to same-origin server proxy. This avoids browser CORS and keeps Woo keys server-side.
  console.log('[Store API] Fetching from store cache API (fallback)');

  // perPage=0 means "fetch ALL" — paginate through WooCommerce 100 at a time
  if (perPage === 0 || perPage > 100) {
    try {
      const allProducts: StoreProduct[] = [];
      const maxPerPage = 500;
      let currentPage = 1;

      while (true) {
        const cacheResult = await fetchProductsFromStoreCache(currentPage, maxPerPage, search);
        const products = Array.isArray(cacheResult.products) ? cacheResult.products : [];
        const totalPages = Number(cacheResult.totalPages || 1);
        if (products.length === 0) break;

        allProducts.push(...products);

        if (currentPage >= totalPages) break;
        if (perPage > 0 && allProducts.length >= perPage) break;

        currentPage++;
      }

      return perPage > 0 ? allProducts.slice(0, perPage) : allProducts;
    } catch (error) {
      console.warn('[Store API] Store cache failed, falling back to WooCommerce proxy:', error);
    }

    const allProducts: StoreProduct[] = [];
    const maxPerPage = 100;
    let currentPage = 1;

    while (true) {
      let url = apiUrl(`/api/woo/products?per_page=${maxPerPage}&page=${currentPage}&status=publish`);
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

      const products = await response.json();
      if (!Array.isArray(products) || products.length === 0) break;

      allProducts.push(...products);

      if (products.length < maxPerPage) break;
      if (perPage > 0 && allProducts.length >= perPage) break;

      currentPage++;
    }

    return perPage > 0 ? allProducts.slice(0, perPage) : allProducts;
  }

  // Single page fetch (perPage ≤ 100)
  try {
    const cacheResult = await fetchProductsFromStoreCache(page, perPage, search);
    const products = Array.isArray(cacheResult.products) ? cacheResult.products : [];
    if (products.length > 0) return products;
  } catch (error) {
    console.warn('[Store API] Store cache failed, falling back to WooCommerce proxy:', error);
  }

  let url = apiUrl(`/api/woo/products?per_page=${perPage}&page=${page}&status=publish`);
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
  // Try Firestore first (fastest path)
  try {
    console.log('[Store API] Fetching product from Firestore (fast)');
    const product = await fetchProductFromFirebase(slug);

    if (product) {
      console.log(`[Store API] Firestore returned product: ${product.name}`);

      // If it's a variable product, fetch variations through the same-origin proxy
      if (product.type === 'variable' && product.id) {
        try {
          const variationsResponse = await fetch(
            apiUrl(`/api/woo/products/${product.id}/variations?per_page=100`),
            { headers: { 'Accept': 'application/json' } },
          );

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
  } catch (error) {
    console.warn('[Store API] Firestore fetch failed, falling back to WooCommerce:', error);
  }

  // Fallback to same-origin WooCommerce proxy
  console.log('[Store API] Fetching product from WooCommerce proxy (fallback)');
  
  try {
    const response = await fetch(
      apiUrl(`/api/woo/products?slug=${encodeURIComponent(slug)}&per_page=1&status=publish`),
      { headers: { 'Accept': 'application/json' } },
    );
    
    if (!response.ok) return null;
    
    const products = await response.json();
    const product = Array.isArray(products) && products.length > 0 ? products[0] : null;
    
    if (!product) return null;
    
    // If it's a variable product, fetch variations
    if (product.type === 'variable' && product.id) {
      try {
        const variationsResponse = await fetch(
          apiUrl(`/api/woo/products/${product.id}/variations?per_page=100`),
          { headers: { 'Accept': 'application/json' } },
        );
        
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
  // Try Firestore first (fastest path)
  try {
    console.log('[Store API] Fetching categories from Firestore (fast)');

    // Warm product cache in the background; don't block first render on the full catalog.
    void fetchProductsFromFirebase().catch(() => {});

    const firebaseCategories = await fetchCategoriesFromFirebase();
    const categories = Array.isArray(firebaseCategories) ? firebaseCategories : [];

    if (categories.length > 0) {
      console.log(`[Store API] Firestore returned ${categories.length} categories`);
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
  } catch (error) {
    console.warn('[Store API] Firestore fetch failed, falling back to WooCommerce:', error);
  }

  // Fallback to same-origin WooCommerce proxy
  console.log('[Store API] Fetching categories from WooCommerce proxy (fallback)');
  
  const response = await fetch(
    apiUrl(`/api/woo/categories?page=${page}&per_page=${perPage}&hide_empty=false`),
    { headers: { 'Accept': 'application/json' } },
  );
  
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

  // Try Firestore first (fastest path)
  try {
    console.log('[Store API] Searching in Firestore (fast)');
    const firebaseProducts = await searchProductsInFirebase(query);
    const products = Array.isArray(firebaseProducts) ? firebaseProducts : [];

    if (products.length > 0) {
      console.log(`[Store API] Firestore search returned ${products.length} results`);
      return products.slice(0, 8).map(mapStoreProductToLocalProduct).filter((product): product is Product => product !== null);
    }
  } catch (error) {
    console.warn('[Store API] Firestore search failed, falling back to WooCommerce:', error);
  }

  // Fallback to same-origin WooCommerce proxy
  console.log('[Store API] Searching in WooCommerce proxy (fallback)');
  
  try {
    const response = await fetch(
      apiUrl(`/api/woo/products?search=${encodeURIComponent(query)}&per_page=8&status=publish`),
      { headers: { 'Accept': 'application/json' } },
    );
    
    if (!response.ok) return [];
    
    const products = await response.json();
    
    if (Array.isArray(products) && products.length > 0) {
      return products.map(mapStoreProductToLocalProduct).filter((product): product is Product => product !== null);
    }

    return [];
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

  const resolvedCategories = resolveProductCategories(product);

  return {
    id: (product.id ?? Math.random()).toString(),
    slug: product.slug || '',
    name: product.name || 'Unnamed Product',
    // Normalise categories — handle both WooCommerce raw format and already-mapped format
    categories: resolvedCategories,
    category: resolvedCategories[0]?.name || 'Uncategorized',
    categoryId: resolvedCategories[0]?.id,
    price: Math.round(price),
    oldPrice: regularPrice > price ? Math.round(regularPrice) : undefined,
    image: mainImage,
    images: allImages.length > 0 ? allImages : [mainImage],
    ...(() => {
      const wooRating = Number((product as any).average_rating || product.rating || 0);
      const wooReviews = Number((product as any).rating_count || product.reviewCount || 0);
      const slug = product.slug || '';
      // Pass category name (more reliable than slug for matching)
      const catName = product.categories?.[0]?.name || product.categories?.[0]?.slug || '';
      const market = getMarketRating(product.name || '', slug, catName, wooRating);
      return {
        rating: market ? market.rating : (wooRating > 0 ? wooRating : 4.2),
        reviews: market ? market.reviews : (wooReviews > 0 ? wooReviews : 4800),
      };
    })(),
    description: (product as any).short_description || product.description || product.shortDescription || '',
    badge: regularPrice > price ? 'Sale' : undefined,
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
