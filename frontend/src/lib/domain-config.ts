// Domain to country mapping for multidomain setup
export const DOMAIN_CONFIG = {
  // Primary domains
  'luxtronics.com': 'US',
  'luxtronics.co.uk': 'GB',
  'luxtronics.in': 'IN',
  'luxtronics.luxtronics.in': 'IN',
  'luxtronics.com.au': 'AU',
  'luxtronics.co.nz': 'NZ',

  // Indian regional domains
  'luxtronics.in.au': 'AU', 
  'luxtronics.in.nz': 'NZ', // Indian domain for New Zealand

  // Alternative domains (redirects)
  'luxtronics.au': 'AU',
  'luxtronics.nz': 'NZ',

  // Development domains
  'localhost': 'IN', // Default for development
  '127.0.0.1': 'IN',
  'localhost:5173': 'IN',
  'localhost:5174': 'IN', // Current dev port
  'localhost:3000': 'IN',
  '127.0.0.1:5173': 'IN',
  '127.0.0.1:5174': 'IN',
  '127.0.0.1:3000': 'IN',
};

// Inline domain suffix map — avoids circular import with CurrencyContext
const COUNTRY_DOMAIN_MAP: Record<string, string> = {
  US: '.com', GB: '.co.uk', IN: '.in', DE: '.de', FR: '.fr',
  JP: '.jp', AU: '.com.au', NZ: '.co.nz', CA: '.ca',
  AE: '.ae', SG: '.sg', BR: '.br', KR: '.kr',
};

export function getCountryFromDomain(hostname: string): string | null {
  // Remove port for localhost
  const cleanHostname = hostname.replace(/:\d+$/, '');

  // Direct match
  if (DOMAIN_CONFIG[cleanHostname as keyof typeof DOMAIN_CONFIG]) {
    return DOMAIN_CONFIG[cleanHostname as keyof typeof DOMAIN_CONFIG];
  }

  // Check for subdomain (like au.luxtronics.com)
  const parts = cleanHostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    const fullDomain = `${subdomain}.${domain}`;

    if (DOMAIN_CONFIG[fullDomain as keyof typeof DOMAIN_CONFIG]) {
      return DOMAIN_CONFIG[fullDomain as keyof typeof DOMAIN_CONFIG];
    }
  }

  return null;
}

export function getDomainFromCountry(countryCode: string): string {
  return COUNTRY_DOMAIN_MAP[countryCode] || '.com';
}

export function getFullDomain(countryCode: string): string {
  const domain = getDomainFromCountry(countryCode);
  return `luxtronics${domain}`;
}
