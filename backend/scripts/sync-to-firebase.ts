/**
 * Sync WooCommerce Products → Firebase Firestore
 * Run manually: npm run sync:firebase
 * Auto-run: GitHub Actions every 15 minutes
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, WriteBatch } from 'firebase-admin/firestore';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Load root .env
dotenv.config({ path: join(__dirname, '../../.env') });

// ── Firebase Admin ────────────────────────────────────────────────────────────
const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!rawKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY missing in .env');
  process.exit(1);
}
const serviceAccount = JSON.parse(rawKey);
const fbApp = initializeApp({ credential: cert(serviceAccount) });
const db    = getFirestore(fbApp);

// ── WooCommerce API ───────────────────────────────────────────────────────────
const Api = (WooCommerceRestApi as any).default ?? WooCommerceRestApi;
const woo = new Api({
  url:            process.env.VITE_WOOCOMMERCE_URL_INDIA    || '',
  consumerKey:    process.env.VITE_WOOCOMMERCE_KEY_INDIA    || '',
  consumerSecret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  version: 'wc/v3',
});

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

function inferCategoryFromProduct(product: any) {
  const searchableText = [
    product?.name,
    product?.slug,
    product?.description,
    product?.short_description,
    ...(Array.isArray(product?.tags) ? product.tags.map((tag: any) => tag?.name || tag?.slug || '') : []),
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

function resolveCategories(product: any) {
  const existing = Array.isArray(product?.categories)
    ? product.categories
        .filter((category: any) => category && !isUncategorizedCategory(category.name) && !isUncategorizedCategory(category.slug))
        .map((category: any) => ({
          id: Number(category.id ?? 0),
          name: String(category.name ?? ''),
          slug: String(category.slug ?? ''),
        }))
        .filter((category: any) => category.name && category.slug)
    : [];

  if (existing.length > 0) {
    return existing;
  }

  const inferred = inferCategoryFromProduct(product);
  return inferred ? [inferred] : [];
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchTerms(product: any): string[] {
  const categories = resolveCategories(product);
  const source = normalizeSearchText([
    product?.name,
    product?.slug,
    product?.sku,
    product?.type,
    ...(Array.isArray(product?.tags) ? product.tags.map((tag: any) => `${tag?.name || ''} ${tag?.slug || ''}`) : []),
    ...categories.map((category: any) => `${category.name} ${category.slug}`),
  ].filter(Boolean).join(' '));

  const tokens = source
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && token.length <= 32);

  const terms = new Set<string>();
  for (const token of tokens) {
    terms.add(token);
    const maxPrefix = Math.min(token.length, 12);
    for (let len = 2; len <= maxPrefix; len++) {
      terms.add(token.slice(0, len));
    }
  }

  return [...terms].slice(0, 160);
}

// ── Fetch all products (paginated) ────────────────────────────────────────────
async function fetchAllProducts(): Promise<any[]> {
  console.log('📦 Fetching products from WooCommerce...');
  const all: any[] = [];
  let page = 1;

  while (true) {
    try {
      const { data } = await woo.get('products', { per_page: 100, page, status: 'publish' });
      if (!data.length) break;
      all.push(...data);
      console.log(`   ✓ Page ${page} — ${data.length} products (total so far: ${all.length})`);
      page++;
    } catch (err: any) {
      console.error(`   ✗ Page ${page} error:`, err.message);
      break;
    }
  }

  console.log(`✅ Total products: ${all.length}\n`);
  return all.map((product) => ({
    ...product,
    categories: resolveCategories(product),
    searchTerms: buildSearchTerms(product),
  }));
}

// ── Fetch categories ──────────────────────────────────────────────────────────
async function fetchAllCategories(): Promise<any[]> {
  console.log('📂 Fetching categories from WooCommerce...');
  try {
    const { data } = await woo.get('products/categories', { per_page: 100 });
    console.log(`✅ Total categories: ${data.length}\n`);
    return data;
  } catch (err: any) {
    console.error('✗ Categories error:', err.message);
    return [];
  }
}

// ── Write to Firestore in chunks of 1000, committed safely in sub-batches ───
async function batchWrite(collectionName: string, items: any[]): Promise<void> {
  console.log(`🔄 Writing ${items.length} docs to "${collectionName}"...`);
  const CHUNK = 1000;
  const FIRESTORE_BATCH_LIMIT = 500;

  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);

    for (let j = 0; j < chunk.length; j += FIRESTORE_BATCH_LIMIT) {
      const slice = chunk.slice(j, j + FIRESTORE_BATCH_LIMIT);
      const batch: WriteBatch = db.batch();

      for (const item of slice) {
        const ref = db.collection(collectionName).doc(String(item.id));
        batch.set(ref, { ...item, syncedAt: FieldValue.serverTimestamp() });
      }

      await batch.commit();
      console.log(`   ✓ Committed ${Math.min(i + j + slice.length, items.length)} / ${items.length}`);
    }
  }

  console.log(`✅ "${collectionName}" synced\n`);
}

// ── Update sync status ────────────────────────────────────────────────────────
async function updateSyncStatus(productsCount: number, categoriesCount: number): Promise<void> {
  await db.collection('sync_status').doc('latest').set({
    lastSyncAt: FieldValue.serverTimestamp(),
    productsCount,
    categoriesCount,
    status: 'success',
  });
  console.log('✅ Sync status updated\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 WooCommerce → Firebase sync starting...\n');
  const t0 = Date.now();

  const [products, categories] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
  ]);

  await batchWrite('products',   products);
  await batchWrite('categories', categories);
  await updateSyncStatus(products.length, categories.length);

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`🎉 Done in ${secs}s  |  ${products.length} products  |  ${categories.length} categories`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
