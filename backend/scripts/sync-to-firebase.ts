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
  return all;
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

// ── Write to Firestore in batches of 500 ─────────────────────────────────────
async function batchWrite(collectionName: string, items: any[]): Promise<void> {
  console.log(`🔄 Writing ${items.length} docs to "${collectionName}"...`);
  const CHUNK = 500;

  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const batch: WriteBatch = db.batch();

    for (const item of chunk) {
      const ref = db.collection(collectionName).doc(String(item.id));
      batch.set(ref, { ...item, syncedAt: FieldValue.serverTimestamp() });
    }

    await batch.commit();
    console.log(`   ✓ Committed ${i + chunk.length} / ${items.length}`);
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
