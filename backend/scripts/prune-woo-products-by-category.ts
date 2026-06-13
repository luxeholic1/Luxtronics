import 'dotenv/config';

type WooStore = {
  label: string;
  url: string;
  key: string;
  secret: string;
};

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count?: number;
};

type WooProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
  status?: string;
};

const isConfirmed = process.argv.includes('--confirm');
const targetStoreName = process.argv.find((arg) => arg.startsWith('--store='))?.split('=')[1]?.toLowerCase();

const keepCategoryPatterns = [
  /smart[\s-]*wear/i,
  /outdoor/i,
  /sport/i,
  /consumer[\s-]*electronics/i,
  /mobile[\s-]*accessories/i,
  /dji/i,
  /insta360/i,
];

const keepProductPatterns = [
  // Smart wear
  /smart[\s-]*watch/i,
  /\bwatch\b/i,
  /\bwearable\b/i,
  /\bfitness[\s-]*(band|tracker)\b/i,
  /\bfitbit\b/i,
  /\bgarmin\b/i,
  /\bapple[\s-]*watch\b/i,
  /\bsamsung[\s-]*watch\b/i,
  /\bhuawei[\s-]*watch\b/i,

  // Outdoor and sport
  /\b(outdoor|camping|fishing|hiking|cycling|bicycle|bike|scooter|yoga|survival|emergency|helmet|tent)\b/i,

  // Consumer electronics
  /\b(projector|android[\s-]*tv|tv[\s-]*box|vr|ar|3d[\s-]*printer|arduino|recorder|microphone|speaker|camera)\b/i,
  /\b(stylus|touch[\s-]*pen|electronic[\s-]*pen|electromagnetic[\s-]*pen|keyboard|keypad|mouse|headset|u[\s-]*disk|flash[\s-]*drive)\b/i,

  // Mobile accessories
  /\b(phone|mobile|tablet)?\s*(case|cover|protector|tempered[\s-]*glass|screen[\s-]*protector)\b/i,
  /\b(film|hydrogel|glass[\s-]*film|lens[\s-]*film|screen[\s-]*film|explosion[\s-]*proof)\b/i,
  /\b(charger|charging|cable|adapter|power[\s-]*bank|holder|stand|mount|dock|magsafe|wireless[\s-]*charger|lens[\s-]*protector)\b/i,
  /\b(usb|type[\s-]*c|otg|data[\s-]*line)\b/i,
  /\b(phone|mobile|tablet|smartphone).{0,50}\b(bag|pouch|arm[\s-]*band|waist[\s-]*bag|waterproof|pocket)\b/i,
  /\b(bag|pouch|arm[\s-]*band|waist[\s-]*bag|waterproof|pocket).{0,50}\b(phone|mobile|tablet|smartphone)\b/i,
  /\bwaist[\s-]*bag\b.{0,90}\b(iphone|smartphone|phone|mobile)\b/i,
  /\b(waterproof|running|sports).{0,40}\b(phone|mobile|tablet|arm[\s-]*band|wrist[\s-]*bag|waist[\s-]*bag)\b/i,
  /\b(airpods|earbuds|earphones|headphones)\b/i,

  // DJI / Insta360
  /\b(dji|insta360|osmo|mavic|drone)\b/i,
];

const actualPhonePatterns = [
  /\bapple[\s-]*iphone[\s-]+(?:\d|se\b|x\b|xr\b|xs\b)/i,
  /\brugged[\s-]*phone\b/i,
  /\b(xiaomi|redmi|poco|ulefone|oukitel|hotwav|infinix|tecno|oppo|vivo|realme|oneplus|motorola|huawei|honor|nokia|samsung|galaxy)\b.{0,80}\b(\d+gb|5g|4g|android|octa[\s-]*core|snapdragon|dimensity|unlocked|rugged[\s-]*phone|smartphone)\b/i,
];

const accessoryTextPattern =
  /\b(case|cover|protector|film|glass|charger|charging|cable|adapter|holder|stand|mount|dock|bag|pouch|band|strap|wallet|bracket|stylus|pen|keyboard|keypad|mouse|headset|earbuds|earphones|headphones|power[\s-]*bank)\b/i;

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
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: authHeader(store),
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(`${store.label} request failed for ${endpoint}: ${error instanceof Error ? error.message : error}`);
  }

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

async function fetchAllPages<T>(store: WooStore, endpoint: string, params: Record<string, string>): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const searchParams = new URLSearchParams({
      ...params,
      per_page: '100',
      page: String(page),
    });
    let data: T[] | null = null;
    let headers: Headers | null = null;
    let lastError: unknown;

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const response = await wooRequest<T[]>(store, `${endpoint}?${searchParams}`);
        data = response.data;
        headers = response.headers;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
        }
      }
    }

    if (!data || !headers) {
      throw lastError;
    }

    all.push(...data);
    totalPages = Number(headers.get('X-WP-TotalPages') || '1');
    if (endpoint === 'products' && (page === 1 || page % 10 === 0 || page === totalPages)) {
      console.log(`  fetched products page ${page}/${totalPages}`);
    }
    page += 1;
  } while (page <= totalPages);

  return all;
}

function categoryText(category: WooCategory): string {
  return `${category.name} ${category.slug}`;
}

