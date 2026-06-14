/**
 * Fast WooCommerce → MongoDB slug sync.
 *
 * Use this after changing WooCommerce product slugs when a full product sync would
 * be too slow. It only patches URL-facing fields in MongoDB.
 *
 * Run: npm run sync:slugs:mongo
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../.env.local'), override: true });

const STORE_URL = (process.env.VITE_WOOCOMMERCE_URL_INDIA || '').replace(/\/$/, '');
const CONSUMER_KEY = process.env.VITE_WOOCOMMERCE_KEY_INDIA || '';
const CONSUMER_SECRET = process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'luxtronics';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
const API_BASE = `${STORE_URL}/wp-json/wc/v3`;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET || !MONGODB_URI) {
  console.error('Missing required env vars for WooCommerce or MongoDB');
  process.exit(1);
}

type WooProductSlug = {
  id: number;
  slug: string;
  permalink?: string;
  date_modified_gmt?: string;
};

async function wooGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${endpoint.replace(/^\//, '')}`, {
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }

  return res.json() as Promise<T>;
}

async function fetchAllProductSlugs(): Promise<WooProductSlug[]> {
  const products: WooProductSlug[] = [];
  let page = 1;

  console.log('Fetching product slugs from WooCommerce...');
  while (true) {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
      status: 'publish',
      _fields: 'id,slug,permalink,date_modified_gmt',
    });
    const data = await wooGet<WooProductSlug[]>(`products?${params}`);
    if (!data.length) break;

    products.push(...data);
    process.stdout.write(`\r   fetched ${products.length} products...`);
    page++;
  }

  console.log(`\nFetched ${products.length} product slugs.\n`);
  return products;
}

async function main() {
  const products = await fetchAllProductSlugs();
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log(`Connecting to MongoDB database "${DB_NAME}"...`);
    await client.connect();
    const collection = client.db(DB_NAME).collection('products');

    const ops = products.map(product => ({
      updateOne: {
        filter: { id: product.id },
        update: {
          $set: {
            slug: product.slug,
            permalink: product.permalink || `${STORE_URL}/product/${product.slug}/`,
            date_modified_gmt: product.date_modified_gmt,
            updatedAt: new Date(),
          },
        },
        upsert: false,
      },
    }));

    console.log('Updating MongoDB slugs...');
    const result = await collection.bulkWrite(ops, { ordered: false });
    console.log(`Done. Matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
