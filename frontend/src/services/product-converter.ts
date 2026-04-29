/**
 * Convert WooCommerce products to local Product format
 */
import { Product } from '@/data/products';
import { WooProduct } from '@/services/woocommerce';

export function convertWooProductToLocalProduct(wooProduct: WooProduct): Product {
  const mainImage = wooProduct.images?.[0]?.src || '';
  const price = parseFloat(wooProduct.sale_price || wooProduct.price || '0');
  const originalPrice = parseFloat(wooProduct.regular_price || wooProduct.price || '0');

  return {
    id: wooProduct.id.toString(),
    slug: wooProduct.slug,
    name: wooProduct.name,
    category: wooProduct.categories?.[0]?.name || 'Other',
    price: Math.round(price),
    oldPrice: originalPrice > price ? Math.round(originalPrice) : undefined,
    image: mainImage,
    rating: parseFloat(wooProduct.average_rating) || 0,
    reviews: wooProduct.rating_count || 0,
    description: wooProduct.description || wooProduct.short_description || '',
    badge: price < originalPrice ? '-20%' : undefined, // Adjust logic as needed
  };
}

export function convertWooProductsToLocal(wooProducts: WooProduct[]): Product[] {
  return wooProducts.map(convertWooProductToLocalProduct);
}