function buildKeepCategoryIds(categories: WooCategory[]): Set<number> {
  const byParent = new Map<number, WooCategory[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parent) || [];
    siblings.push(category);
    byParent.set(category.parent, siblings);
  }

  const keepIds = new Set<number>();
  const queue = categories
    .filter((category) => keepCategoryPatterns.some((pattern) => pattern.test(categoryText(category))))
    .map((category) => category.id);

  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index];
    if (keepIds.has(id)) continue;

    keepIds.add(id);
    for (const child of byParent.get(id) || []) {
      queue.push(child.id);
    }
  }

  return keepIds;
}

function shouldKeepProduct(product: WooProduct, keepCategoryIds: Set<number>): boolean {
  const hasKeptCategory = (product.categories || []).some((category) => keepCategoryIds.has(category.id));
  if (hasKeptCategory) return true;

  const productText = [product.name, product.slug, product.sku].filter(Boolean).join(' ');
  const categoryText = (product.categories || []).map((category) => `${category.name} ${category.slug}`).join(' ');
  if (/smart[\s-]*phones?/i.test(categoryText) && !accessoryTextPattern.test(productText)) {
    return false;
  }

  if (actualPhonePatterns.some((pattern) => pattern.test(productText)) && !accessoryTextPattern.test(productText)) {
    return false;
  }

  return keepProductPatterns.some((pattern) => pattern.test(productText));
}

async function deleteProduct(store: WooStore, productId: number): Promise<void> {
  await wooRequest(store, `products/${productId}?force=true`, { method: 'DELETE' });
}

async function pruneStore(store: WooStore) {
  console.log(`\nStore: ${store.label}`);

  const categories = await fetchAllPages<WooCategory>(store, 'products/categories', { hide_empty: 'false' });
  const keepCategoryIds = buildKeepCategoryIds(categories);
  const keepCategories = categories
    .filter((category) => keepCategoryIds.has(category.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Keep categories: ${keepCategories.length}`);
  for (const category of keepCategories.slice(0, 80)) {
    console.log(`  - ${category.id}: ${category.name}`);
  }
  if (keepCategories.length > 80) {
    console.log(`  ... ${keepCategories.length - 80} more`);
  }

  const products = await fetchAllPages<WooProduct>(store, 'products', { status: 'any' });
  const keepProducts = products.filter((product) => shouldKeepProduct(product, keepCategoryIds));
  const deleteProducts = products.filter((product) => !shouldKeepProduct(product, keepCategoryIds));

  console.log(`Products total: ${products.length}`);
  console.log(`Products to keep: ${keepProducts.length}`);
  console.log(`Products to delete: ${deleteProducts.length}`);

  console.log('Keep sample:');
  for (const product of keepProducts.slice(0, 30)) {
    const categoryNames = (product.categories || []).map((category) => category.name).join(', ') || 'No category';
    console.log(`  - ${product.id}: ${product.name} [${categoryNames}]`);
  }
  if (keepProducts.length > 30) {
    console.log(`  ... ${keepProducts.length - 30} more`);
  }

  console.log('Delete sample:');
  for (const product of deleteProducts.slice(0, 40)) {
    const categoryNames = (product.categories || []).map((category) => category.name).join(', ') || 'No category';
    console.log(`  - ${product.id}: ${product.name} [${categoryNames}]`);
  }
  if (deleteProducts.length > 40) {
    console.log(`  ... ${deleteProducts.length - 40} more`);
  }

  if (!isConfirmed) {
    return { store: store.label, total: products.length, kept: keepProducts.length, deleted: 0, matchedForDelete: deleteProducts.length, failed: 0 };
  }

  let deleted = 0;
  let failed = 0;
  for (const product of deleteProducts) {
    try {
      await deleteProduct(store, product.id);
      deleted += 1;
      if (deleted % 25 === 0 || deleted === deleteProducts.length) {
        console.log(`  deleted ${deleted}/${deleteProducts.length}`);
      }
    } catch (error) {
      failed += 1;
      console.error(`  failed ${product.id}:`, error instanceof Error ? error.message : error);
    }
  }

  return { store: store.label, total: products.length, kept: keepProducts.length, deleted, matchedForDelete: deleteProducts.length, failed };
}

async function main() {
  console.log(isConfirmed ? 'Deleting WooCommerce products outside kept categories...' : 'Dry run: no WooCommerce products will be deleted.');
  console.log('Keeping: Smart Wear, Outdoor/Sport, Consumer Electronics, Mobile Accessories, DJI/Insta360');

  if (stores.length === 0) {
    throw new Error(targetStoreName ? `No configured store matched --store=${targetStoreName}` : 'No WooCommerce stores are configured');
  }

  const summaries = [];
  for (const store of stores) {
    try {
      summaries.push(await pruneStore(store));
    } catch (error) {
      console.error(`\n${store.label} failed:`, error instanceof Error ? error.message : error);
      summaries.push({ store: store.label, total: 0, kept: 0, deleted: 0, matchedForDelete: 0, failed: 1 });
    }
  }

  console.log('\nSummary');
  for (const summary of summaries) {
    console.log(
      `  ${summary.store}: total ${summary.total}, keep ${summary.kept}, ` +
      `delete target ${summary.matchedForDelete}, deleted ${summary.deleted}, failed ${summary.failed}`
    );
  }

  if (!isConfirmed) {
    console.log('\nRun with --confirm to permanently delete the target products.');
    console.log('Use --store=India, --store=Australia, or --store=New Zealand to limit the run.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
