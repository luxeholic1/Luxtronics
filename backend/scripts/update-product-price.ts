#!/usr/bin/env ts-node

/**
 * Update Product Price in WooCommerce
 * Usage: npm run update:price -- --product="Ulefone Armor X16" --price=49999 --store=india
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

interface WooStoreConfig {
  url: string;
  key: string;
  secret: string;
}

const STORES: Record<string, WooStoreConfig> = {
  india: {
    url: process.env.VITE_WOOCOMMERCE_URL_INDIA || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_INDIA || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  },
  australia: {
    url: process.env.VITE_WOOCOMMERCE_URL_AUSTRALIA || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || '',
  },
  newzealand: {
    url: process.env.VITE_WOOCOMMERCE_URL_NEWZEALAND || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || '',
  },
};

function getAuthHeader(store: WooStoreConfig): string {
  return 'Basic ' + Buffer.from(`${store.key}:${store.secret}`).toString('base64');
}

async function searchProductByName(store: WooStoreConfig, productName: string): Promise<any> {
  const url = `${store.url}/wp-json/wc/v3/products?search=${encodeURIComponent(productName)}&per_page=100`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(store),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce search failed: ${response.status} ${body}`);
  }

  const products = await response.json();
  return products;
}

async function updateProductPrice(store: WooStoreConfig, productId: number, newPrice: number): Promise<any> {
  const url = `${store.url}/wp-json/wc/v3/products/${productId}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: getAuthHeader(store),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      regular_price: newPrice.toString(),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce update failed: ${response.status} ${body}`);
  }

  return response.json();
}

async function main() {
  const args = process.argv.slice(2);
  
  let productName = '';
  let price = 0;
  let storeName = 'india';

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--product=')) {
      productName = args[i].substring('--product='.length);
    }
    if (args[i].startsWith('--price=')) {
      price = parseInt(args[i].substring('--price='.length));
    }
    if (args[i].startsWith('--store=')) {
      storeName = args[i].substring('--store='.length).toLowerCase();
    }
  }

  // Validate inputs
  if (!productName || !price || price <= 0) {
    console.error('❌ Usage: npx ts-node update-product-price.ts --product="Product Name" --price=9999 --store=india');
    console.error('   Available stores: india, australia, newzealand');
    process.exit(1);
  }

  if (!STORES[storeName]) {
    console.error(`❌ Invalid store: ${storeName}. Available: ${Object.keys(STORES).join(', ')}`);
    process.exit(1);
  }

  const store = STORES[storeName];

  console.log('\n' + '='.repeat(60));
  console.log('🛍️  WooCommerce Product Price Update');
  console.log('='.repeat(60));
  console.log(`Product: ${productName}`);
  console.log(`New Price: ₹${price}`);
  console.log(`Store: ${storeName}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Search for product
    console.log('🔍 Searching for product...');
    const products = await searchProductByName(store, productName);

    if (!products || products.length === 0) {
      console.error('❌ Product not found!');
      console.error('   Searched for:', productName);
      process.exit(1);
    }

    // Find exact or best match
    let targetProduct = products[0];
    const exactMatch = products.find((p: any) => 
      p.name.toLowerCase() === productName.toLowerCase()
    );

    if (exactMatch) {
      targetProduct = exactMatch;
    }

    console.log(`✅ Found product: "${targetProduct.name}"`);
    console.log(`   ID: ${targetProduct.id}`);
    console.log(`   Current Price: ₹${targetProduct.regular_price}\n`);

    // Step 2: Update price
    console.log('📝 Updating price...');
    const updated = await updateProductPrice(store, targetProduct.id, price);

    console.log('\n' + '='.repeat(60));
    console.log('✅ PRICE UPDATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`
Product: ${updated.name}
ID: ${updated.id}
Old Price: ₹${targetProduct.regular_price}
New Price: ₹${updated.regular_price}
Updated at: ${new Date().toLocaleString()}
`);
    console.log('='.repeat(60));
    console.log('ℹ️  Note: Run "npm run sync:products" to sync to MongoDB\n');

  } catch (error) {
    console.error('\n❌ UPDATE FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
