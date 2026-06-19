/**
 * Delete all cached products from Firestore and MongoDB.
 *
 * This only deletes product cache collections:
 * - Firestore: products
 * - MongoDB: products
 *
 * It does not delete WooCommerce products or categories.
 *
 * Run:
 *   tsx backend/scripts/delete-products-from-caches.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../.env.local'), override: true });

const FIREBASE_BATCH_SIZE = Number(process.env.FIREBASE_DELETE_BATCH_SIZE || 50);
const ONLY = process.argv.find((arg) => arg.startsWith('--only='))?.split('=')[1] || 'all';
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'luxtronics';
const rawFirebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!rawFirebaseKey) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env');
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

async function deleteFirestoreProducts() {
  const serviceAccount = JSON.parse(rawFirebaseKey);
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  let deleted = 0;

  while (true) {
    try {
      const snapshot = await db.collection('products').limit(FIREBASE_BATCH_SIZE).get();
      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      deleted += snapshot.size;
      process.stdout.write(`\rFirestore products deleted: ${deleted}`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error: any) {
      if (String(error?.message || error).includes('RESOURCE_EXHAUSTED')) {
        console.error('\nFirestore quota is exhausted. Try again after quota resets or upgrade Firebase quota.');
      }
      throw error;
    }
  }

  await db.collection('sync_status').doc('latest').set({
    lastDeletedAt: FieldValue.serverTimestamp(),
    productsCount: 0,
    status: 'products_deleted',
  }, { merge: true });

  console.log(`\nFirestore products deleted total: ${deleted}`);
  return deleted;
}

async function deleteMongoProducts() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  try {
    const db = client.db(MONGODB_DB_NAME);
    const result = await db.collection('products').deleteMany({});
    await db.collection('sync_status').updateOne(
      { type: 'products' },
      {
        $set: {
          type: 'products',
          status: 'products_deleted',
          productsCount: 0,
          lastDeletedAt: new Date(),
        },
      },
      { upsert: true },
    );

    console.log(`MongoDB products deleted total: ${result.deletedCount}`);
    return result.deletedCount;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('Deleting cached products from Firestore and MongoDB...');
  const firestoreDeleted = ONLY === 'mongo' ? 0 : await deleteFirestoreProducts();
  const mongoDeleted = ONLY === 'firestore' ? 0 : await deleteMongoProducts();

  console.log('\nDone.');
  console.log(`Firestore deleted: ${firestoreDeleted}`);
  console.log(`MongoDB deleted: ${mongoDeleted}`);
}

main().catch((error) => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
