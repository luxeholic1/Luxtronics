/**
 * MongoDB Blog Post Service
 * CRUD operations for blog posts
 */

import { Db, ObjectId } from 'mongodb';
import { BlogPostInput, MongoBlogPost, slugifyBlogTitle } from '../models/blog-models';

export class BlogService {
  private db: Db;
  private readonly COLLECTION = 'blog_posts';

  constructor(db: Db) {
    this.db = db;
  }

  private collection() {
    return this.db.collection<MongoBlogPost>(this.COLLECTION);
  }

  async createIndexes(): Promise<void> {
    await this.collection().createIndex({ slug: 1 }, { unique: true });
    await this.collection().createIndex({ tag: 1 });
    await this.collection().createIndex({ createdAt: -1 });
  }

  async listPosts(tag?: string): Promise<MongoBlogPost[]> {
    const filter = tag ? { tag } : {};
    return this.collection().find(filter).sort({ createdAt: -1 }).toArray();
  }

  async getPostBySlug(slug: string): Promise<MongoBlogPost | null> {
    return this.collection().findOne({ slug });
  }

  async getPostById(id: string): Promise<MongoBlogPost | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  private async uniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let candidate = baseSlug || 'post';
    let suffix = 1;
    while (true) {
      const existing = await this.collection().findOne({ slug: candidate });
      if (!existing || (excludeId && existing._id?.toString() === excludeId)) {
        return candidate;
      }
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
    }
  }

  async createPost(input: BlogPostInput): Promise<MongoBlogPost> {
    const baseSlug = slugifyBlogTitle(input.title) || 'post';
    const slug = await this.uniqueSlug(baseSlug);
    const now = new Date();

    const doc: MongoBlogPost = {
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      tag: input.tag.trim(),
      date: input.date || now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      image: input.image?.trim() || undefined,
      background: input.background?.trim() || undefined,
      foreground: input.foreground?.trim() || undefined,
      content: input.content.map((p) => String(p || '').trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async updatePost(id: string, input: Partial<BlogPostInput>): Promise<MongoBlogPost | null> {
    if (!ObjectId.isValid(id)) return null;
    const existing = await this.getPostById(id);
    if (!existing) return null;

    const update: Partial<MongoBlogPost> = { updatedAt: new Date() };
    if (input.title !== undefined) {
      update.title = input.title.trim();
      const baseSlug = slugifyBlogTitle(input.title) || 'post';
      if (baseSlug !== slugifyBlogTitle(existing.title)) {
        update.slug = await this.uniqueSlug(baseSlug, id);
      }
    }
    if (input.excerpt !== undefined) update.excerpt = input.excerpt.trim();
    if (input.tag !== undefined) update.tag = input.tag.trim();
    if (input.date !== undefined) update.date = input.date;
    if (input.image !== undefined) update.image = input.image.trim() || undefined;
    if (input.background !== undefined) update.background = input.background.trim() || undefined;
    if (input.foreground !== undefined) update.foreground = input.foreground.trim() || undefined;
    if (input.content !== undefined) {
      update.content = input.content.map((p) => String(p || '').trim()).filter(Boolean);
    }

    await this.collection().updateOne({ _id: new ObjectId(id) }, { $set: update });
    return this.getPostById(id);
  }

  async deletePost(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection().deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
