# 🎯 Purchase Flow Diagram

## Complete Visual Guide to Purchase Lifecycle

---

## 🔄 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                                │
│                    (luxtronics.in)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Browse Products │
                    │  - Shop Page     │
                    │  - Product Page  │
                    │  - Categories    │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Choose Option  │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────┐
        │   BUY NOW    │          │ ADD TO CART  │
        │   (Fast)     │          │  (Browse)    │
        └──────────────┘          └──────────────┘
                │                           │
                │                           ▼
                │                  ┌──────────────┐
                │                  │  Cart Page   │
                │                  │  - View      │
                │                  │  - Update    │
                │                  │  - Remove    │
                │                  └──────────────┘
                │                           │
                │                           ▼
                │                  ┌──────────────┐
                │                  │   Proceed    │
                │                  │ to Checkout  │
                │                  └──────────────┘
                │                           │
                └───────────┬───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WOOCOMMERCE                                 │
│              (luxtronics.luxtronics.in)                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Checkout   │
                    │  - Billing   │
                    │  - Shipping  │
                    │  - Payment   │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Payment    │
                    │  Processing  │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Thank You    │
                    │    Page      │
                    │ (3 seconds)  │
                    └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                                │
│                  /account/orders                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Order Shown  │
                    │  - Details   │
                    │  - Status    │
                    │  - Tracking  │
                    └──────────────┘
```

---

## 🛒 Option 1: Buy Now (Fast Checkout)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCT DETAIL PAGE                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User selects:
                            │ - Quantity: 2
                            │ - Variation: Red, Large
                            │
                            ▼
                    ┌──────────────┐
                    │  Click       │
                    │  "Buy Now"   │
                    └──────────────┘
                            │
                            │ redirectToWooCheckout([{
                            │   product_id: 123,
                            │   quantity: 2,
                            │   variation_id: 456
                            │ }])
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WOOCOMMERCE CHECKOUT                          │
│                                                                  │
│  URL: luxtronics.luxtronics.in/?add-to-cart=123&quantity=2      │
│       &variation_id=456&return_to=checkout                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Product automatically added to cart
                            │ Checkout page opens immediately
                            │
                            ▼
                    ┌──────────────┐
                    │ Fill Details │
                    │  - Billing   │
                    │  - Shipping  │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Payment    │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Thank You    │
                    │ (3 seconds)  │
                    └──────────────┘
                            │
                            │ WordPress Snippet 1:
                            │ redirect_to_react_after_order()
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT APP - ORDERS PAGE                       │
│                                                                  │
│  URL: luxtronics.in/account/orders?order_complete=true          │
│       &order_id=789&order_key=wc_order_xxx                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ fetchCustomerOrders(user.email)
                            │
                            ▼
                    ┌──────────────┐
                    │ Order #789   │
                    │ Status: ✅   │
                    │ Items: 2     │
                    │ Total: $99   │
                    └──────────────┘

⏱️ Total Time: ~2 minutes
🖱️ Total Clicks: 2-3 clicks
```

---

## 🛍️ Option 2: Add to Cart (Multi-item)

