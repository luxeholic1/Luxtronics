/**
 * Test WooCommerce Connection
 * Quick test to verify WooCommerce API credentials work
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load root .env
dotenv.config({ path: join(__dirname, '../../.env') });

async function testConnection() {
  console.log('🧪 Testing WooCommerce connection...\n');

  const url    = process.env.VITE_WOOCOMMERCE_URL_INDIA    || '';
  const key    = process.env.VITE_WOOCOMMERCE_KEY_INDIA    || '';
  const secret = process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';

  console.log('Config:');
  console.log('  URL   :', url);
  console.log('  Key   :', key.substring(0, 12) + '...');
  console.log('  Secret:', secret.substring(0, 12) + '...\n');

  if (!url || !key || !secret) {
    console.error('❌ Missing credentials in .env!');
    process.exit(1);
  }

  // WooCommerceRestApi ships as a CommonJS default export
  const Api = (WooCommerceRestApi as any).default ?? WooCommerceRestApi;
  const woo = new Api({ url, consumerKey: key, consumerSecret: secret, version: 'wc/v3' });

  try {
    // --- Products ---
    console.log('📦 Fetching 5 products...');
    const { data: products } = await woo.get('products', { per_page: 5 });
    console.log(`✅ Got ${products.length} products:`);
    products.forEach((p: any, i: number) =>
      console.log(`   ${i + 1}. ${p.name}  –  ₹${p.price}`)
    );

    // --- Categories ---
    console.log('\n📂 Fetching categories...');
    const { data: cats } = await woo.get('products/categories', { per_page: 5 });
    console.log(`✅ Got ${cats.length} categories:`);
    cats.forEach((c: any, i: number) =>
      console.log(`   ${i + 1}. ${c.name}  (${c.count} products)`)
    );

    console.log('\n✅ WooCommerce connection OK — ready to sync to Firebase!');
  } catch (err: any) {
    console.error('\n❌ Connection failed:', err.message);
    if (err.response) {
      console.error('   Status:', err.response.status);
      console.error('   Body  :', JSON.stringify(err.response.data).slice(0, 300));
    }
    process.exit(1);
  }
}

testConnection();
