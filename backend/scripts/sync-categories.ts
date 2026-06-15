#!/usr/bin/env ts-node

/**
 * Sync Categories from WooCommerce to MongoDB
 * Usage: npm run sync:categories
 */

import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('CATEGORY SYNC: WooCommerce to MongoDB');
  console.log('Products will not be touched');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  console.log('Connecting to MongoDB...');
  const db = await initializeMongoDB();
  console.log('MongoDB connected\n');

  const syncService = new WooCommerceSync(db);
  const startTime = Date.now();
  const result = await syncService.syncCategories();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log(result.errors.length > 0 ? 'CATEGORY SYNC COMPLETED WITH ERRORS' : 'CATEGORY SYNC COMPLETED');
  console.log('='.repeat(60));
  console.log(`Categories Synced: ${result.synced}`);
  console.log(`Duration: ${duration}s`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    process.exitCode = 1;
  }

  await disconnectMongoDB();
}

main().catch(async (error) => {
  console.error('\nCATEGORY SYNC FAILED');
  console.error('Error:', error instanceof Error ? error.message : error);
  await disconnectMongoDB();
  process.exit(1);
});
