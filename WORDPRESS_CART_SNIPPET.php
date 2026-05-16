<?php
/**
 * ============================================================
 * LUXTRONICS — WordPress Cart Handler Snippet
 * ============================================================
 * Add this to WordPress via:
 *   Plugins → Code Snippets → Add New → paste → Save & Activate
 *
 * OR add to your theme's functions.php
 *
 * What this does:
 *  1. Reads ?lux_cart=[...] param → clears WC cart → adds all items → redirects to /checkout/
 *  2. Reads ?add-to-cart=ID&redirect_to=URL → WooCommerce handles natively,
 *     but we also force redirect to checkout after add
 *  3. After order complete → redirects back to React app /account/orders
 * ============================================================
 */

// ── 1. Handle multi-item cart from React ─────────────────────────────────────
add_action( 'template_redirect', 'luxtronics_handle_react_cart', 1 );

function luxtronics_handle_react_cart() {
    if ( ! isset( $_GET['lux_cart'] ) ) return;

    // Decode cart items
    $raw        = stripslashes( $_GET['lux_cart'] );
    $cart_items = json_decode( $raw, true );

    if ( ! is_array( $cart_items ) || empty( $cart_items ) ) return;

    // Make sure WooCommerce is ready
    if ( ! function_exists( 'WC' ) || ! WC()->cart ) return;

    // Clear existing cart
    WC()->cart->empty_cart();

    $added = 0;
    foreach ( $cart_items as $item ) {
        $product_id   = isset( $item['product_id'] )   ? absint( $item['product_id'] )   : 0;
        $quantity     = isset( $item['quantity'] )      ? absint( $item['quantity'] )      : 1;
        $variation_id = isset( $item['variation_id'] )  ? absint( $item['variation_id'] )  : 0;

        if ( $product_id <= 0 ) continue;

        $result = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id );
        if ( $result ) $added++;
    }

    // Redirect to checkout (or cart if nothing was added)
    $redirect = $added > 0
        ? wc_get_checkout_url()
        : wc_get_cart_url();

    wp_safe_redirect( $redirect );
    exit;
}


// ── 2. After Buy Now (?add-to-cart=ID) → force redirect to checkout ──────────
add_filter( 'woocommerce_add_to_cart_redirect', 'luxtronics_buynow_redirect', 10, 2 );

function luxtronics_buynow_redirect( $url, $product ) {
    // Only redirect to checkout when redirect_to param is set
    if ( isset( $_GET['redirect_to'] ) ) {
        $redirect = esc_url_raw( $_GET['redirect_to'] );
        // Safety: only allow redirects to our own checkout
        if ( strpos( $redirect, '/checkout' ) !== false ) {
            return wc_get_checkout_url();
        }
    }
    return $url;
}


// ── 3. After order complete → redirect back to React app ─────────────────────
add_action( 'woocommerce_thankyou', 'luxtronics_redirect_after_order', 10, 1 );

function luxtronics_redirect_after_order( $order_id ) {
    if ( ! $order_id ) return;

    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    // Determine which React domain to redirect to
    $host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';

    if ( strpos( $host, 'storeau' ) !== false || strpos( $host, '.com.au' ) !== false ) {
        $react_base = 'https://luxtronics.com.au';
    } elseif ( strpos( $host, 'storenz' ) !== false || strpos( $host, '.co.nz' ) !== false ) {
        $react_base = 'https://luxtronics.co.nz';
    } else {
        $react_base = 'https://luxtronics.in';
    }

    $redirect_url = add_query_arg( array(
        'order_complete' => '1',
        'order_id'       => $order_id,
        'order_key'      => $order->get_order_key(),
    ), $react_base . '/account/orders' );

    // Show a brief thank-you message, then auto-redirect after 3 seconds
    ?>
    <div style="
        text-align:center;
        padding:24px;
        margin:20px 0;
        background:#f0fdf4;
        border:2px solid #22c55e;
        border-radius:12px;
        font-family:sans-serif;
    ">
        <p style="font-size:18px;color:#15803d;font-weight:700;margin:0 0 8px;">
            ✅ Order Placed Successfully!
        </p>
        <p style="font-size:14px;color:#6b7280;margin:0;">
            Redirecting you to your order history in 3 seconds…
        </p>
    </div>
    <script>
        setTimeout( function() {
            window.location.href = '<?php echo esc_js( $redirect_url ); ?>';
        }, 3000 );
    </script>
    <?php
}


// ── 4. Allow CORS for React app API calls ────────────────────────────────────
add_action( 'init', 'luxtronics_cors_headers' );

function luxtronics_cors_headers() {
    $allowed = array(
        'https://luxtronics.in',
        'https://www.luxtronics.in',
        'https://luxtronics.com.au',
        'https://www.luxtronics.com.au',
        'https://luxtronics.co.nz',
        'https://www.luxtronics.co.nz',
    );

    $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';

    if ( in_array( $origin, $allowed, true ) ) {
        header( 'Access-Control-Allow-Origin: '  . $origin );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
    }

    // Handle preflight
    if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
        status_header( 200 );
        exit;
    }
}
