/**
 * MongoDB Models & Schemas
 * Data models for products, categories, and cache
 */

import { ObjectId } from 'mongodb';

const CATEGORY_RULES = [
  { name: 'Smartphones', slug: 'smartphones', patterns: [/phone/i, /iphone/i, /mobile/i, /smartphone/i, /handset/i] },
  { name: 'Laptops', slug: 'laptops', patterns: [/laptop/i, /macbook/i, /notebook/i, /ultrabook/i] },
  { name: 'Audio', slug: 'audio', patterns: [/headphone/i, /earbud/i, /speaker/i, /audio/i, /sound/i, /buds?/i] },
  { name: 'Wearables', slug: 'wearables', patterns: [/watch/i, /smartwatch/i, /wearable/i, /fitness band/i, /band/i, /\bring\b/i, /smart ring/i] },
  { name: 'Gaming', slug: 'gaming', patterns: [/gaming/i, /gamepad/i, /controller/i, /console/i, /ps5/i, /xbox/i] },
  { name: 'Cameras', slug: 'cameras', patterns: [/camera/i, /dslr/i, /mirrorless/i, /lens/i, /photograph/i] },
  { name: 'Chargers & Cables', slug: 'chargers-cables', patterns: [/charger/i, /cable/i, /adapter/i, /usb-c/i, /type-c/i, /power bank/i] },
  { name: 'Smart Home', slug: 'smart-home', patterns: [/smart home/i, /home device/i, /automation/i, /robot/i, /sensor/i, /smart bulb/i, /fan/i, /cooler/i, /air condition/i, /refrigeration/i, /humidif/i, /mug warmer/i, /heating cup/i] },
  { name: 'Outdoor Electronics', slug: 'outdoor-electronics', patterns: [/outdoor/i, /camping/i, /fishing/i, /running/i, /led light/i, /illumination/i] },
  { name: 'Electronics Accessories', slug: 'electronics-accessories', patterns: [/cover/i, /case/i, /holder/i, /stand/i, /mount/i, /protector/i] },
];

const PRODUCT_STOP_WORDS = new Set([
  'and',
  'for',
  'with',
  'the',
  'new',
  'hot',
  'sale',
  'pcs',
  'piece',
  'set',
  'box',
  'cm',
  'mm',
  'inch',
  'inches',
  'color',
  'colour',
  'black',
  'white',
]);

