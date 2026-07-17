import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { CONSENT_KEY, getConsent, hasAnalyticsConsent, setConsent, clearConsent } from "@/lib/consent";
import { trackEvent, trackProductView, trackChatOpen, trackConfigChange } from "@/hooks/useAnalytics";

/**
 * RM6 — consent-enforced analytics.
 *
 * Grounds: the 2026-07-10 read-only production capture recorded 128 analytics
 * attempts BEFORE any cookie choice. These tests pin the three preference
 * states so that can never regress.
 */

const analyticsCalls = () =>
  (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
    (c) => String(c[0]).includes("/api/analytics"),
  );

describe("RM6 — consent gate", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("state: unset (no choice made)", () => {
    it("reports unset and withholds consent", () => {
      expect(getConsent()).toBe("unset");
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it("fires ZERO analytics requests across every tracked event", () => {
      trackEvent("page_view");
      trackProductView("Casement");
      trackChatOpen();
      trackConfigChange("finish", "walnut");
      expect(analyticsCalls()).toHaveLength(0);
    });

    it("writes nothing to sessionStorage (no session id before a choice)", () => {
      trackEvent("page_view");
      expect(sessionStorage.getItem("flq_sid")).toBeNull();
    });
  });

  describe("state: declined", () => {
    beforeEach(() => setConsent("declined"));

    it("withholds consent", () => {
      expect(getConsent()).toBe("declined");
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it("fires ZERO analytics requests across every tracked event", () => {
      trackEvent("page_view");
      trackProductView("Sliding");
      trackChatOpen();
      trackConfigChange("finish", "oak");
      expect(analyticsCalls()).toHaveLength(0);
    });
  });

  describe("state: accepted", () => {
    beforeEach(() => setConsent("accepted"));

    it("grants consent", () => {
      expect(hasAnalyticsConsent()).toBe(true);
    });

    it("sends the event to the first-party endpoint", () => {
      trackEvent("page_view");
      const calls = analyticsCalls();
      expect(calls).toHaveLength(1);
      expect(String(calls[0][0])).toBe("/api/analytics");
    });
  });

  describe("preference changes take effect with no stale tracking", () => {
    it("accept → decline stops tracking immediately", () => {
      setConsent("accepted");
      trackEvent("page_view");
      expect(analyticsCalls()).toHaveLength(1);

      setConsent("declined");
      trackEvent("page_view");
      expect(analyticsCalls()).toHaveLength(1); // unchanged — no new request
    });

    it("clearing the preference returns the visitor to untracked", () => {
      setConsent("accepted");
      trackEvent("page_view");
      expect(analyticsCalls()).toHaveLength(1);

      clearConsent();
      expect(getConsent()).toBe("unset");
      trackEvent("page_view");
      expect(analyticsCalls()).toHaveLength(1); // unchanged
    });
  });

  it("fails closed when storage is unavailable", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(getConsent()).toBe("unset");
    expect(hasAnalyticsConsent()).toBe(false);
    spy.mockRestore();
  });

  it("banner and analytics share one storage key", () => {
    expect(CONSENT_KEY).toBe("fourlinq_cookie_consent");
  });
});
