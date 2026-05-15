# WordPress Checkout Data Sync Guide

## 🎯 Overview

This guide explains how to sync customer data from your React checkout form to WooCommerce checkout page.

---

## ✅ What's Already Done (Frontend)

### 1. **Checkout Form with State Management**
- Form collects: First Name, Last Name, Email, Phone, Address, City, ZIP Code
- Data stored in React state
- Form validation (all fields required)

### 2. **Data Passed to WooCommerce**
- Customer data sent as URL parameter: `customer_data`
- Format: JSON string with billing and shipping info
- Example URL:
  ```
  https://luxtronics.in/checkout/?cart_items=[...]&customer_data={"billing":{...},"shipping":{...}}
  ```

---

## 🔧 WordPress Setup Required

### Step 1: Add Custom Snippet to WordPress

You need to add a PHP snippet to your WordPress site that will:
1. Read the `customer_data` parameter from URL
2. Pre-fill WooCommerce checkout fields

### Option A: Using Code Snippets Plugin (Recommended)

1. **Install Plugin**:
   - Go to: WordPress Admin → Plugins → Add New
   - Search: "Code Snippets"
   - Install & Activate

2. **Add New Snippet**:
   - Go to: Snippets → Add New
   - Title: "Pre-fill Checkout from React App"
   - Code: (see below)
   - Run: "Only run on site front-end"
   - Save & Activate

### Option B: Add to functions.php

Add this code to your theme's `functions.php` file:

```php
<?php
/**
 * Pre-fill WooCommerce checkout fields from React app
 * Reads customer_data from URL parameter and populates checkout form
 */

add_filter('woocommerce_checkout_get_value', 'prefill_checkout_fields_from_react', 10, 2);

function prefill_checkout_fields_from_react($value, $input) {
    // Check if customer_data parameter exists in URL
    if (isset($_GET['customer_data'])) {
        // Decode JSON data
        $customer_data = json_decode(stripslashes($_GET['customer_data']), true);
        
        if ($customer_data && is_array($customer_data)) {
            // Billing fields mapping
            $billing_fields = array(
                'billing_first_name' => isset($customer_data['billing']['first_name']) ? $customer_data['billing']['first_name'] : '',
                'billing_last_name' => isset($customer_data['billing']['last_name']) ? $customer_data['billing']['last_name'] : '',
                'billing_email' => isset($customer_data['billing']['email']) ? $customer_data['billing']['email'] : '',
                'billing_phone' => isset($customer_data['billing']['phone']) ? $customer_data['billing']['phone'] : '',
                'billing_address_1' => isset($customer_data['billing']['address_1']) ? $customer_data['billing']['address_1'] : '',
                'billing_city' => isset($customer_data['billing']['city']) ? $customer_data['billing']['city'] : '',
                'billing_state' => isset($customer_data['billing']['state']) ? $customer_data['billing']['state'] : '',
                'billing_postcode' => isset($customer_data['billing']['postcode']) ? $customer_data['billing']['postcode'] : '',
                'billing_country' => isset($customer_data['billing']['country']) ? $customer_data['billing']['country'] : '',
            );
            
            // Shipping fields mapping
            $shipping_fields = array(
                'shipping_first_name' => isset($customer_data['shipping']['first_name']) ? $customer_data['shipping']['first_name'] : '',
                'shipping_last_name' => isset($customer_data['shipping']['last_name']) ? $customer_data['shipping']['last_name'] : '',
                'shipping_address_1' => isset($customer_data['shipping']['address_1']) ? $customer_data['shipping']['address_1'] : '',
                'shipping_city' => isset($customer_data['shipping']['city']) ? $customer_data['shipping']['city'] : '',
                'shipping_state' => isset($customer_data['shipping']['state']) ? $customer_data['shipping']['state'] : '',
                'shipping_postcode' => isset($customer_data['shipping']['postcode']) ? $customer_data['shipping']['postcode'] : '',
                'shipping_country' => isset($customer_data['shipping']['country']) ? $customer_data['shipping']['country'] : '',
            );
            
            // Merge all fields
            $all_fields = array_merge($billing_fields, $shipping_fields);
            
            // Return value if field exists in our data
            if (isset($all_fields[$input])) {
                return $all_fields[$input];
            }
        }
    }
    
    return $value;
}

/**
 * Store customer data in session for persistence
 */
add_action('woocommerce_checkout_init', 'store_customer_data_in_session');

function store_customer_data_in_session() {
    if (isset($_GET['customer_data']) && !WC()->session->get('customer_data_loaded')) {
        $customer_data = json_decode(stripslashes($_GET['customer_data']), true);
        
        if ($customer_data && is_array($customer_data)) {
            // Store in session
            WC()->session->set('react_customer_data', $customer_data);
            WC()->session->set('customer_data_loaded', true);
            
            // Also set WooCommerce customer data
            if (isset($customer_data['billing'])) {
                foreach ($customer_data['billing'] as $key => $value) {
                    WC()->customer->{"set_billing_$key"}($value);
                }
            }
            
            if (isset($customer_data['shipping'])) {
                foreach ($customer_data['shipping'] as $key => $value) {
                    WC()->customer->{"set_shipping_$key"}($value);
                }
            }
        }
    }
}
?>
```

