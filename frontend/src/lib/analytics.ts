export type AnalyticsEventType = "page_view" | "section_view" | "click" | "search" | "product_intent" | "product_view";

export type AnalyticsLocation = {
  timezone?: string;
  locale?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  path: string;
  title: string;
  section?: string;
  label?: string;
  href?: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  countryStore?: string;
  timezone?: string;
  locale?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  productId?: string | number;
  productName?: string;
  productSlug?: string;
  productCategory?: string;
  productPrice?: number;
  sessionId: string;
  timestamp: number;
};

export type LiveVisitor = {
  sessionId: string;
  path: string;
  title: string;
  section?: string;
  lastAction?: string;
  scrollDepth: number;
  source: string;
  medium: string;
  campaign: string;
  device: AnalyticsEvent["device"];
  browser: string;
  countryStore?: string;
  timezone?: string;
  locale?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  currentProductId?: string | number;
  currentProductName?: string;
  currentProductSlug?: string;
  currentProductCategory?: string;
  referrer: string;
  startedAt: number;
  lastSeenAt: number;
  status: "active" | "idle";
};

const STORAGE_KEY = "lux_admin_analytics_events";
const LIVE_STORAGE_KEY = "lux_admin_live_visitors";
const SESSION_KEY = "lux_session_id";
const SESSION_STARTED_KEY = "lux_session_started_at";
const MAX_EVENTS = 1200;
const LIVE_ACTIVE_WINDOW = 30 * 1000;
const LIVE_RETENTION = 10 * 60 * 1000;

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = nowId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getSessionStartedAt() {
  const existing = sessionStorage.getItem(SESSION_STARTED_KEY);
  if (existing) return Number(existing);
  const startedAt = Date.now();
  sessionStorage.setItem(SESSION_STARTED_KEY, String(startedAt));
  return startedAt;
}

export function getDeviceType(): AnalyticsEvent["device"] {
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getBrowserName() {
  const agent = navigator.userAgent;
  if (/Edg/i.test(agent)) return "Edge";
  if (/Chrome/i.test(agent)) return "Chrome";
  if (/Safari/i.test(agent)) return "Safari";
  if (/Firefox/i.test(agent)) return "Firefox";
  return "Browser";
}

export function getApproxLocation(): AnalyticsLocation {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language || "unknown";
  const store = localStorage.getItem("lux_store_code") || "";
  const countryFromLocale = locale.includes("-") ? locale.split("-").pop()?.toUpperCase() : undefined;
  const country =
    store === "IN" ? "India" :
    store === "AU" ? "Australia" :
    store === "NZ" ? "New Zealand" :
    countryFromLocale;

  return { timezone, locale, country };
}

export function getTrafficSource() {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");

  if (source || medium || campaign) {
    return {
      source: source || "utm",
      medium: medium || "unknown",
      campaign: campaign || "not set",
    };
  }

  if (!referrer) {
    return { source: "direct", medium: "none", campaign: "not set" };
  }

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    const searchEngines = ["google.", "bing.", "yahoo.", "duckduckgo.", "yandex."];
    const socials = ["facebook.", "instagram.", "pinterest.", "youtube.", "linkedin.", "x.com", "twitter."];
    if (searchEngines.some((item) => host.includes(item))) return { source: host, medium: "organic", campaign: "not set" };
    if (socials.some((item) => host.includes(item))) return { source: host, medium: "social", campaign: "not set" };
    return { source: host, medium: "referral", campaign: "not set" };
  } catch {
    return { source: "referral", medium: "unknown", campaign: "not set" };
  }
}

export function readAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readLiveVisitors(): LiveVisitor[] {
  try {
    const raw = localStorage.getItem(LIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((visitor) => visitor && Date.now() - Number(visitor.lastSeenAt) < LIVE_RETENTION)
      .map((visitor) => ({
        ...visitor,
        status: Date.now() - Number(visitor.lastSeenAt) < LIVE_ACTIVE_WINDOW ? "active" : "idle",
      }));
  } catch {
    return [];
  }
}

export function clearAnalyticsEvents() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LIVE_STORAGE_KEY);
}

