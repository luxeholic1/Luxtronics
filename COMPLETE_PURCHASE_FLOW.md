# Complete Purchase Flow Guide

## 🎯 Overview

Complete end-to-end purchase flow from React app to WooCommerce and back.

---

## 📊 Purchase Flow Diagram

```
React App (luxtronics.in)
    ↓
User browses products
    ↓
┌─────────────────────────────────┐
│  Option 1: Buy Now              │
│  - Direct to WooCommerce        │
│  - Skip cart                    │
│  - Instant checkout             │
└─────────────────────────────────┘
    ↓
WooCommerce Checkout
    ↓
Payment
    ↓
Order Complete
    ↓
Redirect to React App
    ↓
Order shows in Account → Orders

┌─────────────────────────────────┐
│  Option 2: Add to Cart          │
│  - Add multiple products        │
│  - View cart in React           │
│  - Proceed to WooCommerce       │
└─────────────────────────────────┘
    ↓
React Cart Page
    ↓
"Proceed to Checkout" button
    ↓
WooCommerce Checkout
    ↓
Payment
    ↓
Order Complete
    ↓
Redirect to React App
    ↓
Order shows in Account → Orders
```

---

## ✅ What's Implemented (Frontend)

### 1. **Product Detail Page**

**Buy Now Button**:
- Redirects directly to WooCommerce checkout
- Passes product ID, quantity, variation
- Skips cart completely
- Fast checkout experience

**Add to Cart Button**:
- Adds product to React cart (localStorage)
- Shows toast notification
- Updates cart badge in navbar
- User can continue shopping

### 2. **Cart Page**

**Features**:
- View all cart items
- Update quantities (+/-)
- Remove items (X button)
- See subtotal, shipping, total
- Related products carousel

**Checkout Options**:
- **Continue Shopping**: Stay in React app
- **Proceed to Checkout**: Redirect to WooCommerce with all cart items

### 3. **Navbar Cart Badge**

**Features**:
- Shows total item count
- Real-time updates
- Visible badge (5x5 size)
- Click to view cart

### 4. **Account Orders Page**

**Features**:
- Fetches orders from WooCommerce API
- Filters by customer email
- Shows order details:
  * Order ID & status
  * Order items with images
  * Shipping address
  * Payment method
  * Subtotal, shipping, tax, total
- Status indicators (pending, processing, completed, etc.)

---

## 🔧 WordPress Setup Required

### Step 1: Add Redirect After Purchase

Add this snippet to WordPress to redirect back to React app after order completion:

```php
<?php
/**
 * Redirect to React app after WooCommerce order completion
 */

add_action('woocommerce_thankyou', 'redirect_to_react_after_order', 10, 1);

function redirect_to_react_after_order($order_id) {
    if (!$order_id) return;
    
    // Get order
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    // Get customer email
    $customer_email = $order->get_billing_email();
    
    // Determine React app URL based on current domain
    $current_domain = $_SERVER['HTTP_HOST'];
    
    if (strpos($current_domain, 'storeau') !== false) {
        $react_url = 'https://luxtronics.com.au';
    } elseif (strpos($current_domain, 'storenz') !== false) {
        $react_url = 'https://luxtronics.co.nz';
    } else {
        $react_url = 'https://luxtronics.in';
    }
    
    // Build redirect URL with order info
    $redirect_url = add_query_arg(array(
        'order_complete' => 'true',
        'order_id' => $order_id,
        'order_key' => $order->get_order_key(),
        'customer_email' => urlencode($customer_email),
    ), $react_url . '/account/orders');
    
    // Redirect after 3 seconds (show thank you message first)
    ?>
    <script>
        setTimeout(function() {
            window.location.href = '<?php echo esc_js($redirect_url); ?>';
        }, 3000);
    </script>
    <div style="text-align: center; padding: 20px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; color: #1e40af; margin: 0;">
            <strong>Redirecting to your account...</strong>
        </p>
        <p style="font-size: 14px; color: #64748b; margin: 10px 0 0 0;">
            You'll be redirected to view your order in 3 seconds.
        </p>
    </div>
    <?php
}
?>
```

### Step 2: Add Cart Items Handler

Add this snippet to handle cart items from React app:

```php
<?php
/**
 * Handle cart items from React app
 * Reads cart_items parameter and adds to WooCommerce cart
 */

add_action('template_redirect', 'handle_react_cart_items');

function handle_react_cart_items() {
    // Only on checkout page
    if (!is_checkout() && !is_cart()) return;
    
    // Check if cart_items parameter exists
    if (isset($_GET['cart_items'])) {
        // Clear existing cart
        WC()->cart->empty_cart();
        
        // Decode cart items
        $cart_items = json_decode(stripslashes($_GET['cart_items']), true);
        
        if ($cart_items && is_array($cart_items)) {
            foreach ($cart_items as $item) {
                $product_id = isset($item['product_id']) ? intval($item['product_id']) : 0;
                $quantity = isset($item['quantity']) ? intval($item['quantity']) : 1;
                $variation_id = isset($item['variation_id']) ? intval($item['variation_id']) : 0;
                
                if ($product_id > 0) {
                    // Add to cart
                    WC()->cart->add_to_cart($product_id, $quantity, $variation_id);
                }
            }
        }
    }
}
?>
```

### Step 3: Enable CORS (if needed)

If React app and WordPress are on different domains:

