/**
 * woo-checkout.ts
 * Builds the WooCommerce checkout redirect URL so the React frontend
 * can hand off to the WordPress/WooCommerce payment flow on the
 * appropriate store based on the current domain.
 */

import { storeConfig } from '@/config/storeConfig';

// Get store-specific WooCommerce base URL
export const WOO_BASE = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');

export interface CartLineItem {
  /** WooCommerce product ID (numeric) */
  product_id: number;
  quantity: number;
  variation_id?: number;
}

/**
 * Redirects the browser to the WooCommerce checkout page for the current store.
 *
 * Strategy:
 *  1. For a single product ("Buy Now") → use WooCommerce's
 *     add-to-cart + redirect-to-checkout shortcut:
 *     /?add-to-cart=<id>&quantity=<qty>&return_to=checkout
 *
 *  2. For multiple items (full cart) → link directly to
 *     /checkout/ with source_domain + currency.
 *
 * The checkout URL is automatically determined based on the current domain:
 * - luxtronics.in → luxtronics.luxtronics.in
 * - luxtronics.com.au → luxtronics.luxtronics.in/storeau
 * - luxtronics.co.nz → luxtronics.luxtronics.in/storenz
 */
export function redirectToWooCheckout(
  items: CartLineItem[],
  sourceDomain: string,
  currency: string
): void {
  if (items.length === 0) return;

  const params = new URLSearchParams({
    source_domain: sourceDomain,
    currency,
  });

  let url: string;

  if (items.length === 1) {
    // Single product shortcut — WooCommerce adds to cart and
    // immediately opens /checkout/
    const { product_id, quantity, variation_id } = items[0];
    params.set("add-to-cart", String(product_id));
    params.set("quantity", String(quantity));
    if (variation_id) params.set("variation_id", String(variation_id));
    params.set("return_to", "checkout");
    url = `${WOO_BASE}/?${params.toString()}`;
  } else {
    // Multi-item: encode cart as JSON in query param.
    // The WooMultiDomain / custom snippet on WP side will read
    // `cart_items` and populate the WC session before checkout.
    params.set("cart_items", JSON.stringify(items));
    url = `${WOO_BASE}/checkout/?${params.toString()}`;
  }

  window.location.href = url;
}

/**
 * Returns the WooCommerce cart page URL for viewing the cart
 * (without immediately going to checkout).
 */
export function getWooCartUrl(sourceDomain: string, currency: string): string {
  const params = new URLSearchParams({ source_domain: sourceDomain, currency });
  return `${WOO_BASE}/cart/?${params.toString()}`;
}