function stripHtml(value: string): string {
  return String(value || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanProductName(value: string): string {
  const cleaned = stripHtml(value)
    .replace(/\bSUNSKY\b/gi, '')
    .replace(/\bSKU[:\s-]*[A-Z0-9-]+\b/gi, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[,\s-]+|[,\s-]+$/g, '')
    .trim();

  const primary = cleaned
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(', ') || cleaned;

  return primary.length > 90
    ? primary.slice(0, 90).replace(/\s+\S*$/, '').replace(/[,\s-]+$/, '')
    : primary;
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildSeoSlug(wooProduct: any, categories: Array<{ name: string; slug: string }>): string {
  const nameTokens = slugify(cleanProductName(wooProduct?.name || wooProduct?.slug || 'product'))
    .split('-')
    .filter((token) => token.length > 1 && !PRODUCT_STOP_WORDS.has(token))
    .slice(0, 7);
  const categoryToken = categories[0]?.slug && !PRODUCT_STOP_WORDS.has(categories[0].slug)
    ? categories[0].slug
    : '';
  const tokens = [...new Set([categoryToken, ...nameTokens].filter(Boolean))];
  const base = tokens.join('-').slice(0, 64).replace(/-+[^-]*$/, '').replace(/-+$/g, '');
  const suffix = wooProduct?.id ? `-${wooProduct.id}` : '';
  return `${base || 'product'}${suffix}`;
}

function buildMetaDescription(wooProduct: any, cleanName: string, categories: Array<{ name: string }>): string {
  const source = stripHtml(wooProduct?.short_description || wooProduct?.description || '');
  const category = categories[0]?.name ? `${categories[0].name} ` : '';
  const base = source || `Shop ${cleanName} online at Luxtronics with secure checkout and regional delivery.`;
  const normalized = `${base} ${category ? `Browse more ${category}products at Luxtronics.` : ''}`
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.length > 158 ? `${normalized.slice(0, 155).replace(/\s+\S*$/, '')}...` : normalized;
}

function buildSearchText(wooProduct: any, cleanName: string, categories: Array<{ name: string; slug: string }>): string {
  return [
    cleanName,
    wooProduct?.slug,
    wooProduct?.sku,
    stripHtml(wooProduct?.short_description || ''),
    stripHtml(wooProduct?.description || ''),
    ...(Array.isArray(wooProduct?.tags) ? wooProduct.tags.map((tag: any) => `${tag?.name || ''} ${tag?.slug || ''}`) : []),
    ...categories.map((category) => `${category.name} ${category.slug}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCategoryName(name: string): string {
  return String(name || '').trim().toLowerCase();
}

function isUncategorizedCategory(name: string): boolean {
  const normalized = normalizeCategoryName(name);
  return !normalized || normalized === 'uncategorized' || normalized === 'uncategorised';
}

function inferCategoryFromProduct(wooProduct: any): { id: number; name: string; slug: string } | null {
  const searchableText = [
    wooProduct?.name,
    wooProduct?.slug,
    wooProduct?.description,
    wooProduct?.short_description,
    ...(Array.isArray(wooProduct?.tags) ? wooProduct.tags.map((tag: any) => tag?.name || tag?.slug || '') : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(searchableText))) {
      return {
        id: Math.abs(rule.slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)),
        name: rule.name,
        slug: rule.slug,
      };
    }
  }

  return null;
}

function resolveProductCategories(wooProduct: any): Array<{ id: number; name: string; slug: string }> {
  const categories = Array.isArray(wooProduct?.categories)
    ? wooProduct.categories
        .filter((category: any) => category && !isUncategorizedCategory(category.name) && !isUncategorizedCategory(category.slug))
        .map((category: any) => ({
          id: Number(category.id ?? 0),
          name: String(category.name ?? ''),
          slug: String(category.slug ?? ''),
        }))
        .filter((category: any) => category.name && category.slug)
    : [];

  if (categories.length > 0) {
    return categories;
  }

  const inferred = inferCategoryFromProduct(wooProduct);
  return inferred ? [inferred] : [];
}

/**
 * Product Document Model
 */
export interface MongoProduct {
  _id?: ObjectId;
  id: number; // WooCommerce product ID
  type?: string;
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
    options?: string[];
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
  seo?: {
    title: string;
    description: string;
    slug: string;
    keywords: string[];
  };
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
  const resolvedCategories = resolveProductCategories(wooProduct);
  const cleanName = cleanProductName(wooProduct.name || '');
  const seoSlug = buildSeoSlug(wooProduct, resolvedCategories);
  const seoDescription = buildMetaDescription(wooProduct, cleanName || wooProduct.name || 'Product', resolvedCategories);
  const searchText = buildSearchText(wooProduct, cleanName || wooProduct.name || '', resolvedCategories);
  const keywords = [
    cleanName,
    wooProduct.sku,
    ...resolvedCategories.flatMap((category) => [category.name, category.slug]),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .slice(0, 12);

  return {
    id: wooProduct.id,
    type: wooProduct.type,
    slug: seoSlug,
    name: cleanName || wooProduct.name,
    description: wooProduct.description || '',
    shortDescription: wooProduct.short_description,
    categories: resolvedCategories,
    price: parseFloat(wooProduct.price || 0),
    salePrice: wooProduct.sale_price ? parseFloat(wooProduct.sale_price) : undefined,
    regularPrice: parseFloat(wooProduct.regular_price || wooProduct.price || 0),
    images: (wooProduct.images || []).map((img: any) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || `${cleanName || wooProduct.name} product image`,
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
      value: Array.isArray(attr.options) ? attr.options.join(' | ') : (attr.options || ''),
      options: Array.isArray(attr.options) ? attr.options : [],
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
    searchText,
    seo: {
      title: `${cleanName || wooProduct.name} | Luxtronics`.slice(0, 68),
      description: seoDescription,
      slug: seoSlug,
      keywords,
    },
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
