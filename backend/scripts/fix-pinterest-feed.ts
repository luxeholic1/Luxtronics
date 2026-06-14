/**
 * Fix Pinterest Feed — Bulk update WooCommerce catalog metadata with:
 *   1. condition = "new"
 *   2. google_product_category (mapped from WooCommerce category)
 *   3. the same metadata on every variation
 *
 * Run: npm run fix:pinterest
 * Dry run: npm run fix:pinterest -- --dry-run
 * Quick test: npm run fix:pinterest -- --dry-run --limit=25
 * Tune variation concurrency: npm run fix:pinterest -- --concurrency=6
 * Target retry: npm run fix:pinterest -- --product-ids=123,456
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// ── WooCommerce API ───────────────────────────────────────────────────────────
const STORE_URL = (process.env.VITE_WOOCOMMERCE_URL_INDIA || '').replace(/\/$/, '');
const CONSUMER_KEY = process.env.VITE_WOOCOMMERCE_KEY_INDIA || '';
const CONSUMER_SECRET = process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(arg => arg.startsWith('--limit='));
const PRODUCT_LIMIT = LIMIT_ARG ? Math.max(0, Number(LIMIT_ARG.split('=')[1]) || 0) : 0;
const CONCURRENCY_ARG = process.argv.find(arg => arg.startsWith('--concurrency='));
const VARIATION_CONCURRENCY = CONCURRENCY_ARG ? Math.max(1, Number(CONCURRENCY_ARG.split('=')[1]) || 8) : 8;
const PRODUCT_IDS_ARG = process.argv.find(arg => arg.startsWith('--product-ids='));
const PRODUCT_IDS = PRODUCT_IDS_ARG
  ? PRODUCT_IDS_ARG.split('=')[1].split(',').map(id => Number(id.trim())).filter(Boolean)
  : [];
const AUTH_HEADER = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
const API_BASE = `${STORE_URL}/wp-json/wc/v3`;
const BATCH_SIZE = 100;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error('Missing WooCommerce env vars: VITE_WOOCOMMERCE_URL_INDIA, VITE_WOOCOMMERCE_KEY_INDIA, VITE_WOOCOMMERCE_SECRET_INDIA');
  process.exit(1);
}

async function wooRequest<T>(method: 'GET' | 'PUT' | 'POST', endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/${endpoint.replace(/^\//, '')}`, {
    method,
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }

  return res.json() as Promise<T>;
}

// ── Google Product Category mapping ──────────────────────────────────────────
// Full taxonomy: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const CATEGORY_MAP: Record<string, string> = {
  // Smartphones & Tablets
  'phone':                '267',
  'phones':               '267',
  'mobile-phone':         '267',
  'mobile phones':        '267',
  'smart-phone':          '267',   // Electronics > Communications > Telephony > Mobile Phones
  'smartphones':          '267',
  'smart phones':         '267',
  'smart phone':          '267',
  'rugged-phone':         '267',
  'rugged phones':        '267',
  'android-tablet-pc':    '4745',  // Electronics > Computers > Tablet Computers
  'android tablet pc':    '4745',
  'tablet':               '4745',
  'tablets':              '4745',
  'feature-phones':       '267',
  'google':               '267',
  'huawei':               '267',
  'motorola':             '267',
  'honor':                '267',

  // Apple
  'iphone':               '267',
  'apple-accessories':    '1267',  // Electronics > Communications > Telephony > Mobile Phone Accessories
  'apple-parts':          '1267',
  'apple-watch':          '201',   // Electronics > Electronics Accessories > Wearable Technology
  'mac-accessories':      '328',   // Electronics > Computers > Computer Accessories
  'mac-parts':            '328',
  'airpods-protective-case': '1267',

  // Samsung
  'samsung-accessories':  '1267',
  'samsung-parts':        '1267',
  'galaxy-tab-s11':       '4745',
  'galaxy-z-fold8-5g':    '267',
  'galaxy-s25-ultra-5g':  '267',
  'galaxy-s26-5g':        '267',

  // Mobile Parts & Accessories
  'mobile-parts':         '1267',
  'mobile-accessories':   '1267',
  'replacement-parts':    '1267',
  'repair-tools':         '1267',
  'cable-charger':        '1267',
  'tempered-glass':       '1267',
  'cases':                '1267',
  'bags-cases-straps':    '1267',
  'bags, cases & straps': '1267',

  // Xiaomi / OnePlus / OPPO
  'xiaomi':               '267',
  'redmi-k90':            '267',
  'redmi-note-15':        '267',
  'oneplus-oppo-accessories': '1267',
  'oneplus-15':           '267',
  'oppo-find-x9':         '267',
  'oppo-reno14-pro':      '267',

  // Wearables
  'wearables':            '201',   // Electronics > Electronics Accessories > Wearable Technology
  'smart-watch':          '201',
  'smart watch':          '201',
  'smart-watches':        '201',
  'smart watches':        '201',
  'watch':                '201',
  'watches':              '201',
  'garmin-watch':         '201',
  'fitbit-watch':         '201',
  'huawei-watch':         '201',

  // Audio
  'audio':                '232',   // Electronics > Audio
  'bluetooth-speakers':   '232',

  // Camera & Photography
  'camera':               '2096',  // Electronics > Cameras & Optics > Cameras
  'camera-accessories':   '2096',
  'camera-filters':       '2096',
  'camera-lens-protector':'2096',
  'photo-studio':         '2096',
  'photographic-supplies':'2096',
  'dji-air-series':       '2096',
  'dji-mavic-series':     '2096',
  'dji-insta360-accessories': '2096',
  'insta360-x-series':    '2096',
  'osmo-pocket-accessories': '2096',
  'gopro-combo-kits':     '2096',
  'live-equipment':       '2096',

  // Gaming
  'game-accessories':     '1279',  // Electronics > Video Game Consoles & Accessories
  'gaming-accessories':   '1279',
  'nintendo-accessories': '1279',
  'pocket-console-accessories': '1279',

  // Consumer Electronics
  'consumer-electronics': '222',   // Electronics
  'android-tv-boxes':     '1801',  // Electronics > Video > Video Players & Recorders
  'projector':            '306',   // Electronics > Video > Projectors
  'ip-camera':            '2425',  // Electronics > Cameras & Optics > Surveillance Systems
  'cctv-accessories':     '2425',
  'access-control-system':'2425',
  'gps-tracker-accessories': '1267',
  '3d-printer-machines':  '499948',// Electronics > 3D Printers

  // In Car
  'in-car':               '8526',  // Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Electronics
  'car-dvrs-accessories': '8526',
  'parking-sensor':       '8526',

  // Outdoor & Sports
  'outdoor-sports':       '990',   // Sporting Goods
  'camping':              '3334',  // Sporting Goods > Outdoor Recreation > Camping & Hiking
  'bicycle-accessories':  '3618',  // Sporting Goods > Cycling
  'fishing':              '3334',

  // Arduino / Tech
  'arduino-scm-supplies': '222',
  'diagnostic-scan-tools':'8526',
};

// Default fallback
const DEFAULT_GOOGLE_CATEGORY = '222'; // Electronics

function getGoogleCategory(categories: any[]): string {
  for (const cat of categories) {
    const slug = (cat.slug || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();
    if (CATEGORY_MAP[slug]) return CATEGORY_MAP[slug];
    if (CATEGORY_MAP[name]) return CATEGORY_MAP[name];
    // Partial match
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (slug.includes(key) || name.includes(key)) return val;
    }
  }
  return DEFAULT_GOOGLE_CATEGORY;
}

function metaValue(item: any, key: string): string {
  const meta = Array.isArray(item?.meta_data) ? item.meta_data : [];
  return String(meta.find((entry: any) => entry?.key === key)?.value || '').trim();
}

function needsPinterestMeta(item: any, googleCat: string): boolean {
  return metaValue(item, 'condition') !== 'new' || metaValue(item, 'google_product_category') !== googleCat;
}

function pinterestMeta(googleCat: string) {
  return [
    { key: 'condition', value: 'new' },
    { key: 'google_product_category', value: googleCat },
  ];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

// ── Fetch all products ────────────────────────────────────────────────────────
async function fetchAllProducts(): Promise<any[]> {
  const all: any[] = [];
  let page = 1;

  if (PRODUCT_IDS.length > 0) {
    console.log(`📦 Fetching targeted products: ${PRODUCT_IDS.join(', ')}`);
    for (const ids of chunk(PRODUCT_IDS, 100)) {
      const params = new URLSearchParams({
        include: ids.join(','),
        per_page: String(ids.length),
      });
      all.push(...await wooRequest<any[]>('GET', `products?${params}`));
    }
    console.log(`✅ Total: ${all.length} targeted products\n`);
    return all;
  }

  console.log('📦 Fetching all products...');
  while (true) {
    try {
      const params = new URLSearchParams({
        per_page: '100',
        page: String(page),
        status: 'publish',
      });
      const data = await wooRequest<any[]>('GET', `products?${params}`);
      if (!data.length) break;
      all.push(...(PRODUCT_LIMIT ? data.slice(0, Math.max(PRODUCT_LIMIT - all.length, 0)) : data));
      process.stdout.write(`\r   Fetched ${all.length} products (page ${page})...`);
      if (PRODUCT_LIMIT && all.length >= PRODUCT_LIMIT) break;
      page++;
    } catch (err: any) {
      console.error(`\n❌ Fetch error page ${page}:`, err.message);
      break;
    }
  }
  console.log(`\n✅ Total: ${all.length} products\n`);
  return all;
}

async function fetchAllVariations(productId: number): Promise<any[]> {
  const all: any[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
    });
    const data = await wooRequest<any[]>('GET', `products/${productId}/variations?${params}`);
    if (!data.length) break;
    all.push(...data);
    page++;
  }

  return all;
}

// ── Update products in WooCommerce batch calls ────────────────────────────────
async function updateProductBatch(updates: Array<{ id: number; meta_data: ReturnType<typeof pinterestMeta> }>) {
  if (DRY_RUN || updates.length === 0) return { updated: updates.length, failed: 0 };

  let updated = 0;
  let failed = 0;

  for (const batch of chunk(updates, BATCH_SIZE)) {
    try {
      await wooRequest('POST', 'products/batch', { update: batch });
      updated += batch.length;
    } catch (err: any) {
      failed += batch.length;
      console.error(`\n   Product batch failed: ${err.message}`);
    }
  }

  return { updated, failed };
}

// ── Update product variations ─────────────────────────────────────────────────
async function updateVariations(productId: number, googleCat: string): Promise<{ updated: number; skipped: number; failed: number }> {
  const variations = await fetchAllVariations(productId);
  const updates = variations
    .filter((variation: any) => needsPinterestMeta(variation, googleCat))
    .map((v: any) => ({
      id: v.id,
      meta_data: pinterestMeta(googleCat),
    }));

  if (DRY_RUN || updates.length === 0) {
    return { updated: updates.length, skipped: variations.length - updates.length, failed: 0 };
  }

  let updated = 0;
  let failed = 0;

  for (const batch of chunk(updates, BATCH_SIZE)) {
    try {
      await wooRequest('POST', `products/${productId}/variations/batch`, { update: batch });
      updated += batch.length;
    } catch (err: any) {
      failed += batch.length;
      console.error(`\n   Variation batch failed for product ${productId}: ${err.message}`);
    }
  }

  return { updated, skipped: variations.length - updates.length, failed };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🚀 Pinterest Feed Fix — Starting${DRY_RUN ? ' (dry run)' : ''}...\n`);
  const t0 = Date.now();

  const products = await fetchAllProducts();

  let productUpdated = 0, productFailed = 0, productSkipped = 0;
  let variationUpdated = 0, variationFailed = 0, variationSkipped = 0;

  console.log('🔄 Preparing product updates...\n');

  const productUpdates = products
    .map((p: any) => ({
      id: p.id,
      googleCat: getGoogleCategory(p.categories || []),
      needsUpdate: needsPinterestMeta(p, getGoogleCategory(p.categories || [])),
    }))
    .filter(item => item.needsUpdate)
    .map(item => ({ id: item.id, meta_data: pinterestMeta(item.googleCat) }));

  productSkipped = products.length - productUpdates.length;
  const productResult = await updateProductBatch(productUpdates);
  productUpdated = productResult.updated;
  productFailed = productResult.failed;

  console.log(
    `   Products: ${productUpdated} ${DRY_RUN ? 'would update' : 'updated'} | ${productSkipped} skipped | ${productFailed} failed`
  );

  const variableProducts = products.filter((p: any) => p.type === 'variable');
  console.log(`\n🔄 Checking variations for ${variableProducts.length} variable products (${VARIATION_CONCURRENCY} parallel)...\n`);

  let processedVariations = 0;
  for (const group of chunk(variableProducts, VARIATION_CONCURRENCY)) {
    await Promise.all(group.map(async (p: any) => {
      const googleCat = getGoogleCategory(p.categories || []);
      try {
        const result = await updateVariations(p.id, googleCat);
        variationUpdated += result.updated;
        variationSkipped += result.skipped;
        variationFailed += result.failed;
      } catch (err: any) {
        variationFailed++;
        console.error(`\n   Variations for product ${p.id} failed: ${err.message}`);
      }
    }));

    processedVariations += group.length;
    process.stdout.write(
      `\r   [${processedVariations}/${variableProducts.length}] variations ${variationUpdated} ${DRY_RUN ? 'would update' : 'updated'} / ${variationSkipped} skipped / ${variationFailed} failed`
    );
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n🎉 Done in ${secs}s`);
  console.log(`   Products updated:   ${productUpdated}`);
  console.log(`   Products skipped:   ${productSkipped}`);
  console.log(`   Products failed:    ${productFailed}`);
  console.log(`   Variations updated: ${variationUpdated}`);
  console.log(`   Variations skipped: ${variationSkipped}`);
  console.log(`   Variations failed:  ${variationFailed}`);
  console.log('\n📌 Next: Regenerate your Pinterest feed in WooCommerce → Pinterest → Sync');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
