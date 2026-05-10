import type { Product } from '@/data/products';

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
  count: number;
  productCount?: number;
  sampleImage?: string | null;
}

export interface StoreVariation {
  id: number;
  sku?: string;
  price: number;
  salePrice?: number;
  regularPrice: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  attributes: Array<{
    name: string;
    option: string;
  }>;
  image?: {
    id: number;
    src: string;
    alt: string;
  };
}

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  salePrice?: number;
  regularPrice: number;
  images: StoreImage[];
  average_rating?: string;
  rating_count?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  variations?: StoreVariation[];
  attributes?: Array<{
    name: string;
    value: string;
    options?: string[];
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

export async function fetchStoreProducts(page = 1, perPage = 100): Promise<StoreProduct[]> {
  const response = await fetchJson<ApiResponse<StoreProduct[]>>(`/api/products?per_page=${perPage}&page=${page}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to load products');
  }

  return response.data;
}

export async function fetchStoreProduct(slug: string): Promise<StoreProduct | null> {
  try {
    const response = await fetchJson<ApiResponse<StoreProduct>>(`/api/products/slug/${encodeURIComponent(slug)}`);

    return response.success ? response.data : null;
  } catch {
    return null;
  }
}

export async function fetchStoreCategories(page = 1, perPage = 20): Promise<{
  data: StoreCategory[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
}> {
  const response = await fetchJson<{
    success: boolean;
    data: StoreCategory[];
    pagination?: { page: number; perPage: number; total: number; totalPages: number };
    error?: string;
  }>(`/api/categories?page=${page}&per_page=${perPage}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to load categories');
  }

  return {
    data: response.data,
    pagination: response.pagination || { page, perPage, total: response.data.length, totalPages: 1 },
  };
}

export function mapStoreProductToLocalProduct(product: StoreProduct): Product {
  const mainImage = product.images?.[0]?.src || '';
  
  const activePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.regularPrice && product.regularPrice > 0 ? product.regularPrice : product.price;
  
  return {
    id: product.id.toString(),
    slug: product.slug,
    name: product.name,
    category: product.category || 'Uncategorized',
    price: Math.round(activePrice),
    oldPrice: originalPrice > activePrice ? Math.round(originalPrice) : undefined,
    image: mainImage,
    rating: parseFloat(product.average_rating || '0'),
    reviews: product.rating_count || 0,
    description: product.description || product.shortDescription || '',
    badge: originalPrice > activePrice ? `-${Math.round(((originalPrice - activePrice) / originalPrice) * 100)}%` : undefined,
    variations: product.variations?.map(v => ({
      id: v.id.toString(),
      sku: v.sku,
      price: Math.round(v.salePrice && v.salePrice > 0 ? v.salePrice : v.price),
      oldPrice: v.regularPrice > (v.salePrice || v.price) ? Math.round(v.regularPrice) : undefined,
      attributes: v.attributes,
      image: v.image?.src,
      stockStatus: v.stockStatus,
    })),
  };
}

/**
 * Fetch search suggestions based on a query
 */
export async function fetchSearchSuggestions(query: string): Promise<Product[]> {
  if (!query || query.length < 2) return [];
  
  const response = await fetchJson<ApiResponse<StoreProduct[]>>(`/api/search?q=${encodeURIComponent(query)}&per_page=5`);
  
  if (!response.success) return [];
  
  return response.data.map(mapStoreProductToLocalProduct);
}
