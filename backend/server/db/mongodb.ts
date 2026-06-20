/**
 * MongoDB Connection & Configuration
 * Production-ready setup for MongoDB Atlas
 */

import { Collection, CreateIndexesOptions, Db, IndexSpecification, MongoClient, MongoClientOptions } from 'mongodb';

interface MongoDBConfig {
  uri: string;
  dbName: string;
  retryWrites?: boolean;
  w?: string;
  journal?: boolean;
}

type SafeIndexOptions = CreateIndexesOptions & {
  ignoreDuplicateKeyError?: boolean;
};

class MongoDBConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private uri: string;
  private dbName: string;
  private isConnected: boolean = false;

  constructor(config: MongoDBConfig) {
    this.uri = config.uri;
    this.dbName = config.dbName;

    if (!this.uri) {
      throw new Error('MongoDB URI not provided in environment variables');
    }
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<Db> {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      console.log('🔗 Connecting to MongoDB...');
      console.log('📋 Connection URI starts with:', this.uri.substring(0, 20) + '...');

      // Enable TLS/SSL only when the URI indicates it's required (e.g. mongodb+srv)
      const uriLower = this.uri.toLowerCase();
      const useTls = uriLower.startsWith('mongodb+srv') || uriLower.includes('ssl=true') || uriLower.includes('tls=true');

      const clientOptions: MongoClientOptions = {
        retryWrites: true,
        w: 'majority',
        journal: true,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      };

      if (useTls) {
        clientOptions.tls = true;
        clientOptions.ssl = true;
        // More lenient SSL settings for compatibility
        clientOptions.tlsAllowInvalidCertificates = true;
        clientOptions.tlsAllowInvalidHostnames = true;
      }

      this.client = new MongoClient(this.uri, clientOptions);

      console.log('🔄 Attempting to connect...');
      await this.client.connect();
      console.log('✅ MongoDB client connected, testing connection...');

      // Verify connection with ping
      await this.client.db('admin').command({ ping: 1 });
      console.log('✅ MongoDB ping successful!');

      this.db = this.client.db(this.dbName);
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully!');

      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB disconnected');
    }
  }

  /**
   * Get database instance
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Check connection status
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  private async createIndexIfPossible(
    collection: Collection,
    keys: IndexSpecification,
    options: SafeIndexOptions = {}
  ): Promise<void> {
    const { ignoreDuplicateKeyError = false, ...indexOptions } = options;

    try {
      await collection.createIndex(keys, indexOptions);
    } catch (err: unknown) {
      const details = err && typeof err === 'object' ? err as { codeName?: string; code?: number; message?: string } : {};
      const codeName = details.codeName || '';
      const code = details.code;
      const message = details.message || String(err);

      if (
        codeName === 'IndexOptionsConflict' ||
        codeName === 'IndexKeySpecsConflict' ||
        /equivalent index already exists|already exists with a different name|same name as the requested index/i.test(message)
      ) {
        console.warn(`⚠️ Reusing existing MongoDB index on ${collection.collectionName}: ${message}`);
        return;
      }

      if (ignoreDuplicateKeyError && (code === 11000 || /duplicate key/i.test(message))) {
        console.warn(`⚠️ Skipping MongoDB index on ${collection.collectionName}: existing duplicate values found. ${message}`);
        return;
      }

      throw err;
    }
  }

  /**
   * Create indexes for collections
   */
  async createIndexes(): Promise<void> {
    const db = this.getDb();

    // Products collection indexes
    const productsCollection = db.collection('products');
    
    await Promise.all([
      this.createIndexIfPossible(productsCollection, { id: 1 }, { unique: true, ignoreDuplicateKeyError: true }),
      this.createIndexIfPossible(productsCollection, { slug: 1 }), // Non-unique: WooCommerce can have duplicate slugs
      this.createIndexIfPossible(productsCollection, { category: 1 }),
      this.createIndexIfPossible(productsCollection, { price: 1 }),
      this.createIndexIfPossible(productsCollection, { rating: -1 }),
      this.createIndexIfPossible(productsCollection, { createdAt: -1 }),
      this.createIndexIfPossible(productsCollection, { updatedAt: -1 }),
      this.createIndexIfPossible(productsCollection, { syncedAt: -1 }),
      this.createIndexIfPossible(productsCollection, { name: 'text', description: 'text' }), // Text search
    ]);

    // Categories collection indexes
    const categoriesCollection = db.collection('categories');
    await this.createIndexIfPossible(categoriesCollection, { slug: 1 }, { unique: true, ignoreDuplicateKeyError: true });

    // Cache metadata indexes
    const cacheCollection = db.collection('cache_metadata');
    await Promise.all([
      this.createIndexIfPossible(cacheCollection, { key: 1 }, { unique: true, ignoreDuplicateKeyError: true }),
      this.createIndexIfPossible(cacheCollection, { expiresAt: 1 }, { expireAfterSeconds: 0 }), // TTL index
    ]);

    // Users and sessions indexes
    const usersCollection = db.collection('users');
    await this.createIndexIfPossible(usersCollection, { email: 1 }, { unique: true, ignoreDuplicateKeyError: true });

    const sessionsCollection = db.collection('user_sessions');
    await Promise.all([
      this.createIndexIfPossible(sessionsCollection, { token: 1 }, { unique: true, ignoreDuplicateKeyError: true }),
      this.createIndexIfPossible(sessionsCollection, { expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);

    console.log('✅ Indexes created successfully!');
  }
}

// Singleton instance
let mongoConnection: MongoDBConnection | null = null;

export async function initializeMongoDB(): Promise<Db> {
  if (!mongoConnection) {
    mongoConnection = new MongoDBConnection({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'luxtronics',
    });

    await mongoConnection.connect();
    await mongoConnection.createIndexes();
  }

  return mongoConnection.getDb();
}

export function getMongoDBConnection(): MongoDBConnection {
  if (!mongoConnection) {
    throw new Error('MongoDB not initialized. Call initializeMongoDB() first.');
  }
  return mongoConnection;
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoConnection) {
    await mongoConnection.disconnect();
    mongoConnection = null;
  }
}

export default MongoDBConnection;
