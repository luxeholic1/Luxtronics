/**
 * MongoDB Product Services
 * CRUD operations and caching for products
 */

import { Db, Filter, UpdateFilter } from 'mongodb';
import { MongoProduct, MongoCategory, CacheMetadata } from '../models/mongo-models';

export class ProductService {
  private db: Db;
  private readonly PRODUCTS_COLLECTION = 'products';
  private readonly CATEGORIES_COLLECTION = 'categories';
  private readonly CACHE_COLLECTION = 'cache_metadata';

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Save/Update product in MongoDB
   */
  async saveProduct(product: MongoProduct): Promise<string> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    const result = await collection.updateOne(
      { id: product.id },
      { $set: product },
      { upsert: true }
    );

    return result.upsertedId?.toString() || result.modifiedCount > 0 ? 'updated' : 'created';
  }

  /**
   * Save multiple products (bulk operation)
   */
  async saveProducts(products: MongoProduct[]): Promise<number> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    const operations = products.map(product => ({
      updateOne: {
        filter: { id: product.id },
        update: { $set: product },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);

    return result.upsertedCount + result.modifiedCount;
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<MongoProduct | null> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);
    return collection.findOne({ id: productId }) as Promise<MongoProduct | null>;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<MongoProduct | null> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);
    return collection.findOne({ slug }) as Promise<MongoProduct | null>;
  }

  /**
   * Get products with pagination
   */
  async getProducts(
    page: number = 1,
    perPage: number = 50,
    filter?: Filter<MongoProduct>
  ): Promise<{ products: MongoProduct[]; total: number }> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    const skip = (page - 1) * perPage;
    const query = filter || {};

    const [products, total] = await Promise.all([
      collection
        .find(query)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .toArray() as Promise<MongoProduct[]>,
      collection.countDocuments(query),
    ]);

    return { products, total };
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<{ products: MongoProduct[]; total: number }> {
    return this.getProducts(page, perPage, { category });
  }

  /**
   * Search products (text search)
   */
  async searchProducts(
    searchTerm: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<{ products: MongoProduct[]; total: number }> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    const skip = (page - 1) * perPage;

    const [products, total] = await Promise.all([
      collection
        .find({
          $text: { $search: searchTerm },
        })
        .skip(skip)
        .limit(perPage)
        .sort({ score: { $meta: 'textScore' } })
        .toArray() as Promise<MongoProduct[]>,
      collection.countDocuments({
        $text: { $search: searchTerm },
      }),
    ]);

    return { products, total };
  }

  /**
   * Get products sorted by price
   */
  async getProductsSortedByPrice(
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    perPage: number = 50
  ): Promise<{ products: MongoProduct[]; total: number }> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    const skip = (page - 1) * perPage;
    const sortValue = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      collection
        .find({})
        .skip(skip)
        .limit(perPage)
        .sort({ price: sortValue })
        .toArray() as Promise<MongoProduct[]>,
      collection.countDocuments(),
    ]);

    return { products, total };
  }

  /**
   * Get top rated products
   */
  async getTopRatedProducts(limit: number = 10): Promise<MongoProduct[]> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    return collection
      .find({})
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .toArray() as Promise<MongoProduct[]>;
  }

  /**
   * Get recently added products
   */
  async getRecentProducts(limit: number = 10): Promise<MongoProduct[]> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);

    return collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray() as Promise<MongoProduct[]>;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number): Promise<boolean> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);
    const result = await collection.deleteOne({ id: productId });
    return result.deletedCount > 0;
  }

  /**
   * Delete all products (for complete sync)
   */
  async deleteAllProducts(): Promise<number> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);
    const result = await collection.deleteMany({});
    return result.deletedCount;
  }

  /**
   * Get product count
   */
  async getProductCount(): Promise<number> {
    const collection = this.db.collection(this.PRODUCTS_COLLECTION);
    return collection.countDocuments();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: number): Promise<MongoCategory | null> {
    const collection = this.db.collection(this.CATEGORIES_COLLECTION);
    return collection.findOne({ id: categoryId }) as Promise<MongoCategory | null>;
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<MongoCategory[]> {
    const collection = this.db.collection(this.CATEGORIES_COLLECTION);
    return collection
      .find({})
      .sort({ name: 1 })
      .toArray() as Promise<MongoCategory[]>;
  }

  /**
   * Save category
   */
  async saveCategory(category: MongoCategory): Promise<void> {
    const collection = this.db.collection(this.CATEGORIES_COLLECTION);
    await collection.updateOne(
      { id: category.id },
      { $set: category },
      { upsert: true }
    );
  }

  /**
   * Save multiple categories
   */
  async saveCategories(categories: MongoCategory[]): Promise<number> {
    const collection = this.db.collection(this.CATEGORIES_COLLECTION);

    const operations = categories.map(category => ({
      updateOne: {
        filter: { id: category.id },
        update: { $set: category },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    return result.upsertedCount + result.modifiedCount;
  }

  /**
   * Get products with filters (advanced)
   */
  async getProductsFiltered(
    filters: {
      minPrice?: number;
      maxPrice?: number;
      category?: string;
      rating?: number;
      inStock?: boolean;
    },
    page: number = 1,
    perPage: number = 50
  ): Promise<{ products: MongoProduct[]; total: number }> {
    const query: Filter<MongoProduct> = {};

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.rating !== undefined) {
      query.rating = { $gte: filters.rating };
    }

    if (filters.inStock) {
      query.stockStatus = 'instock';
    }

    return this.getProducts(page, perPage, query);
  }
}

/**
 * Cache Service
 */
export class CacheService {
  private db: Db;
  private readonly CACHE_COLLECTION = 'cache_metadata';

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Set cache metadata (tracks what data is cached)
   */
  async setCacheMetadata(
    key: string,
    metadata: Omit<CacheMetadata, '_id'>
  ): Promise<void> {
    const collection = this.db.collection(this.CACHE_COLLECTION);

    await collection.updateOne(
      { key },
      {
        $set: {
          ...metadata,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      },
      { upsert: true }
    );
  }

  /**
   * Get cache metadata
   */
  async getCacheMetadata(key: string): Promise<CacheMetadata | null> {
    const collection = this.db.collection(this.CACHE_COLLECTION);
    return collection.findOne({ key }) as Promise<CacheMetadata | null>;
  }

  /**
   * Clear cache metadata
   */
  async clearCacheMetadata(key: string): Promise<void> {
    const collection = this.db.collection(this.CACHE_COLLECTION);
    await collection.deleteOne({ key });
  }

  /**
   * Clear all cache metadata
   */
  async clearAllCache(): Promise<number> {
    const collection = this.db.collection(this.CACHE_COLLECTION);
    const result = await collection.deleteMany({});
    return result.deletedCount;
  }
}
