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

export interface StoreProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId?: number;
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
      option: string;
    }>;
    image?: StoreImage;
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

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const response = await fetchJson<ApiResponse<StoreProduct[]>>('/api/products?per_page=100&page=1');

  if (!response.success) {
    throw new Error(response.error || 'Failed to load products');
  }

  return response.data;
}

export async function fetchStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
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
  const price = product.salePrice ?? product.price;
  const originalPrice = product.regularPrice || product.price;

  return {
    id: product.id.toString(),
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Math.round(price),
    oldPrice: originalPrice > price ? Math.round(originalPrice) : undefined,
    image: mainImage,
    rating: product.rating,
    reviews: product.reviewCount,
    description: product.description || product.shortDescription || '',
    badge: originalPrice > price ? '-20%' : undefined,
    variations: product.variations?.map((variation) => ({
      id: variation.id.toString(),
      sku: variation.sku,
      price: Math.round(variation.salePrice ?? variation.price),
      oldPrice: variation.regularPrice > (variation.salePrice ?? variation.price) ? Math.round(variation.regularPrice) : undefined,
      attributes: variation.attributes,
      image: variation.image?.src,
      stockStatus: variation.stockStatus,
    })),
  };
}
