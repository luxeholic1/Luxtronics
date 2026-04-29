/**
 * MongoDB Connection & Configuration
 * Production-ready setup for MongoDB Atlas
 */

import { MongoClient, Db, MongoError } from 'mongodb';

interface MongoDBConfig {
  uri: string;
  dbName: string;
  retryWrites?: boolean;
  w?: string;
  journal?: boolean;
}

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

      this.client = new MongoClient(this.uri, {
        retryWrites: true,
        w: 'majority',
        journal: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();

      // Verify connection
      await this.client.db('admin').command({ ping: 1 });

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

  /**
   * Create indexes for collections
   */
  async createIndexes(): Promise<void> {
    const db = this.getDb();

    // Products collection indexes
    const productsCollection = db.collection('products');
    
    await Promise.all([
      productsCollection.createIndex({ id: 1 }, { unique: true }),
      productsCollection.createIndex({ slug: 1 }, { unique: true }),
      productsCollection.createIndex({ category: 1 }),
      productsCollection.createIndex({ price: 1 }),
      productsCollection.createIndex({ rating: -1 }),
      productsCollection.createIndex({ createdAt: -1 }),
      productsCollection.createIndex({ name: 'text', description: 'text' }), // Text search
    ]);

    // Categories collection indexes
    const categoriesCollection = db.collection('categories');
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });

    // Cache metadata indexes
    const cacheCollection = db.collection('cache_metadata');
    await Promise.all([
      cacheCollection.createIndex({ key: 1 }, { unique: true }),
      cacheCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), // TTL index
    ]);

    // Users and sessions indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    const sessionsCollection = db.collection('user_sessions');
    await Promise.all([
      sessionsCollection.createIndex({ token: 1 }, { unique: true }),
      sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
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
      dbName: process.env.MONGODB_DB_NAME || 'sunsky-finds',
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
