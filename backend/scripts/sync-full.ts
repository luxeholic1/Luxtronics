#!/usr/bin/env ts-node

/**
 * Full Sync: Products + Categories from WooCommerce to MongoDB
 * Usage: npm run sync:full
 */

import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
console.log('📁 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
} else {
  console.log('✅ .env loaded, parsed keys:', Object.keys(result.parsed || {}));
}
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

console.log('🔍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('🔍 MONGODB_URI value:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');

let isSyncing = false;

async function main() {
  try {
    if (isSyncing) {
      console.log('⚠️  Sync already in progress. Please wait...');
      return;
    }

    isSyncing = true;

    console.log('\n' + '='.repeat(60));
    console.log('🔄 FULL SYNC: WooCommerce to MongoDB');
    console.log('   (Products + Categories)');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

    // Initialize MongoDB
    console.log('📦 Connecting to MongoDB...');
    const db = await initializeMongoDB();
    console.log('✅ MongoDB connected\n');

    // Create sync service
    const syncService = new WooCommerceSync(db);

    // Get start time
    const startTime = Date.now();

    // Run full sync
    console.log('🔄 Running full sync...\n');

    const result = await syncService.fullSync({
      concurrency: Number(process.env.WOO_SYNC_CONCURRENCY || 6),
      delay: Number(process.env.WOO_SYNC_DELAY_MS || 0),
      syncVariations: process.env.SYNC_VARIATIONS === 'true',
      onProgress: (current, total) => {
        const percentage = Math.round((current / total) * 100);
        const progressBar = createProgressBar(percentage, 50);
        process.stdout.write(
          `\r📊 Products Progress: [${progressBar}] ${percentage}% (${current}/${total})`
        );
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ FULL SYNC COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`
📈 Results:
   ├─ Products Synced: ${result.products}
   ├─ Categories Synced: ${result.categories}
   ├─ Total Duration: ${duration}s
   └─ Completed at: ${new Date().toLocaleString()}
`);

    if (result.errors.length > 0) {
      console.log('❌ ERRORS:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log('='.repeat(60) + '\n');

    // Disconnect
    await disconnectMongoDB();
  } catch (error) {
    console.error('\n❌ FULL SYNC FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    isSyncing = false;
    process.exit(0);
  }
}

function createProgressBar(percentage: number, width: number): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Handle interruption
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Sync interrupted by user');
  await disconnectMongoDB();
  process.exit(0);
});

// Run
main();
