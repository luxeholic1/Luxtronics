#!/bin/bash

# Geo-redirect setup script for Luxtronics multidomain
# This script helps set up geo-based redirects from main domain to regional domains

echo "🌍 Setting up Geo-Redirects for Luxtronics Multi-Domain"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"

# Function to create geo-redirect middleware
create_geo_middleware() {
    cat > vercel-geo-middleware.js << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Only redirect from main domain
  if (!hostname.includes('luxtronics.com') || hostname.includes('.com.au') || hostname.includes('.co.nz')) {
    return NextResponse.next();
  }

  // Skip API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    request.ip ||
                    '127.0.0.1';

    // For demo purposes, you can implement IP geolocation here
    // For production, use a service like MaxMind GeoIP

    // Example: Redirect Australians to AU domain
    // const country = getCountryFromIP(clientIP);
    // if (country === 'AU') {
    //   return NextResponse.redirect(new URL(`https://luxtronics.com.au${pathname}`, request.url));
    // }

  } catch (error) {
    console.warn('Geo redirect failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
EOF

    echo "✅ Created vercel-geo-middleware.js"
}

# Create middleware file
create_geo_middleware

echo ""
echo "📋 Next Steps for Geo-Redirects:"
echo ""
echo "1. 🌐 Domain Setup:"
echo "   - Point luxtronics.com → Vercel deployment"
echo "   - Point luxtronics.com.au → Same Vercel deployment"
echo "   - Point luxtronics.co.nz → Same Vercel deployment"
echo ""
echo "2. 🔧 Implement Geo-Detection:"
echo "   - Uncomment the geo-detection logic in vercel-geo-middleware.js"
echo "   - Add your preferred geolocation service (MaxMind, IP-API, etc.)"
echo ""
echo "3. 🚀 Deploy:"
echo "   - Run: vercel --prod"
echo "   - Users will be automatically redirected to regional domains"
echo ""
echo "4. 🧪 Test:"
echo "   - Visit luxtronics.com from different locations"
echo "   - Verify redirects work correctly"
echo ""
echo "💡 Note: Geo-redirects are optional. Domain-based detection works without them."