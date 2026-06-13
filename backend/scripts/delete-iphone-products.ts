import 'dotenv/config';
import { MongoClient } from 'mongodb';

type WooStore = {
  label: string;
  url: string;
  key: string;
  secret: string;
};

type WooProduct = {
  id: number;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  short_description?: string;
};

const isConfirmed = process.argv.includes('--confirm');
const includeAllMentions = process.argv.includes('--all-mentions');
const targetPattern = includeAllMentions ? /iphone/i : /apple[\s-]+iphone[\s-]+(?:\d|se\b|x\b|xr\b|xs\b)/i;
const targetDescription = includeAllMentions ? 'any iPhone mention' : 'actual Apple iPhone listings';

const stores: WooStore[] = [
  {
    label: 'India',
    url: process.env.VITE_WOOCOMMERCE_URL_INDIA || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_INDIA || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_INDIA || '',
  },
  {
    label: 'Australia',
    url: process.env.VITE_WOOCOMMERCE_URL_AUSTRALIA || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_AUSTRALIA || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_AUSTRALIA || '',
  },
  {
    label: 'New Zealand',
    url: process.env.VITE_WOOCOMMERCE_URL_NEWZEALAND || '',
    key: process.env.VITE_WOOCOMMERCE_KEY_NEWZEALAND || '',
    secret: process.env.VITE_WOOCOMMERCE_SECRET_NEWZEALAND || '',
  },
].filter((store) => store.url && store.key && store.secret);

function productMatches(product: WooProduct): boolean {
  return [
    product.name,
    product.slug,
    product.sku,
    ...(includeAllMentions ? [product.description, product.short_description] : []),
  ].some((value) => targetPattern.test(String(value || '')));
}

function authHeader(store: WooStore): string {
  return `Basic ${Buffer.from(`${store.key}:${store.secret}`).toString('base64')}`;
}

async function wooRequest<T>(store: WooStore, endpoint: string, init?: RequestInit): Promise<{ data: T; headers: Headers }> {
  const response = await fetch(`${store.url.replace(/\/$/, '')}/wp-json/wc/v3/${endpoint}`, {
    ...init,
    headers: {
      Authorization: authHeader(store),
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${store.label} WooCommerce ${response.status}: ${body.slice(0, 300)}`);
  }

  try {
    return { data: JSON.parse(body) as T, headers: response.headers };
  } catch {
    throw new Error(`${store.label} WooCommerce returned non-JSON: ${body.slice(0, 120)}`);
  }
}

async function fetchWooIphoneProducts(store: WooStore): Promise<WooProduct[]> {
  const matches = new Map<number, WooProduct>();
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams({
      search: includeAllMentions ? 'iphone' : 'Apple iPhone',
      status: 'any',
      per_page: '100',
      page: String(page),
    });
    const { data, headers } = await wooRequest<WooProduct[]>(store, `products?${params}`);

    for (const product of data) {
      if (productMatches(product)) {
        matches.set(product.id, product);
      }
    }

    totalPages = Number(headers.get('X-WP-TotalPages') || '1');
    page += 1;
  } while (page <= totalPages);

  return [...matches.values()];
}

async function deleteWooProduct(store: WooStore, productId: number): Promise<void> {
  await wooRequest(store, `products/${productId}?force=true`, { method: 'DELETE' });
}

async function runMongoDelete() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'Luxtronics';

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = new MongoClient(uri, {
    retryWrites: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  try {
    const products = client.db(dbName).collection('products');
    const fields = [
      { name: targetPattern },
      { slug: targetPattern },
      { sku: targetPattern },
      ...(includeAllMentions
        ? [{ description: targetPattern }, { shortDescription: targetPattern }, { searchText: targetPattern }]
        : []),
    ];

    const query = {
      $or: [
        ...fields,
      ],
    };

    const matches = await products
      .find(query, { projection: { id: 1, name: 1, slug: 1, sku: 1 } })
      .sort({ name: 1 })
      .toArray();

    console.log(`\nMongoDB (${dbName}) matches: ${matches.length}`);
    for (const product of matches) {
      console.log(`  - ${product.id ?? product._id}: ${product.name || product.slug || '(unnamed)'}`);
    }

    if (!isConfirmed) {
      return { matched: matches.length, deleted: 0 };
    }

    const result = await products.deleteMany(query);
    return { matched: matches.length, deleted: result.deletedCount };
  } finally {
    await client.close();
  }
}

async function runWooDeletes() {
  const summary: Array<{ store: string; matched: number; deleted: number; failed: number }> = [];

  for (const store of stores) {
    let matches: WooProduct[] = [];
    try {
      matches = await fetchWooIphoneProducts(store);
    } catch (error) {
      console.error(`\nWooCommerce ${store.label} failed:`, error instanceof Error ? error.message : error);
      summary.push({ store: store.label, matched: 0, deleted: 0, failed: 1 });
      continue;
    }
    console.log(`\nWooCommerce ${store.label} matches: ${matches.length}`);
    for (const product of matches) {
      console.log(`  - ${product.id}: ${product.name || product.slug || '(unnamed)'}`);
    }

    if (!isConfirmed) {
      summary.push({ store: store.label, matched: matches.length, deleted: 0, failed: 0 });
      continue;
    }

    let deleted = 0;
    let failed = 0;
    for (const product of matches) {
      try {
        await deleteWooProduct(store, product.id);
        deleted += 1;
        console.log(`    deleted ${product.id}`);
      } catch (error) {
        failed += 1;
        console.error(`    failed ${product.id}:`, error instanceof Error ? error.message : error);
      }
    }

    summary.push({ store: store.label, matched: matches.length, deleted, failed });
  }

  return summary;
}

async function main() {
  console.log(isConfirmed ? `Deleting ${targetDescription}...` : `Dry run for ${targetDescription}: no products will be deleted.`);

  if (stores.length === 0) {
    console.log('No WooCommerce stores are configured.');
  }

  const [mongoSummary, wooSummary] = await Promise.all([runMongoDelete(), runWooDeletes()]);

  console.log('\nSummary');
  console.log(`  MongoDB matched ${mongoSummary.matched}, deleted ${mongoSummary.deleted}`);
  for (const item of wooSummary) {
    console.log(`  WooCommerce ${item.store} matched ${item.matched}, deleted ${item.deleted}, failed ${item.failed}`);
  }

  if (!isConfirmed) {
    console.log('\nRun again with --confirm to permanently delete these products.');
    console.log('Use --all-mentions only if you also want accessories and descriptions that mention iPhone.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