```
┌─────────────────────────────────────────────────────────────────┐
│                         SHOP PAGE                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks shopping bag icon
                            │ on 3 different products
                            │
                            ▼
                    ┌──────────────┐
                    │  Product 1   │
                    │  🛒 Click    │
                    └──────────────┘
                            │
                            │ addItem(product1, 1)
                            │ localStorage.setItem('cart', ...)
                            │
                            ▼
                    ┌──────────────┐
                    │ Toast: ✅    │
                    │ "Added!"     │
                    └──────────────┘
                            │
                            │ Cart Badge: 1 → 2 → 3
                            │
                            ▼
                    ┌──────────────┐
                    │  Product 2   │
                    │  🛒 Click    │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Product 3   │
                    │  🛒 Click    │
                    └──────────────┘
                            │
                            │ User clicks cart icon in navbar
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CART PAGE                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Product 1  [−] 1 [+]  $29.99              [X]          │    │
│  │ Product 2  [−] 2 [+]  $59.98              [X]          │    │
│  │ Product 3  [−] 1 [+]  $39.99              [X]          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Subtotal: $129.96                                              │
│  Shipping: $15.00                                               │
│  Total: $144.96                                                 │
│                                                                  │
│  [Continue Shopping]  [Proceed to Checkout]                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks "Proceed to Checkout"
                            │
                            │ redirectToWooCheckout([
                            │   { product_id: 1, quantity: 1 },
                            │   { product_id: 2, quantity: 2 },
                            │   { product_id: 3, quantity: 1 }
                            │ ])
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WOOCOMMERCE CHECKOUT                          │
│                                                                  │
│  URL: luxtronics.luxtronics.in/checkout/?cart_items=[...]       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ WordPress Snippet 2:
                            │ handle_react_cart_items()
                            │ - Reads cart_items parameter
                            │ - Adds all items to WC cart
                            │
                            ▼
                    ┌──────────────┐
                    │ Cart Filled  │
                    │ - Product 1  │
                    │ - Product 2  │
                    │ - Product 3  │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Fill Details │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Payment    │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Thank You    │
                    │ (3 seconds)  │
                    └──────────────┘
                            │
                            │ WordPress Snippet 1:
                            │ redirect_to_react_after_order()
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT APP - ORDERS PAGE                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ fetchCustomerOrders(user.email)
                            │
                            ▼
                    ┌──────────────┐
                    │ Order #790   │
                    │ Status: ✅   │
                    │ Items: 4     │
                    │ Total: $145  │
                    └──────────────┘

⏱️ Total Time: ~3-5 minutes
🖱️ Total Clicks: 5-10 clicks
```

---

