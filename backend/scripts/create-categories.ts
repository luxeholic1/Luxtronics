/**
 * Create categories (and subcategories) in WooCommerce from a JSON file,
 * then optionally sync them to Firebase Firestore.
 * Usage: npm run create:categories
 *
 * Environment variables required in root .env:
 * - VITE_WOOCOMMERCE_URL_INDIA, VITE_WOOCOMMERCE_KEY_INDIA, VITE_WOOCOMMERCE_SECRET_INDIA
 * - FIREBASE_SERVICE_ACCOUNT_KEY (stringified JSON)
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, WriteBatch } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!rawKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY missing in .env');
  process.exit(1);
}
const serviceAccount = JSON.parse(rawKey);
const fbApp = initializeApp({ credential: cert(serviceAccount) });
const db    = getFirestore(fbApp);

const Api = (WooCommerceRestApi as any).default ?? WooCommerceRestApi;
const woo = new Api({
  url:            process.env.VITE_WOOCOMMERCE_URL_INDIA    || '',
  consumerKey:    process.env.VITE_WOOCOMMERCE_KEY_INDIA    || '',
  consumerSecret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  version: 'wc/v3',
});

type CatDef = { name: string; slug?: string; description?: string; parent?: string | null };

async function loadDefinitions(path: string): Promise<CatDef[]> {
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data) as CatDef[];
}

async function createCategory(payload: any) {
  try {
    const { data } = await woo.post('products/categories', payload);
    console.log(`   ✓ Created category: ${data.name} (id=${data.id})`);
    return data;
  } catch (err: any) {
    const resp = err?.response?.data;
    // If category already exists, WooCommerce returns code 'term_exists' with resource_id
    if (resp && resp.code === 'term_exists' && resp.data && resp.data.resource_id) {
      const existingId = resp.data.resource_id;
      try {
        const { data: existing } = await woo.get(`products/categories/${existingId}`);
        console.log(`   i Term exists — using existing category: ${existing.name} (id=${existing.id})`);
        return existing;
      } catch (fetchErr: any) {
        console.error('   ✗ Failed to fetch existing term after conflict:', fetchErr?.response?.data || fetchErr.message || fetchErr);
        throw err;
      }
    }

    console.error('   ✗ Create error:', resp || err.message || err);
    throw err;
  }
}

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

async function main() {
  console.log('🚀 Create categories script starting...\n');
  const defs = await loadDefinitions(join(__dirname, 'categories-to-create.json'));

  // Fetch existing categories so we don't attempt to recreate duplicates
  const existing = await fetchAllCategories();
  const existingBySlug: Record<string, any> = {};
  const existingByName: Record<string, any> = {};
  for (const e of existing) {
    if (e.slug) existingBySlug[e.slug] = e;
    if (e.name) existingByName[e.name.toLowerCase()] = e;
  }

  // Maps for created category IDs by slug (or created during this run)
  const idMap: Record<string, number> = {};

  // Helper to ensure a category exists (returns id)
  async function ensureCategory(def: CatDef): Promise<number> {
    // If slug provided and exists, reuse
    if (def.slug && existingBySlug[def.slug]) {
      const id = existingBySlug[def.slug].id;
      console.log(`   i Skipping existing category (slug): ${def.name} (id=${id})`);
      return id;
    }

    // Fallback: match by name
    const nameKey = def.name.toLowerCase();
    if (existingByName[nameKey]) {
      const id = existingByName[nameKey].id;
      console.log(`   i Skipping existing category (name): ${def.name} (id=${id})`);
      return id;
    }

    // Not found — create it
    const payload: any = { name: def.name, description: def.description || '' };
    if (def.slug) payload.slug = def.slug;
    const data = await createCategory(payload);
    // Add to existing maps so subsequent checks see it
    if (data.slug) existingBySlug[data.slug] = data;
    existingByName[data.name.toLowerCase()] = data;
    return data.id;
  }

  // Create roots first
  const roots = defs.filter(d => !d.parent);
  for (const r of roots) {
    const id = await ensureCategory(r);
    if (r.slug) idMap[r.slug] = id;
  }

  // Then create children, ensuring parent exists first
  const children = defs.filter(d => d.parent);
  for (const c of children) {
    const parentSlug = c.parent as string;

    // parent might already be in idMap, or in existingBySlug
    let parentId = idMap[parentSlug] ?? existingBySlug[parentSlug]?.id;

    // If parent not found, try to find by name in defs or create parent
    if (!parentId) {
      const parentDef = defs.find(d => d.slug === parentSlug || d.name.toLowerCase() === parentSlug.toLowerCase());
      if (parentDef) {
        parentId = await ensureCategory(parentDef);
        if (parentDef.slug) idMap[parentDef.slug] = parentId;
      }
    }

    if (!parentId) {
      console.error(`✗ Parent category with slug "${parentSlug}" not found for "${c.name}"`);
      continue;
    }

    // If category already exists, skip -- but ensure parent relationship
    if (c.slug && existingBySlug[c.slug]) {
      console.log(`   i Skipping existing child category: ${c.name} (id=${existingBySlug[c.slug].id})`);
      continue;
    }

    const payload = { name: c.name, slug: c.slug, description: c.description || '', parent: parentId };
    const data = await createCategory(payload);
    if (c.slug) idMap[c.slug] = data.id;
  }

  // Optional: fetch all categories and sync to Firestore
  const all = await fetchAllCategories();
  if (all.length) {
    await batchWrite('categories', all);
    console.log('✅ Categories created and synced to Firestore.');
  }

  console.log('\n🎉 Done');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
