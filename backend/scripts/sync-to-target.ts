//!/usr/bin/env ts-node

/**
 * Sync products from source WooCommerce (luxtronics.luxtronics.in) to target WooCommerce (luxtronics.in)
 * Usage: npm run sync:to-target
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env variables (both .env and .env.local)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Source credentials
const SOURCE_URL = process.env.VITE_WOOCOMMERCE_URL;
const SOURCE_KEY = process.env.VITE_WOOCOMMERCE_KEY;
const SOURCE_SECRET = process.env.VITE_WOOCOMMERCE_SECRET;

// Target credentials
const TARGET_URL = process.env.VITE_WOOCOMMERCE_TARGET_URL;
const TARGET_KEY = process.env.VITE_WOOCOMMERCE_TARGET_KEY;
const TARGET_SECRET = process.env.VITE_WOOCOMMERCE_TARGET_SECRET;

if (!SOURCE_URL || !SOURCE_KEY || !SOURCE_SECRET) {
  console.error('Source WooCommerce credentials are missing');
  process.exit(1);
}
if (!TARGET_URL || !TARGET_KEY || !TARGET_SECRET) {
  console.error('Target WooCommerce credentials are missing');
  process.exit(1);
}

const sourceAuth = Buffer.from(`${SOURCE_KEY}:${SOURCE_SECRET}`).toString('base64');
const targetAuth = Buffer.from(`${TARGET_KEY}:${TARGET_SECRET}`).toString('base64');

async function fetchAllProducts(page = 1, perPage = 100, accum: any[] = []): Promise<any[]> {
  const url = `${SOURCE_URL}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Basic ${sourceAuth}` },
  });
  const products = resp.data;
  accum.push(...products);
  const total = parseInt(resp.headers['x-wp-totalpages'] || '0');
  if (page < total) {
    return fetchAllProducts(page + 1, perPage, accum);
  }
  return accum;
}

async function createProductOnTarget(product: any) {
  // Map fields needed for target store. Basic mapping – you can extend as needed.
  const payload = {
    name: product.name,
    type: product.type,
    regular_price: product.price,
    description: product.description,
    short_description: product.short_description,
    sku: product.sku,
    images: product.images?.map((img: any) => ({ src: img.src, alt: img.alt })),
    categories: product.categories?.map((cat: any) => ({ id: cat.id })),
    // Add any other fields you require.
  };
  const url = `${TARGET_URL}/wp-json/wc/v3/products`;
  const resp = await axios.post(url, payload, {
    headers: { Authorization: `Basic ${targetAuth}` },
  });
  return resp.data;
}

async function main() {
  console.log('Fetching products from source store...');
  const products = await fetchAllProducts();
  console.log(`Found ${products.length} products. Syncing to target...`);
  let success = 0;
  for (const p of products) {
    try {
      await createProductOnTarget(p);
      success++;
      process.stdout.write(`\r✅ Synced ${success}/${products.length}`);
    } catch (e) {
      console.error('\n❌ Failed to sync product', p.id, ':', e.message);
    }
  }
  console.log('\nSync complete.');
}

main();
