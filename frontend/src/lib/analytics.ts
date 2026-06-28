export type AnalyticsEventType =
  | "page_view"
  | "section_view"
  | "click"
  | "search"
  | "product_intent"
  | "product_view"
  | "location_resolved";

export type AnalyticsLocation = {
  timezone?: string;
  locale?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  path: string;
  title: string;
  siteHost: string;
  siteLabel: string;
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
  accuracy?: number;
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
  siteHost: string;
  siteLabel: string;
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
  accuracy?: number;
  currentProductId?: string | number;
  currentProductName?: string;
  currentProductSlug?: string;
  currentProductCategory?: string;
  referrer: string;
  startedAt: number;
  lastSeenAt: number;
  status: "active" | "idle";
};

const COOKIE_CONSENT_KEY = "luxtronics_cookie_consent_v1";

// Shared gate so every call site (not just AnalyticsTracker) skips tracking
// without consent and on /admin routes. Without this, e.g. a page-level
// useEffect calling trackAnalyticsEvent directly fires for every visitor
// including crawlers (Googlebot/GoogleOther render pages with JS enabled),
// regardless of cookie consent.
export function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

const STORAGE_KEY = "lux_admin_analytics_events";
const LIVE_STORAGE_KEY = "lux_admin_live_visitors";
const SESSION_KEY = "lux_session_id";
const SESSION_STARTED_KEY = "lux_session_started_at";
const IP_LOCATION_KEY = "lux_ip_location";
const IP_LOCATION_ATTEMPTED_KEY = "lux_ip_location_attempted";
const PRECISE_LOCATION_KEY = "lux_precise_location";
const PRECISE_LOCATION_ATTEMPTED_KEY = "lux_precise_location_attempted";
const MAX_EVENTS = 1200;
const LIVE_ACTIVE_WINDOW = 30 * 1000;
const LIVE_RETENTION = 10 * 60 * 1000;
const CENTRAL_ANALYTICS_ORIGIN = "https://luxtronics.in";
let ipLocationRequestStarted = false;
let preciseLocationRequestStarted = false;

// Every click/section-view/search calls updateLiveVisitor, which used to POST
// immediately and unconditionally. A burst of interaction (rapid clicks,
// several sections crossing the viewport at once) turned into one proxied
// request per event with no ceiling, each tying up an Apache process via
// mod_proxy on shared hosting. Throttle the network leg so a burst costs at
// most ~2 requests per window instead of one per interaction.
const LIVE_VISITOR_POST_INTERVAL_MS = 4000;
let liveVisitorPostTimer: number | null = null;
let pendingLiveVisitorPost: LiveVisitor | null = null;

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function getSiteHost() {
  return window.location.hostname.replace(/^www\./, "") || "luxtronics.in";
}

function getSiteLabel(host = getSiteHost()) {
  if (host.includes("com.au")) return "Australia";
  if (host.includes("co.nz")) return "New Zealand";
  return "India";
}

function getAnalyticsEndpoint(path: string, override?: string) {
  if (override) return override;
  const host = getSiteHost();
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const base = isLocal ? "" : CENTRAL_ANALYTICS_ORIGIN;
  return `${base}${path}`;
}

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
  const ipLocation = readStoredIpLocation();
  const countryFromLocale = locale.includes("-") ? locale.split("-").pop()?.toUpperCase() : undefined;
  const countryFromTimezone =
    timezone?.startsWith("Asia/") ? "India" :
    timezone?.startsWith("Australia/") ? "Australia" :
    timezone?.startsWith("Pacific/Auckland") ? "New Zealand" :
    undefined;
  const country =
    ipLocation.country ||
    (store === "IN" ? "India" :
    store === "AU" ? "Australia" :
    store === "NZ" ? "New Zealand" :
    undefined) ||
    countryFromTimezone ||
    countryFromLocale;

  return {
    timezone,
    locale,
    country,
    city: ipLocation.city,
    latitude: ipLocation.latitude,
    longitude: ipLocation.longitude,
  };
}

