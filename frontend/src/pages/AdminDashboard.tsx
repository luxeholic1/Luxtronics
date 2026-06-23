import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  Clock,
  Crosshair,
  Eye,
  Gauge,
  Globe2,
  LocateFixed,
  MapPin,
  MousePointerClick,
  Package,
  Radio,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAnalyticsEvents,
  fetchRemoteAnalyticsEvents,
  fetchRemoteLiveVisitors,
  readAnalyticsEvents,
  readLiveVisitors,
  type AnalyticsEvent,
  type LiveVisitor,
} from "@/lib/analytics";

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(timestamp);

const countBy = (events: AnalyticsEvent[], getKey: (event: AnalyticsEvent) => string | undefined) => {
  const counts = new Map<string, number>();
  events.forEach((event) => {
    const key = getKey(event);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const shortSession = (sessionId: string) => sessionId.slice(-7).toUpperCase();

const getLocationLabel = (item: Pick<AnalyticsEvent | LiveVisitor, "city" | "country" | "timezone" | "locale">) =>
  [item.city, item.country].filter(Boolean).join(", ") || item.timezone || item.locale || "Unknown";

const hasCoordinates = (item: Pick<AnalyticsEvent | LiveVisitor, "latitude" | "longitude">) =>
  typeof item.latitude === "number" && typeof item.longitude === "number";

const getPrecisionLabel = (item: Pick<AnalyticsEvent | LiveVisitor, "accuracy" | "latitude" | "longitude">) => {
  if (!hasCoordinates(item)) return "Approximate";
  return typeof item.accuracy === "number" && item.accuracy > 0
    ? `Exact GPS · +/- ${Math.round(item.accuracy)}m`
    : "Exact GPS";
};

const getProductKey = (event: AnalyticsEvent) => {
  if (event.productName) return event.productSlug || event.productName;
  const match = event.path.match(/^\/product\/([^/?#]+)/);
  return match?.[1];
};

const getSiteLabel = (item: Pick<AnalyticsEvent | LiveVisitor, "siteHost" | "siteLabel">) => {
  if (item.siteLabel) return item.siteLabel;
  if (item.siteHost?.includes("com.au")) return "Australia";
  if (item.siteHost?.includes("co.nz")) return "New Zealand";
  return "India";
};

const getSiteHost = (item: Pick<AnalyticsEvent | LiveVisitor, "siteHost">) =>
  item.siteHost || "luxtronics.in";

const getMapQuery = (visitor?: LiveVisitor) => {
  if (!visitor) return "World";
  if (hasCoordinates(visitor)) return `${visitor.latitude},${visitor.longitude}`;
  const label = getLocationLabel(visitor);
  return label === "Unknown" ? "World" : label;
};

const getGoogleSatelliteMapUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&t=k&z=${query === "World" ? "2" : "5"}&output=embed`;

const getGoogleEarthUrl = (query: string) =>
  `https://earth.google.com/web/search/${encodeURIComponent(query)}`;

const StatCard = ({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <Card className="border-border/70 bg-card/80">
    <CardContent className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="mt-1 font-display text-2xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => readAnalyticsEvents());
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>(() => readLiveVisitors());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [followedSessionId, setFollowedSessionId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState("all");
  const [liveOnly, setLiveOnly] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const remoteEvents = await fetchRemoteAnalyticsEvents();
      setEvents(remoteEvents.length > 0 ? remoteEvents : readAnalyticsEvents());
      const remoteVisitors = await fetchRemoteLiveVisitors();
      setLiveVisitors(remoteVisitors.length > 0 ? remoteVisitors : readLiveVisitors());
    };

    // Polling at 2.5s indefinitely (even with the tab backgrounded for hours,
    // which is exactly how this dashboard tends to be left open) was a steady
    // background load of 2 requests every cycle. 8s is still effectively
    // "live" for a human glancing at a dashboard, and pausing while hidden
    // removes the load entirely when nobody's looking.
    let interval: number | undefined;
    const start = () => {
      if (interval) return;
      refresh();
      interval = window.setInterval(refresh, 8000);
    };
    const stop = () => {
      if (!interval) return;
      window.clearInterval(interval);
      interval = undefined;
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    start();
    window.addEventListener("lux-analytics-event", refresh);
    window.addEventListener("lux-live-visitor", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      window.removeEventListener("lux-analytics-event", refresh);
      window.removeEventListener("lux-live-visitor", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const siteOptions = useMemo(() => {
    const sites = new Map<string, { host: string; label: string; live: number; events: number }>();
    liveVisitors.forEach((visitor) => {
      const host = getSiteHost(visitor);
      const existing = sites.get(host) || { host, label: getSiteLabel(visitor), live: 0, events: 0 };
      if (Date.now() - visitor.lastSeenAt < 30 * 1000) existing.live += 1;
      sites.set(host, existing);
    });
    events.forEach((event) => {
      const host = getSiteHost(event);
      const existing = sites.get(host) || { host, label: getSiteLabel(event), live: 0, events: 0 };
      existing.events += 1;
      sites.set(host, existing);
    });
    return [...sites.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [events, liveVisitors]);

  const visibleEvents = useMemo(
    () => selectedSite === "all" ? events : events.filter((event) => getSiteHost(event) === selectedSite),
    [events, selectedSite],
  );

  const visibleLiveVisitors = useMemo(() => {
    const scoped = selectedSite === "all"
      ? liveVisitors
      : liveVisitors.filter((visitor) => getSiteHost(visitor) === selectedSite);
    return liveOnly ? scoped.filter((visitor) => Date.now() - visitor.lastSeenAt < 30 * 1000) : scoped;
  }, [liveVisitors, liveOnly, selectedSite]);

  const stats = useMemo(() => {
    const pageViews = visibleEvents.filter((event) => event.type === "page_view");
    const clicks = visibleEvents.filter((event) => event.type === "click" || event.type === "product_intent");
    const searches = visibleEvents.filter((event) => event.type === "search");
    const sections = visibleEvents.filter((event) => event.type === "section_view");
    const sessions = new Set(visibleEvents.map((event) => event.sessionId)).size;
    const lastHour = visibleEvents.filter((event) => Date.now() - event.timestamp < 60 * 60 * 1000).length;
    const activeVisitors = visibleLiveVisitors.filter((visitor) => Date.now() - visitor.lastSeenAt < 30 * 1000);

    return { pageViews, clicks, searches, sections, sessions, lastHour, activeVisitors };
  }, [visibleEvents, visibleLiveVisitors]);

  const topPages = useMemo(() => countBy(stats.pageViews, (event) => event.path).slice(0, 8), [stats.pageViews]);
  const topSections = useMemo(() => countBy(stats.sections, (event) => event.section).slice(0, 8), [stats.sections]);
  const topClicks = useMemo(() => countBy(stats.clicks, (event) => event.label).slice(0, 8), [stats.clicks]);
  const trafficSources = useMemo(() => countBy(visibleEvents, (event) => `${event.source} / ${event.medium}`).slice(0, 6), [visibleEvents]);
  const deviceSplit = useMemo(() => countBy(visibleEvents, (event) => event.device).slice(0, 4), [visibleEvents]);
  const siteSplit = useMemo(() => {
    const visitors = visibleLiveVisitors.length > 0 ? visibleLiveVisitors : [];
    const counts = new Map<string, number>();
    visitors.forEach((visitor) => {
      const key = `${getSiteLabel(visitor)} · ${getSiteHost(visitor)}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    if (counts.size === 0) {
      visibleEvents.forEach((event) => {
        const key = `${getSiteLabel(event)} · ${getSiteHost(event)}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [visibleEvents, visibleLiveVisitors]);
  const productRows = useMemo(() => {
    const products = new Map<string, {
      key: string;
      name: string;
      slug?: string;
      category?: string;
      views: number;
      intents: number;
      sessions: Set<string>;
      lastSeen: number;
    }>();

    visibleEvents.forEach((event) => {
      const key = getProductKey(event);
      if (!key) return;
      const row = products.get(key) || {
        key,
        name: event.productName || decodeURIComponent(key).replace(/-/g, " "),
        slug: event.productSlug || key,
        category: event.productCategory,
        views: 0,
        intents: 0,
        sessions: new Set<string>(),
        lastSeen: 0,
      };
      if (event.type === "product_view" || event.type === "page_view") row.views += 1;
      if (event.type === "product_intent") row.intents += 1;
      row.sessions.add(event.sessionId);
      row.lastSeen = Math.max(row.lastSeen, event.timestamp);
      if (event.productName) row.name = event.productName;
      if (event.productCategory) row.category = event.productCategory;
      products.set(key, row);
    });

    return [...products.values()]
      .sort((a, b) => (b.views + b.intents * 2) - (a.views + a.intents * 2))
      .slice(0, 10);
  }, [visibleEvents]);
  const locationRows = useMemo(() => {
    const counts = new Map<string, { label: string; sessions: Set<string>; active: number; lastSeen: number }>();
    visibleLiveVisitors.forEach((visitor) => {
      const label = getLocationLabel(visitor);
      const row = counts.get(label) || { label, sessions: new Set<string>(), active: 0, lastSeen: 0 };
      row.sessions.add(visitor.sessionId);
      if (Date.now() - visitor.lastSeenAt < 30 * 1000) row.active += 1;
      row.lastSeen = Math.max(row.lastSeen, visitor.lastSeenAt);
      counts.set(label, row);
    });
    return [...counts.values()].sort((a, b) => b.active - a.active || b.lastSeen - a.lastSeen).slice(0, 8);
  }, [visibleLiveVisitors]);
  const selectedVisitor = useMemo(
    () => selectedSessionId ? visibleLiveVisitors.find((visitor) => visitor.sessionId === selectedSessionId) : visibleLiveVisitors[0],
    [visibleLiveVisitors, selectedSessionId],
  );
  const selectedSessionEvents = useMemo(() => {
    if (!selectedVisitor) return [];
    return visibleEvents.filter((event) => event.sessionId === selectedVisitor.sessionId).slice(0, 18);
  }, [visibleEvents, selectedVisitor]);
  const recentEvents = visibleEvents.slice(0, 18);
  const mapQuery = getMapQuery(selectedVisitor);
  const mapUrl = getGoogleSatelliteMapUrl(mapQuery);
  const earthUrl = getGoogleEarthUrl(mapQuery);

  const handleClear = () => {
    clearAnalyticsEvents();
    setEvents([]);
    setLiveVisitors([]);
  };

  return (
    <Layout>
      <SEO
        title="Admin Monitoring Dashboard"
        description="Admin-only Luxtronics monitoring dashboard."
        url="/admin"
        noindex
        nofollow
      />

      <section className="container py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Admin only</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Site Monitoring
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track traffic sources, page views, live visitor movement, section visibility, searches, clicks, and product intent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Products
              </Button>
            </Link>
            <Link to="/admin/invoices">
              <Button variant="outline" className="gap-2">
                <ReceiptText className="h-4 w-4" />
                Invoices
              </Button>
            </Link>
            <Link to="/admin/blogs">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Blogs
              </Button>
            </Link>
            <Button variant="destructive" className="gap-2" onClick={handleClear} disabled={events.length === 0}>
              <Trash2 className="h-4 w-4" />
              Clear local data
            </Button>
          </div>
        </div>

        <Card className="mb-5 border-border/70 bg-card/80">
          <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Monitoring Scope
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {selectedSite === "all" ? "all Luxtronics domains" : selectedSite}
                {liveOnly ? " · active sessions only" : " · active and idle sessions"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedSite === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setSelectedSite("all")}
              >
                <Globe2 className="h-3.5 w-3.5" />
                All sites
              </Button>
              {siteOptions.map((site) => (
                <Button
                  key={site.host}
                  variant={selectedSite === site.host ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setSelectedSite(site.host)}
                >
                  {site.label}
                  <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] text-foreground">
                    {site.live}
                  </span>
                </Button>
              ))}
              <Button
                variant={liveOnly ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setLiveOnly((value) => !value)}
              >
                <Radio className="h-3.5 w-3.5" />
                Live only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={!selectedSessionId}
                onClick={() => {
                  setSelectedSessionId(null);
                  setFollowedSessionId(null);
                }}
              >
                Reset inspect
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Live now" value={stats.activeVisitors.length} detail="Active in last 30 seconds" icon={Radio} />
          <StatCard title="Page views" value={stats.pageViews.length} detail={`${stats.lastHour} events in last hour`} icon={Eye} />
          <StatCard title="Sessions" value={stats.sessions} detail="Unique browser sessions" icon={Users} />
          <StatCard title="Clicks" value={stats.clicks.length} detail="Buttons and links" icon={MousePointerClick} />
          <StatCard title="Sections" value={stats.sections.length} detail="Viewed page sections" icon={Activity} />
          <StatCard title="Searches" value={stats.searches.length} detail="Submitted search queries" icon={Search} />
        </div>

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3 text-base">
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Live Visitor Movement
              </span>
              <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-primary">
                Refreshes every 2.5s
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Inspect</th>
                    <th className="py-3 pr-4">Website</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Current page</th>
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Current section</th>
                    <th className="py-3 pr-4">Last action</th>
                    <th className="py-3 pr-4">Scroll</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLiveVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-muted-foreground">
                        No sessions match this scope yet. Open one of the sites in another tab/device and movement will appear here.
                      </td>
                    </tr>
                  ) : (
                    visibleLiveVisitors.map((visitor) => {
                      const isActive = Date.now() - visitor.lastSeenAt < 30 * 1000;
                      return (
                        <tr key={visitor.sessionId} className="border-b border-border/70">
                          <td className="py-3 pr-4">
                            <Button
                              variant={followedSessionId === visitor.sessionId ? "default" : "outline"}
                              size="sm"
                              className="h-8 gap-1.5 px-2.5 text-xs"
                              onClick={() => {
                                setSelectedSessionId(visitor.sessionId);
                                setFollowedSessionId((current) => current === visitor.sessionId ? null : visitor.sessionId);
                              }}
                            >
                              <Crosshair className="h-3.5 w-3.5" />
                              {followedSessionId === visitor.sessionId ? "Following" : "Follow"}
                            </Button>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="whitespace-nowrap">
                              <span className="block text-xs font-black uppercase tracking-wider text-primary">{getSiteLabel(visitor)}</span>
                              <span className="block text-xs text-muted-foreground">{getSiteHost(visitor)}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {isActive ? "Active" : "Idle"}
                            </span>
                          </td>
                          <td className="max-w-[220px] truncate py-3 pr-4 font-medium">{visitor.path}</td>
                          <td className="max-w-[180px] py-3 pr-4">
                            <span className="block truncate font-medium">{getLocationLabel(visitor)}</span>
                            <span className="block truncate text-xs text-muted-foreground">{getPrecisionLabel(visitor)}</span>
                          </td>
                          <td className="max-w-[180px] truncate py-3 pr-4">
                            {visitor.currentProductName ? (
                              <span className="font-medium text-primary">{visitor.currentProductName}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="max-w-[180px] truncate py-3 pr-4">{visitor.section || "Page top"}</td>
                          <td className="max-w-[220px] truncate py-3 pr-4 text-muted-foreground">{visitor.lastAction || "Browsing"}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-3.5 w-3.5 text-primary" />
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-background">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${visitor.scrollDepth}%` }} />
                              </div>
                              <span className="text-xs font-semibold">{visitor.scrollDepth}%</span>
                            </div>
                          </td>
                          <td className="max-w-[160px] truncate py-3 pr-4 text-muted-foreground">
                            {visitor.source} / {visitor.medium}
                          </td>
                          <td className="whitespace-nowrap py-3 capitalize">{visitor.device} · {visitor.browser}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span className="flex items-center gap-2">
                  <LocateFixed className="h-4 w-4 text-primary" />
                  Session Inspect
                </span>
                {selectedVisitor && (
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs font-bold">
                    {shortSession(selectedVisitor.sessionId)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedVisitor ? (
                <p className="text-sm text-muted-foreground">Select a live visitor to inspect their journey.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Website</p>
                      <p className="mt-1 truncate text-sm font-semibold">{getSiteLabel(selectedVisitor)} · {getSiteHost(selectedVisitor)}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current page</p>
                      <p className="mt-1 truncate text-sm font-semibold">{selectedVisitor.path}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</p>
                      <p className="mt-1 truncate text-sm font-semibold">{getLocationLabel(selectedVisitor)}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{getPrecisionLabel(selectedVisitor)}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current product</p>
                      <p className="mt-1 truncate text-sm font-semibold">{selectedVisitor.currentProductName || "No product open"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source / device</p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        {selectedVisitor.source} / {selectedVisitor.medium} · {selectedVisitor.device}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Session timeline</p>
                      <Button
                        variant={followedSessionId === selectedVisitor.sessionId ? "default" : "outline"}
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => setFollowedSessionId((current) =>
                          current === selectedVisitor.sessionId ? null : selectedVisitor.sessionId
                        )}
                      >
                        <Radio className="h-3.5 w-3.5" />
                        {followedSessionId === selectedVisitor.sessionId ? "Following session" : "Follow session"}
                      </Button>
                    </div>
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {selectedSessionEvents.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                          This session has no detailed events yet.
                        </p>
                      ) : (
                        selectedSessionEvents.map((event) => (
                          <div key={event.id} className="rounded-lg border border-border bg-background/60 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold capitalize">{event.type.replace("_", " ")}</span>
                              <span className="whitespace-nowrap text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {event.productName || event.label || event.section || event.path}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Visitor Earth Map
                </span>
                <a
                  href={earthUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-3 py-1 text-xs font-bold text-primary transition hover:border-primary/40"
                >
                  Open Google Earth
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  title={`Visitor map for ${mapQuery}`}
                  src={mapUrl}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="mb-4 rounded-lg border border-border bg-background/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focused location</p>
                <p className="mt-1 truncate text-sm font-semibold">{mapQuery}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {selectedVisitor ? getPrecisionLabel(selectedVisitor) : "No visitor selected"}
                </p>
              </div>
              <div className="space-y-3">
                {locationRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Location buckets appear when live sessions are active.</p>
                ) : (
                  locationRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.label}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                        {row.active} live · {row.sessions.size} sessions
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Product Hits & Intent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Views</th>
                    <th className="py-3 pr-4">Intent clicks</th>
                    <th className="py-3 pr-4">Sessions</th>
                    <th className="py-3">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {productRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Product hits appear after visitors open products or click product CTAs.
                      </td>
                    </tr>
                  ) : (
                    productRows.map((row) => (
                      <tr key={row.key} className="border-b border-border/70">
                        <td className="max-w-[320px] truncate py-3 pr-4 font-semibold">{row.name}</td>
                        <td className="max-w-[180px] truncate py-3 pr-4 text-muted-foreground">{row.category || "-"}</td>
                        <td className="py-3 pr-4 font-bold">{row.views}</td>
                        <td className="py-3 pr-4 font-bold text-primary">{row.intents}</td>
                        <td className="py-3 pr-4">{row.sessions.size}</td>
                        <td className="whitespace-nowrap py-3 text-muted-foreground">{row.lastSeen ? formatTime(row.lastSeen) : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page views yet.</p>
              ) : (
                topPages.map(([path, count]) => (
                  <div key={path} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{path}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trafficSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No traffic source data yet.</p>
              ) : (
                trafficSources.map(([source, count]) => (
                  <div key={source} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{source}</span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{count}</span>
                  </div>
                ))
              )}
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Website split</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {siteSplit.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No website data yet.</span>
                  ) : (
                    siteSplit.map(([site, count]) => (
                      <span key={site} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                        {site}: {count}
                      </span>
                    ))
                  )}
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Device split</p>
                <div className="flex flex-wrap gap-2">
                  {deviceSplit.map(([device, count]) => (
                    <span key={device} className="rounded-full border border-border px-3 py-1 text-xs font-semibold capitalize">
                      {device}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Most Viewed Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSections.length === 0 ? (
                <p className="text-sm text-muted-foreground">Section visibility appears after scrolling pages.</p>
              ) : (
                topSections.map(([section, count]) => (
                  <div key={section} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{section}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Clicks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topClicks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Click data appears when visitors interact.</p>
              ) : (
                topClicks.map(([label, count]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Live Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Time</th>
                    <th className="py-3 pr-4">Website</th>
                    <th className="py-3 pr-4">Event</th>
                    <th className="py-3 pr-4">Page</th>
                    <th className="py-3 pr-4">Label / Section</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        No events yet. Browse the website once and this dashboard will start filling.
                      </td>
                    </tr>
                  ) : (
                    recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-border/70">
                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatTime(event.timestamp)}</td>
                        <td className="max-w-[160px] truncate py-3 pr-4">
                          <span className="font-semibold">{getSiteLabel(event)}</span>
                          <span className="ml-1 text-xs text-muted-foreground">{getSiteHost(event)}</span>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 font-semibold">{event.type.replace("_", " ")}</td>
                        <td className="max-w-[220px] truncate py-3 pr-4">{event.path}</td>
                        <td className="max-w-[260px] truncate py-3 pr-4">{event.label || event.section || "-"}</td>
                        <td className="max-w-[180px] truncate py-3 pr-4 text-muted-foreground">
                          {event.source} / {event.medium}
                        </td>
                        <td className="whitespace-nowrap py-3 capitalize">{event.device}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
