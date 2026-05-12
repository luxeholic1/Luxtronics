import type { Product } from '@/data/products';

// Backend API URL - absolute for parked domains
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://luxtronics.in';

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
  let url = `${BACKEND_URL}/api/woo/products?per_page=${perPage}&page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await fetchJson<StoreProduct[]>(url);
  
  return Array.isArray(response) ? response : [];
}

export async function fetchStoreProduct(slug: string): Promise<StoreProduct | null> {
  try {
    // WooCommerce doesn't support slug lookup directly, so we search by slug
    const response = await fetchJson<StoreProduct[]>(`${BACKEND_URL}/api/woo/products?slug=${encodeURIComponent(slug)}&per_page=1`);
    
    return Array.isArray(response) && response.length > 0 ? response[0] : null;
  } catch {
    return null;
  }
}

export async function fetchStoreCategories(page = 1, perPage = 20): Promise<{
  data: StoreCategory[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
}> {
  const response = await fetchJson<StoreCategory[]>(`${BACKEND_URL}/api/woo/categories?page=${page}&per_page=${perPage}`);

  const categories = Array.isArray(response) ? response : [];
  
  return {
    data: categories,
    pagination: { page, perPage, total: categories.length, totalPages: 1 },
  };
}

/**
 * Fetch search suggestions based on a query
 */
export async function fetchSearchSuggestions(query: string): Promise<Product[]> {
  if (!query || query.length < 2) return [];
  
  const response = await fetchJson<StoreProduct[]>(`${BACKEND_URL}/api/woo/products?search=${encodeURIComponent(query)}&per_page=5`);
  
  if (!Array.isArray(response)) return [];
  
  return response.map(mapStoreProductToLocalProduct);
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
    categories: product.categories || [],
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