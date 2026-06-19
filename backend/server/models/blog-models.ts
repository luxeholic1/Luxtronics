/**
 * MongoDB Blog Post Model
 */

import { ObjectId } from 'mongodb';

export interface MongoBlogPost {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image?: string;
  background?: string;
  foreground?: string;
  content: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  tag: string;
  date?: string;
  image?: string;
  background?: string;
  foreground?: string;
  content: string[];
}

export function slugifyBlogTitle(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function validateBlogPostInput(input: Partial<BlogPostInput>): string[] {
  const errors: string[] = [];

  if (!input.title || !String(input.title).trim()) errors.push('Title is required');
  if (!input.excerpt || !String(input.excerpt).trim()) errors.push('Excerpt is required');
  if (!input.tag || !String(input.tag).trim()) errors.push('Tag is required');
  if (!Array.isArray(input.content) || input.content.filter((p) => String(p || '').trim()).length === 0) {
    errors.push('Content must include at least one paragraph');
  }

  return errors;
}
