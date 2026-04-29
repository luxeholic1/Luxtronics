#!/usr/bin/env ts-node

/**
 * Sync Products from WooCommerce to MongoDB
 * Usage: npm run sync:products
 */

import { initializeMongoDB, disconnectMongoDB } from '../server/db/mongodb';
import WooCommerceSync from '../server/services/woocommerce-sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

let isSyncing = false;

async function main() {
  try {
    if (isSyncing) {
      console.log('⚠️  Sync already in progress. Please wait...');
      return;
    }

    isSyncing = true;

    console.log('\n' + '='.repeat(60));
    console.log('🔄 WooCommerce to MongoDB Product Sync');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

    // Initialize MongoDB
    console.log('📦 Connecting to MongoDB...');
    const db = await initializeMongoDB();
    console.log('✅ MongoDB connected\n');

    // Create sync service
    const syncService = new WooCommerceSync(db);

    // Get start time for timing
    const startTime = Date.now();

    // Run sync with progress callback
    console.log('🔄 Syncing products from WooCommerce...\n');

    const result = await syncService.syncProducts({
      batchSize: 100,
      delay: 1000,
      onProgress: (current, total) => {
        const percentage = Math.round((current / total) * 100);
        const progressBar = createProgressBar(percentage, 50);
        process.stdout.write(
          `\r📊 Progress: [${progressBar}] ${percentage}% (${current}/${total})`
        );
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ SYNC COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`
📈 Results:
   ├─ Products Synced: ${result.synced}
   ├─ Failed: ${result.failed}
   ├─ Duration: ${duration}s
   ├─ Avg Speed: ${(result.synced / parseFloat(duration)).toFixed(0)} products/sec
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
    console.error('\n❌ SYNC FAILED');
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