function readStoredIpLocation(): AnalyticsLocation {
  try {
    const raw = sessionStorage.getItem(IP_LOCATION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      city: typeof parsed?.city === "string" ? parsed.city : undefined,
      country: typeof parsed?.country === "string" ? parsed.country : undefined,
      timezone: typeof parsed?.timezone === "string" ? parsed.timezone : undefined,
      latitude: typeof parsed?.latitude === "number" ? parsed.latitude : undefined,
      longitude: typeof parsed?.longitude === "number" ? parsed.longitude : undefined,
    };
  } catch {
    return {};
  }
}

function storeIpLocation(location: AnalyticsLocation) {
  try {
    sessionStorage.setItem(IP_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Best-effort only. Analytics should never break the storefront.
  }
}

function requestIpLocation() {
  if (ipLocationRequestStarted) return;
  if (readStoredIpLocation().city || sessionStorage.getItem(IP_LOCATION_ATTEMPTED_KEY) === "1") return;
  if (window.location.pathname.startsWith("/admin")) return;

  ipLocationRequestStarted = true;
  try {
    sessionStorage.setItem(IP_LOCATION_ATTEMPTED_KEY, "1");
  } catch {
    // Ignore storage failures and still try the network lookup.
  }

  fetch("https://ipapi.co/json/?fields=city,region,country_name,country_code,latitude,longitude,timezone", {
    headers: { Accept: "application/json" },
  })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => {
      if (!data || typeof data !== "object") return;
      const location: AnalyticsLocation = {
        city: typeof data.city === "string" && data.city ? data.city : undefined,
        country: typeof data.country_name === "string" && data.country_name ? data.country_name : data.country_code,
        timezone: typeof data.timezone === "string" ? data.timezone : undefined,
        latitude: typeof data.latitude === "number" ? Number(data.latitude.toFixed(6)) : undefined,
        longitude: typeof data.longitude === "number" ? Number(data.longitude.toFixed(6)) : undefined,
      };

      if (!location.city && !location.country) return;
      storeIpLocation(location);
      updateLiveVisitor({
        ...location,
        lastAction: location.city ? `City resolved: ${location.city}` : "Location resolved",
      });
      trackAnalyticsEvent({
        type: "location_resolved",
        label: location.city ? `IP city: ${location.city}` : "IP location",
        ...location,
      });
    })
    .catch(() => {
      // IP lookup is helpful, not required.
    });
}

function readStoredPreciseLocation(): AnalyticsLocation {
  try {
    const raw = sessionStorage.getItem(PRECISE_LOCATION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed?.latitude !== "number" || typeof parsed?.longitude !== "number") return {};
    return {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      accuracy: typeof parsed.accuracy === "number" ? parsed.accuracy : undefined,
    };
  } catch {
    return {};
  }
}

function storePreciseLocation(location: AnalyticsLocation) {
  try {
    sessionStorage.setItem(PRECISE_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Best-effort only. Analytics should never break the storefront.
  }
}

function canRequestPreciseLocation() {
  if (preciseLocationRequestStarted) return false;
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return false;
  if (sessionStorage.getItem(PRECISE_LOCATION_ATTEMPTED_KEY) === "1") return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  return window.location.protocol === "https:" || window.location.hostname === "localhost";
}

function requestPreciseLocation() {
  if (!canRequestPreciseLocation()) return;

  preciseLocationRequestStarted = true;
  try {
    sessionStorage.setItem(PRECISE_LOCATION_ATTEMPTED_KEY, "1");
  } catch {
    // Ignore storage failures and still try the browser permission flow.
  }

  window.setTimeout(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const preciseLocation: AnalyticsLocation = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy || 0),
        };

        storePreciseLocation(preciseLocation);
        updateLiveVisitor({
          ...preciseLocation,
          lastAction: preciseLocation.accuracy
            ? `Exact location resolved +/- ${preciseLocation.accuracy}m`
            : "Exact location resolved",
        });
        trackAnalyticsEvent({
          type: "location_resolved",
          label: preciseLocation.accuracy
            ? `Exact GPS +/- ${preciseLocation.accuracy}m`
            : "Exact GPS",
          ...preciseLocation,
        });
      },
      () => {
        // Permission denied or unavailable. Approximate location remains active.
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, 1800);
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
  if (typeof window === "undefined" || !isAnalyticsAllowed()) return;

  const traffic = getTrafficSource();
  const location = getApproxLocation();
  const preciseLocation = readStoredPreciseLocation();
  const sessionId = getSessionId();
  const siteHost = getSiteHost();
  const siteLabel = getSiteLabel(siteHost);
  const existing = readLiveVisitors().find((visitor) => visitor.sessionId === sessionId);
  const visitor: LiveVisitor = {
    sessionId,
    siteHost: input.siteHost || existing?.siteHost || siteHost,
    siteLabel: input.siteLabel || existing?.siteLabel || siteLabel,
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
    latitude: input.latitude ?? existing?.latitude ?? preciseLocation.latitude ?? location.latitude,
    longitude: input.longitude ?? existing?.longitude ?? preciseLocation.longitude ?? location.longitude,
    accuracy: input.accuracy ?? existing?.accuracy ?? preciseLocation.accuracy ?? location.accuracy,
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

  scheduleLiveVisitorPost(visitor);
  requestIpLocation();
  requestPreciseLocation();
}

