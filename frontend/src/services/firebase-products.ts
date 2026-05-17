/**
 * Firebase Products Service
 * Fast product fetching from Firebase Firestore
 * 
 * Performance optimisations:
 * - In-memory cache: products fetched once per session, reused on every call
 * - checkFirebaseAvailability result cached for 5 minutes
 * - No redundant Firestore reads
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
} from 'firebase/firestore';
import { productsDb, COLLECTIONS } from '@/lib/firebase-config';
import type { StoreProduct, StoreCategory } from './store-api';

// ── In-memory cache ───────────────────────────────────────────────────────────
const PRODUCTS_TTL    = 30 * 60 * 1000;  // 30 minutes
const CATEGORIES_TTL  = 60 * 60 * 1000;  // 1 hour
const AVAILABILITY_TTL = 5 * 60 * 1000;  // 5 minutes

let _productsCache:    { data: StoreProduct[]; ts: number } | null = null;
let _categoriesCache:  { data: StoreCategory[]; ts: number } | null = null;
let _availabilityCache: { value: boolean; ts: number } | null = null;

/**
 * Check if Firebase has fresh data — result cached for 5 minutes
 */
export async function checkFirebaseAvailability(): Promise<boolean> {
  // Return cached result if still fresh
  if (_availabilityCache && Date.now() - _availabilityCache.ts < AVAILABILITY_TTL) {
    return _availabilityCache.value;
  }

  try {
    const syncStatusRef = doc(productsDb, COLLECTIONS.SYNC_STATUS, 'latest');
    const syncDoc = await getDoc(syncStatusRef);

    if (!syncDoc.exists()) {
      _availabilityCache = { value: false, ts: Date.now() };
      return false;
    }

    const syncData = syncDoc.data();
    const lastSync = syncData?.lastSyncAt?.toDate?.();

    if (!lastSync) {
      _availabilityCache = { value: false, ts: Date.now() };
      return false;
    }

    // Accept data synced within last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isAvailable = lastSync > sevenDaysAgo;

    _availabilityCache = { value: isAvailable, ts: Date.now() };
    return isAvailable;
  } catch {
    _availabilityCache = { value: false, ts: Date.now() };
    return false;
  }
}

/**
 * Fetch ALL products from Firebase — cached in memory for the session.
 * First call: ~200-500ms (Firestore read)
 * Subsequent calls: <1ms (memory cache)
 */
export async function fetchProductsFromFirebase(
  _page = 1,
  _perPage = 0,
  searchQuery?: string
): Promise<StoreProduct[]> {
  try {
    // Use cache if still fresh (within 30 minutes)
    const now = Date.now();
    if (!_productsCache || now - _productsCache.ts > PRODUCTS_TTL) {
      const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);
      const q = query(productsRef, orderBy('name'));
      const snapshot = await getDocs(q);

      _productsCache = {
        data: snapshot.docs.map(docSnap => ({
          id: parseInt(docSnap.id),
          ...docSnap.data()
        })) as StoreProduct[],
        ts: now,
      };
    }

    let products = _productsCache.data;

    // Light pre-filter for search (full scoring done in Shop.tsx)
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.categories?.some((c: any) => c.name?.toLowerCase().includes(lower))
      );
    }

    return products;
  } catch (error) {
    console.error('Firebase fetchProducts error:', error);
    return [];
  }
}

/**
 * Fetch single product by slug — checks cache first, then Firestore
 */
export async function fetchProductFromFirebase(slug: string): Promise<StoreProduct | null> {
  try {
    // Check in-memory cache first (if still fresh)
    if (_productsCache && Date.now() - _productsCache.ts <= PRODUCTS_TTL) {
      const cached = _productsCache.data.find((p: any) => p.slug === slug);
      if (cached) return cached;
    }

    const productsRef = collection(productsDb, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, where('slug', '==', slug), firestoreLimit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return {
      id: parseInt(snapshot.docs[0].id),
      ...snapshot.docs[0].data()
    } as StoreProduct;
  } catch (error) {
    console.error('Firebase fetchProduct error:', error);
    return null;
  }
}

/**
 * Fetch categories — cached in memory
 */
export async function fetchCategoriesFromFirebase(): Promise<StoreCategory[]> {
  try {
    const now = Date.now();
    if (!_categoriesCache || now - _categoriesCache.ts > CATEGORIES_TTL) {
      const categoriesRef = collection(productsDb, COLLECTIONS.CATEGORIES);
      const q = query(categoriesRef, orderBy('name'));
      const snapshot = await getDocs(q);

      _categoriesCache = {
        data: snapshot.docs.map(docSnap => ({
          id: parseInt(docSnap.id),
          ...docSnap.data()
        })) as StoreCategory[],
        ts: now,
      };
    }

    return _categoriesCache.data;
  } catch (error) {
    console.error('Firebase fetchCategories error:', error);
    return [];
  }
}

/**
 * Search products — uses in-memory cache, no extra Firestore reads
 */
export async function searchProductsInFirebase(searchQuery: string): Promise<StoreProduct[]> {
  try {
    // Ensure cache is populated (respects TTL)
    if (!_productsCache || Date.now() - _productsCache.ts > PRODUCTS_TTL) {
      await fetchProductsFromFirebase();
    }
    const products = _productsCache?.data || [];

    const q     = searchQuery.toLowerCase().trim();
    const words = q.match(/[a-z0-9]+/g) || [];

    const tok = (text: string) => (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    const wordMatchesToken = (qw: string, pt: string) =>
      /^\d+$/.test(qw) ? pt === qw : pt.startsWith(qw);
    const allIn = (ws: string[], tokens: string[]) =>
      ws.every(w => tokens.some(t => wordMatchesToken(w, t)));

    const score = (product: StoreProduct): number => {
      const name = (product.name || '').toLowerCase();
      const cats = product.categories?.map((c: any) => c.name).join(' ') || '';
      const desc = (product.description || '').toLowerCase();
      const nt = tok(name), ct = tok(cats), dt = tok(desc);

      let s = 0;
      if (name === q)              s += 1000;
      if (name.startsWith(q + ' ')) s += 800;

      const inName = allIn(words, nt);
      if (inName) {
        s += 600;
        if (words.length > 1) {
          let last = -1, ok = true;
          for (const w of words) {
            const idx = nt.findIndex((t, i) => i > last && wordMatchesToken(w, t));
            if (idx === -1) { ok = false; break; }
            last = idx;
          }
          if (ok) s += 200;
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
    console.error('Firebase search error:', error);
    return [];
  }
}

/** Clear cache manually (e.g. after Firebase sync) */
export function clearFirebaseCache() {
  _productsCache    = null;
  _categoriesCache  = null;
  _availabilityCache = null;
}
