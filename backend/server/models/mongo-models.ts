/**
 * MongoDB Models & Schemas
 * Data models for products, categories, and cache
 */

import { ObjectId } from 'mongodb';

/**
 * Product Document Model
 */
export interface MongoProduct {
  _id?: ObjectId;
  id: number; // WooCommerce product ID
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId?: number;
  price: number;
  salePrice?: number;
  regularPrice: number;
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
  rating: number;
  reviewCount: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stock?: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes?: Array<{
    name: string;
    value: string;
  }>;
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
    image?: {
      id: number;
      src: string;
      alt: string;
    };
  }>;
  
  // Metadata
  syncedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  lastWooSyncAt?: Date;
  
  // Search optimization
  searchText?: string;
}

/**
 * Category Document Model
 */
export interface MongoCategory {
  _id?: ObjectId;
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
  count: number;
  
  // Metadata
  syncedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Cache Metadata Model (for tracking cache status)
 */
export interface CacheMetadata {
  _id?: ObjectId;
  key: string; // Unique cache key (e.g., "products-page-1-50")
  collectionName: string; // Which collection this cache is for
  lastUpdated: Date;
  expiresAt: Date; // TTL index will auto-delete expired docs
  metadata?: {
    page?: number;
    perPage?: number;
    category?: string;
    totalCount?: number;
  };
}

/**
 * Sync Status Model (tracking WooCommerce sync)
 */
export interface SyncStatus {
  _id?: ObjectId;
  type: 'products' | 'categories' | 'full';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  totalProcessed: number;
  failedCount: number;
  errors?: string[];
  nextSyncAt: Date;
}

/**
 * User document model
 */
export interface MongoUser {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  phone?: string;
  orders?: Array<{
    id: string;
    date: string;
    amount: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User session model
 */
export interface UserSession {
  _id?: ObjectId;
  token: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Create Product Document from WooCommerce data
 */
export function createProductDocument(wooProduct: any, variations?: any[]): MongoProduct {
  return {
    id: wooProduct.id,
    slug: wooProduct.slug,
    name: wooProduct.name,
    description: wooProduct.description || '',
    shortDescription: wooProduct.short_description,
    category: wooProduct.categories?.[0]?.name || 'Uncategorized',
    categoryId: wooProduct.categories?.[0]?.id,
    price: parseFloat(wooProduct.price || 0),
    salePrice: wooProduct.sale_price ? parseFloat(wooProduct.sale_price) : undefined,
    regularPrice: parseFloat(wooProduct.regular_price || wooProduct.price || 0),
    images: (wooProduct.images || []).map((img: any) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || '',
    })),
    rating: parseFloat(wooProduct.average_rating || 0),
    reviewCount: wooProduct.rating_count || 0,
    stockStatus: wooProduct.stock_status || 'instock',
    stock: wooProduct.stock_quantity,
    sku: wooProduct.sku,
    weight: wooProduct.weight ? parseFloat(wooProduct.weight) : undefined,
    dimensions: wooProduct.dimensions
      ? {
          length: parseFloat(wooProduct.dimensions.length || 0),
          width: parseFloat(wooProduct.dimensions.width || 0),
          height: parseFloat(wooProduct.dimensions.height || 0),
        }
      : undefined,
    attributes: wooProduct.attributes?.map((attr: any) => ({
      name: attr.name,
      value: attr.options ? attr.options[0] : '',
    })),
    variations: variations?.map((variation: any) => ({
      id: variation.id,
      sku: variation.sku,
      price: parseFloat(variation.price || 0),
      salePrice: variation.sale_price ? parseFloat(variation.sale_price) : undefined,
      regularPrice: parseFloat(variation.regular_price || variation.price || 0),
      stockStatus: variation.stock_status || 'instock',
      stock: variation.stock_quantity,
      attributes: variation.attributes?.map((attr: any) => ({
        name: attr.name,
        option: attr.option,
      })) || [],
      image: variation.image ? {
        id: variation.image.id,
        src: variation.image.src,
        alt: variation.image.alt || '',
      } : undefined,
    })),
    syncedAt: new Date(),
    updatedAt: new Date(),
    createdAt: new Date(),
    lastWooSyncAt: new Date(),
    searchText: `${wooProduct.name} ${wooProduct.description} ${wooProduct.categories?.map((c: any) => c.name).join(' ')}`.toLowerCase(),
  };
}

/**
 * Create Category Document from WooCommerce data
 */
export function createCategoryDocument(wooCat: any): MongoCategory {
  return {
    id: wooCat.id,
    name: wooCat.name,
    slug: wooCat.slug,
    description: wooCat.description,
    image: wooCat.image
      ? {
          src: wooCat.image.src,
          alt: wooCat.image.alt || '',
        }
      : undefined,
    count: wooCat.count || 0,
    syncedAt: new Date(),
    updatedAt: new Date(),
    createdAt: new Date(),
  };
}

/**
 * Validation schemas
 */
export const MongoValidation = {
  product: {
    validate: (doc: MongoProduct): string[] => {
      const errors: string[] = [];
      
      if (!doc.id || !Number.isInteger(doc.id)) errors.push('Invalid product ID');
      if (!doc.slug || doc.slug.length === 0) errors.push('Product slug is required');
      if (!doc.name || doc.name.length === 0) errors.push('Product name is required');
      if (!Array.isArray(doc.images)) errors.push('Images must be an array');
      if (doc.price < 0) errors.push('Price cannot be negative');
      if (doc.rating < 0 || doc.rating > 5) errors.push('Rating must be between 0-5');
      
      return errors;
    },
  },

  category: {
    validate: (doc: MongoCategory): string[] => {
      const errors: string[] = [];
      
      if (!doc.id || !Number.isInteger(doc.id)) errors.push('Invalid category ID');
      if (!doc.slug || doc.slug.length === 0) errors.push('Category slug is required');
      if (!doc.name || doc.name.length === 0) errors.push('Category name is required');
      
      return errors;
    },
  },
};
