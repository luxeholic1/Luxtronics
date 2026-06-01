/**
 * GeoRedirectPopup
 * Jeep-style country selector popup.
 * Shows immediately on AU/NZ domains so visitors can continue there
 * or switch back to the India store. On the India domain, it still
 * suggests AU/NZ when IP detection says the user is there.
 *
 * Three stores:
 *   India   → luxtronics.in
 *   Australia → luxtronics.com.au
 *   New Zealand → luxtronics.co.nz
 */

import { useEffect, useState } from "react";
import { X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreOption {
  country: string;
  code: string;
  flag: string;
  domain: string;
  currency: string;
  symbol: string;
}

const STORES: StoreOption[] = [
  { country: "India",       code: "IN", flag: "🇮🇳", domain: "luxtronics.in",     currency: "INR", symbol: "₹"   },
  { country: "Australia",   code: "AU", flag: "🇦🇺", domain: "luxtronics.com.au", currency: "AUD", symbol: "A$"  },
  { country: "New Zealand", code: "NZ", flag: "🇳🇿", domain: "luxtronics.co.nz",  currency: "NZD", symbol: "NZ$" },
];

// Map IP country codes → our store codes
const IP_TO_STORE: Record<string, string> = {
  IN: "IN",
  AU: "AU", NZ: "NZ",
  // Nearby / common fallbacks
  PK: "IN", BD: "IN", LK: "IN", NP: "IN",
};

const STORAGE_KEY_PREFIX = "lux_geo_prompt_v2";
const DEFAULT_HOME_STORE = "IN";

function getCurrentStoreCode(): string {
  const host = window.location.hostname.replace(/^www\./, "");
  if (host.endsWith(".com.au")) return "AU";
  if (host.endsWith(".co.nz"))  return "NZ";
  if (host.endsWith(".in"))     return "IN";
  return "IN"; // localhost / unknown → India
}

async function detectIPCountry(): Promise<string | null> {
  const providers = [
    {
      url: "https://ipapi.co/json/?fields=country_code",
      parse: (data: { country_code?: string }) => data.country_code,
    },
    {
      url: "https://ipwho.is/",
      parse: (data: { country_code?: string; success?: boolean }) => data.success === false ? null : data.country_code,
    },
  ];

  for (const provider of providers) {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 3000);
      const res = await fetch(provider.url, { signal: controller.signal, cache: "no-store" });
      window.clearTimeout(timer);
      const data = await res.json();
      const code = provider.parse(data);
      if (code) return code.toUpperCase();
    } catch {
      // Try the next provider.
    }
  }

  return null;
}

export default function GeoRedirectPopup() {
  const [show, setShow]           = useState(false);
  const [suggestedCode, setSuggested] = useState<string | null>(null);
  const currentCode = getCurrentStoreCode();
  const currentStore  = STORES.find(s => s.code === currentCode)!;
  const suggestedStore = STORES.find(s => s.code === suggestedCode);
  const storageKey = suggestedCode
    ? `${STORAGE_KEY_PREFIX}_${currentCode}_to_${suggestedCode}`
    : `${STORAGE_KEY_PREFIX}_${currentCode}`;

  useEffect(() => {
    // AU/NZ domains must always offer India as the home-store switch.
    if (currentCode !== DEFAULT_HOME_STORE) {
      const key = `${STORAGE_KEY_PREFIX}_${currentCode}_to_${DEFAULT_HOME_STORE}`;
      if (sessionStorage.getItem(key)) return;
      setSuggested(DEFAULT_HOME_STORE);
      setShow(true);
      return;
    }

    const dismissedPrefix = `${STORAGE_KEY_PREFIX}_${currentCode}_to_`;
    const dismissedAny = Object.keys(sessionStorage).some((key) => key.startsWith(dismissedPrefix));
    if (dismissedAny) return;

    detectIPCountry().then(ipCode => {
      if (!ipCode) return;
      const storeCode = IP_TO_STORE[ipCode] || null;
      if (!storeCode) return;                    // country not in our stores
      if (storeCode === currentCode) return;     // already on correct domain
      setSuggested(storeCode);
      setShow(true);
    });
  }, [currentCode]);

  const dismiss = () => {
    sessionStorage.setItem(storageKey, "1");
    setShow(false);
  };

  const goToStore = (domain: string) => {
    sessionStorage.setItem(storageKey, "1");
    window.location.href = `https://${domain}`;
  };

  return (
    <AnimatePresence>
      {show && suggestedStore && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-background border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="font-display font-bold text-lg">Choose Your Store</span>
                </div>
                <button
                  onClick={dismiss}
                  className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  You are currently in the <strong className="text-foreground">{currentStore.country}</strong> store.
                  Continue here or switch to the <strong className="text-foreground">{suggestedStore.country}</strong> store
                  for the right currency and availability.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Suggested store */}
                  <button
                    onClick={() => goToStore(suggestedStore.domain)}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    <span className="text-5xl">{suggestedStore.flag}</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{suggestedStore.country}</p>
                      <p className="text-xs text-muted-foreground">{suggestedStore.symbol} {suggestedStore.currency}</p>
                    </div>
                    <span className="w-full text-center text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Go to {suggestedStore.country} →
                    </span>
                  </button>

                  {/* Current store */}
                  <button
                    onClick={dismiss}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-primary/40 transition-all"
                  >
                    <span className="text-5xl">{currentStore.flag}</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{currentStore.country}</p>
                      <p className="text-xs text-muted-foreground">{currentStore.symbol} {currentStore.currency}</p>
                    </div>
                    <span className="w-full text-center text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1.5 group-hover:border-primary/40 transition-all">
                      Stay on {currentStore.country}
                    </span>
                  </button>
                </div>

                {/* All stores link */}
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground mb-3">All available stores</p>
                  <div className="flex justify-center gap-3">
                    {STORES.map(store => (
                      <button
                        key={store.code}
                        onClick={() => goToStore(store.domain)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          store.code === currentCode
                            ? "border-primary/40 bg-primary/5 text-primary"
                            : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{store.flag}</span>
                        <span>{store.country}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
