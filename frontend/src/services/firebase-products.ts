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
} from 'firebase/firestore';
import { productsDb, COLLECTIONS } from '@/lib/firebase-config';
import type { Product } from '@/data/products';
import type { StoreProduct, StoreCategory } from './store-api';

/**
 * Fetch all products from Firebase — no artificial limit
 */
export async function fetchProductsFromFirebase(
  page = 1,
  perPage = 0,          // 0 = fetch ALL
  searchQuery?: string
): Promise<StoreProduct[]> {
  try {
    const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);

    // Always fetch ALL docs — pagination is done client-side in Shop.tsx
    const q = query(productsRef, orderBy('name'));
    const snapshot = await getDocs(q);

    let products = snapshot.docs.map(docSnap => ({
      id: parseInt(docSnap.id),
      ...docSnap.data()
    })) as StoreProduct[];

    // Client-side search pre-filter (full scoring done in Shop.tsx)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.categories?.some((cat: any) => cat.name?.toLowerCase().includes(searchLower))
      );
    }

    return products;
  } catch (error) {
    console.error('Error fetching products from Firebase:', error);
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
 * Same strict token-matching logic as Shop.tsx
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
    const words = (q.match(/[a-z0-9]+/g) || []);

    // Tokenise helper
    const tok = (text: string) => (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];

    // Strict word match: numbers must be exact tokens, letters use prefix
    const wordMatchesToken = (qw: string, pt: string) =>
      /^\d+$/.test(qw) ? pt === qw : pt.startsWith(qw);

    const allIn = (ws: string[], tokens: string[]) =>
      ws.every(w => tokens.some(t => wordMatchesToken(w, t)));

    const score = (product: StoreProduct): number => {
      const name  = (product.name || '').toLowerCase();
      const cats  = product.categories?.map((c: any) => c.name).join(' ') || '';
      const desc  = (product.description || '').toLowerCase();

      const nt = tok(name);
      const ct = tok(cats);
      const dt = tok(desc);

      let s = 0;
      if (name === q)                          s += 1000;
      if (name.startsWith(q + ' '))            s += 800;

      const inName = allIn(words, nt);
      if (inName) {
        s += 600;
        if (words.length > 1) {
          let last = -1, ordered = true;
          for (const w of words) {
            const idx = nt.findIndex((t, i) => i > last && wordMatchesToken(w, t));
            if (idx === -1) { ordered = false; break; }
            last = idx;
          }
          if (ordered) s += 200;
        }
      }

      if (!inName && allIn(words, [...nt, ...ct])) s += 120;
      if (!inName && allIn(words, dt))             s += 40;

      if (s > 0) s -= name.length * 0.1;
      return s;
    };

    return products
      .map(p => ({ p, s: score(p) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .map(({ p }) => p);

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

    // Check if last sync was within 24 hours (was 1 hour — too strict)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (lastSync < oneDayAgo) {
      console.warn('Firebase data is stale (last sync > 24 hours ago)');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Firebase availability:', error);
    return false;
  }
}
