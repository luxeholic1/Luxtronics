import type { StoreCategory } from "@/services/store-api";

const VISIBLE_CATEGORY_PATTERNS = [
  /mobile[\s-]*access/i,
  /cable|charger|case|cover|protector|tempered|glass|screen|bag|pouch|holder|stand|mount|dock|magsafe|adapter|power[\s-]*bank|earbuds|earphones|headphones|airpods/i,
  /smart[\s-]*wear|wearable|watch|fitbit|garmin|band|glasses|eyewear/i,
  /outdoor|sport|camping|bicycle|cycling|fishing|scooter|survival|emergency|yoga/i,
  /consumer[\s-]*electronics|projector|android[\s-]*tv|tv[\s-]*box|audio|speaker|3d[\s-]*printer|arduino|vr|ar|live[\s-]*equipment/i,
  /dji|insta360|osmo|mavic|gopro|drone/i,
];

export function isVisibleCategory(category: Pick<StoreCategory, "name" | "slug" | "description">): boolean {
  const text = `${category.name || ""} ${category.slug || ""} ${category.description || ""}`;
  return VISIBLE_CATEGORY_PATTERNS.some((pattern) => pattern.test(text));
}

export function filterVisibleCategories<T extends Pick<StoreCategory, "name" | "slug" | "description">>(categories: T[]): T[] {
  return categories.filter(isVisibleCategory);
}
