/**
 * woo-checkout.ts
 * Builds the WooCommerce checkout redirect URL so the React frontend
 * can hand off to the WordPress/WooCommerce payment flow on
 * luxtronics.luxtronics.in, with WooMultiDomain knowing which
 * source domain/currency the customer came from.
 */

export const WOO_BASE = "https://luxtronics.luxtronics.in";

export interface CartLineItem {
  /** WooCommerce product ID (numeric) */
  product_id: number;
  quantity: number;
  variation_id?: number;
}

/**
 * Redirects the browser to the WooCommerce checkout page.
 *
 * Strategy:
 *  1. For a single product ("Buy Now") → use WooCommerce's
 *     add-to-cart + redirect-to-checkout shortcut:
 *     /?add-to-cart=<id>&quantity=<qty>&return_to=checkout
 *
 *  2. For multiple items (full cart) → link directly to
 *     /checkout/ with source_domain + currency so WooMultiDomain
 *     can apply the correct pricing tier.
 *
 * WooMultiDomain reads `source_domain` from the query string and
 * switches the store context accordingly.
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
