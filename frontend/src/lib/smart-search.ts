export const SEARCH_SYNONYMS: Record<string, string[]> = {
  airpod: ["airpods", "earbuds", "earphone", "headphones"],
  airpods: ["airpod", "earbuds", "earphone", "headphones"],
  buds: ["earbuds", "airpods", "earphone"],
  earpods: ["earbuds", "airpods", "earphone"],
  magsafe: ["magnetic charger", "iphone charger", "wireless charger"],
  magsefe: ["magsafe", "magnetic charger", "iphone charger"],
  iph: ["iphone"],
  iphon: ["iphone"],
  iphone: ["apple", "ios", "mobile", "smartphone"],
  samsng: ["samsung"],
  samung: ["samsung"],
  samsung: ["galaxy", "android", "mobile", "smartphone"],
  galax: ["galaxy"],
  charger: ["charging", "adapter", "power", "usb", "type c", "usb c", "gan"],
  gan: ["charger", "adapter", "fast charger", "wall charger", "type c", "usb c"],
  ga: ["gan", "charger"],
  charging: ["charger", "adapter", "power", "usb"],
  cable: ["usb", "type c", "lightning", "charging"],
  cover: ["case", "back cover", "phone case"],
  case: ["cover", "back cover", "phone case"],
  watch: ["smartwatch", "wearable", "band"],
  smartwatch: ["watch", "wearable", "band"],
  wearable: ["watch", "smartwatch", "smart wear", "glasses"],
  wearables: ["watch", "smartwatch", "smart wear", "glasses"],
  "smart wear": ["wearable", "watch", "smartwatch", "glasses"],
  glass: ["glasses", "smart glasses", "eyewear"],
  glasses: ["smart glasses", "eyewear", "wearable"],
  sunglass: ["sunglasses", "glasses", "eyewear"],
  sunglasses: ["glasses", "eyewear", "smart glasses"],
  headphone: ["headphones", "headset", "audio"],
  headphones: ["headphone", "headset", "audio"],
  speaker: ["bluetooth speaker", "audio", "sound"],
  gam: ["game", "gaming"],
  game: ["gaming", "controller", "console"],
  camera: ["photo", "lens", "dslr", "mirrorless"],
  tablet: ["ipad", "tab", "android tablet"],
  tab: ["tablet", "ipad"],
  powerbank: ["power bank", "charger", "battery"],
  power: ["charger", "adapter", "power bank"],
};

function asSearchString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function tokeniseSmart(value: unknown): string[] {
  return asSearchString(value).toLowerCase().match(/[a-z0-9]+/g) || [];
}

const tokenCache = new Map<string, string[]>();
const levenshteinCache = new Map<string, number>();

function cachedTokens(value: unknown): string[] {
  const key = asSearchString(value).toLowerCase();
  const cached = tokenCache.get(key);
  if (cached) return cached;
  const tokens = tokeniseSmart(key);
  if (tokenCache.size > 1500) tokenCache.clear();
  tokenCache.set(key, tokens);
  return tokens;
}

export function expandSearchQuery(value: unknown): string {
  const cleaned = asSearchString(value).toLowerCase().trim().replace(/\s+/g, " ");
  const words = tokeniseSmart(cleaned);
  const expanded = new Set<string>(words);

  words.forEach((word) => {
    SEARCH_SYNONYMS[word]?.forEach((synonym) => {
      tokeniseSmart(synonym).forEach((token) => expanded.add(token));
    });
  });

  return Array.from(expanded).join(" ");
}

export function normalizeSmartQuery(value: unknown): string {
  const cleaned = asSearchString(value).toLowerCase().trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const directRewrite = SEARCH_SYNONYMS[cleaned]?.[0];
  return directRewrite || cleaned;
}

export function levenshtein(a: string, b: string): number {
  const cacheKey = a < b ? `${a}|${b}` : `${b}|${a}`;
  const cached = levenshteinCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  if (levenshteinCache.size > 3000) levenshteinCache.clear();
  levenshteinCache.set(cacheKey, dp[m][n]);
  return dp[m][n];
}

export function wordMatchesToken(queryWord: string, token: string): boolean {
  queryWord = asSearchString(queryWord);
  token = asSearchString(token);
  if (!queryWord || !token) return false;
  if (/^\d+$/.test(queryWord)) return token === queryWord;
  if (token.startsWith(queryWord) || queryWord.startsWith(token)) return true;

  const allowedDistance = queryWord.length >= 7 ? 2 : queryWord.length >= 4 ? 1 : 0;
  if (allowedDistance === 0 || Math.abs(queryWord.length - token.length) > allowedDistance) return false;
  return levenshtein(queryWord, token) <= allowedDistance;
}

export function scoreTextMatch(query: unknown, fields: Array<unknown>, weights?: number[]): number {
  const normalized = normalizeSmartQuery(query);
  const expanded = expandSearchQuery(query);
  const queryWords = cachedTokens(`${normalized} ${expanded}`);
  const uniqueWords = Array.from(new Set(queryWords));
  if (uniqueWords.length === 0) return 0;

  let score = 0;
  fields.forEach((field, index) => {
    const text = asSearchString(field).toLowerCase();
    if (!text) return;

    const fieldWeight = weights?.[index] ?? 1;
    const tokens = cachedTokens(text);
    if (text === normalized) score += 1000 * fieldWeight;
    if (text.startsWith(normalized)) score += 600 * fieldWeight;
    if (text.includes(normalized)) score += 260 * fieldWeight;

    const matchedWords = uniqueWords.filter((word) => tokens.some((token) => wordMatchesToken(word, token)));
    score += matchedWords.length * 90 * fieldWeight;
    if (matchedWords.length === uniqueWords.length) score += 160 * fieldWeight;
  });

  return score;
}
