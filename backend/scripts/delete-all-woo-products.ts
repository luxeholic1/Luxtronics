import 'dotenv/config';

type WooStore = {
  label: string;
  url: string;
  key: string;
  secret: string;
};

type WooProduct = {
  id: number;
  name: string;
  status?: string;
};

const isConfirmed = process.argv.includes('--confirm');
const targetStoreName = process.argv.find((arg) => arg.startsWith('--store='))?.split('=')[1]?.toLowerCase();
const concurrency = Math.max(
  1,
  Number(process.argv.find((arg) => arg.startsWith('--concurrency='))?.split('=')[1] || 3),
);

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
].filter((store) => {
  if (!store.url || !store.key || !store.secret) return false;
  return !targetStoreName || store.label.toLowerCase() === targetStoreName;
});

function authHeader(store: WooStore): string {
  return `Basic ${Buffer.from(`${store.key}:${store.secret}`).toString('base64')}`;
}

async function wooRequest<T>(store: WooStore, endpoint: string, init?: RequestInit): Promise<{ data: T; headers: Headers }> {
  const url = `${store.url.replace(/\/$/, '')}/wp-json/wc/v3/${endpoint}`;
  const response = await fetch(url, {
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

  return {
    data: body ? (JSON.parse(body) as T) : ({} as T),
    headers: response.headers,
  };
}

async function fetchAllProducts(store: WooStore): Promise<WooProduct[]> {
  const products: WooProduct[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
      status: 'any',
    });

    const { data, headers } = await wooRequest<WooProduct[]>(store, `products?${params}`);
    products.push(...data);

    totalPages = Number(headers.get('X-WP-TotalPages') || '1');
    console.log(`${store.label}: fetched products page ${page}/${totalPages}`);
    page += 1;
  } while (page <= totalPages);

  return products;
}

async function deleteProduct(store: WooStore, productId: number): Promise<void> {
  await wooRequest(store, `products/${productId}?force=true`, { method: 'DELETE' });
}

async function runPool<T>(items: T[], worker: (item: T, index: number) => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await worker(items[index], index);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return errors;
}

async function main() {
  if (stores.length === 0) {
    throw new Error(targetStoreName ? `No configured WooCommerce store matched "${targetStoreName}"` : 'No configured WooCommerce stores found');
  }

  console.log(`Mode: ${isConfirmed ? 'LIVE DELETE' : 'DRY RUN'}`);
  console.log(`Stores: ${stores.map((store) => store.label).join(', ')}`);
  console.log('This deletes WooCommerce products only. Categories are not touched.\n');

  let totalFound = 0;
  let totalDeleted = 0;
  const allErrors: string[] = [];

  for (const store of stores) {
    console.log(`== ${store.label} ==`);
    const products = await fetchAllProducts(store);
    totalFound += products.length;
    console.log(`${store.label}: found ${products.length} products`);

    if (!isConfirmed) {
      for (const product of products.slice(0, 10)) {
        console.log(`  would delete ${product.id}: ${product.name}`);
      }
      if (products.length > 10) console.log(`  ...and ${products.length - 10} more`);
      console.log('');
      continue;
    }

    const errors = await runPool(products, async (product, index) => {
      await deleteProduct(store, product.id);
      totalDeleted += 1;
      if ((index + 1) % 25 === 0 || index + 1 === products.length) {
        console.log(`${store.label}: deleted ${index + 1}/${products.length}`);
      }
    });

    allErrors.push(...errors);
    console.log(`${store.label}: deleted ${products.length - errors.length}/${products.length}\n`);
  }

  console.log('Summary');
  console.log(`Products found: ${totalFound}`);
  console.log(`Products deleted: ${totalDeleted}`);
  console.log(`Errors: ${allErrors.length}`);

  if (!isConfirmed) {
    console.log('\nRun again with --confirm to permanently delete these WooCommerce products.');
  }

  if (allErrors.length > 0) {
    console.log('\nFirst errors:');
    for (const error of allErrors.slice(0, 10)) console.log(`- ${error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