export function updateLiveVisitor(input: Partial<LiveVisitor> = {}) {
  if (typeof window === "undefined") return;

  const traffic = getTrafficSource();
  const location = getApproxLocation();
  const sessionId = getSessionId();
  const existing = readLiveVisitors().find((visitor) => visitor.sessionId === sessionId);
  const visitor: LiveVisitor = {
    sessionId,
    path: input.path || `${window.location.pathname}${window.location.search}`,
    title: input.title || document.title,
    section: input.section ?? existing?.section,
    lastAction: input.lastAction ?? existing?.lastAction,
    scrollDepth: input.scrollDepth ?? existing?.scrollDepth ?? 0,
    source: input.source || existing?.source || traffic.source,
    medium: input.medium || existing?.medium || traffic.medium,
    campaign: input.campaign || existing?.campaign || traffic.campaign,
    device: getDeviceType(),
    browser: getBrowserName(),
    countryStore: localStorage.getItem("lux_store_code") || existing?.countryStore,
    timezone: input.timezone || existing?.timezone || location.timezone,
    locale: input.locale || existing?.locale || location.locale,
    country: input.country || existing?.country || location.country,
    city: input.city || existing?.city || location.city,
    latitude: input.latitude ?? existing?.latitude ?? location.latitude,
    longitude: input.longitude ?? existing?.longitude ?? location.longitude,
    currentProductId: input.currentProductId ?? existing?.currentProductId,
    currentProductName: input.currentProductName ?? existing?.currentProductName,
    currentProductSlug: input.currentProductSlug ?? existing?.currentProductSlug,
    currentProductCategory: input.currentProductCategory ?? existing?.currentProductCategory,
    referrer: document.referrer || existing?.referrer || "direct",
    startedAt: existing?.startedAt || getSessionStartedAt(),
    lastSeenAt: Date.now(),
    status: "active",
  };

  const visitors = [visitor, ...readLiveVisitors().filter((item) => item.sessionId !== sessionId)]
    .filter((item) => Date.now() - item.lastSeenAt < LIVE_RETENTION)
    .slice(0, 200);

  localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(visitors));
  window.dispatchEvent(new CustomEvent("lux-live-visitor", { detail: visitor }));

  const endpoint = import.meta.env.VITE_ANALYTICS_LIVE_ENDPOINT || "/api/analytics/live";
  const body = JSON.stringify(visitor);
  fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

export async function fetchRemoteLiveVisitors(): Promise<LiveVisitor[]> {
  const endpoint = import.meta.env.VITE_ANALYTICS_LIVE_ENDPOINT || "/api/analytics/live";
  try {
    const response = await fetch(endpoint, { headers: { "Accept": "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
    const visitors = Array.isArray(payload) ? payload : payload?.visitors;
    return Array.isArray(visitors) ? visitors : [];
  } catch {
    return [];
  }
}

export async function fetchRemoteAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const endpoint = import.meta.env.VITE_ANALYTICS_EVENTS_ENDPOINT || "/api/analytics/events";
  try {
    const response = await fetch(endpoint, { headers: { "Accept": "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
    const events = Array.isArray(payload) ? payload : payload?.events;
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function trackAnalyticsEvent(input: Partial<AnalyticsEvent> & { type: AnalyticsEventType }) {
  if (typeof window === "undefined") return;

  const traffic = getTrafficSource();
  const location = getApproxLocation();
  const event: AnalyticsEvent = {
    id: nowId(),
    type: input.type,
    path: input.path || `${window.location.pathname}${window.location.search}`,
    title: input.title || document.title,
    section: input.section,
    label: input.label,
    href: input.href,
    referrer: document.referrer || "direct",
    source: input.source || traffic.source,
    medium: input.medium || traffic.medium,
    campaign: input.campaign || traffic.campaign,
    device: getDeviceType(),
    browser: getBrowserName(),
    countryStore: localStorage.getItem("lux_store_code") || undefined,
    timezone: input.timezone || location.timezone,
    locale: input.locale || location.locale,
    country: input.country || location.country,
    city: input.city || location.city,
    latitude: input.latitude ?? location.latitude,
    longitude: input.longitude ?? location.longitude,
    productId: input.productId,
    productName: input.productName,
    productSlug: input.productSlug,
    productCategory: input.productCategory,
    productPrice: input.productPrice,
    sessionId: getSessionId(),
    timestamp: Date.now(),
  };

  const events = [event, ...readAnalyticsEvents()].slice(0, MAX_EVENTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  updateLiveVisitor({
    path: event.path,
    title: event.title,
    section: event.section,
    lastAction: event.label || event.section || event.type.replace("_", " "),
    currentProductId: event.productId,
    currentProductName: event.productName,
    currentProductSlug: event.productSlug,
    currentProductCategory: event.productCategory,
  });

  window.dispatchEvent(new CustomEvent("lux-analytics-event", { detail: event }));

  if (typeof window.gtag === "function") {
    window.gtag("event", event.type, {
      event_category: "site_monitoring",
      event_label: event.label || event.section || event.path,
      page_path: event.path,
      traffic_source: event.source,
      traffic_medium: event.medium,
    });
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || "/api/analytics/events";
  if (endpoint) {
    const body = JSON.stringify(event);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
