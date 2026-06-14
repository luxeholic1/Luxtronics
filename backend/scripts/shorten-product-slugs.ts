/**
 * Shorten WooCommerce product slugs into compact SEO-friendly URLs.
 *
 * Dry run:
 *   npm run slugs:shorten -- --dry-run --limit=25
 *
 * Apply:
 *   npm run slugs:shorten -- --apply
 *
 * Options:
 *   --limit=25
 *   --status=publish
 *   --max-length=70
 *   --concurrency=8
 */

import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const STORE_URL = (process.env.VITE_WOOCOMMERCE_URL_INDIA || '').replace(/\/$/, '');
const CONSUMER_KEY = process.env.VITE_WOOCOMMERCE_KEY_INDIA || '';
const CONSUMER_SECRET = process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '';
const APPLY = process.argv.includes('--apply');
const DRY_RUN = process.argv.includes('--dry-run') || !APPLY;
const LIMIT_ARG = process.argv.find(arg => arg.startsWith('--limit='));
const PRODUCT_LIMIT = LIMIT_ARG ? Math.max(0, Number(LIMIT_ARG.split('=')[1]) || 0) : 0;
const STATUS_ARG = process.argv.find(arg => arg.startsWith('--status='));
const PRODUCT_STATUS = STATUS_ARG ? STATUS_ARG.split('=')[1] : 'publish';
const MAX_LENGTH_ARG = process.argv.find(arg => arg.startsWith('--max-length='));
const MAX_SLUG_LENGTH = MAX_LENGTH_ARG ? Math.max(35, Number(MAX_LENGTH_ARG.split('=')[1]) || 70) : 70;
const CONCURRENCY_ARG = process.argv.find(arg => arg.startsWith('--concurrency='));
const CONCURRENCY = CONCURRENCY_ARG ? Math.max(1, Number(CONCURRENCY_ARG.split('=')[1]) || 8) : 8;
const AUTH_HEADER = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
const API_BASE = `${STORE_URL}/wp-json/wc/v3`;
const BATCH_SIZE = 100;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error('Missing WooCommerce env vars: VITE_WOOCOMMERCE_URL_INDIA, VITE_WOOCOMMERCE_KEY_INDIA, VITE_WOOCOMMERCE_SECRET_INDIA');
  process.exit(1);
}

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  status?: string;
  categories?: Array<{ name?: string; slug?: string }>;
  attributes?: Array<{ name?: string; options?: string[] }>;
};

type SlugChange = {
  id: number;
  name: string;
  oldSlug: string;
  newSlug: string;
  oldLength: number;
  newLength: number;
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'is', 'it', 'its',
  'of', 'on', 'or', 'the', 'to', 'with', 'without', 'your',
  'support', 'supports', 'compatible', 'version', 'global', 'original', 'premium', 'new',
  'replacement', 'accessory', 'accessories', 'parts', 'part', 'combo', 'kit', 'set',
  'color', 'touch', 'screen', 'display', 'monitor', 'forecast', 'identification',
  'tbd', 'eda', 'cht',
]);

const FEATURE_WORDS = new Set([
  '5g', '4g', '3g', 'wifi', 'nfc', 'gps', 'otg', 'oled', 'amoled', 'ips', 'lcd', 'led',
  'usb', 'typec', 'type-c', 'bluetooth', 'wireless', 'magsafe', 'fast', 'pd', 'qc',
]);

const COLORS = new Set([
  'black', 'white', 'blue', 'red', 'green', 'yellow', 'gold', 'silver', 'grey', 'gray',
  'pink', 'purple', 'orange', 'brown', 'beige', 'clear', 'transparent', 'midnight',
  'starlight', 'graphite', 'titanium',
]);

const BRAND_WORDS = new Set([
  'apple', 'iphone', 'ipad', 'samsung', 'galaxy', 'sony', 'jbl', 'bose', 'canon', 'nikon',
  'xiaomi', 'redmi', 'oneplus', 'oppo', 'vivo', 'realme', 'huawei', 'honor', 'motorola',
  'nokia', 'google', 'pixel', 'garmin', 'fitbit', 'logitech', 'dyson', 'dji', 'gopro',
  'insta360', 'ulefone', 'armor', 'tecno',
]);

