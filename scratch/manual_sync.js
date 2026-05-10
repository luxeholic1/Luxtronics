
import { initializeMongoDB } from './backend/server/db/mongodb.js';
import { WooCommerceSync } from './backend/server/services/woocommerce-sync.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function runSync() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await initializeMongoDB();
    console.log('Connected.');

    const syncService = new WooCommerceSync(db);
    console.log('Starting full sync...');
    const result = await syncService.fullSync({
      onProgress: (current, total) => {
        console.log(`Progress: ${current}/${total}`);
      }
    });

    console.log('Sync completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

runSync();
