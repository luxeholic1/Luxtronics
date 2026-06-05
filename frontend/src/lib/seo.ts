const PRIMARY_SITE_URL = "https://luxtronics.in";

const SITE_URLS: Record<string, string> = {
  "luxtronics.in": "https://luxtronics.in",
  "www.luxtronics.in": "https://luxtronics.in",
  "luxtronics.com.au": "https://luxtronics.com.au",
  "www.luxtronics.com.au": "https://luxtronics.com.au",
  "luxtronics.co.nz": "https://luxtronics.co.nz",
  "www.luxtronics.co.nz": "https://luxtronics.co.nz",
};

export const MARKET_CURRENCY: Record<string, string> = {
  IN: "INR",
  AU: "AUD",
  NZ: "NZD",
};

const MARKET_COUNTRIES = ["IN", "AU", "NZ"] as const;

const DAY_UNIT = "DAY";

const servicePeriod = (minValue: number, maxValue: number) => ({
  "@type": "ServicePeriod",
  businessDays: [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday",
  ],
  duration: {
    "@type": "QuantitativeValue",
    minValue,
    maxValue,
    unitCode: DAY_UNIT,
  },
});

const shippingDeliveryTime = () => ({
  "@type": "ShippingDeliveryTime",
  handlingTime: {
    "@type": "QuantitativeValue",
    minValue: 0,
    maxValue: 2,
    unitCode: DAY_UNIT,
  },
  transitTime: {
    "@type": "QuantitativeValue",
    minValue: 3,
    maxValue: 7,
    unitCode: DAY_UNIT,
  },
});

const toPlainNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  const normalized = value
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toSchemaPrice = (value: unknown) => {
  const safeValue = toPlainNumber(value);
  return safeValue.toFixed(2);
};

export const toSchemaInteger = (value: unknown) => Math.max(0, Math.round(toPlainNumber(value)));

export const merchantReturnPolicySchema = (countryCode: string) => ({
  "@type": "MerchantReturnPolicy",
  "@id": `${getSiteUrl()}/shipping-returns#return-policy-${countryCode.toLowerCase()}`,
  applicableCountry: countryCode,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  refundType: "https://schema.org/FullRefund",
  merchantReturnLink: `${getSiteUrl()}/shipping-returns`,
});

export const shippingServiceSchema = (countryCode: string) => ({
  "@type": "ShippingService",
  "@id": `${getSiteUrl()}/shipping-returns#standard-shipping-${countryCode.toLowerCase()}`,
  name: `Standard shipping - ${countryCode}`,
  description: "Standard delivery for eligible Luxtronics orders. Final charges are shown before payment.",
  fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
  handlingTime: servicePeriod(0, 2),
  shippingConditions: {
    "@type": "ShippingConditions",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: countryCode,
    },
    transitTime: servicePeriod(3, 7),
  },
});

export const offerShippingDetailsSchema = ({
  countryCode,
  currency,
  maxShippingValue,
}: {
  countryCode: string;
  currency: string;
  maxShippingValue: number;
}) => ({
  "@type": "OfferShippingDetails",
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: countryCode,
  },
  shippingRate: {
    "@type": "MonetaryAmount",
    currency,
    maxValue: toSchemaPrice(maxShippingValue),
  },
  deliveryTime: shippingDeliveryTime(),
});

export const offerReturnPolicyReference = (countryCode: string) => ({
  "@id": `${getSiteUrl()}/shipping-returns#return-policy-${countryCode.toLowerCase()}`,
});

export const getSiteUrl = () => {
  if (typeof window === "undefined") return PRIMARY_SITE_URL;
  return SITE_URLS[window.location.hostname] ?? PRIMARY_SITE_URL;
};

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
};

export const cleanText = (value = "", maxLength = 160) => {
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${getSiteUrl()}/#organization`,
  name: "Luxtronics",
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/logo.jpeg`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-92664-33722",
    contactType: "customer support",
    areaServed: ["IN", "AU", "NZ"],
    availableLanguage: ["en"],
  },
  sameAs: [
    "https://luxtronics.in",
    "https://luxtronics.com.au",
    "https://luxtronics.co.nz",
  ],
  hasMerchantReturnPolicy: MARKET_COUNTRIES.map((countryCode) => merchantReturnPolicySchema(countryCode)),
  hasShippingService: MARKET_COUNTRIES.map((countryCode) => shippingServiceSchema(countryCode)),
});

export const websiteSchema = (description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${getSiteUrl()}/#website`,
  name: "Luxtronics",
  url: getSiteUrl(),
  description,
  inLanguage: "en",
  publisher: {
    "@id": `${getSiteUrl()}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${getSiteUrl()}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbSchema = (items: Array<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