const CATEGORY_PATTERNS: Array<[RegExp, string[]]> = [
  [/\b(smart\s*watch|smartwatch|watch|wearable|fitness\s*band)\b/i, ['smart', 'watch']],
  [/\b(iphone|smart\s*phone|smartphone|mobile\s*phone|android\s*phone|rugged\s*phone|phone)\b/i, ['phone']],
  [/\b(tablet|ipad|tab)\b/i, ['tablet']],
  [/\b(laptop|macbook|notebook|ultrabook)\b/i, ['laptop']],
  [/\b(earbuds?|airpods?|headphones?|headset|speaker|audio)\b/i, ['audio']],
  [/\b(camera|lens|gopro|insta360|dji|drone)\b/i, ['camera']],
  [/\b(charger|charging|adapter|power\s*bank)\b/i, ['charger']],
  [/\b(cable|usb\s*c|type\s*c|lightning)\b/i, ['cable']],
  [/\b(case|cover|bumper|shell)\b/i, ['case']],
  [/\b(screen\s*protector|tempered\s*glass|glass)\b/i, ['screen', 'protector']],
  [/\b(projector)\b/i, ['projector']],
  [/\b(heater|fan|humidifier|lamp|light|home\s*appliance)\b/i, ['home', 'appliance']],
  [/\b(toy|toys|kids?|children|baby|doll|dollhouse|building\s*block|blocks|pretend\s*play|educational|beach\s*toy|puzzle|game)\b/i, ['toy']],
  [/\b(suitcase|luggage|bag|backpack|case)\b/i, ['bag']],
  [/\b(keyboard|mouse|trackpad)\b/i, ['computer', 'accessory']],
  [/\b(battery)\b/i, ['battery']],
  [/\b(cctv|ip\s*camera|security\s*camera)\b/i, ['security', 'camera']],
  [/\b(gamepad|controller|console|gaming)\b/i, ['gaming']],
];

async function wooRequest<T>(method: 'GET' | 'POST', endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/${endpoint.replace(/^\//, '')}`, {
    method,
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }

  return res.json() as Promise<T>;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, ' and ')
    .replace(/&quot;/gi, ' ')
    .replace(/&#039;|&apos;/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ');
}

function cleanText(value: string): string {
  return decodeEntities(value)
    .replace(/\([^)]*variation[^)]*\)/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(inch|inches|in|cm|mm|m)\b/gi, ' ')
    .replace(/[+_]/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/[|/\\,;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return cleanText(value)
    .replace(/[^a-z0-9.\-\s]/g, ' ')
    .split(/\s+/)
    .map(token => token.replace(/^\.+|\.+$/g, ''))
    .map(token => token.replace(/\./g, ''))
    .filter(Boolean);
}

function slugifyTokens(tokens: string[]): string {
  return tokens
    .join('-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function addUnique(target: string[], seen: Set<string>, token: string) {
  const cleaned = slugifyTokens([token]);
  if (!cleaned || seen.has(cleaned)) return;
  seen.add(cleaned);
  target.push(cleaned);
}

function categoryTokens(product: WooProduct, text: string): string[] {
  const categoryText = text;

  for (const [pattern, tokens] of CATEGORY_PATTERNS) {
    if (pattern.test(categoryText)) return tokens;
  }

  const firstCategory = product.categories?.find(category => category.slug || category.name);
  if (!firstCategory) return ['electronics'];
  return tokenize(firstCategory.slug || firstCategory.name || '')
    .filter(token => !STOP_WORDS.has(token) && !['uncategorized', 'security'].includes(token))
    .slice(0, 2);
}

function attributeTokens(product: WooProduct): string[] {
  const tokens: string[] = [];
  for (const attribute of product.attributes || []) {
    const name = cleanText(attribute.name || '');
    if (!/(color|colour|size|storage|capacity|model)/i.test(name)) continue;
    for (const option of attribute.options || []) {
      const optionTokens = tokenize(option).filter(token => COLORS.has(token) || /\b\d+(gb|tb|mah|w)\b/i.test(token));
      tokens.push(...optionTokens.slice(0, 2));
    }
  }
  return tokens;
}

function buildShortSlug(product: WooProduct, maxLength: number): string {
  const text = cleanText(product.name || '');
  const tokens = tokenize(text);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    if (BRAND_WORDS.has(token)) addUnique(out, seen, token);
    if (out.length >= 2) break;
  }

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const previous = tokens[index - 1];
    const isNoisySku = /^(tbd|eda|cht)\d+/i.test(token);
    const isModel = !isNoisySku && /^[a-z]{1,8}\d[a-z0-9-]*$/.test(token)
      || /^(ip\d{2,3}k?|[345]g|\d{2,4}(gb|tb|mah|w)|[a-z]\d{1,4})$/.test(token);
    const isUsefulNumber = /^\d{1,4}$/.test(token) && previous && !STOP_WORDS.has(previous) && previous.length > 2;
    if (isModel) addUnique(out, seen, token);
    if (isUsefulNumber) {
      addUnique(out, seen, previous);
      addUnique(out, seen, token);
    }
    if (out.length >= 4) break;
  }

  for (const token of categoryTokens(product, text)) addUnique(out, seen, token);

  for (const token of tokens) {
    if (FEATURE_WORDS.has(token) || COLORS.has(token) || /^ip\d{2,3}k?$/.test(token) || /^\d{2,4}(gb|tb|mah|w)$/.test(token)) {
      addUnique(out, seen, token);
    }
  }

  for (const token of attributeTokens(product)) addUnique(out, seen, token);

  for (const token of tokens) {
    if (out.length >= 8) break;
    if (token.length < 3 || STOP_WORDS.has(token) || COLORS.has(token) || FEATURE_WORDS.has(token)) continue;
    addUnique(out, seen, token);
  }

  let slug = slugifyTokens(out).slice(0, maxLength).replace(/-+[^-]*$/, '');
  if (slug.length < 10) slug = slugifyTokens(tokens.filter(token => !STOP_WORDS.has(token)).slice(0, 6));
  return (slug || `product-${product.id}`).slice(0, maxLength).replace(/-+$/, '');
}

