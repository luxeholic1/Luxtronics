import type { StoreCategory } from "@/services/store-api";

type VisibleCategoryInput = Pick<StoreCategory, "name" | "slug" | "description"> & Partial<Pick<StoreCategory, "count" | "productCount">>;

export function isVisibleCategory(category: VisibleCategoryInput): boolean {
  const count = Number(category.productCount ?? category.count ?? 0);
  if (!Number.isFinite(count) || count <= 0) return false;
  if (String(category.name || "").toLowerCase().trim() === "uncategorized") return false;

  return true;
}

export function filterVisibleCategories<T extends VisibleCategoryInput>(categories: T[]): T[] {
  return categories.filter(isVisibleCategory);
}
