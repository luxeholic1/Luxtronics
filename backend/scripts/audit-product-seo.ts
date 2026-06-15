import dotenv from 'dotenv';
import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

type MongoProduct = {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  images?: Array<{ src?: string; alt?: string }>;
  categories?: Array<{ id?: number; name?: string; slug?: string }>;
  seo?: { title?: string; description?: string; slug?: string };
};

const limitArg = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 0);

function stripHtml(value: string): string {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value: string): string[] {
  return stripHtml(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function auditProduct(product: MongoProduct, duplicateSlugCount: number): string[] {
  const issues: string[] = [];
  const cleanName = stripHtml(product.name || '');
  const slug = product.slug || '';
  const description = stripHtml(product.seo?.description || product.shortDescription || product.description || '');
  const imageCount = product.images?.filter((image) => image.src).length || 0;
  const categoryCount = product.categories?.filter((category) => category.id || category.slug).length || 0;

  if (cleanName.length < 12) issues.push('title too short');
  if (cleanName.length > 72) issues.push('title too long');
  if (/sunsky|wholesale|dropship/i.test(cleanName)) issues.push('supplier wording in title');
  if (slug.length > 80) issues.push('slug too long');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) issues.push('slug not clean');
  if (duplicateSlugCount > 1) issues.push('duplicate slug');
  if (words(description).length < 12) issues.push('description too thin');
  if (imageCount === 0) issues.push('missing image');
  if (categoryCount === 0) issues.push('missing category');
  if (product.images?.some((image) => image.src && !stripHtml(image.alt || ''))) issues.push('image alt missing');

  return issues;
}

async function main() {
  const db = await initializeMongoDB();
  const products = await db
    .collection<MongoProduct>('products')
    .find({}, {
      projection: {
        id: 1,
        name: 1,
        slug: 1,
        description: 1,
        shortDescription: 1,
        images: 1,
        categories: 1,
        seo: 1,
      },
    })
    .limit(limitArg || 0)
    .toArray();

  const slugCounts = new Map<string, number>();
  for (const product of products) {
    slugCounts.set(product.slug || '', (slugCounts.get(product.slug || '') || 0) + 1);
  }

  const rows = products
    .map((product) => ({
      product,
      issues: auditProduct(product, slugCounts.get(product.slug || '') || 0),
    }))
    .filter((row) => row.issues.length > 0);

  console.log('\nSEO Audit Summary');
  console.log(`Source: MongoDB products`);
  console.log(`Products checked: ${products.length}`);
  console.log(`Products with issues: ${rows.length}`);

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const issue of row.issues) counts.set(issue, (counts.get(issue) || 0) + 1);
  }

  for (const [issue, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${issue}: ${count}`);
  }

  if (rows.length > 0) {
    console.log('\nFirst products to fix:');
    for (const row of rows.slice(0, 25)) {
      console.log(`${row.product.id} | ${row.product.slug} | ${row.issues.join(', ')} | ${stripHtml(row.product.name || '').slice(0, 90)}`);
    }
  }

  await disconnectMongoDB();

  if (rows.length > Math.max(products.length * 0.25, 20)) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  await disconnectMongoDB();
  process.exit(1);
});
