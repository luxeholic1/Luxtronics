import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", exchangeRate: 1.53, domain: ".au" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$", exchangeRate: 1.36, domain: ".ca" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", currencySymbol: "AED", exchangeRate: 3.67, domain: ".ae" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", currencySymbol: "S$", exchangeRate: 1.34, domain: ".sg" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", exchangeRate: 4.97, domain: ".br" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", exchangeRate: 1320, domain: ".kr" },
];

type CurrencyContextType = {
  country: CountryInfo;
  setCountry: (c: CountryInfo) => void;
  formatPrice: (usdPrice: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountryState] = useState<CountryInfo>(() => {
    try {
      const saved = sessionStorage.getItem("lux_country");
      if (saved) {
        const parsed = JSON.parse(saved);
        return countries.find((c) => c.code === parsed.code) ?? countries[0];
      }
    } catch {}
    return countries[0];
  });

  const setCountry = (c: CountryInfo) => {
    sessionStorage.setItem("lux_country", JSON.stringify(c));
    setCountryState(c);
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = usdPrice * country.exchangeRate;
    // JPY and KRW don't use decimals
    const noDecimals = ["JPY", "KRW"].includes(country.currency);
    const formatted = noDecimals
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)$/, "$10");
    return `${country.currencySymbol}${Number(noDecimals ? Math.round(converted) : converted.toFixed(2)).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
