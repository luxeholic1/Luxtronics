import dotenv from 'dotenv';
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

type MongoProduct = {
  id: number;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  categories?: Array<{ name?: string; slug?: string }>;
  images?: Array<{ id?: number; src?: string; alt?: string }>;
  seo?: {
    title?: string;
    description?: string;
    slug?: string;
    keywords?: string[];
  };
};

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
]);

const CATEGORY_RULES = [
  { name: 'Wearables', slug: 'wearables', patterns: [/watch/i, /smartwatch/i, /wearable/i, /fitness band/i, /\bring\b/i, /smart ring/i] },
  { name: 'Smart Home', slug: 'smart-home', patterns: [/fan/i, /cooler/i, /air condition/i, /refrigeration/i, /humidif/i, /mug warmer/i, /heating cup/i] },
  { name: 'Outdoor Electronics', slug: 'outdoor-electronics', patterns: [/outdoor/i, /camping/i, /fishing/i, /running/i, /led light/i, /illumination/i] },
  { name: 'Chargers & Cables', slug: 'chargers-cables', patterns: [/charger/i, /cable/i, /adapter/i, /usb/i, /power bank/i] },
  { name: 'Electronics Accessories', slug: 'electronics-accessories', patterns: [/cover/i, /case/i, /holder/i, /stand/i, /mount/i, /protector/i] },
];

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

function truncateWords(value: string, maxLength: number): string {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return text
    .slice(0, maxLength)
    .replace(/\s+\S*$/, '')
    .replace(/[,\s-]+$/, '')
    .trim();
}

function cleanProductName(value: string): string {
  const cleaned = stripHtml(value)
    .replace(/\bSUNSKY\b/gi, '')
    .replace(/\bwholesale\b/gi, '')
    .replace(/\bdropship(?:ping)?\b/gi, '')
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

  return truncateWords(primary, 72) || 'Product';
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildSeoSlug(product: MongoProduct, cleanName: string, categories: Array<{ name?: string; slug?: string }>): string {
  const categoryToken = slugify(categories[0]?.slug || categories[0]?.name || '');
  const nameTokens = slugify(cleanName || product.slug || 'product')
    .split('-')
    .filter((token) => token.length > 1 && !PRODUCT_STOP_WORDS.has(token))
    .slice(0, 6);
  const tokens = [...new Set([categoryToken, ...nameTokens].filter(Boolean))];
  const suffix = product.id ? `-${product.id}` : '';
  const maxBaseLength = Math.max(16, 78 - suffix.length);
  const base = (tokens.join('-') || 'product')
    .slice(0, maxBaseLength)
    .replace(/-+[^-]*$/, '')
    .replace(/-+$/g, '');

  return `${base || 'product'}${suffix}`;
}

function buildMetaDescription(product: MongoProduct, cleanName: string, categories: Array<{ name?: string; slug?: string }>): string {
  const category = categories[0]?.name || '';
  const source = stripHtml(product.seo?.description || product.shortDescription || product.description || '');
  const base = source || `Shop ${cleanName} online at Luxtronics with secure checkout and regional delivery.`;
  const text = `${base} ${category ? `Explore more ${category} products at Luxtronics.` : ''}`
    .replace(/\s+/g, ' ')
    .trim();
  return truncateWords(text, 158);
}

function buildKeywords(product: MongoProduct, cleanName: string, categories: Array<{ name?: string; slug?: string }>): string[] {
  return [
    cleanName,
    product.sku,
    ...categories.flatMap((category) => [category.name, category.slug]),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .slice(0, 12);
}

function fixImages(product: MongoProduct, cleanName: string) {
  return (product.images || []).map((image, index) => ({
    ...image,
    alt: stripHtml(image.alt || '') || `${cleanName} image ${index + 1}`,
  }));
}

function hasCategories(product: MongoProduct): boolean {
  return (product.categories || []).some((category) => category.slug || category.name);
}

function inferCategories(product: MongoProduct, cleanName: string): Array<{ id: number; name: string; slug: string }> {
  if (hasCategories(product)) {
    return (product.categories || [])
      .filter((category) => category.slug || category.name)
      .map((category, index) => ({
        id: Number((category as any).id || index + 1),
        name: String(category.name || category.slug || 'Electronics'),
        slug: slugify(category.slug || category.name || 'electronics'),
      }));
  }

  const text = [
    cleanName,
    product.slug,
    product.sku,
    product.description,
    product.shortDescription,
  ].filter(Boolean).join(' ');

  const rule = CATEGORY_RULES.find((item) => item.patterns.some((pattern) => pattern.test(text)));
  const fallback = rule || { name: 'Electronics Accessories', slug: 'electronics-accessories' };
  return [{
    id: Math.abs(fallback.slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)),
    name: fallback.name,
    slug: fallback.slug,
  }];
}

async function main() {
  const db = await initializeMongoDB();
  const collection = db.collection<MongoProduct>('products');
  const cursor = collection.find({}, {
    projection: {
      id: 1,
      name: 1,
      slug: 1,
      sku: 1,
      description: 1,
      shortDescription: 1,
      categories: 1,
      images: 1,
      seo: 1,
    },
  });

  let scanned = 0;
  let updated = 0;
  const operations: any[] = [];
  const categoryCounts = new Map<string, { id: number; name: string; slug: string; count: number }>();

  for await (const product of cursor) {
    scanned += 1;
    const cleanName = cleanProductName(product.name || product.slug || 'Product');
    const categories = inferCategories(product, cleanName);
    for (const category of categories) {
      const existing = categoryCounts.get(category.slug);
      if (existing) {
        existing.count += 1;
      } else {
        categoryCounts.set(category.slug, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: 1,
        });
      }
    }
    const slug = buildSeoSlug(product, cleanName, categories);
    const seoDescription = buildMetaDescription(product, cleanName, categories);
    const images = fixImages(product, cleanName);
    const seo = {
      ...(product.seo || {}),
      title: truncateWords(`${cleanName} | Luxtronics`, 68),
      description: seoDescription,
      slug,
      keywords: buildKeywords(product, cleanName, categories),
    };

    operations.push({
      updateOne: {
        filter: { id: product.id },
        update: {
          $set: {
            name: cleanName,
            slug,
            categories,
            images,
            seo,
            updatedAt: new Date(),
          },
        },
      },
    });

    if (operations.length >= 500) {
      const result = await collection.bulkWrite(operations, { ordered: false });
      updated += result.modifiedCount;
      operations.length = 0;
      console.log(`Processed ${scanned} products...`);
    }
  }

  if (operations.length > 0) {
    const result = await collection.bulkWrite(operations, { ordered: false });
    updated += result.modifiedCount;
  }

  const categoryOperations = Array.from(categoryCounts.values()).map((category) => ({
    updateOne: {
      filter: { slug: category.slug },
      update: {
        $set: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category.count,
          updatedAt: new Date(),
          syncedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (categoryOperations.length > 0) {
    await db.collection('categories').bulkWrite(categoryOperations, { ordered: false });
  }

  console.log(`Mongo SEO repair complete. Scanned: ${scanned}, updated: ${updated}`);
  await disconnectMongoDB();
}

main().catch(async (error) => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  await disconnectMongoDB();
  process.exit(1);
});