function postLiveVisitor(visitor: LiveVisitor) {
  const endpoint = getAnalyticsEndpoint("/api/analytics/live", import.meta.env.VITE_ANALYTICS_LIVE_ENDPOINT);
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(visitor),
    keepalive: true,
  }).catch(() => {});
}

function scheduleLiveVisitorPost(visitor: LiveVisitor) {
  pendingLiveVisitorPost = visitor;
  if (liveVisitorPostTimer) return;

  postLiveVisitor(visitor);
  pendingLiveVisitorPost = null;
  liveVisitorPostTimer = window.setTimeout(() => {
    liveVisitorPostTimer = null;
    if (pendingLiveVisitorPost) {
      postLiveVisitor(pendingLiveVisitorPost);
      pendingLiveVisitorPost = null;
    }
  }, LIVE_VISITOR_POST_INTERVAL_MS);
}

export async function fetchRemoteLiveVisitors(): Promise<LiveVisitor[]> {
  const endpoint = getAnalyticsEndpoint("/api/analytics/live", import.meta.env.VITE_ANALYTICS_LIVE_ENDPOINT);
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
  const endpoint = getAnalyticsEndpoint("/api/analytics/events", import.meta.env.VITE_ANALYTICS_EVENTS_ENDPOINT);
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

export function trackAnalyticsEvent(
  input: Partial<AnalyticsEvent> & { type: AnalyticsEventType },
  liveOverrides?: Partial<LiveVisitor>,
) {
  if (typeof window === "undefined" || !isAnalyticsAllowed()) return;

  const traffic = getTrafficSource();
  const location = getApproxLocation();
  const preciseLocation = readStoredPreciseLocation();
  const siteHost = getSiteHost();
  const siteLabel = getSiteLabel(siteHost);
  const event: AnalyticsEvent = {
    id: nowId(),
    type: input.type,
    path: input.path || `${window.location.pathname}${window.location.search}`,
    title: input.title || document.title,
    siteHost: input.siteHost || siteHost,
    siteLabel: input.siteLabel || siteLabel,
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
    latitude: input.latitude ?? preciseLocation.latitude ?? location.latitude,
    longitude: input.longitude ?? preciseLocation.longitude ?? location.longitude,
    accuracy: input.accuracy ?? preciseLocation.accuracy ?? location.accuracy,
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
    siteHost: event.siteHost,
    siteLabel: event.siteLabel,
    section: event.section,
    lastAction: event.label || event.section || event.type.replace("_", " "),
    currentProductId: event.productId,
    currentProductName: event.productName,
    currentProductSlug: event.productSlug,
    currentProductCategory: event.productCategory,
    ...liveOverrides,
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

  const endpoint = getAnalyticsEndpoint("/api/analytics/events", import.meta.env.VITE_ANALYTICS_ENDPOINT);
  if (endpoint) {
    const body = JSON.stringify(event);
    const isCrossOrigin = endpoint.startsWith("http") && !endpoint.startsWith(window.location.origin);
    if (navigator.sendBeacon && !isCrossOrigin) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }
  requestIpLocation();
  requestPreciseLocation();
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
