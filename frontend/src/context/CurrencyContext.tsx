import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCountryFromDomain } from "@/lib/domain-config";

// Country code to currency mapping for IP geolocation
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'US': 'US', 'CA': 'CA', 'GB': 'GB', 'AU': 'AU', 'NZ': 'NZ',
  'IN': 'IN', 'DE': 'DE', 'FR': 'FR', 'JP': 'JP', 'KR': 'KR',
  'AE': 'AE', 'SG': 'SG', 'BR': 'BR'
};

export type CountryInfo = {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // relative to USD
  domain: string;
};

export const countries: CountryInfo[] = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", exchangeRate: 1, domain: ".com" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", exchangeRate: 0.79, domain: ".co.uk" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", currencySymbol: "₹", exchangeRate: 83.5, domain: ".in" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", exchangeRate: 0.92, domain: ".de" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", exchangeRate: 0.92, domain: ".fr" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥", exchangeRate: 149.5, domain: ".jp" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", exchangeRate: 1.53, domain: ".com.au" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "NZD", currencySymbol: "NZ$", exchangeRate: 1.67, domain: ".co.nz" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", exchangeRate: 1.36, domain: ".ca" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", currencySymbol: "AED", exchangeRate: 3.67, domain: ".ae" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", currencySymbol: "S$", exchangeRate: 1.34, domain: ".sg" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", exchangeRate: 4.97, domain: ".br" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", exchangeRate: 1320, domain: ".kr" },
];

// Geolocation function using IP-API (free service)
async function detectUserCountry(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/?fields=country_code');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.warn('Geolocation failed:', error);
    return null;
  }
}

type CurrencyContextType = {
  country: CountryInfo;
  setCountry: (c: CountryInfo) => void;
  formatPrice: (usdPrice: number) => string;
  isLoadingLocation: boolean;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountryState] = useState<CountryInfo>(() => {
    try {
      const saved = sessionStorage.getItem("lux_country");
      if (saved) {
        const parsed = JSON.parse(saved);
        return countries.find((c) => c.code === parsed.code) ?? countries[2]; // Default to India
      }
    } catch { }
    return countries[2]; // Default to India
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Auto-detect location on first visit
  useEffect(() => {
    const initializeLocation = async () => {
      // Check if user has already selected a country manually
      const hasManualSelection = sessionStorage.getItem("lux_country_manual");
      if (hasManualSelection) return;

      // Check if we already detected location in this session
      const hasDetectedLocation = sessionStorage.getItem("lux_location_detected");
      if (hasDetectedLocation) return;

      setIsLoadingLocation(true);
      try {
        // First, try domain-based detection
        const hostname = window.location.hostname;
        const domainCountryCode = getCountryFromDomain(hostname);

        if (domainCountryCode) {
          const detectedCountry = countries.find(c => c.code === domainCountryCode);
          if (detectedCountry && detectedCountry.code !== country.code) {
            setCountryState(detectedCountry);
            sessionStorage.setItem("lux_country", JSON.stringify(detectedCountry));
            sessionStorage.setItem("lux_location_detected", "true");
            setIsLoadingLocation(false);
            return;
          }
        }

        // Fallback to IP geolocation
        const ipCountryCode = await detectUserCountry();
        if (ipCountryCode) {
          const detectedCountry = countries.find(c => c.code === ipCountryCode);
          if (detectedCountry && detectedCountry.code !== country.code) {
            setCountryState(detectedCountry);
            sessionStorage.setItem("lux_country", JSON.stringify(detectedCountry));
          }
        }

        sessionStorage.setItem("lux_location_detected", "true");
      } catch (error) {
        console.warn('Failed to detect location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    initializeLocation();
  }, []);

  const setCountry = (c: CountryInfo) => {
    sessionStorage.setItem("lux_country", JSON.stringify(c));
    sessionStorage.setItem("lux_country_manual", "true"); // Mark as manual selection
    setCountryState(c);
  };

  const formatPrice = (inrPrice: number): string => {
    // Convert INR to USD first, then to target currency
    const usdPrice = inrPrice / countries[2].exchangeRate; // INR to USD
    const converted = usdPrice * country.exchangeRate; // USD to target
    // JPY and KRW don't use decimals
    const noDecimals = ["JPY", "KRW"].includes(country.currency);
    return `${country.currencySymbol}${Number(noDecimals ? Math.round(converted) : converted.toFixed(2)).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatPrice, isLoadingLocation }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
