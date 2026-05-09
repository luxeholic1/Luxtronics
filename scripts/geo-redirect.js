/**
 * Geo-based redirects for multidomain setup
 * This can be used as Vercel Edge Function or middleware
 */

export async function handleGeoRedirect(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Only redirect from main domain
  if (hostname !== 'luxtronics.com') {
    return fetch(request);
  }

  try {
    // Get user's IP for geolocation
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    '127.0.0.1';

    // Use IP-API for geolocation (free tier)
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=countryCode`);
    const geoData = await geoResponse.json();

    const countryCode = geoData.countryCode;

    // Redirect based on country
    let redirectDomain = 'luxtronics.com'; // Default

    switch (countryCode) {
      case 'AU':
        redirectDomain = 'luxtronics.com.au';
        break;
      case 'NZ':
        redirectDomain = 'luxtronics.co.nz';
        break;
      case 'IN':
        redirectDomain = 'luxtronics.in';
        break;
      // Add more countries as needed
    }

    // If redirect domain is different, redirect
    if (redirectDomain !== hostname) {
      const redirectUrl = `https://${redirectDomain}${url.pathname}${url.search}`;
      return Response.redirect(redirectUrl, 302);
    }

  } catch (error) {
    console.warn('Geo redirect failed:', error);
    // Continue to main site if geolocation fails
  }

  return fetch(request);
}