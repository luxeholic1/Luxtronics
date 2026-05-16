/**
 * Firebase Configuration for Products Database
 * Separate from Auth Firebase instance
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config for products database
// Using same Firebase project as auth, but separate app instance
const firebaseProductsConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase app for products (separate instance from auth)
const productsAppName = 'products-db';
let productsApp;

// Check if app already exists
const existingApps = getApps();
const existingApp = existingApps.find(app => app.name === productsAppName);

if (existingApp) {
  productsApp = existingApp;
} else {
  productsApp = initializeApp(firebaseProductsConfig, productsAppName);
}

// Initialize Firestore
export const productsDb = getFirestore(productsApp);

// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SYNC_STATUS: 'sync_status',
} as const;
