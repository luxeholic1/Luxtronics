/**
 * Export Commerce Product Feeds from MongoDB.
 *
 * Outputs:
 * - pinterest-feed.csv
 * - google-merchant-feed.csv
 */

import * as fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

type FeedProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  regularPrice?: number;
  stockStatus?: string;
  sku?: string;
  images?: Array<{ src?: string; alt?: string }>;
  categories?: Array<{ name?: string; slug?: string }>;
  weight?: number;
  attributes?: Array<{ name?: string; value?: string; options?: string[] }>;
  seo?: { description?: string; keywords?: string[] };
};

const SITE_URL = (process.env.FEED_SITE_URL || 'https://luxtronics.in').replace(/\/$/, '');
const CURRENCY = process.env.FEED_CURRENCY || 'INR';
const BRAND = process.env.FEED_BRAND || 'Luxtronics';

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

function csvField(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ').trim()}"`;
}

function truncate(value: string, maxLength: number): string {
  const text = stripHtml(value);
  return text.length > maxLength ? text.slice(0, maxLength).replace(/\s+\S*$/, '').trim() : text;
}

function attr(product: FeedProduct, name: string): string {
  const found = product.attributes?.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return found?.options?.[0] || found?.value || '';
}

function categoryName(product: FeedProduct): string {
  return product.categories?.[0]?.name || 'Electronics';
}

function googleProductCategory(product: FeedProduct): string {
  const text = `${product.name} ${categoryName(product)} ${product.categories?.[0]?.slug || ''}`.toLowerCase();
  if (/phone|mobile|smartphone|iphone|android/.test(text)) return 'Electronics > Communications > Telephony > Mobile Phones';
  if (/case|cover|protector|charger|cable|adapter|power bank|holder|mount/.test(text)) return 'Electronics > Electronics Accessories';
  if (/camera|surveillance|cctv|lens|tripod/.test(text)) return 'Cameras & Optics > Cameras';
  if (/headphone|earbud|earphone|speaker|audio|microphone/.test(text)) return 'Electronics > Audio';
  if (/watch|wearable|fitness band/.test(text)) return 'Electronics > Wearable Technology > Smart Watches';
  if (/laptop|notebook|keyboard|mouse|computer/.test(text)) return 'Electronics > Computers';
  if (/game|controller|console/.test(text)) return 'Electronics > Video Game Consoles';
  return 'Electronics > Consumer Electronics';
}

function availability(product: FeedProduct): string {
  return product.stockStatus === 'outofstock' ? 'out of stock' : 'in stock';
}

function productUrl(product: FeedProduct): string {
  return `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
}

function imageUrl(product: FeedProduct): string {
  return product.images?.find((image) => image.src)?.src || '';
}

function description(product: FeedProduct): string {
  return truncate(
    product.seo?.description ||
      product.shortDescription ||
      product.description ||
      `Shop ${product.name} online at Luxtronics.`,
    5000,
  );
}

function title(product: FeedProduct): string {
  return truncate(product.name, 150);
}

function price(product: FeedProduct): string {
  const value = Number(product.price || product.regularPrice || 0);
  return `${value.toFixed(2)} ${CURRENCY}`;
}

function salePrice(product: FeedProduct): string {
  const regular = Number(product.regularPrice || 0);
  const current = Number(product.price || 0);
  if (!regular || !current || current >= regular) return '';
  return `${current.toFixed(2)} ${CURRENCY}`;
}

function buildPinterestRows(products: FeedProduct[]): string {
  const header = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'additional_image_link',
    'price',
    'sale_price',
    'availability',
    'brand',
    'condition',
    'product_type',
    'google_product_category',
    'gtin',
    'mpn',
    'item_group_id',
    'color',
    'size',
    'age_group',
    'gender',
    'material',
    'pattern',
    'shipping_weight',
  ];

  const rows = products.map((product) => [
    product.id,
    title(product),
    description(product),
    productUrl(product),
    imageUrl(product),
    product.images?.slice(1, 4).map((image) => image.src).filter(Boolean).join(',') || '',
    price(product),
    salePrice(product),
    availability(product),
    BRAND,
    'new',
    categoryName(product),
    googleProductCategory(product),
    '',
    product.sku || String(product.id),
    product.id,
    attr(product, 'Color'),
    attr(product, 'Size'),
    'adult',
    'unisex',
    attr(product, 'Material'),
    '',
    product.weight || '',
  ].map(csvField).join(','));

  return [header.join(','), ...rows].join('\n');
}

function buildGoogleRows(products: FeedProduct[]): string {
  const header = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'additional_image_link',
    'availability',
    'price',
    'sale_price',
    'condition',
    'brand',
    'google_product_category',
    'product_type',
    'mpn',
    'identifier_exists',
  ];

  const rows = products.map((product) => [
    product.id,
    title(product),
    description(product),
    productUrl(product),
    imageUrl(product),
    product.images?.slice(1, 10).map((image) => image.src).filter(Boolean).join(',') || '',
    availability(product),
    price(product),
    salePrice(product),
    'new',
    BRAND,
    googleProductCategory(product),
    categoryName(product),
    product.sku || String(product.id),
    product.sku ? 'yes' : 'no',
  ].map(csvField).join(','));

  return [header.join(','), ...rows].join('\n');
}

async function main() {
  const db = await initializeMongoDB();
  const products = await db
    .collection<FeedProduct>('products')
    .find({ slug: { $exists: true, $ne: '' }, price: { $gt: 0 } })
    .sort({ updatedAt: -1 })
    .allowDiskUse(true)
    .toArray();

  const feedProducts = products.filter((product) => imageUrl(product) && title(product) && description(product));

  const pinterestPath = join(process.cwd(), 'pinterest-feed.csv');
  const googlePath = join(process.cwd(), 'google-merchant-feed.csv');
  const pinterestCsv = buildPinterestRows(feedProducts);
  const googleCsv = buildGoogleRows(feedProducts);
  fs.writeFileSync(pinterestPath, pinterestCsv);
  fs.writeFileSync(googlePath, googleCsv);

  for (const dir of ['dist', 'build']) {
    const targetDir = join(process.cwd(), dir);
    if (!fs.existsSync(targetDir)) continue;
    fs.writeFileSync(join(targetDir, 'pinterest-feed.csv'), pinterestCsv);
    fs.writeFileSync(join(targetDir, 'google-merchant-feed.csv'), googleCsv);
  }

  console.log('Commerce feeds exported');
  console.log(`Products in Mongo: ${products.length}`);
  console.log(`Products included: ${feedProducts.length}`);
  console.log(`Pinterest: ${pinterestPath}`);
  console.log(`Google Merchant: ${googlePath}`);

  await disconnectMongoDB();
}

main().catch(async (error) => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  await disconnectMongoDB();
  process.exit(1);
});
