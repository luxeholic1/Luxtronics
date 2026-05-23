/**
 * Export Pinterest Product Feed (CSV)
 * Run: npx tsx backend/scripts/export-pinterest-feed.ts
 * Output: pinterest-feed.csv (ready for Pinterest Catalog upload)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
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

// ── Helper: Clean CSV field ───────────────────────────────────────────────────
function cleanField(value: any): string {
  if (!value) return '';
  return String(value).replace(/"/g, '""').replace(/\n/g, ' ').trim();
}

// ── Helper: Strip HTML tags ───────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function exportPinterestFeed() {
  console.log('📦 Fetching products from Firebase...\n');

  const productsSnapshot = await db.collection('products').get();
  const products = productsSnapshot.docs.map(doc => doc.data());

  console.log(`✅ Found ${products.length} products\n`);
  console.log('🔄 Generating Pinterest CSV feed...\n');

  // CSV Header (Pinterest Product Feed Format)
  const csvHeader = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'additional_image_link',
    'price',
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
    'shipping_weight'
  ].join(',') + '\n';

  // CSV Rows
  const csvRows = products.map(p => {
    const title = cleanField(p.name).substring(0, 150);
    const description = cleanField(stripHtml(p.short_description || p.description || '')).substring(0, 500);
    const link = `https://luxtronics.com/product/${p.slug}`;
    const imageLink = p.images?.[0]?.src || '';
    const additionalImages = p.images?.slice(1, 4).map((img: any) => img.src).join(',') || '';
    const price = `${p.price} INR`;
    const availability = p.stock_status === 'instock' ? 'in stock' : 'out of stock';
    const brand = 'Luxtronics';
    const condition = 'new';
    const productType = p.categories?.[0]?.name || 'Electronics';
    const googleCategory = 'Electronics > Consumer Electronics';
    const gtin = p.sku || '';
    const mpn = p.sku || '';
    const itemGroupId = p.id;
    const color = p.attributes?.find((a: any) => a.name === 'Color')?.options?.[0] || '';
    const size = p.attributes?.find((a: any) => a.name === 'Size')?.options?.[0] || '';
    const ageGroup = 'adult';
    const gender = 'unisex';
    const material = p.attributes?.find((a: any) => a.name === 'Material')?.options?.[0] || '';
    const pattern = '';
    const shippingWeight = p.weight || '';

    return [
      `"${p.id}"`,
      `"${title}"`,
      `"${description}"`,
      `"${link}"`,
      `"${imageLink}"`,
      `"${additionalImages}"`,
      `"${price}"`,
      `"${availability}"`,
      `"${brand}"`,
      `"${condition}"`,
      `"${productType}"`,
      `"${googleCategory}"`,
      `"${gtin}"`,
      `"${mpn}"`,
      `"${itemGroupId}"`,
      `"${color}"`,
      `"${size}"`,
      `"${ageGroup}"`,
      `"${gender}"`,
      `"${material}"`,
      `"${pattern}"`,
      `"${shippingWeight}"`
    ].join(',');
  }).join('\n');

  // Write to file
  const outputPath = join(__dirname, '../../pinterest-feed.csv');
  fs.writeFileSync(outputPath, csvHeader + csvRows);

  console.log(`✅ Pinterest feed exported successfully!\n`);
  console.log(`📄 File: ${outputPath}`);
  console.log(`📊 Products: ${products.length}`);
  console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);
  console.log('🎯 Next steps:');
  console.log('   1. Go to https://www.pinterest.com/business/catalogs/');
  console.log('   2. Click "Create catalog"');
  console.log('   3. Upload pinterest-feed.csv');
  console.log('   4. Set update frequency (daily/weekly)\n');

  process.exit(0);
}

exportPinterestFeed().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