---

## 🧪 Testing

### Step 1: Test Frontend Form

1. Go to your React app checkout page
2. Fill in all fields:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Address: 123 Test Street
   - City: New York
   - ZIP: 10001

3. Click "Pay" button

### Step 2: Verify WooCommerce Checkout

1. You should be redirected to WooCommerce checkout
2. **Check**: All fields should be pre-filled with your data
3. **Verify**:
   - ✅ First Name: John
   - ✅ Last Name: Doe
   - ✅ Email: john@example.com
   - ✅ Phone: +1234567890
   - ✅ Address: 123 Test Street
   - ✅ City: New York
   - ✅ ZIP: 10001

### Step 3: Complete Order

1. Select payment method
2. Complete checkout
3. Order should be created with correct customer data

---

## 🐛 Troubleshooting

### Issue 1: Fields Not Pre-filling

**Check**:
1. Is the WordPress snippet added and activated?
2. Check browser console for errors
3. Check URL - does it have `customer_data` parameter?
4. Check WordPress error log

**Debug**:
Add this to your snippet to see what data is received:
```php
error_log('Customer Data: ' . print_r($_GET['customer_data'], true));
```

### Issue 2: Data Lost on Page Refresh

**Solution**: The session storage code (second function) should prevent this.

**Check**:
- WooCommerce sessions are enabled
- PHP sessions are working

### Issue 3: Special Characters in Data

**Solution**: Data is already URL-encoded by JavaScript

**Check**:
- Use `stripslashes()` in PHP (already in code)
- Use `json_decode()` with proper flags

---

## 🔒 Security Considerations

### 1. **Data Validation**

Add validation in WordPress:
```php
// Sanitize email
$email = sanitize_email($customer_data['billing']['email']);

// Sanitize text fields
$first_name = sanitize_text_field($customer_data['billing']['first_name']);

// Validate phone
$phone = preg_replace('/[^0-9+\-\(\)\s]/', '', $customer_data['billing']['phone']);
```

### 2. **XSS Protection**

Already handled by:
- `sanitize_text_field()` in WordPress
- WooCommerce's built-in sanitization

### 3. **SQL Injection**

Not applicable - we're not writing to database directly.
WooCommerce handles all database operations.

---

## 📊 Data Flow

```
React Checkout Form
    ↓
User fills form
    ↓
Form data stored in state
    ↓
User clicks "Pay"
    ↓
Data converted to JSON
    ↓
URL parameter: customer_data={"billing":{...}}
    ↓
Redirect to WooCommerce
    ↓
WordPress receives URL
    ↓
PHP snippet reads customer_data
    ↓
WooCommerce checkout fields pre-filled
    ↓
User completes payment
    ↓
Order created with customer data
```

---

## ✅ Checklist

### Frontend (Already Done):
- [x] Form collects customer data
- [x] Data stored in React state
- [x] Data passed to redirectToWooCheckout()
- [x] Data encoded as JSON in URL
- [x] Form validation

### WordPress (To Do):
- [ ] Add PHP snippet to WordPress
- [ ] Test pre-filling on checkout page
- [ ] Verify data persists on page refresh
- [ ] Test complete order flow
- [ ] Add data validation (optional)

---

## 🎯 Expected Result

**Before**: User fills form in React → Redirects to WooCommerce → Has to fill form again ❌

**After**: User fills form in React → Redirects to WooCommerce → Form already filled ✅

---

## 📞 Support

### If fields not pre-filling:

1. **Check WordPress snippet**:
   - Go to: Snippets → All Snippets
   - Verify: "Pre-fill Checkout from React App" is Active

2. **Check URL**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Check redirect URL
   - Should contain: `customer_data=...`

3. **Check PHP errors**:
   - Enable WordPress debug mode
   - Check: `wp-content/debug.log`

4. **Test manually**:
   - Go to: `https://luxtronics.in/checkout/?customer_data={"billing":{"first_name":"John"}}`
   - First name field should show "John"

---

## 🚀 Advanced Features (Optional)

### 1. **Remember Customer Data**

Store in localStorage for returning customers:
```javascript
// Save to localStorage
localStorage.setItem('checkout_data', JSON.stringify(formData));

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('checkout_data');
  if (saved) {
    setFormData(JSON.parse(saved));
  }
}, []);
```

### 2. **Auto-fill from User Account**

If user is logged in, pre-fill from their account:
```javascript
useEffect(() => {
  if (user) {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      // ... etc
    });
  }
}, [user]);
```

### 3. **Address Autocomplete**

Integrate Google Places API for address autocomplete.

---

**Status**: ✅ Frontend Ready, WordPress Setup Required
**Estimated Time**: 10 minutes to add WordPress snippet
**Difficulty**: Easy

---

**Last Updated**: May 15, 2026
