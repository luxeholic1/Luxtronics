import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";

export const COOKIE_CONSENT_KEY = "luxtronics_cookie_consent_v1";

type CookieConsentValue = "accepted" | "essential";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): CookieConsentValue | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

function saveConsent(value: CookieConsentValue) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Ignore storage failures; the banner may reappear on private browsers.
  }

  window.dispatchEvent(new CustomEvent("luxtronics-cookie-consent", { detail: value }));

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: value === "accepted" ? "granted" : "denied",
      ad_storage: value === "accepted" ? "granted" : "denied",
      ad_user_data: value === "accepted" ? "granted" : "denied",
      ad_personalization: value === "accepted" ? "granted" : "denied",
    });
  }
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  const choose = (value: CookieConsentValue) => {
    saveConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur sm:bottom-5 sm:p-4">
      <div className="flex gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground sm:text-base">Cookie preferences</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                We use essential cookies for cart, login and checkout. With your permission, we also use analytics cookies to improve product discovery and shopping experience.
              </p>
            </div>
            <button
              type="button"
              onClick={() => choose("essential")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close cookie notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/privacy" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Read Privacy Policy
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