async function fetchProducts(): Promise<WooProduct[]> {
  const products: WooProduct[] = [];
  let page = 1;
  console.log(`Fetching WooCommerce products (status=${PRODUCT_STATUS})...`);

  while (true) {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
      status: PRODUCT_STATUS,
    });
    const data = await wooRequest<WooProduct[]>('GET', `products?${params}`);
    if (!data.length) break;

    products.push(...(PRODUCT_LIMIT ? data.slice(0, Math.max(PRODUCT_LIMIT - products.length, 0)) : data));
    process.stdout.write(`\r   fetched ${products.length} products...`);
    if (PRODUCT_LIMIT && products.length >= PRODUCT_LIMIT) break;
    page++;
  }

  console.log(`\nFound ${products.length} products.\n`);
  return products;
}

function uniqueSlug(base: string, productId: number, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  const suffix = `-${productId}`;
  const trimmed = base.slice(0, Math.max(1, MAX_SLUG_LENGTH - suffix.length)).replace(/-+$/, '');
  const slug = `${trimmed}${suffix}`;
  used.add(slug);
  return slug;
}

function buildChanges(products: WooProduct[]): SlugChange[] {
  const used = new Set<string>();

  for (const product of products) {
    const current = slugifyTokens([product.slug || '']);
    if (current) used.add(current);
  }

  const changes: SlugChange[] = [];

  for (const product of products) {
    const current = slugifyTokens([product.slug || '']);
    if (current) used.delete(current);
    const base = buildShortSlug(product, MAX_SLUG_LENGTH);
    const next = uniqueSlug(base, product.id, used);

    if (current) used.add(current);
    if (!next || next === current) continue;

    if (current) used.delete(current);
    used.add(next);
    changes.push({
      id: product.id,
      name: product.name || '',
      oldSlug: product.slug || '',
      newSlug: next,
      oldLength: product.slug?.length || 0,
      newLength: next.length,
    });
  }

  return changes;
}

function csvField(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function writeReport(changes: SlugChange[]) {
  const rows = [
    ['id', 'name', 'old_slug', 'new_slug', 'old_length', 'new_length'].map(csvField).join(','),
    ...changes.map(change => [
      change.id,
      change.name,
      change.oldSlug,
      change.newSlug,
      change.oldLength,
      change.newLength,
    ].map(csvField).join(',')),
  ];
  const path = join(__dirname, '../../slug-update-report.csv');
  writeFileSync(path, rows.join('\n'));
  console.log(`Report written: ${path}`);
}

async function applyChanges(changes: SlugChange[]) {
  let updated = 0;
  let failed = 0;

  for (const group of chunk(changes, CONCURRENCY)) {
    await Promise.all(group.map(async change => {
      try {
        await wooRequest('POST', `products/${change.id}`, { slug: change.newSlug });
        updated++;
      } catch (error: any) {
        failed++;
        console.error(`\nFailed ${change.id}: ${error.message}`);
      }
    }));
    process.stdout.write(`\r   updated ${updated}/${changes.length}, failed ${failed}`);
  }

  console.log('');
  return { updated, failed };
}

async function main() {
  console.log(`Shorten Product Slugs ${DRY_RUN ? '(dry run)' : '(apply)'}\n`);
  const products = await fetchProducts();
  const changes = buildChanges(products);

  writeReport(changes);

  console.log(`Planned slug changes: ${changes.length}`);
  for (const change of changes.slice(0, 20)) {
    console.log(`- ${change.id}: ${change.oldSlug} -> ${change.newSlug}`);
  }
  if (changes.length > 20) console.log(`... ${changes.length - 20} more in slug-update-report.csv`);

  if (DRY_RUN) {
    console.log('\nDry run only. Re-run with --apply to update WooCommerce.');
    return;
  }

  const result = await applyChanges(changes);
  console.log(`\nDone. Updated: ${result.updated}, failed: ${result.failed}`);
  console.log('Next: run npm run sync:full and npm run sync:firebase so frontend caches use the new slugs.');
}

main().catch(error => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
