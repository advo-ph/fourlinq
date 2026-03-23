import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

// Generate a persistent session ID per browser tab
const SESSION_ID =
  sessionStorage.getItem("flq_sid") ||
  (() => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("flq_sid", id);
    return id;
  })();

// Fire-and-forget — never blocks UI
function sendEvent(event: string, extra: Record<string, unknown> = {}) {
  const payload = {
    sessionId: SESSION_ID,
    event,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    screenW: window.innerWidth,
    screenH: window.innerHeight,
    ...extra,
  };

  // Use fetch with keepalive (survives page unload, proper content-type)
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Track a named event manually
 */
export function trackEvent(event: string, target?: string, data?: Record<string, unknown>) {
  sendEvent(event, { target, data });
}

/**
 * Hook: auto-tracks page views, scroll depth, and click targets.
 * Mount once in App.tsx or Layout.
 */
export function useAnalytics() {
  const location = useLocation();
  const scrollMaxRef = useRef(0);
  const lastPageRef = useRef("");

  // ─── Page View ───────────────────────────────
  useEffect(() => {
    const page = location.pathname;
    if (page === lastPageRef.current) return;

    // Send scroll depth for the previous page before tracking new one
    if (scrollMaxRef.current > 0 && lastPageRef.current) {
      sendEvent("scroll_depth", {
        page: lastPageRef.current,
        data: { depth: scrollMaxRef.current },
      });
    }

    lastPageRef.current = page;
    scrollMaxRef.current = 0;
    sendEvent("page_view");
  }, [location.pathname]);

  // ─── Scroll Depth ────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      if (pct > scrollMaxRef.current) scrollMaxRef.current = pct;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Send final scroll depth on unload
  useEffect(() => {
    const handleUnload = () => {
      if (scrollMaxRef.current > 0) {
        sendEvent("scroll_depth", {
          data: { depth: scrollMaxRef.current },
        });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ─── Click Tracking ──────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-track], a, button");
      if (!el) return;

      const trackId =
        el.getAttribute("data-track") ||
        el.getAttribute("aria-label") ||
        el.textContent?.trim().slice(0, 60) ||
        "unknown";

      sendEvent("click", { target: trackId });
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

/**
 * Track design tool configurator changes
 */
export function trackConfigChange(field: string, value: string) {
  sendEvent("config_change", { data: { field, value, finish: field === "finish" ? value : undefined } });
}

/**
 * Track product detail view (drawer open)
 */
export function trackProductView(productName: string) {
  sendEvent("product_view", { target: productName });
}

/**
 * Track chat interaction
 */
export function trackChatOpen() {
  sendEvent("chat_open");
}

export function trackChatMessage() {
  sendEvent("chat_message");
}
