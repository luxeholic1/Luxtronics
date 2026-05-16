/**
 * Firebase Products Service
 * Fast product fetching from Firebase Firestore
 */

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit as firestoreLimit,
  QueryConstraint
} from 'firebase/firestore';
import { productsDb, COLLECTIONS } from '@/lib/firebase-config';
import type { Product } from '@/data/products';
import type { StoreProduct, StoreCategory } from './store-api';

/**
 * Fetch all products from Firebase
 * Much faster than WooCommerce API (50-200ms vs 1-2s)
 */
export async function fetchProductsFromFirebase(
  page = 1,
  perPage = 100,
  searchQuery?: string
): Promise<StoreProduct[]> {
  try {
    const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);
    const constraints: QueryConstraint[] = [];

    // Add search filter if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      // Firebase doesn't support full-text search, so we'll fetch all and filter client-side
      // For better search, consider using Algolia or Meilisearch
      constraints.push(orderBy('name'));
    } else {
      constraints.push(orderBy('name'));
    }

    // Add pagination
    if (perPage > 0) {
      constraints.push(firestoreLimit(perPage));
    }

    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let products = snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as StoreProduct[];

    // Client-side search filtering if search query provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.categories?.some(cat => cat.name.toLowerCase().includes(searchLower))
      );
    }

    return products;
  } catch (error) {
    console.error('Error fetching products from Firebase:', error);
    // Fallback to empty array on error
    return [];
  }
}

/**
 * Fetch single product by slug from Firebase
 */
export async function fetchProductFromFirebase(slug: string): Promise<StoreProduct | null> {
  try {
    const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, where('slug', '==', slug), firestoreLimit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: parseInt(doc.id),
      ...doc.data()
    } as StoreProduct;
  } catch (error) {
    console.error('Error fetching product from Firebase:', error);
    return null;
  }
}

/**
 * Fetch categories from Firebase
 */
export async function fetchCategoriesFromFirebase(): Promise<StoreCategory[]> {
  try {
    const categoriesRef = collection(productsDb, COLLECTIONS.CATEGORIES);
    const q = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as StoreCategory[];
  } catch (error) {
    console.error('Error fetching categories from Firebase:', error);
    return [];
  }
}

/**
 * Search products in Firebase with smart filtering + relevance scoring
 * Same scoring logic as Shop.tsx for consistency
 */
export async function searchProductsInFirebase(searchQuery: string): Promise<StoreProduct[]> {
  try {
    const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as StoreProduct[];

    const q     = searchQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);

    // Score each product
    const scored = products
      .map(product => {
        const name  = (product.name || '').toLowerCase();
        const cat   = product.categories?.map((c: any) => c.name).join(' ').toLowerCase() || '';
        const desc  = (product.description || '').toLowerCase();

        let score = 0;

        if (name === q)                   score += 1000;
        if (name.startsWith(q + ' '))     score += 800;
        if (name.includes(' ' + q))       score += 700;
        if (name.includes(q))             score += 600;

        const allInName = words.every(w => name.includes(w));
        if (allInName)                    score += 500;

        if (allInName && words.length > 1) {
          let last = -1, inOrder = true;
          for (const w of words) {
            const idx = name.indexOf(w, last + 1);
            if (idx <= last) { inOrder = false; break; }
            last = idx;
          }
          if (inOrder) score += 200;
        }

        const prefixMatches = words.filter(w =>
          name.split(/\s+/).some(token => token.startsWith(w))
        );
        score += prefixMatches.length * 80;

        if (cat.includes(q))              score += 150;
        const allInCat = words.every(w => (name + ' ' + cat).includes(w));
        if (!allInName && allInCat)       score += 120;

        const allInDesc = words.every(w => desc.includes(w));
        if (!allInName && !allInCat && allInDesc) score += 50;

        return { product, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(({ product }) => product);
  } catch (error) {
    console.error('Error searching products in Firebase:', error);
    return [];
  }
}

/**
 * Check if Firebase is available and has data
 */
export async function checkFirebaseAvailability(): Promise<boolean> {
  try {
    const syncStatusRef = doc(productsDb, COLLECTIONS.SYNC_STATUS, 'latest');
    const syncDoc = await getDoc(syncStatusRef);
    
    if (!syncDoc.exists()) {
      console.warn('Firebase sync status not found - data may not be synced yet');
      return false;
    }

    const syncData = syncDoc.data();
    const lastSync = syncData?.lastSyncAt?.toDate();
    
    if (!lastSync) {
      console.warn('Firebase last sync time not found');
      return false;
    }

    // Check if last sync was within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (lastSync < oneHourAgo) {
      console.warn('Firebase data is stale (last sync > 1 hour ago)');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Firebase availability:', error);
    return false;
  }
}