## 🔴 Cart Badge Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│                                                                  │
│  [Logo]  [Nav Links]  [Search] [Currency] [🛒 0] [User]        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User adds Product 1
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│                                                                  │
│  [Logo]  [Nav Links]  [Search] [Currency] [🛒 1] [User]        │
│                                              ↑                   │
│                                              │                   │
│                                         ┌────────┐               │
│                                         │   1    │ ← Badge       │
│                                         └────────┘               │
│                                         20px x 20px              │
│                                         Gradient BG              │
│                                         White Text               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User adds Product 2
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│                                                                  │
│  [Logo]  [Nav Links]  [Search] [Currency] [🛒 2] [User]        │
│                                              ↑                   │
│                                              │                   │
│                                         ┌────────┐               │
│                                         │   2    │ ← Badge       │
│                                         └────────┘               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User adds Product 3 (qty: 2)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│                                                                  │
│  [Logo]  [Nav Links]  [Search] [Currency] [🛒 4] [User]        │
│                                              ↑                   │
│                                              │                   │
│                                         ┌────────┐               │
│                                         │   4    │ ← Badge       │
│                                         └────────┘               │
│                                         Shows total qty          │
│                                         Not unique products      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Cart Persistence Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ADDS TO CART                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ addItem(product, qty)
                            │
                            ▼
                    ┌──────────────┐
                    │ CartContext  │
                    │ State Update │
                    └──────────────┘
                            │
                            │ useEffect(() => {
                            │   localStorage.setItem('cart', ...)
                            │ }, [items])
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOCALSTORAGE                                │
│                                                                  │
│  Key: "luxtronics_cart"                                         │
│  Value: [                                                       │
│    { product: {...}, qty: 1 },                                  │
│    { product: {...}, qty: 2 },                                  │
│    { product: {...}, qty: 1 }                                   │
│  ]                                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User refreshes page (F5)
                            │
                            ▼
                    ┌──────────────┐
                    │ Page Reload  │
                    └──────────────┘
                            │
                            │ CartProvider initializes
                            │
                            ▼
                    ┌──────────────┐
                    │ useState(() =>│
                    │   localStorage│
                    │   .getItem()  │
                    │ )             │
                    └──────────────┘
                            │
                            │ Cart restored from localStorage
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CART BADGE: 4                                 │
│                    CART PAGE: 3 items                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Order Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER COMPLETES ORDER                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Order created in WooCommerce
                            │ Order ID: 789
                            │ Customer Email: user@example.com
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WOOCOMMERCE DATABASE                          │
│                                                                  │
│  Order #789                                                     │
│  - Status: processing                                           │
│  - Customer: user@example.com                                   │
│  - Items: [Product 1, Product 2, Product 3]                     │
│  - Total: $144.96                                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User redirected to React app
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT ORDERS PAGE                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ useEffect(() => {
                            │   fetchCustomerOrders(user.email)
                            │ }, [user])
                            │
                            ▼
                    ┌──────────────┐
                    │ API Call     │
                    │ GET /orders  │
                    │ ?customer=   │
                    │ user@...     │
                    └──────────────┘
                            │
                            │ WooCommerce API
                            │ Returns orders filtered by email
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORDERS DISPLAYED                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Order #789                          🔵 Processing       │    │
│  │ Placed on May 16, 2026                                 │    │
│  │                                                         │    │
│  │ Items:                                                  │    │
│  │ - Product 1 (Qty: 1) ............ $29.99              │    │
│  │ - Product 2 (Qty: 2) ............ $59.98              │    │
│  │ - Product 3 (Qty: 1) ............ $39.99              │    │
│  │                                                         │    │
│  │ Shipping: John Doe                                      │    │
│  │ 123 Main St, City, State 12345                         │    │
│  │                                                         │    │
│  │ Payment: Credit Card                                    │    │
│  │                                                         │    │
│  │ Subtotal: $129.96                                      │    │
│  │ Shipping: $15.00                                       │    │
│  │ Total: $144.96                                         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 WordPress Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 1. Redirect to WooCommerce
                            │    with cart items
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WORDPRESS                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Snippet 2: handle_react_cart_items()                   │    │
│  │                                                         │    │
│  │ - Reads cart_items parameter                           │    │
│  │ - Decodes JSON                                          │    │
│  │ - Adds items to WC cart                                │    │
│  │ - WC()->cart->add_to_cart(...)                         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 2. User completes checkout
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WORDPRESS                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Snippet 1: redirect_to_react_after_order()             │    │
│  │                                                         │    │
│  │ - Triggered on woocommerce_thankyou                    │    │
│  │ - Gets order details                                    │    │
│  │ - Determines React app URL                             │    │
│  │ - Builds redirect URL with order info                  │    │
│  │ - JavaScript redirect after 3 seconds                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 3. Redirect back to React
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                                │
│                    /account/orders                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 4. Fetch orders from WooCommerce
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WORDPRESS                                  │
│                    WooCommerce REST API                          │
│                                                                  │
│  GET /wp-json/wc/v3/orders?customer=user@example.com           │
│                                                                  │
│  Authorization: Basic base64(key:secret)                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 5. Return orders
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                                │
│                    Orders displayed                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary

### Frontend (100% Complete)
- ✅ Buy Now button
- ✅ Add to Cart button
- ✅ Cart badge (20px x 20px)
- ✅ Cart page
- ✅ Cart persistence
- ✅ Proceed to Checkout
- ✅ Order tracking

### WordPress (3 Snippets Required)
- ⚠️ Snippet 1: Redirect after purchase
- ⚠️ Snippet 2: Cart items handler
- ⚠️ Snippet 3: CORS headers (optional)

### Time to Complete
- ⏱️ WordPress setup: 25 minutes
- ⏱️ Testing: 10 minutes
- ⏱️ Total: 35 minutes

---

**Last Updated**: May 16, 2026
