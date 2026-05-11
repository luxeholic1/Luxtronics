<?php
/**
 * WooCommerce CORS Configuration
 * 
 * Add this to each WooCommerce store's functions.php file
 * Location: /wp-content/themes/your-active-theme/functions.php
 * 
 * This allows the React frontend (on different domains) to make API calls
 * to the WooCommerce backend.
 */

add_action('init', function () {
    $allowed = [
        'https://luxtronics.in',
        'https://www.luxtronics.in',
        'https://luxtronics.com.au',
        'https://www.luxtronics.com.au',
        'https://luxtronics.co.nz',
        'https://www.luxtronics.co.nz',
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Allow-Credentials: true');
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