```php
<?php
/**
 * Enable CORS for React app
 */

add_action('init', 'add_cors_headers');

function add_cors_headers() {
    $allowed_origins = array(
        'https://luxtronics.in',
        'https://luxtronics.com.au',
        'https://luxtronics.co.nz',
    );
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}
?>
```

---

## 🧪 Testing Complete Flow

### Test 1: Buy Now Flow

1. **Go to Product Page**:
   - Visit any product: `/product/[slug]`
   - Select quantity
   - Select variation (if applicable)

2. **Click "Buy Now"**:
   - Should redirect to WooCommerce checkout
   - Product should be in cart
   - Quantity should match

3. **Complete Checkout**:
   - Fill billing/shipping details
   - Select payment method
   - Complete payment

4. **After Payment**:
   - See WooCommerce thank you page
   - Wait 3 seconds
   - **Should redirect** to React app `/account/orders`
   - **Order should appear** in orders list

### Test 2: Add to Cart Flow

1. **Add Products to Cart**:
   - Go to Shop page
   - Click shopping bag icon on 2-3 products
   - See toast notifications
   - Cart badge updates (shows count)

2. **View Cart**:
   - Click cart icon in navbar
   - See all added products
   - Update quantities
   - Remove items (test)

3. **Proceed to Checkout**:
   - Click "Proceed to Checkout" button
   - Should redirect to WooCommerce checkout
   - All cart items should be there
   - Quantities should match

4. **Complete Order**:
   - Fill details
   - Complete payment
   - Wait for redirect
   - **Check Account → Orders**

### Test 3: Order Tracking

1. **Go to Account → Orders**:
   - Should see all your orders
   - Orders fetched from WooCommerce
   - Filtered by your email

2. **Check Order Details**:
   - Order ID & status
   - Order items with images
   - Shipping address
   - Payment method
   - Total amount

3. **Order Status**:
   - Pending (yellow)
   - Processing (blue)
   - Completed (green)
   - Cancelled (red)

---

## 🎯 User Flows

### Flow 1: Quick Purchase (Buy Now)

```
Product Page
    ↓
Select options
    ↓
Click "Buy Now"
    ↓
WooCommerce Checkout (instant)
    ↓
Payment
    ↓
Order Complete
    ↓
Auto-redirect to React app
    ↓
View order in Account
```

**Time**: ~2 minutes

### Flow 2: Multiple Items (Cart)

```
Shop Page
    ↓
Add multiple products to cart
    ↓
Cart badge updates
    ↓
Click cart icon
    ↓
Review cart
    ↓
Update quantities
    ↓
Click "Proceed to Checkout"
    ↓
WooCommerce Checkout
    ↓
Payment
    ↓
Order Complete
    ↓
Auto-redirect to React app
    ↓
View order in Account
```

**Time**: ~3-5 minutes

---

## 🐛 Troubleshooting

### Issue 1: Not Redirecting After Purchase

**Check**:
1. Is WordPress snippet added?
2. Check browser console for errors
3. Check if redirect URL is correct
4. Verify order was created

**Debug**:
```php
// Add to snippet
error_log('Redirecting to: ' . $redirect_url);
```

### Issue 2: Cart Items Not Showing in WooCommerce

**Check**:
1. Is cart_items parameter in URL?
2. Check WordPress snippet is active
3. Check WooCommerce cart is enabled
4. Check product IDs are correct

**Debug**:
```php
// Add to snippet
error_log('Cart Items: ' . print_r($cart_items, true));
```

### Issue 3: Orders Not Showing in Account

**Check**:
1. Is customer email correct?
2. Are orders created in WooCommerce?
3. Check WooCommerce API credentials
4. Check network tab for API errors

**Debug**:
```javascript
// In browser console
console.log('Fetching orders for:', user.email);
```

---

## 📊 Purchase Flow Summary

### React App Handles:
- ✅ Product browsing
- ✅ Add to cart (localStorage)
- ✅ Cart management (view, update, remove)
- ✅ Cart badge
- ✅ Order history display

### WooCommerce Handles:
- ✅ Checkout process
- ✅ Payment processing
- ✅ Order creation
- ✅ Order management
- ✅ Email notifications
- ✅ Inventory management

### Integration Points:
1. **React → WooCommerce**: Redirect with cart items
2. **WooCommerce → React**: Redirect after order complete
3. **React ← WooCommerce**: Fetch orders via API

---

## ✅ Checklist

### Frontend (Done):
- [x] Buy Now button redirects to WooCommerce
- [x] Add to Cart adds to React cart
- [x] Cart page shows all items
- [x] Cart badge shows item count
- [x] Proceed to Checkout redirects to WooCommerce
- [x] Account Orders fetches from WooCommerce API

### WordPress (To Do):
- [ ] Add redirect snippet after order completion
- [ ] Add cart items handler snippet
- [ ] Test Buy Now flow
- [ ] Test Add to Cart flow
- [ ] Verify orders show in Account

---

## 🚀 Next Steps

1. **Add WordPress Snippets** (15 minutes):
   - Copy snippets from this guide
   - Add to Code Snippets plugin
   - Activate all snippets

2. **Test Complete Flow** (10 minutes):
   - Test Buy Now
   - Test Add to Cart
   - Test order tracking
   - Verify redirect works

3. **Configure WooCommerce** (5 minutes):
   - Set thank you page message
   - Configure email templates
   - Set up payment gateways

---

**Status**: ✅ Frontend Complete, WordPress Setup Required
**Estimated Time**: 30 minutes total
**Difficulty**: Easy

---

**Last Updated**: May 15, 2026
