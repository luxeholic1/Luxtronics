import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalyticsEvent, updateLiveVisitor } from "@/lib/analytics";
import { COOKIE_CONSENT_KEY } from "@/components/CookieConsent";

const getElementLabel = (element: HTMLElement) => {
  const explicit = element.getAttribute("data-analytics-label") || element.getAttribute("aria-label");
  if (explicit) return explicit.trim();

  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);

  return element.tagName.toLowerCase();
};

const getProductMeta = (element: HTMLElement) => {
  const productElement = element.closest("[data-product-id],[data-product-slug],[data-product-name]") as HTMLElement | null;
  if (!productElement) return {};
  const price = productElement.getAttribute("data-product-price");
  return {
    productId: productElement.getAttribute("data-product-id") || undefined,
    productName: productElement.getAttribute("data-product-name") || undefined,
    productSlug: productElement.getAttribute("data-product-slug") || undefined,
    productCategory: productElement.getAttribute("data-product-category") || undefined,
    productPrice: price ? Number(price) : undefined,
  };
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(() => {
    try {
      return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onConsent = (event: Event) => {
      const value = (event as CustomEvent).detail;
      setAnalyticsAllowed(value === "accepted");
    };

    window.addEventListener("luxtronics-cookie-consent", onConsent);
    return () => window.removeEventListener("luxtronics-cookie-consent", onConsent);
  }, []);

  useEffect(() => {
    if (!analyticsAllowed || window.location.pathname.startsWith("/admin")) return;

    trackAnalyticsEvent({
      type: "page_view",
      path: `${location.pathname}${location.search}`,
      title: document.title,
    });
    updateLiveVisitor({
      path: `${location.pathname}${location.search}`,
      title: document.title,
      section: "Page top",
      lastAction: "Opened page",
      scrollDepth: 0,
    });
  }, [analyticsAllowed, location.pathname, location.search]);

  useEffect(() => {
    if (!analyticsAllowed || window.location.pathname.startsWith("/admin")) return;

    let lastScrollDepth = 0;

    const getScrollDepth = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 100;
      return Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100)));
    };

    const heartbeat = () => {
      const nextDepth = getScrollDepth();
      if (nextDepth > lastScrollDepth) lastScrollDepth = nextDepth;
      updateLiveVisitor({
        path: `${window.location.pathname}${window.location.search}`,
        title: document.title,
        scrollDepth: lastScrollDepth,
      });
    };

    const onScroll = () => {
      const nextDepth = getScrollDepth();
      if (nextDepth > lastScrollDepth) {
        lastScrollDepth = nextDepth;
        updateLiveVisitor({
          path: `${window.location.pathname}${window.location.search}`,
          title: document.title,
          scrollDepth: lastScrollDepth,
          lastAction: `Scrolled ${lastScrollDepth}%`,
        });
      }
    };

    // Heartbeat keeps the visitor "active" (LIVE_ACTIVE_WINDOW is 30s server-side),
    // so 20s gives margin without hammering /api/analytics/live every 5s per open tab.
    let interval: number | undefined;
    const startHeartbeat = () => {
      if (interval) return;
      heartbeat();
      interval = window.setInterval(heartbeat, 20000);
    };
    const stopHeartbeat = () => {
      if (!interval) return;
      window.clearInterval(interval);
      interval = undefined;
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stopHeartbeat();
      else startHeartbeat();
    };

    startHeartbeat();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("focus", heartbeat);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopHeartbeat();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", heartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [analyticsAllowed, location.pathname, location.search]);

  useEffect(() => {
    if (!analyticsAllowed || window.location.pathname.startsWith("/admin")) return;

    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = entry.target as HTMLElement;
          const name =
            section.getAttribute("data-section") ||
            section.id ||
            section.querySelector("h1,h2,h3")?.textContent?.replace(/\s+/g, " ").trim() ||
            section.className?.toString().split(" ").slice(0, 2).join(" ") ||
            "section";

          const key = `${window.location.pathname}:${name}`;
          if (seenSections.has(key)) return;
          seenSections.add(key);

          trackAnalyticsEvent({
            type: "section_view",
            section: name.slice(0, 100),
            path: `${window.location.pathname}${window.location.search}`,
          });
          updateLiveVisitor({
            section: name.slice(0, 100),
            lastAction: `Viewing ${name.slice(0, 80)}`,
            path: `${window.location.pathname}${window.location.search}`,
          });
        });
      },
      { threshold: 0.45, rootMargin: "0px 0px -12% 0px" },
    );

    const sections = document.querySelectorAll("main section, main [data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [analyticsAllowed, location.pathname, location.search]);

  useEffect(() => {
    if (!analyticsAllowed || window.location.pathname.startsWith("/admin")) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const clickable = target?.closest("a,button,[role='button']") as HTMLElement | null;
      if (!clickable) return;

      const label = getElementLabel(clickable);
      const href = clickable instanceof HTMLAnchorElement ? clickable.href : clickable.getAttribute("data-href") || undefined;
      const lower = label.toLowerCase();
      const productMeta = getProductMeta(clickable);
      const type =
        lower.includes("buy") || lower.includes("cart") || lower.includes("checkout") || Boolean(productMeta.productSlug)
          ? "product_intent"
          : "click";

      // trackAnalyticsEvent already forwards label/path/productMeta into its own
      // internal updateLiveVisitor call — a second explicit call here just sent
      // the exact same values as a duplicate POST to /api/analytics/live.
      trackAnalyticsEvent({
        type,
        label,
        href,
        path: `${window.location.pathname}${window.location.search}`,
        ...productMeta,
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      const input = form?.querySelector("input[type='search'], input[name='q']") as HTMLInputElement | null;
      if (!input?.value.trim()) return;

      trackAnalyticsEvent({
        type: "search",
        label: input.value.trim().slice(0, 120),
        path: `${window.location.pathname}${window.location.search}`,
      });
      updateLiveVisitor({
        lastAction: `Searched "${input.value.trim().slice(0, 80)}"`,
        path: `${window.location.pathname}${window.location.search}`,
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [analyticsAllowed]);

  return null;
};

export default AnalyticsTracker;
